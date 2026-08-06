import SceneManager from './core/SceneManager.js';
import MaterialBuilder from './builders/MaterialBuilder.js';
import LightingBuilder from './builders/LightingBuilder.js';
import AvatarBuilder from './builders/AvatarBuilder.js';
import PoseController from './asl/PoseController.js';
import { AlphabetPoses } from './asl/AlphabetPoses.js';
import AnimationQueue from './asl/AnimationQueue.js';
import UIPanel from './ui/UIPanel.js';
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

// --- Playback: Text -> TextParser -> Sequence -> AnimationQueue -> Avatar ---
// AnimationQueue never touches the rig/PoseController directly — it only
// calls back with (letter, index); this module is the one place that wires
// "play this letter" to an actual pose.
const queue = new AnimationQueue({
  holdMs: 650,
  transitionMs: 460,
  onLetter: (letter) => pose.setLetter(letter),
  onStep: (index) => textPanel.setActiveIndex(index),
  onDone: () => {
    textPanel.setPlaying(false);
    textPanel.setActiveIndex(-1);
  },
  onStop: () => textPanel.setPlaying(false),
});

const textPanel = new TextSignPanel({
  onPlay: (sequence) => {
    ui.stopAutoplay();
    queue.load(sequence);
    textPanel.setPlaying(true);
    queue.play();
  },
  onReplay: (sequence) => {
    ui.stopAutoplay();
    queue.load(sequence);
    textPanel.setPlaying(true);
    queue.play();
  },
  onStop: () => queue.stop(),
});

const ui = new UIPanel({
  onSelect: (letter) => {
    queue.stop();
    pose.setLetter(letter);
  },
  onAutoplayStart: () => queue.stop(),
});
ui.setActiveLetter('A', AlphabetPoses.A.desc);
pose.onLetterChange = (letter, data) => ui.setActiveLetter(letter, data.desc);

let fpsAccum = 0;
let fpsFrames = 0;
let fpsTimer = 0;

sceneManager.onTick((dt) => {
  pose.update(dt);

  fpsAccum += dt;
  fpsFrames++;
  fpsTimer += dt;
  if (fpsTimer > 0.5) {
    ui.setFps(fpsFrames / fpsAccum);
    fpsAccum = 0;
    fpsFrames = 0;
    fpsTimer = 0;
  }
});

sceneManager.start();

if (import.meta.env.DEV) {
  window.__debug = { sceneManager, rig, pose, avatarGroup, queue };
}
