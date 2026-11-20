
 // =================================
 // 1. GAME SETTINGS
 // =================================

// Information about each hand.
const HANDS = {
    ROCK: {
        image: "rock copy.png",
        beats: "SCISSORS"
    },
    SCISSORS: {
        image: "scissors copy.png",
        beats: "PAPER"
    },
    PAPER: {
        image: "paper copy.png",
        beats: "ROCK"
    }
};

// A list of all three hands.
const HANDS_LIST = ["ROCK", "SCISSORS", "PAPER"];

// =================================
// 2. GAME DATA
// =================================

// Current scores.
let playerScore = 0;
let computerScore = 0;
let drawScore = 0;
let streak = 0;

// Is the game waiting for the computer?
let isBusy = false;

// Sound setting.
let soundOn = localStorage.getItem("jankenSound") !== "false";

// Load saved records.
// If there are no saved records, start at zero.
let bestRecord = JSON.parse(localStorage.getItem("jankenBestRecord")) || {
    wins: 0,
    losses: 0,
    draws: 0
};

let bestStreak = Number(localStorage.getItem("jankenBestStreak")) || 0;


// =================================
// 3. HTML ELEMENTS
// =================================

// Find things in the HTML.
const $ = (id) => document.querySelector(id);

const handButtons = document.querySelectorAll(".hand-button");

const playerHand = $("#player-hand");
const computerHand = $("#pc_hands");
const judgment = $("#judgment");
const cpuMessage = $("#cpu-message");
const battleArea = $("#battle-area");

const playerScoreDisplay = $("#player-score");
const computerScoreDisplay = $("#computer-score");
const roundDisplay = $("#round-count");
const streakDisplay = $("#streak");

const winsDisplay = $("#wins");
const lossesDisplay = $("#losses");
const drawsDisplay = $("#draws");
const bestStreakDisplay = $("#best-streak");

const resetButton = $("#reset-btn");
const clearButton = $("#clear-btn");
const soundButton = $("#sound-btn");


// =================================
// 4. SHOW HANDS
// =================================

// Display a hand image.
function showHand(element, hand) {
    element.innerHTML = "";

    const image = document.createElement("img");

    image.src = "img/" + HANDS[hand].image;
    image.alt = hand;
    image.className = "hand-image";

    // Show the hand's name if its image cannot load.
    image.onerror = function() {
        element.textContent = hand;
    };

    element.appendChild(image);
}

// Reset both hands.
function resetHands() {
    playerHand.textContent = "?";
    computerHand.textContent = "?";
}


// =================================
// 5. CHECK WHO WINS
// =================================

// Compare the player's hand with the computer's hand.
function checkWinner(player, computer) {

    if (player === computer) {
        return "draw";
    }

    if (HANDS[player].beats === computer) {
        return "win";
    }

    return "lose";
}


// =================================
// 6. PLAY SOUND
// =================================

let audioContext;

// Play one simple sound.
function playSound(frequency) {

    if (!soundOn) return;

    // Create the sound system if it does not exist.
    if (!audioContext) {
        audioContext = new AudioContext();
    }

    // Create a sound.
    const sound = audioContext.createOscillator();

    sound.frequency.value = frequency;
    sound.connect(audioContext.destination);

    sound.start();
    sound.stop(audioContext.currentTime + 0.15);
}


// =================================
// 7. PLAY A ROUND
// =================================

function playRound(player) {

    // Stop if another round is still running.
    if (isBusy) return;

    isBusy = true;

    // Disable buttons while waiting.
    handButtons.forEach(button => button.disabled = true);
    resetButton.disabled = true;

    // Show the player's hand.
    showHand(playerHand, player);

    judgment.textContent = "JAN... KEN... PON!";
    cpuMessage.textContent = "CPU is thinking...";

    // Wait half a second before showing the computer's hand.
    setTimeout(function() {

        // Computer randomly chooses a hand.
        const computer = HANDS_LIST[
            Math.floor(Math.random() * HANDS_LIST.length)
        ];

        // Check the result.
        const result = checkWinner(player, computer);

        // Show the computer's hand.
        showHand(computerHand, computer);

        // Update the scores.
        if (result === "win") {

            playerScore++;
            streak++;

            judgment.textContent = "YOU WIN!";
            cpuMessage.textContent = "WOOOOOOW!";

            playSound(700);

            // Save a new best streak.
            if (streak > bestStreak) {
                bestStreak = streak;
                localStorage.setItem("jankenBestStreak", bestStreak);
            }

            if (streak >= 3) {
                cpuMessage.textContent = streak + " IN A ROW! UNSTOPPABLE!";
            }

        } else if (result === "lose") {

            computerScore++;
            streak = 0;

            judgment.textContent = "YOU LOSE!";
            cpuMessage.textContent = "HAHAHA, YOU LOSE!";

            playSound(200);

        } else {

            drawScore++;

            judgment.textContent = "DRAW!";
            cpuMessage.textContent = "A TIE! TRY AGAIN!";

            playSound(400);
        }

        // Add the result styles.
        playerHand.classList.remove("is-win", "is-lose", "is-draw");
        computerHand.classList.remove("is-win", "is-lose", "is-draw");
        judgment.classList.remove("is-win", "is-lose", "is-draw");

        playerHand.classList.add("is-" + result);
        computerHand.classList.add(
            result === "draw" ? "is-draw" :
            result === "win" ? "is-lose" : "is-win"
        );
        judgment.classList.add("is-" + result);

        // Shake the game area if the player loses.
        if (result === "lose") {
            battleArea.classList.add("is-shaking");

            setTimeout(function() {
                battleArea.classList.remove("is-shaking");
            }, 700);
        }

        // Update the scoreboard.
        updateScores();

        // Allow the player to play again.
        isBusy = false;
        handButtons.forEach(button => button.disabled = false);
        resetButton.disabled = false;

    }, 500);
}


// =================================
// 8. UPDATE SCORES
// =================================

function updateScores() {

    // Add zeros before numbers.
    playerScoreDisplay.textContent = String(playerScore).padStart(3, "0");
    computerScoreDisplay.textContent = String(computerScore).padStart(3, "0");
    streakDisplay.textContent = String(streak).padStart(3, "0");

    // Calculate the round number.
    roundDisplay.textContent =
        "◆ ROUND " + String(playerScore + computerScore + drawScore + 1).padStart(3, "0") + " ◆";

    // Show saved records.
    winsDisplay.textContent = String(bestRecord.wins).padStart(3, "0");
    lossesDisplay.textContent = String(bestRecord.losses).padStart(3, "0");
    drawsDisplay.textContent = String(bestRecord.draws).padStart(3, "0");
    bestStreakDisplay.textContent = String(bestStreak).padStart(3, "0");
}


// =================================
// 9. RESET GAME
// =================================

function resetGame() {

    if (isBusy) return;

    // Check if the current game is a new personal best.
    if (
        playerScore > bestRecord.wins ||
        (playerScore === bestRecord.wins && computerScore < bestRecord.losses)
    ) {

        bestRecord = {
            wins: playerScore,
            losses: computerScore,
            draws: drawScore
        };

        // Save the new record.
        localStorage.setItem("jankenBestRecord", JSON.stringify(bestRecord));

        judgment.textContent = "NEW PERSONAL BEST!";
        cpuMessage.textContent = "LEGENDARY!";
        playSound(900);

    } else if (playerScore + computerScore + drawScore > 0) {

        judgment.textContent = "GAME OVER!";
        cpuMessage.textContent = "Can you beat your record?";

    } else {

        judgment.textContent = "READY?";
        cpuMessage.textContent = "Choose your hand, player!";
    }

    // Reset current scores.
    playerScore = 0;
    computerScore = 0;
    drawScore = 0;
    streak = 0;

    // Reset the hands and styles.
    resetHands();

    playerHand.classList.remove("is-win", "is-lose", "is-draw");
    computerHand.classList.remove("is-win", "is-lose", "is-draw");
    judgment.classList.remove("is-win", "is-lose", "is-draw");

    updateScores();
}


// =================================
// 10. CLEAR RECORDS
// =================================

function clearRecords() {

    // Ask before deleting saved records.
    if (!confirm("Clear your personal best and best streak?")) {
        return;
    }

    bestRecord = {
        wins: 0,
        losses: 0,
        draws: 0
    };

    bestStreak = 0;

    // Remove saved records from the browser.
    localStorage.removeItem("jankenBestRecord");
    localStorage.removeItem("jankenBestStreak");

    updateScores();
}


// =================================
// 12. BUTTON CLICKS
// =================================

// Play a round when a hand button is clicked.
handButtons.forEach(button => {

    button.addEventListener("click", function() {
        playRound(button.dataset.hand);
    });

});

// Other buttons.
resetButton.addEventListener("click", resetGame);
clearButton.addEventListener("click", clearRecords);
soundButton.addEventListener("click", toggleSound);


// =================================
// 13. KEYBOARD CONTROLS
// =================================

// Keys used to choose hands.
const KEY_MAP = {
    r: "ROCK",
    s: "SCISSORS",
    p: "PAPER",
    1: "ROCK",
    2: "SCISSORS",
    3: "PAPER"
};

// Listen for keyboard presses.
document.addEventListener("keydown", function(event) {

    const hand = KEY_MAP[event.key.toLowerCase()];

    if (hand) {
        playRound(hand);
    }

});


// =================================
// 14. START GAME
// =================================

// Update the screen when the game opens.
updateSoundButton();
updateScores();
