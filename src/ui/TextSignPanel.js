import { parseText, hasSignableContent } from '../asl/TextParser.js';

/**
 * TextSignPanel
 * -------------
 * DOM wiring only — the text box, Play/Replay/Clear buttons, and the
 * letter-progress chips. It never touches the avatar or the rig directly:
 * on Play it parses the input into a sequence (TextParser) and hands that
 * sequence to whatever `onPlay(sequence)` callback it was given, same as
 * UIPanel does for single letters. main.js is the only place that wires a
 * sequence to an actual AnimationQueue/PoseController.
 */
export default class TextSignPanel {
  constructor({ onPlay, onStop, onReplay }) {
    this.onPlay = onPlay;
    this.onStop = onStop;
    this.onReplay = onReplay;

    this.input = document.getElementById('text-input');
    this.chipsEl = document.getElementById('text-chips');
    this.playBtn = document.getElementById('btn-play');
    this.replayBtn = document.getElementById('btn-replay');
    this.clearBtn = document.getElementById('btn-clear');

    this.sequence = [];
    this.isPlaying = false;

    this._renderChips();
    this._syncButtons();

    this.input.addEventListener('input', () => {
      this.sequence = parseText(this.input.value);
      this._renderChips();
      this._syncButtons();
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._handlePlayToggle();
      }
    });

    this.playBtn.addEventListener('click', () => this._handlePlayToggle());
    this.replayBtn.addEventListener('click', () => {
      if (!hasSignableContent(this.input.value)) return;
      this.onReplay?.(this.sequence);
    });
    this.clearBtn.addEventListener('click', () => {
      this.input.value = '';
      this.sequence = [];
      this.setPlaying(false);
      this._renderChips();
      this._syncButtons();
      this.onStop?.();
    });
  }

  _handlePlayToggle() {
    if (this.isPlaying) {
      this.onStop?.();
      return;
    }
    if (!hasSignableContent(this.input.value)) return;
    this.onPlay?.(this.sequence);
  }

  /** Called by main.js to keep the button/chip UI in sync with actual playback state. */
  setPlaying(isPlaying) {
    this.isPlaying = isPlaying;
    this.playBtn.textContent = isPlaying ? '❚❚' : '▶';
    this.playBtn.title = isPlaying ? 'Detener' : 'Reproducir';
    this.playBtn.classList.toggle('is-playing', isPlaying);
    this._syncButtons();
  }

  setActiveIndex(index) {
    const chips = this.chipsEl.querySelectorAll('.text-chip');
    chips.forEach((chip, i) => {
      const n = Number(chip.dataset.index);
      chip.classList.toggle('active', n === index);
      chip.classList.toggle('done', n < index);
    });
  }

  _renderChips() {
    this.chipsEl.innerHTML = '';
    this.sequence.forEach((step, i) => {
      const chip = document.createElement('div');
      chip.dataset.index = String(i);
      if (step.type === 'letter') {
        chip.className = 'text-chip';
        chip.textContent = step.letter;
      } else {
        chip.className = 'text-chip pause';
      }
      this.chipsEl.appendChild(chip);
    });
  }

  _syncButtons() {
    const hasContent = hasSignableContent(this.input.value);
    this.replayBtn.disabled = !hasContent || this.isPlaying;
    this.clearBtn.disabled = this.input.value.length === 0;
    this.playBtn.disabled = !hasContent && !this.isPlaying;
  }
}
