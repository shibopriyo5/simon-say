// Simon game: clear, beginner-friendly implementation

// Elements
const pads = Array.from(document.querySelectorAll('.pad'));
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');
const levelLabel = document.getElementById('level');
const highscoreLabel = document.getElementById('highscore');
const hint = document.getElementById('hint');

// Game state
let sequence = [];
let playerIndex = 0;
let playingSequence = false; // ignores user input while true
let currentLevel = 0;
let gameOver = false; // when true, interaction is blocked until restart
let best = parseInt(localStorage.getItem('simon:best') || '0', 10);
highscoreLabel.textContent = `Best: ${best}`;

// Audio setup (small tones generated with WebAudio)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const freqs = { red: 261.6, green: 329.6, blue: 392.0, yellow: 523.3 };

function playTone(color, duration = 260) {
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freqs[color] || 440;
        gain.gain.value = 0.12;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        setTimeout(() => { try { osc.stop(); } catch (e) {} }, duration);
    } catch (e) {
        // If WebAudio isn't available, silently continue (no sound)
    }
}

function flashPad(pad, color) {
    pad.classList.add('active');
    playTone(color);
    setTimeout(() => pad.classList.remove('active'), 300);
}

// Play the sequence (or only the newly added color) to the player.
// If `onlyLast` is true, the function flashes only the most recently added
// color. This follows the requested behavior where previously shown colors
// are not replayed each round — the player must rely on memory.
async function playSequence(onlyLast = false) {
    playingSequence = true;
    hint.textContent = onlyLast ? 'Watch the new color' : 'Watch the sequence';
    // brief delay so user can prepare
    await new Promise(r => setTimeout(r, 350));

    if (onlyLast && sequence.length > 0) {
        const color = sequence[sequence.length - 1];
        const pad = pads.find(p => p.dataset.color === color);
        if (pad) {
            flashPad(pad, color);
            // wait a little so the flash is visible
            await new Promise(r => setTimeout(r, 450));
        }
    } else {
        for (const color of sequence) {
            const pad = pads.find(p => p.dataset.color === color);
            if (!pad) continue;
            flashPad(pad, color);
            // wait between flashes
            await new Promise(r => setTimeout(r, 450));
        }
    }

    // Ensure the visual sequence is fully cleared before the player can act.
    await new Promise(r => setTimeout(r, 200));
    pads.forEach(p => p.classList.remove('active'));

    playingSequence = false;
    playerIndex = 0;
    hint.textContent = 'Your turn';
}

function addRandomColor() {
    const colors = Object.keys(freqs);
    const rand = colors[Math.floor(Math.random() * colors.length)];
    sequence.push(rand);
}

function startGame() {
    // Ensure audio context is allowed (user gesture requirement in some browsers)
    if (audioCtx.state === 'suspended') audioCtx.resume();
    sequence = [];
    currentLevel = 0;
    levelLabel.textContent = 'Level —';
    hint.textContent = 'Good luck!';
    // clear any previous game-over state and enable pads
    gameOver = false;
    pads.forEach(p => { p.disabled = false; });
    nextLevel();
}

function resetGame() {
    sequence = [];
    currentLevel = 0;
    playerIndex = 0;
    levelLabel.textContent = 'Level —';
    hint.textContent = 'Press Start to begin';
    // allow interaction again
    gameOver = false;
    pads.forEach(p => { p.disabled = false; });
}

function nextLevel() {
    currentLevel += 1;
    levelLabel.textContent = `Level ${currentLevel}`;
    addRandomColor();
    // Only flash the newly added color this round so the player must rely on memory
    // for previously added colors.
    playSequence(true);
}

function fail() {
    hint.textContent = 'Wrong! Press Start to try again.';
    // small failure tone
    playTone('red', 180);

    // Immediately enter game-over state: disable interaction until restart
    gameOver = true;
    pads.forEach(p => { p.disabled = true; });

    // update best score
    if (currentLevel > best) {
        best = currentLevel;
        localStorage.setItem('simon:best', String(best));
        highscoreLabel.textContent = `Best: ${best}`;
    }

    // reset play state (visuals and counters)
    sequence = [];
    currentLevel = 0;
    playerIndex = 0;
    levelLabel.textContent = 'Level —';
    playingSequence = false;
}

function handlePadInteraction(pad) {
    if (playingSequence || gameOver) return; // ignore clicks while sequence plays or after game over
    const color = pad.dataset.color;
    // immediate feedback
    flashPad(pad, color);

    // check player's input
    if (sequence[playerIndex] === color) {
        playerIndex += 1;
        // completed the sequence for this level
        if (playerIndex === sequence.length) {
            // give a small delay before next level
            setTimeout(nextLevel, 600);
        }
    } else {
        fail();
    }
}

// Wire pad clicks/touches
pads.forEach(p => {
    p.addEventListener('click', (e) => handlePadInteraction(p));
    // Touch support (for mobile)
    p.addEventListener('touchstart', (e) => { e.preventDefault(); handlePadInteraction(p); });
});

// Keyboard shortcuts: Space = start, 1-4 = pads
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        startGame();
        return;
    }
    if (playingSequence || gameOver) return;
    const map = { Digit1: 'red', Digit2: 'green', Digit3: 'blue', Digit4: 'yellow' };
    if (map[e.code]) {
        const color = map[e.code];
        const pad = pads.find(p => p.dataset.color === color);
        if (pad) handlePadInteraction(pad);
    }
});

// Buttons
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

// Initial hint
hint.textContent = 'Press Start or Space to begin';


