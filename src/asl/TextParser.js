import { AlphabetPoses } from './AlphabetPoses.js';

/**
 * TextParser
 * ----------
 * Text -> Sequence. The only thing this module knows about is characters;
 * it has no idea a Rig, a PoseController, or a scene exist. That's the
 * point — the avatar downstream just plays back whatever sequence it's
 * handed.
 *
 * A sequence is an array of steps:
 *   { type: 'letter', letter: 'H' }   - sign this letter
 *   { type: 'pause', ms }             - hold neutral (word gap)
 *
 * Characters with no defined handshape (digits, punctuation, accents) are
 * dropped rather than guessed at, since only the manual alphabet exists so
 * far.
 */
export function parseText(text) {
  const sequence = [];
  const upper = (text || '').toUpperCase();

  for (const ch of upper) {
    if (AlphabetPoses[ch]) {
      sequence.push({ type: 'letter', letter: ch });
    } else if (ch === ' ' || ch === '\n' || ch === '\t') {
      // Collapse consecutive whitespace into a single pause instead of one per space.
      const last = sequence[sequence.length - 1];
      if (!last || last.type !== 'pause') sequence.push({ type: 'pause', ms: 550 });
    }
    // Anything else (digits, punctuation, accents) is silently skipped.
  }

  // Trim leading/trailing pauses — nothing to hold before the first or after the last letter.
  while (sequence.length && sequence[0].type === 'pause') sequence.shift();
  while (sequence.length && sequence[sequence.length - 1].type === 'pause') sequence.pop();

  return sequence;
}

/** True if any character in the text maps to a known handshape. */
export function hasSignableContent(text) {
  return parseText(text).some((step) => step.type === 'letter');
}
