import SceneManager from './core/SceneManager.js';
import MaterialBuilder from './builders/MaterialBuilder.js';
import LightingBuilder from './builders/LightingBuilder.js';
import AvatarBuilder from './builders/AvatarBuilder.js';
import PoseController from './asl/PoseController.js';
import { AlphabetPoses } from './asl/AlphabetPoses.js';
import UIPanel from './ui/UIPanel.js';

const canvas = document.getElementById('scene');
const sceneManager = new SceneManager(canvas);

LightingBuilder.build(sceneManager.scene);
sceneManager.addGround();

const materials = MaterialBuilder.build();
const { group: avatarGroup, rig } = AvatarBuilder.build(materials);
sceneManager.scene.add(avatarGroup);

const pose = new PoseController(rig, 'R');
pose.setLetter('A', { animate: false });

const ui = new UIPanel({
  onSelect: (letter) => pose.setLetter(letter),
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
  window.__debug = { sceneManager, rig, pose, avatarGroup };
}
