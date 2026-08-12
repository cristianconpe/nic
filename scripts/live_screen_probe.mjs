import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const url = process.env.URL || 'http://localhost:5210';
const letter = process.env.LETTER || 'P';
const dist = Number(process.env.DIST || 1.0);

function resolveExecutablePath() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base || !fs.existsSync(base)) return undefined;
  const entry = fs.readdirSync(base).find((f) => f.startsWith('chromium-'));
  return entry ? path.join(base, entry, 'chrome-linux', 'chrome') : undefined;
}

const browser = await chromium.launch({ executablePath: resolveExecutablePath() });
const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

await page.evaluate((l) => {
  document.querySelectorAll('.letter-btn').forEach((b) => {
    if (b.textContent === l) b.click();
  });
}, letter);
await page.waitForTimeout(700);

const result = await page.evaluate((dist) => {
  const { rig, sceneManager } = window.__debug;
  const hand = rig.get('hand.R');
  const mcp = rig.get('hand.R.index.mcp');
  const dip = rig.get('hand.R.index.dip');
  const thumbIp = rig.get('hand.R.thumb.ip');
  const middleDip = rig.get('hand.R.middle.dip');
  const ringDip = rig.get('hand.R.ring.dip');
  const pinkyDip = rig.get('hand.R.pinky.dip');
  hand.updateWorldMatrix(true, true);

  function worldPos(obj) {
    return obj.getWorldPosition(new (Object.getPrototypeOf(obj.position).constructor)());
  }
  // true fingertip = dip/ip position + local +Y offset by the tip segment's
  // length (hardcoded from AvatarConfig, HAND_SCALE=1.85 already applied)
  function tipWorldPos(bone, segLength) {
    const Vec3 = Object.getPrototypeOf(bone.position).constructor;
    const local = new Vec3(0, segLength, 0);
    bone.updateWorldMatrix(true, false);
    return local.applyMatrix4(bone.matrixWorld);
  }
  const indexTip = tipWorldPos(dip, 0.021 * 1.85);
  const thumbTip = tipWorldPos(thumbIp, 0.028 * 1.85);
  const handPos = worldPos(hand);

  const defaultCamPos = { x: 0, y: 1.62, z: 4.1 };
  const defaultTarget = { x: 0, y: 1.58, z: 0 };
  const dir = {
    x: defaultCamPos.x - defaultTarget.x,
    y: defaultCamPos.y - defaultTarget.y,
    z: defaultCamPos.z - defaultTarget.z,
  };
  const len = Math.sqrt(dir.x ** 2 + dir.y ** 2 + dir.z ** 2);
  dir.x /= len; dir.y /= len; dir.z /= len;

  sceneManager.camera.position.set(handPos.x + dir.x * dist, handPos.y + dir.y * dist, handPos.z + dir.z * dist);
  sceneManager.controls.target.set(handPos.x, handPos.y, handPos.z);
  sceneManager.controls.update();
  sceneManager.camera.updateMatrixWorld(true);

  function toScreen(obj) {
    const p = worldPos(obj).clone().project(sceneManager.camera);
    return { ndcX: p.x, ndcY: p.y, pixelX: (p.x * 0.5 + 0.5) * 1000, pixelY: (1 - (p.y * 0.5 + 0.5)) * 900 };
  }

  function projPoint(worldP) {
    const p = worldP.clone().project(sceneManager.camera);
    return { pixelX: (p.x * 0.5 + 0.5) * 1000, pixelY: (1 - (p.y * 0.5 + 0.5)) * 900 };
  }

  return {
    hand: toScreen(hand),
    indexMcp: toScreen(mcp),
    indexDip: toScreen(dip),
    indexTip: projPoint(indexTip),
    thumbTip: projPoint(thumbTip),
    middleDip: toScreen(middleDip),
    ringDip: toScreen(ringDip),
    pinkyDip: toScreen(pinkyDip),
  };
}, dist);

console.log(JSON.stringify(result, null, 2));
await browser.close();
