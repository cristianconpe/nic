import * as THREE from 'three';
import { AvatarConfig } from '../src/avatar/AvatarConfig.js';
import { JOINT_LIMITS, clamp } from '../src/builders/RigBuilder.js';

function deg2rad(d) { return (d * Math.PI) / 180; }
function pctToDeg(pct, max) { return (THREE.MathUtils.clamp(pct, -100, 100) / 100) * max; }

function fingerTip(name, curl, spread = 0) {
  const f = AvatarConfig.fingers[name];
  const hand = AvatarConfig.hand;
  const mcp = new THREE.Bone();
  mcp.position.set(f.base[0], hand.palmLength + f.base[1], hand.palmThickness * 0.08);
  mcp.rotation.set(deg2rad(clamp(pctToDeg(curl[0], JOINT_LIMITS.mcpCurl[1]), JOINT_LIMITS.mcpCurl)), 0, deg2rad(clamp(pctToDeg(spread, JOINT_LIMITS.mcpSpread[1]), JOINT_LIMITS.mcpSpread)));
  const pip = new THREE.Bone();
  pip.position.set(0, f.lengths[0], 0);
  pip.rotation.set(deg2rad(clamp(pctToDeg(curl[1], JOINT_LIMITS.pipCurl[1]), JOINT_LIMITS.pipCurl)), 0, 0);
  mcp.add(pip);
  const dip = new THREE.Bone();
  dip.position.set(0, f.lengths[1], 0);
  dip.rotation.set(deg2rad(clamp(pctToDeg(curl[2], JOINT_LIMITS.dipCurl[1]), JOINT_LIMITS.dipCurl)), 0, 0);
  pip.add(dip);
  const tip = new THREE.Object3D();
  tip.position.set(0, f.lengths[2], 0);
  dip.add(tip);
  mcp.updateWorldMatrix(true, true);
  const p = new THREE.Vector3();
  tip.getWorldPosition(p);
  const pipPos = new THREE.Vector3();
  pip.getWorldPosition(pipPos);
  return { tip: p, pip: pipPos };
}

function thumbTip(cmcDelta, mcpPct, ipPct) {
  const t = AvatarConfig.thumb;
  const cmc = new THREE.Bone();
  cmc.position.set(t.baseOffset[0], t.baseOffset[1], t.baseOffset[2]);
  cmc.rotation.set(
    deg2rad(t.restRotation.x + clamp(cmcDelta.x || 0, JOINT_LIMITS.thumbCmc.x)),
    deg2rad(t.restRotation.y + clamp(cmcDelta.y || 0, JOINT_LIMITS.thumbCmc.y)),
    deg2rad(t.restRotation.z + clamp(cmcDelta.z || 0, JOINT_LIMITS.thumbCmc.z))
  );
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

const idx = fingerTip('index', [90, 82, 68]);
const mid = fingerTip('middle', [92, 92, 82]);
console.log('index tip:', idx.tip, 'pip:', idx.pip);
console.log('middle tip:', mid.tip, 'pip:', mid.pip);
const targetPip = idx.pip.clone().add(mid.pip).multiplyScalar(0.5);
const targetTip = idx.tip.clone().add(mid.tip).multiplyScalar(0.5);
console.log('midpoint of PIPs (target-ish, between knuckles):', targetPip);
console.log('midpoint of TIPs:', targetTip);

const cmcJSON = JSON.parse(process.env.CMC || '{"x":18,"y":-4,"z":-4}');
const mcpPct = Number(process.env.MCP || 100);
const ipPct = Number(process.env.IP || 90);
const tt = thumbTip(cmcJSON, mcpPct, ipPct);
console.log('thumb tip at CMC', cmcJSON, 'mcp', mcpPct, 'ip', ipPct, ':', tt);
console.log('distance to PIP midpoint:', tt.distanceTo(targetPip).toFixed(4));
console.log('distance to TIP midpoint:', tt.distanceTo(targetTip).toFixed(4));

if (process.env.SWEEP) {
  const results = [];
  for (let cx = -40; cx <= 60; cx += 20) {
    for (let cy = -90; cy <= 50; cy += 20) {
      for (let cz = -30; cz <= 75; cz += 15) {
        for (const mcpP of [40, 60, 80, 100]) {
          for (const ipP of [30, 60, 90]) {
            const p = thumbTip({ x: cx, y: cy, z: cz }, mcpP, ipP);
            const d = p.distanceTo(targetPip);
            results.push({ cx, cy, cz, mcpP, ipP, d });
          }
        }
      }
    }
  }
  results.sort((a, b) => a.d - b.d);
  for (const r of results.slice(0, 15)) {
    console.log(`cmc=(${r.cx},${r.cy},${r.cz}) mcp=${r.mcpP} ip=${r.ipP} -> dist=${r.d.toFixed(4)}`);
  }
}

// Also try targeting the MCP knuckle midpoint (closer, more reachable)
const idxMcpPos = new THREE.Vector3(AvatarConfig.fingers.index.base[0], AvatarConfig.hand.palmLength + AvatarConfig.fingers.index.base[1], AvatarConfig.hand.palmThickness * 0.08);
const midMcpPos = new THREE.Vector3(AvatarConfig.fingers.middle.base[0], AvatarConfig.hand.palmLength + AvatarConfig.fingers.middle.base[1], AvatarConfig.hand.palmThickness * 0.08);
const mcpMidpoint = idxMcpPos.clone().add(midMcpPos).multiplyScalar(0.5);
console.log('MCP knuckle midpoint (much closer target):', mcpMidpoint);

if (process.env.SWEEP2) {
  const results = [];
  for (let cx = -40; cx <= 60; cx += 10) {
    for (let cy = -90; cy <= 50; cy += 10) {
      for (let cz = -30; cz <= 75; cz += 10) {
        for (const mcpP of [40, 60, 80, 100]) {
          for (const ipP of [30, 60, 90]) {
            const p = thumbTip({ x: cx, y: cy, z: cz }, mcpP, ipP);
            const d = p.distanceTo(mcpMidpoint);
            results.push({ cx, cy, cz, mcpP, ipP, d });
          }
        }
      }
    }
  }
  results.sort((a, b) => a.d - b.d);
  for (const r of results.slice(0, 15)) {
    console.log(`cmc=(${r.cx},${r.cy},${r.cz}) mcp=${r.mcpP} ip=${r.ipP} -> dist=${r.d.toFixed(4)}`);
  }
}
