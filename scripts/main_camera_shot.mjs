/**
 * Screenshots a letter zoomed in on the hand, but along the EXACT same
 * viewing direction as the app's actual default camera (SceneManager's
 * initial position/target) — just closer. This matters because "cámara
 * principal" comparisons need the real viewing angle, not an arbitrary
 * close-up angle that happens to look nice.
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const url = process.env.URL || 'http://localhost:5210';
const letter = process.env.LETTER || null;
const outDir = process.env.OUT_DIR || '.';
const outFile = process.env.OUT_FILE || 'mainshot.png';
const distance = Number(process.env.DIST || 0.55);

function resolveExecutablePath() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base || !fs.existsSync(base)) return undefined;
  const entry = fs.readdirSync(base).find((f) => f.startsWith('chromium-'));
  return entry ? path.join(base, entry, 'chrome-linux', 'chrome') : undefined;
}

const browser = await chromium.launch({ executablePath: resolveExecutablePath() });
const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
const errors = [];
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

if (letter) {
  await page.evaluate((l) => {
    document.querySelectorAll('.letter-btn').forEach((b) => {
      if (b.textContent === l) b.click();
    });
  }, letter);
  await page.waitForTimeout(700);
}

await page.evaluate((dist) => {
  const { rig, sceneManager } = window.__debug;
  const hand = rig.get('hand.R');
  hand.updateWorldMatrix(true, false);
  const handPos = hand.getWorldPosition(new (Object.getPrototypeOf(hand.position).constructor)());

  // Default camera direction, from SceneManager's own initial setup.
  const defaultCamPos = { x: 0, y: 1.62, z: 4.1 };
  const defaultTarget = { x: 0, y: 1.58, z: 0 };
  const dir = {
    x: defaultCamPos.x - defaultTarget.x,
    y: defaultCamPos.y - defaultTarget.y,
    z: defaultCamPos.z - defaultTarget.z,
  };
  const len = Math.sqrt(dir.x ** 2 + dir.y ** 2 + dir.z ** 2);
  dir.x /= len;
  dir.y /= len;
  dir.z /= len;

  sceneManager.camera.position.set(handPos.x + dir.x * dist, handPos.y + dir.y * dist, handPos.z + dir.z * dist);
  sceneManager.controls.target.set(handPos.x, handPos.y, handPos.z);
  sceneManager.controls.update();
}, distance);

await page.waitForTimeout(200);
await page.screenshot({ path: path.join(outDir, outFile) });
if (errors.length) console.error('PAGE ERRORS:', errors);
await browser.close();
