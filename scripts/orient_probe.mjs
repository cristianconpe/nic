import * as THREE from 'three';
import { AvatarConfig } from '../src/avatar/AvatarConfig.js';
import { JOINT_LIMITS, clamp } from '../src/builders/RigBuilder.js';

/**
 * Combined probe: builds the same shoulder->foreArm->hand->index chain as
 * axis_probe + wrist_probe, for a given wrist delta AND index curl, and
 * reports both (a) the index fingertip's world-space pointing direction
 * from the MCP joint, and (b) the hand's local +Z world direction (the
 * "palm faces this way" axis — curl bends fingers from local +Y toward
 * local +Z, so +Z pointing at the camera means we see the palm; pointing
 * away means we see the back of the hand / knuckles).
 */
const cfg = AvatarConfig.arm;
const restShoulder = cfg.restShoulder;
const restElbow = cfg.restElbow;
const restWrist = cfg.restWrist;
const idx = AvatarConfig.fingers.index;
const hand = AvatarConfig.hand;

function deg2rad(d) {
  return (d * Math.PI) / 180;
}
function pctToDeg(pct, max) {
  return (THREE.MathUtils.clamp(pct, -100, 100) / 100) * max;
}

const wristDelta = JSON.parse(process.env.WRIST || '{"x":0,"y":0,"z":0}');
const mcpPct = Number(process.env.MCP || 100);
const pipPct = Number(process.env.PIP || 0);
const dipPct = Number(process.env.DIP || 0);
const spreadPct = Number(process.env.SPREAD || 0);

const shoulder = new THREE.Bone();
shoulder.rotation.set(deg2rad(restShoulder.x), deg2rad(restShoulder.y), deg2rad(restShoulder.z));

const foreArm = new THREE.Bone();
foreArm.rotation.set(deg2rad(restElbow.x), deg2rad(restElbow.y), deg2rad(restElbow.z));
foreArm.position.set(0, cfg.upperLength, 0);
shoulder.add(foreArm);

const handBone = new THREE.Bone();
handBone.rotation.set(
  deg2rad(restWrist.x + clamp(wristDelta.x || 0, JOINT_LIMITS.wrist.x)),
  deg2rad(restWrist.y + clamp(wristDelta.y || 0, JOINT_LIMITS.wrist.y)),
  deg2rad(restWrist.z + clamp(wristDelta.z || 0, JOINT_LIMITS.wrist.z))
);
handBone.position.set(0, cfg.foreLength, 0);
foreArm.add(handBone);

const mcp = new THREE.Bone();
mcp.position.set(idx.base[0], hand.palmLength + idx.base[1], hand.palmThickness * 0.08);
mcp.rotation.set(
  deg2rad(clamp(pctToDeg(mcpPct, JOINT_LIMITS.mcpCurl[1]), JOINT_LIMITS.mcpCurl)),
  0,
  deg2rad(clamp(pctToDeg(spreadPct, JOINT_LIMITS.mcpSpread[1]), JOINT_LIMITS.mcpSpread))
);
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

shoulder.updateWorldMatrix(true, true);

const mcpPos = new THREE.Vector3();
mcp.getWorldPosition(mcpPos);
const tipPos = new THREE.Vector3();
tip.getWorldPosition(tipPos);
const indexDir = tipPos.clone().sub(mcpPos).normalize();

const handOrigin = new THREE.Vector3();
handBone.getWorldPosition(handOrigin);
const zProbe = new THREE.Object3D();
zProbe.position.set(0, 0, 1);
handBone.add(zProbe);
handBone.updateWorldMatrix(true, true);
const zWorld = new THREE.Vector3();
zProbe.getWorldPosition(zWorld);
const zDir = zWorld.sub(handOrigin).normalize();

function fmt(v) {
  return `(${v.x.toFixed(3)}, ${v.y.toFixed(3)}, ${v.z.toFixed(3)})`;
}

console.log(`index pointing dir (world, from MCP): ${fmt(indexDir)}`);
console.log(`hand local +Z world dir (palm faces this way; +Z_world=toward camera): ${fmt(zDir)}`);
