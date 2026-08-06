/**
 * AnimationQueue
 * --------------
 * Sequence -> playback. This is the piece that turns a static list of
 * letters into a timed performance, and it's deliberately the only piece
 * that knows about time. It does not know what a "hand" or a "letter pose"
 * is — it just calls `onLetter(letter, index)` at the right moments and
 * lets the caller (main.js, wiring PoseController underneath) decide what
 * that means. That's what keeps the text box from reaching into the
 * avatar directly:
 *
 *   Text -> TextParser -> Sequence -> AnimationQueue -> (callback) -> Avatar
 *
 * `holdMs` is how long a letter is held once fully formed; `transitionMs`
 * should match (or slightly exceed) PoseController's own easing duration
 * so the queue doesn't advance mid-blend.
 */
export default class AnimationQueue {
  constructor({ onLetter, onStep, onDone, onStop, holdMs = 650, transitionMs = 450 } = {}) {
    this.onLetter = onLetter;
    this.onStep = onStep; // (index, sequence) — fired on every step, letter or pause
    this.onDone = onDone;
    this.onStop = onStop;
    this.holdMs = holdMs;
    this.transitionMs = transitionMs;

    this.sequence = [];
    this.isPlaying = false;
    this.currentIndex = -1;
    this._playToken = 0;
  }

  load(sequence) {
    this.stop();
    this.sequence = sequence || [];
    this.currentIndex = -1;
  }

  async play() {
    if (this.isPlaying || this.sequence.length === 0) return;
    this.isPlaying = true;
    const token = ++this._playToken;

    for (let i = 0; i < this.sequence.length; i++) {
      const step = this.sequence[i];
      this.currentIndex = i;
      this.onStep?.(i, this.sequence);

      if (step.type === 'letter') {
        this.onLetter?.(step.letter, i);
        if (!(await this._wait(this.transitionMs + this.holdMs, token))) return;
      } else {
        if (!(await this._wait(step.ms ?? this.holdMs * 0.7, token))) return;
      }
    }

    if (token === this._playToken) {
      this.isPlaying = false;
      this.currentIndex = -1;
      this.onDone?.();
    }
  }

  /** Stops playback in place (does not clear the loaded sequence). */
  stop() {
    const wasPlaying = this.isPlaying;
    this._playToken++;
    this.isPlaying = false;
    this.currentIndex = -1;
    if (wasPlaying) this.onStop?.();
  }

  replay() {
    this.stop();
    this.play();
  }

  _wait(ms, token) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(token === this._playToken), ms);
    });
  }
}
