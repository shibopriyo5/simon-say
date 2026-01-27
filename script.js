const pads = Array.from(document.querySelectorAll('.pad'));
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');
const levelLabel = document.getElementById('level');
const highscoreLabel = document.getElementById('highscore');
const hint = document.getElementById('hint');

let sequence = [];
let playerIndex = 0;
let playingSequence = false;
let currentLevel = 0;
let gameOver = false;
let best = parseInt(localStorage.getItem('simon:best') || '0', 10);
highscoreLabel.textContent = `Best: ${best}`;

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
    } catch (e) {}
}

function flashPad(pad, color) {
    pad.classList.add('active');
    playTone(color);
    setTimeout(() => pad.classList.remove('active'), 300);
}

async function playSequence(onlyLast = false) {
    playingSequence = true;
    hint.textContent = onlyLast ? 'Watch the new color' : 'Watch the sequence';
    await new Promise(r => setTimeout(r, 350));

    if (onlyLast && sequence.length > 0) {
        const color = sequence[sequence.length - 1];
        const pad = pads.find(p => p.dataset.color === color);
        if (pad) {
            flashPad(pad, color);
            await new Promise(r => setTimeout(r, 450));
        }
    } else {
        for (const color of sequence) {
            const pad = pads.find(p => p.dataset.color === color);
            if (!pad) continue;
            flashPad(pad, color);
            await new Promise(r => setTimeout(r, 450));
        }
    }

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
    if (audioCtx.state === 'suspended') audioCtx.resume();
    sequence = [];
    currentLevel = 0;
    levelLabel.textContent = 'Level —';
    hint.textContent = 'Good luck!';
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
    gameOver = false;
    pads.forEach(p => { p.disabled = false; });
}

function nextLevel() {
    currentLevel += 1;
    levelLabel.textContent = `Level ${currentLevel}`;
    addRandomColor();
    playSequence(true);
}

function fail() {
    hint.textContent = 'Wrong! Press Start to try again.';
    playTone('red', 180);

    gameOver = true;
    pads.forEach(p => { p.disabled = true; });

    if (currentLevel > best) {
        best = currentLevel;
        localStorage.setItem('simon:best', String(best));
        highscoreLabel.textContent = `Best: ${best}`;
    }

    sequence = [];
    currentLevel = 0;
    playerIndex = 0;
    levelLabel.textContent = 'Level —';
    playingSequence = false;
}

function handlePadInteraction(pad) {
    if (playingSequence || gameOver) return;
    const color = pad.dataset.color;
    flashPad(pad, color);

    if (sequence[playerIndex] === color) {
        playerIndex += 1;
        if (playerIndex === sequence.length) {
            setTimeout(nextLevel, 600);
        }
    } else {
        fail();
    }
}

pads.forEach(p => {
    p.addEventListener('click', (e) => handlePadInteraction(p));
    p.addEventListener('touchstart', (e) => { e.preventDefault(); handlePadInteraction(p); });
});

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

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

hint.textContent = 'Press Start or Space to begin';



