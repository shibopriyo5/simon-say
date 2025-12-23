# Simon — Memory Game

This is a small, beginner-friendly implementation of the classic "Simon" memory game.

What's included
- `index.html` — semantic, accessible markup with a modern layout.
- `style.css` — clean, responsive UI with glass/gradient styling and simple animations.
- `script.js` — easy-to-follow game logic using Web Audio, keyboard & touch support, and localStorage high score.

Key features
- Responsive layout — plays nicely on phone and desktop.
- Accessibility — aria labels, keyboard controls (Space to start; 1-4 to press pads).
- High score stored in `localStorage`.

How to run
1. Open `index.html` in a browser (just double-click the file).
2. Click Start or press Space to begin.
3. Repeat the shown sequence by clicking pads or pressing keys 1 (red), 2 (green), 3 (blue), 4 (yellow).

Design notes
- WebAudio used for short tones; this avoids shipping asset files.

Potential follow-ups
- Add a "strict" mode (restart on mistake).
- Add small animations & victory state when a long sequence is reached.

