import { parseText, hasSignableContent } from '../asl/TextParser.js';
import SpeechInput from './SpeechInput.js';

/**
 * TextSignPanel
 * -------------
 * DOM wiring only — the text box, its Play/Mic/Clear controls, the speed
 * selector, and the letter-progress chips. It never touches the avatar or
 * the rig directly: on Play it parses the input into a sequence
 * (TextParser) and hands that sequence to whatever `onPlay(sequence)`
 * callback it was given. main.js is the only place that wires a sequence
 * to an actual AnimationQueue/PoseController.
 *
 * The microphone is a second way to fill the same input — voice becomes
 * text, nothing more. It never starts playback on its own; only the Play
 * button (or Enter) turns text into signs, exactly as if the text had
 * been typed.
 */
export default class TextSignPanel {
  constructor({ onPlay, onStop, onSpeedChange }) {
    this.onPlay = onPlay;
    this.onStop = onStop;
    this.onSpeedChange = onSpeedChange;

    this.input = document.getElementById('text-input');
    this.chipsEl = document.getElementById('text-chips');
    this.playBtn = document.getElementById('btn-play');
    this.micBtn = document.getElementById('btn-mic');
    this.clearBtn = document.getElementById('btn-clear');
    this.speedSelect = document.getElementById('speed-select');

    this.sequence = [];
    this.isPlaying = false;
    this._micBaseText = '';

    this._renderChips();
    this._syncButtons();
    this._initSpeech();

    this.input.addEventListener('input', () => this._onInputChanged());

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._handlePlayToggle();
      }
    });

    this.playBtn.addEventListener('click', () => this._handlePlayToggle());
    this.clearBtn.addEventListener('click', () => {
      if (this.speech?.isListening) this.speech.stop();
      this.input.value = '';
      this.sequence = [];
      this.setPlaying(false);
      this._renderChips();
      this._syncButtons();
      this.onStop?.();
    });

    this.speedSelect?.addEventListener('change', () => {
      this.onSpeedChange?.(Number(this.speedSelect.value));
    });
  }

  _initSpeech() {
    this.speech = new SpeechInput({
      lang: 'en-US',
      onResult: (transcript) => {
        this.input.value = this._micBaseText + transcript;
        this._onInputChanged();
      },
      onStateChange: (isListening) => {
        this.micBtn.classList.toggle('is-listening', isListening);
        this.micBtn.title = isListening ? 'Detener dictado' : 'Dictado por voz';
      },
      onError: () => {
        this.micBtn.classList.remove('is-listening');
      },
    });

    if (!this.speech.isSupported) {
      this.micBtn.disabled = true;
      this.micBtn.title = 'Reconocimiento de voz no disponible en este navegador';
      return;
    }

    this.micBtn.addEventListener('click', () => {
      if (this.speech.isListening) {
        this.speech.stop();
        return;
      }
      this._micBaseText = this.input.value ? `${this.input.value} ` : '';
      this.speech.start();
    });
  }

  _onInputChanged() {
    this.sequence = parseText(this.input.value);
    this._renderChips();
    this._syncButtons();
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
    this.clearBtn.disabled = this.input.value.length === 0;
    this.playBtn.disabled = !hasContent && !this.isPlaying;
  }
}
