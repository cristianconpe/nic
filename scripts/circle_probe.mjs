import * as THREE from 'three';
import { AvatarConfig } from '../src/avatar/AvatarConfig.js';
import { JOINT_LIMITS, clamp } from '../src/builders/RigBuilder.js';

/**
 * For O (and any letter where the thumb must actually meet a fingertip):
 * builds both the thumb chain and the index-finger chain in hand-local
 * space and reports the gap between their tips, so "does the circle
 * close" is a number instead of a guess.
 */
const t = AvatarConfig.thumb;
const idx = AvatarConfig.fingers.index;

function deg2rad(d) {
  return (d * Math.PI) / 180;
}
function pctToDeg(pct, max) {
  return (THREE.MathUtils.clamp(pct, -100, 100) / 100) * max;
}

function thumbTip(cmcDelta, mcpPct, ipPct) {
  const cx = clamp(cmcDelta.x || 0, JOINT_LIMITS.thumbCmc.x);
  const cy = clamp(cmcDelta.y || 0, JOINT_LIMITS.thumbCmc.y);
  const cz = clamp(cmcDelta.z || 0, JOINT_LIMITS.thumbCmc.z);
  const cmc = new THREE.Bone();
  cmc.position.set(t.baseOffset[0], t.baseOffset[1], t.baseOffset[2]);
  cmc.rotation.set(deg2rad(t.restRotation.x + cx), deg2rad(t.restRotation.y + cy), deg2rad(t.restRotation.z + cz));
  const mcp = new THREE.Bone();
  mcp.position.set(0, t.lengths[0], 0);
  mcp.rotation.set(deg2rad(clamp(pctToDeg(mcpPct, JOINT_LIMITS.thumbMcp[1]), JOINT_LIMITS.thumbMcp)), 0, 0);
  cmc.add(mcp);
  const ip = new THREE.Bone();
  ip.position.set(0, t.lengths[1], 0);
  ip.rotation.set(deg2rad(clamp(pctToDeg(ipPct, JOINT_LIMITS.thumbIp[1]), JOINT_LIMITS.thumbIp)), 0, 0);
  mcp.add(ip);
  const tip = new THREE.Object3D();
  tip.position.set(0, t.lengths[2], 0);
  ip.add(tip);
  cmc.updateWorldMatrix(true, true);
  const p = new THREE.Vector3();
  tip.getWorldPosition(p);
  return p;
}

function indexTip(mcpPct, pipPct, dipPct, spreadPct = 0) {
  const mcp = new THREE.Bone();
  mcp.position.set(idx.base[0], AvatarConfig.hand.palmLength + idx.base[1], AvatarConfig.hand.palmThickness * 0.08);
  const curlMcp = clamp(pctToDeg(mcpPct, JOINT_LIMITS.mcpCurl[1]), JOINT_LIMITS.mcpCurl);
  const spread = clamp(pctToDeg(spreadPct, JOINT_LIMITS.mcpSpread[1]), JOINT_LIMITS.mcpSpread);
  mcp.rotation.set(deg2rad(curlMcp), 0, deg2rad(spread));

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

  mcp.updateWorldMatrix(true, true);
  const p = new THREE.Vector3();
  tip.getWorldPosition(p);
  return p;
}

const cmcDelta = JSON.parse(process.env.CMC || '{"x":0,"y":0,"z":0}');
const mcpPct = Number(process.env.MCP || 0);
const ipPct = Number(process.env.IP || 0);
const idxMcp = Number(process.env.IDX_MCP || 54);
const idxPip = Number(process.env.IDX_PIP || 56);
const idxDip = Number(process.env.IDX_DIP || 46);
const idxSpread = Number(process.env.IDX_SPREAD || 0);

const tt = thumbTip(cmcDelta, mcpPct, ipPct);
const it = indexTip(idxMcp, idxPip, idxDip, idxSpread);
const gap = tt.distanceTo(it);

console.log(`thumb tip:  (${tt.x.toFixed(3)}, ${tt.y.toFixed(3)}, ${tt.z.toFixed(3)})`);
console.log(`index tip:  (${it.x.toFixed(3)}, ${it.y.toFixed(3)}, ${it.z.toFixed(3)})`);
console.log(`gap: ${gap.toFixed(4)} m  (thumb radius ~0.010, index tip radius ~0.007 -> touching at roughly <=0.017)`);
