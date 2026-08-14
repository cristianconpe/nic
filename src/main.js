import SceneManager from './core/SceneManager.js';
import MaterialBuilder from './builders/MaterialBuilder.js';
import LightingBuilder from './builders/LightingBuilder.js';
import AvatarBuilder from './builders/AvatarBuilder.js';
import PoseController from './asl/PoseController.js';
import { AlphabetPoses } from './asl/AlphabetPoses.js';
import AnimationQueue from './asl/AnimationQueue.js';
import TextSignPanel from './ui/TextSignPanel.js';

const canvas = document.getElementById('scene');
const sceneManager = new SceneManager(canvas);

LightingBuilder.build(sceneManager.scene);
sceneManager.addGround();

const materials = MaterialBuilder.build();
const { group: avatarGroup, rig } = AvatarBuilder.build(materials);
sceneManager.scene.add(avatarGroup);

const pose = new PoseController(rig, 'R');
pose.setLetter('A', { animate: false });

const letterBigEl = document.getElementById('letter-big');
const letterDescEl = document.getElementById('letter-desc');
letterBigEl.textContent = 'A';
letterDescEl.textContent = AlphabetPoses.A.desc || '';
pose.onLetterChange = (letter, data) => {
  letterBigEl.textContent = letter;
  letterDescEl.textContent = data.desc || '';
};

// --- Playback speed: only affects timing (how long a hold/transition takes),
// never the poses themselves. holdMs/transitionMs are plain public fields on
// AnimationQueue; PoseController's per-letter blend duration is passed in on
// every onLetter call so it always matches the queue's current transitionMs.
const BASE_HOLD_MS = 650;
const BASE_TRANSITION_MS = 450;

// --- Playback: Text -> TextParser -> Sequence -> AnimationQueue -> Avatar ---
// AnimationQueue never touches the rig/PoseController directly — it only
// calls back with (letter, index); this module is the one place that wires
// "play this letter" to an actual pose.
const queue = new AnimationQueue({
  holdMs: BASE_HOLD_MS,
  transitionMs: BASE_TRANSITION_MS,
  onLetter: (letter) => pose.setLetter(letter, { duration: queue.transitionMs / 1000 }),
  onStep: (index) => textPanel.setActiveIndex(index),
  onDone: () => {
    textPanel.setPlaying(false);
    textPanel.setActiveIndex(-1);
  },
  onStop: () => textPanel.setPlaying(false),
});

const textPanel = new TextSignPanel({
  onPlay: (sequence) => {
    queue.load(sequence);
    textPanel.setPlaying(true);
    queue.play();
  },
  onStop: () => queue.stop(),
  onSpeedChange: (speed) => {
    queue.holdMs = BASE_HOLD_MS / speed;
    queue.transitionMs = BASE_TRANSITION_MS / speed;
  },
});

sceneManager.onTick((dt) => {
  pose.update(dt);
});

sceneManager.start();

if (import.meta.env.DEV) {
  window.__debug = { sceneManager, rig, pose, avatarGroup, queue };
}
