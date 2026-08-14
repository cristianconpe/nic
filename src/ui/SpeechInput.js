/**
 * SpeechInput
 * -----------
 * Thin wrapper around the browser's SpeechRecognition (Web Speech API).
 * Does exactly one thing — voice to text — and nothing else: it never
 * touches the avatar, the pose system, or playback. The caller decides
 * what to do with the transcript (TextSignPanel just drops it into the
 * text input, same as if the user had typed it).
 *
 * No backend, no network call: this is entirely the browser's built-in
 * recognizer. On browsers without it (e.g. Firefox), `isSupported` is
 * false and every method is a safe no-op.
 */
export default class SpeechInput {
  constructor({ lang = 'en-US', onResult, onStateChange, onError } = {}) {
    this.onResult = onResult;
    this.onStateChange = onStateChange;
    this.onError = onError;
    this.isListening = false;

    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = !!Ctor;
    if (!this.isSupported) return;

    this.recognition = new Ctor();
    this.recognition.lang = lang;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.addEventListener('result', (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      this.onResult?.(transcript);
    });

    this.recognition.addEventListener('end', () => {
      this.isListening = false;
      this.onStateChange?.(false);
    });

    this.recognition.addEventListener('error', (event) => {
      this.isListening = false;
      this.onStateChange?.(false);
      this.onError?.(event.error);
    });
  }

  start() {
    if (!this.isSupported || this.isListening) return;
    this.isListening = true;
    this.onStateChange?.(true);
    this.recognition.start();
  }

  stop() {
    if (!this.isSupported || !this.isListening) return;
    this.recognition.stop();
  }

  toggle() {
    if (this.isListening) this.stop();
    else this.start();
  }
}
