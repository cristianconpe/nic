/**
 * Small dev/QA helper: boots a headless browser against a running `npm run
 * dev` server, optionally selects an ASL letter and/or repositions the
 * camera, then saves a screenshot. Used while tuning the rig/pose data —
 * not part of the app build.
 *
 * Usage:
 *   npm run dev &
 *   LETTER=B OUT_FILE=b.png npm run shot
 *   CAM_POS="0.5,1.8,0.4" CAM_TARGET="0.2,1.7,-0.1" npm run shot
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const url = process.env.URL || 'http://localhost:5173';
const letter = process.env.LETTER || null;
const outDir = process.env.OUT_DIR || '.';
const outFile = process.env.OUT_FILE || 'shot.png';
const camPos = process.env.CAM_POS; // "x,y,z"
const camTarget = process.env.CAM_TARGET; // "x,y,z"

function resolveExecutablePath() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base || !fs.existsSync(base)) return undefined;
  const entry = fs.readdirSync(base).find((f) => f.startsWith('chromium-'));
  if (!entry) return undefined;
  const candidate = path.join(base, entry, 'chrome-linux', 'chrome');
  return fs.existsSync(candidate) ? candidate : undefined;
}

const browser = await chromium.launch({ executablePath: resolveExecutablePath() });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors = [];
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

if (letter) {
  await page.evaluate((l) => {
    document.querySelectorAll('.letter-btn').forEach((b) => {
      if (b.textContent === l) b.click();
    });
  }, letter);
  await page.waitForTimeout(700);
}

if (camPos || camTarget) {
  await page.evaluate(
    ({ camPos, camTarget }) => {
      const { sceneManager } = window.__debug || {};
      if (!sceneManager) return;
      if (camPos) sceneManager.camera.position.set(...camPos.split(',').map(Number));
      if (camTarget) sceneManager.controls.target.set(...camTarget.split(',').map(Number));
      sceneManager.controls.update();
    },
    { camPos, camTarget }
  );
  await page.waitForTimeout(200);
}

await page.screenshot({ path: path.join(outDir, outFile) });
if (errors.length) console.error('PAGE ERRORS:', errors);
await browser.close();
