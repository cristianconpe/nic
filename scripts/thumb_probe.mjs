import * as THREE from 'three';
import { AvatarConfig } from '../src/avatar/AvatarConfig.js';
import { JOINT_LIMITS, clamp } from '../src/builders/RigBuilder.js';

/**
 * Builds just the thumb chain (cmc -> mcp -> ip) exactly as FingerBuilder /
 * HandBuilder do, in the hand's own local space (no arm/wrist above it), so
 * we can reason about "does the thumb point sideways relative to the palm"
 * without the camera/arm rotation confusing the read. Also builds the index
 * finger's MCP direction for comparison, since L/etc are about the angle
 * between thumb and index, not either one in isolation.
 */
const t = AvatarConfig.thumb;
const side = 'R';
const mirror = 1;

function deg2rad(d) {
  return (d * Math.PI) / 180;
}

function pctToDeg(pct, max) {
  return (THREE.MathUtils.clamp(pct, -100, 100) / 100) * max;
}

function buildThumb(cmcDeltaDeg, mcpPct, ipPct) {
  // Mirrors PoseController.flatten(): the raw pose delta is clamped to
  // JOINT_LIMITS BEFORE being added to the bind rotation, so a value like
  // -100 silently becomes -50. Applying the same clamp here keeps this
  // probe honest with what the live rig will actually do.
  const cx = clamp(cmcDeltaDeg.x || 0, JOINT_LIMITS.thumbCmc.x);
  const cy = clamp(cmcDeltaDeg.y || 0, JOINT_LIMITS.thumbCmc.y);
  const cz = clamp(cmcDeltaDeg.z || 0, JOINT_LIMITS.thumbCmc.z);
  if (cx !== (cmcDeltaDeg.x || 0) || cy !== (cmcDeltaDeg.y || 0) || cz !== (cmcDeltaDeg.z || 0)) {
    console.log(`  (clamped cmc delta to x:${cx} y:${cy} z:${cz})`);
  }

  const cmcBind = t.restRotation; // side R
  const cmc = new THREE.Bone();
  cmc.position.set(t.baseOffset[0] * mirror, t.baseOffset[1], t.baseOffset[2]);
  cmc.rotation.set(deg2rad(cmcBind.x + cx), deg2rad(cmcBind.y + cy), deg2rad(cmcBind.z + cz));

  const mcp = new THREE.Bone();
  mcp.position.set(0, t.lengths[0], 0);
  const mcpDeg = clamp(pctToDeg(mcpPct, JOINT_LIMITS.thumbMcp[1]), JOINT_LIMITS.thumbMcp);
  mcp.rotation.set(deg2rad(mcpDeg), 0, 0);
  cmc.add(mcp);

  const ip = new THREE.Bone();
  ip.position.set(0, t.lengths[1], 0);
  const ipDeg = clamp(pctToDeg(ipPct, JOINT_LIMITS.thumbIp[1]), JOINT_LIMITS.thumbIp);
  ip.rotation.set(deg2rad(ipDeg), 0, 0);
  mcp.add(ip);

  const tip = new THREE.Object3D();
  tip.position.set(0, t.lengths[2], 0);
  ip.add(tip);

  cmc.updateWorldMatrix(true, true);
  const tipPos = new THREE.Vector3();
  tip.getWorldPosition(tipPos);
  const basePos = new THREE.Vector3();
  cmc.getWorldPosition(basePos);
  return tipPos.sub(basePos); // thumb reach vector in hand-local space
}

const cmcDelta = JSON.parse(process.env.CMC || '{"x":0,"y":0,"z":0}');
const mcpPct = Number(process.env.MCP || 0);
const ipPct = Number(process.env.IP || 0);

const reach = buildThumb(cmcDelta, mcpPct, ipPct);
console.log(`thumb reach (hand-local): (${reach.x.toFixed(3)}, ${reach.y.toFixed(3)}, ${reach.z.toFixed(3)})`);
console.log(`  +X = toward thumb's own side (away from fingers, "L" direction)`);
console.log(`  +Y = toward fingertips (parallel to a straight index)`);
console.log(`  +Z = toward viewer / out of palm`);
console.log(`  magnitude: ${reach.length().toFixed(3)}`);
