import * as THREE from 'three';
import { AlphabetPoses } from './AlphabetPoses.js';
import { JOINT_LIMITS, clamp } from '../builders/RigBuilder.js';

const FINGER_NAMES = ['index', 'middle', 'ring', 'pinky'];
const JOINTS = ['mcp', 'pip', 'dip'];

// Centralized sign conventions for the hand-local axes (see HandBuilder /
// FingerBuilder doc comments): curl rotates around local X, spread around
// local Z. Flip these two constants if a mirrored rig ever reads backwards
// instead of re-deriving every letter's numbers.
const CURL_SIGN = 1;
const SPREAD_SIGN = 1;

/**
 * PoseController
 * --------------
 * Turns the semantic AlphabetPoses data (percent curl, degree deltas) into
 * actual bone rotations on a Rig, and smoothly blends between two letters
 * over time instead of snapping — every joint's current angle is linearly
 * eased from its value at the start of the transition to the new target.
 */
export default class PoseController {
  constructor(rig, side = 'R') {
    this.rig = rig;
    this.side = side;
    this.current = flatten(AlphabetPoses.A);
    this.from = { ...this.current };
    this.to = { ...this.current };
    this.t = 1;
    this.duration = 0.45;
    this.letter = 'A';
    this.onLetterChange = null;
    this._apply(this.current);
  }

  setLetter(letter, { animate = true, duration } = {}) {
    if (!AlphabetPoses[letter]) return;
    this.letter = letter;
    const target = flatten(AlphabetPoses[letter]);

    if (!animate) {
      this.current = target;
      this.from = target;
      this.to = target;
      this.t = 1;
      this._apply(this.current);
    } else {
      this.from = { ...this.current };
      this.to = target;
      this.t = 0;
      this.duration = duration ?? 0.45;
    }

    if (this.onLetterChange) this.onLetterChange(letter, AlphabetPoses[letter]);
  }

  update(dt) {
    if (this.t >= 1) return;
    this.t = Math.min(1, this.t + dt / this.duration);
    const e = easeInOutCubic(this.t);
    const blended = {};
    for (const key of Object.keys(this.to)) {
      const a = this.from[key] ?? 0;
      const b = this.to[key] ?? 0;
      blended[key] = THREE.MathUtils.lerp(a, b, e);
    }
    this.current = blended;
    this._apply(blended);
  }

  _apply(flat) {
    const rig = this.rig;
    const side = this.side;

    rig.setLocalEulerDeg(`hand.${side}`, flat.wristX, flat.wristY, flat.wristZ);

    for (const name of FINGER_NAMES) {
      for (const joint of JOINTS) {
        const key = `${name}.${joint}`;
        const curlDeg = flat[`${key}.curl`] || 0;
        const spreadDeg = flat[`${key}.spread`] || 0;
        rig.setLocalEulerDeg(`hand.${side}.${name}.${joint}`, curlDeg, 0, spreadDeg);
      }
    }

    rig.setLocalEulerDeg(
      `hand.${side}.thumb.cmc`,
      flat['thumb.cmc.x'] || 0,
      flat['thumb.cmc.y'] || 0,
      flat['thumb.cmc.z'] || 0
    );
    rig.setLocalEulerDeg(`hand.${side}.thumb.mcp`, flat['thumb.mcp'] || 0, 0, 0);
    rig.setLocalEulerDeg(`hand.${side}.thumb.ip`, flat['thumb.ip'] || 0, 0, 0);

    rig.setLocalPositionOffset(
      `hand.${side}.thumb.cmc`,
      flat['thumb.basePos.x'] || 0,
      flat['thumb.basePos.y'] || 0,
      flat['thumb.basePos.z'] || 0
    );
  }
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Converts one AlphabetPoses entry (percentages/degrees) into a flat map of final bone-delta degrees. */
function flatten(pose) {
  const flat = {
    wristX: clamp(pose.wrist?.x || 0, JOINT_LIMITS.wrist.x),
    wristY: clamp(pose.wrist?.y || 0, JOINT_LIMITS.wrist.y),
    wristZ: clamp(pose.wrist?.z || 0, JOINT_LIMITS.wrist.z),
  };

  for (const name of FINGER_NAMES) {
    const f = pose.fingers[name];
    const [mcpP, pipP, dipP] = f.curl;
    flat[`${name}.mcp.curl`] = CURL_SIGN * clamp(pctToDeg(mcpP, JOINT_LIMITS.mcpCurl[1]), JOINT_LIMITS.mcpCurl);
    flat[`${name}.pip.curl`] = CURL_SIGN * clamp(pctToDeg(pipP, JOINT_LIMITS.pipCurl[1]), JOINT_LIMITS.pipCurl);
    flat[`${name}.dip.curl`] = CURL_SIGN * clamp(pctToDeg(dipP, JOINT_LIMITS.dipCurl[1]), JOINT_LIMITS.dipCurl);
    flat[`${name}.mcp.spread`] = SPREAD_SIGN * clamp(pctToDeg(f.spread, JOINT_LIMITS.mcpSpread[1]), JOINT_LIMITS.mcpSpread);
  }

  const t = pose.thumb;
  flat['thumb.cmc.x'] = clamp(t.cmc.x, JOINT_LIMITS.thumbCmc.x);
  flat['thumb.cmc.y'] = clamp(t.cmc.y, JOINT_LIMITS.thumbCmc.y);
  flat['thumb.cmc.z'] = clamp(t.cmc.z, JOINT_LIMITS.thumbCmc.z);
  flat['thumb.mcp'] = clamp(pctToDeg(t.mcp, JOINT_LIMITS.thumbMcp[1]), JOINT_LIMITS.thumbMcp);
  flat['thumb.ip'] = clamp(pctToDeg(t.ip, JOINT_LIMITS.thumbIp[1]), JOINT_LIMITS.thumbIp);

  const basePos = t.basePos || {};
  flat['thumb.basePos.x'] = basePos.x || 0;
  flat['thumb.basePos.y'] = basePos.y || 0;
  flat['thumb.basePos.z'] = basePos.z || 0;

  return flat;
}

function pctToDeg(pct, max) {
  return (THREE.MathUtils.clamp(pct, -100, 100) / 100) * max;
}
