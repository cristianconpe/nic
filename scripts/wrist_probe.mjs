import * as THREE from 'three';
import { AvatarConfig } from '../src/avatar/AvatarConfig.js';
import { JOINT_LIMITS, clamp } from '../src/builders/RigBuilder.js';

/**
 * Builds hand -> index chain (relative to the forearm, i.e. ignoring the
 * upper arm/shoulder chain above it, which doesn't change per-letter) for a
 * given wrist delta + index curl, and reports the fingertip direction
 * relative to the wrist's PARENT (forearm) frame — this is what actually
 * needs to change for a finger to visually point "down" instead of "up"
 * against a roughly-fixed forearm.
 */
const restWrist = AvatarConfig.arm.restWrist;
const idx = AvatarConfig.fingers.index;
const hand = AvatarConfig.hand;

function deg2rad(d) {
  return (d * Math.PI) / 180;
}
function pctToDeg(pct, max) {
  return (THREE.MathUtils.clamp(pct, -100, 100) / 100) * max;
}

const wristDelta = JSON.parse(process.env.WRIST || '{"x":0,"y":0,"z":0}');
const mcpPct = Number(process.env.MCP || 0);
const pipPct = Number(process.env.PIP || 0);
const dipPct = Number(process.env.DIP || 0);

const handBone = new THREE.Bone();
handBone.rotation.set(
  deg2rad(restWrist.x + (clamp(wristDelta.x || 0, JOINT_LIMITS.wrist.x))),
  deg2rad(restWrist.y + (clamp(wristDelta.y || 0, JOINT_LIMITS.wrist.y))),
  deg2rad(restWrist.z + (clamp(wristDelta.z || 0, JOINT_LIMITS.wrist.z)))
);

const mcp = new THREE.Bone();
mcp.position.set(idx.base[0], hand.palmLength + idx.base[1], hand.palmThickness * 0.08);
mcp.rotation.set(deg2rad(clamp(pctToDeg(mcpPct, JOINT_LIMITS.mcpCurl[1]), JOINT_LIMITS.mcpCurl)), 0, 0);
handBone.add(mcp);

const pip = new THREE.Bone();
pip.position.set(0, idx.lengths[0], 0);
pip.rotation.set(deg2rad(clamp(pctToDeg(pipPct, JOINT_LIMITS.pipCurl[1]), JOINT_LIMITS.pipCurl)), 0, 0);
mcp.add(pip);

const dip = new THREE.Bone();
dip.position.set(0, idx.lengths[1], 0);
dip.rotation.set(deg2rad(clamp(pctToDeg(dipPct, JOINT_LIMITS.dipCurl[1]), JOINT_LIMITS.dipCurl)), 0, 0);
pip.add(dip);

const tip = new THREE.Object3D();
tip.position.set(0, idx.lengths[2], 0);
dip.add(tip);

handBone.updateWorldMatrix(true, true);
const tipPos = new THREE.Vector3();
tip.getWorldPosition(tipPos);
const mcpPos = new THREE.Vector3();
mcp.getWorldPosition(mcpPos);
const dir = tipPos.clone().sub(mcpPos).normalize();

console.log(`finger's OWN pointing direction, MCP joint to tip (+Y=up, -Y=down, +Z=toward viewer): (${dir.x.toFixed(3)}, ${dir.y.toFixed(3)}, ${dir.z.toFixed(3)})`);
