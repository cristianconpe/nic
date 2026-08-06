const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * UIPanel
 * -------
 * Thin DOM wiring layer: renders the A–Z button grid, keeps the HUD text in
 * sync with the active letter, and drives the optional autoplay sequence.
 * Deliberately framework-free — a handful of DOM calls doesn't need React.
 */
export default class UIPanel {
  constructor({ onSelect }) {
    this.onSelect = onSelect;
    this.grid = document.getElementById('alphabet-grid');
    this.letterBig = document.getElementById('letter-big');
    this.letterDesc = document.getElementById('letter-desc');
    this.fpsEl = document.getElementById('fps');
    this.autoplayToggle = document.getElementById('autoplay-toggle');
    this.buttons = new Map();

    this._buildGrid();
    this._autoplayTimer = null;
    this._autoplayIndex = 0;

    this.autoplayToggle.addEventListener('change', () => {
      if (this.autoplayToggle.checked) this._startAutoplay();
      else this._stopAutoplay();
    });
  }

  _buildGrid() {
    for (const letter of LETTERS) {
      const btn = document.createElement('button');
      btn.className = 'letter-btn';
      btn.textContent = letter;
      btn.addEventListener('click', () => {
        this.autoplayToggle.checked = false;
        this._stopAutoplay();
        this.onSelect(letter);
      });
      this.grid.appendChild(btn);
      this.buttons.set(letter, btn);
    }
  }

  setActiveLetter(letter, desc) {
    for (const [l, btn] of this.buttons) btn.classList.toggle('active', l === letter);
    this.letterBig.textContent = letter;
    this.letterDesc.textContent = desc || '';
  }

  setFps(fps) {
    this.fpsEl.textContent = `${fps.toFixed(0)} fps`;
  }

  _startAutoplay() {
    this._stopAutoplay();
    this._autoplayTimer = setInterval(() => {
      this._autoplayIndex = (this._autoplayIndex + 1) % LETTERS.length;
      this.onSelect(LETTERS[this._autoplayIndex]);
    }, 1200);
  }

  _stopAutoplay() {
    if (this._autoplayTimer) clearInterval(this._autoplayTimer);
    this._autoplayTimer = null;
  }
}
