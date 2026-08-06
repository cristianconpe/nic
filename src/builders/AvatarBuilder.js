import * as THREE from 'three';
import RigBuilder from './RigBuilder.js';
import TorsoBuilder from './TorsoBuilder.js';
import NeckBuilder from './NeckBuilder.js';
import HeadBuilder from './HeadBuilder.js';
import ArmBuilder from './ArmBuilder.js';
import { AvatarConfig } from '../avatar/AvatarConfig.js';

/**
 * AvatarBuilder
 * -------------
 * Top-level orchestrator. Owns no geometry of its own — it only wires the
 * independent builders together in the right order (torso first, since
 * everything else measures itself from the shoulder line) and hands back
 * the finished group plus the shared Rig for the pose system to drive.
 */
export default class AvatarBuilder {
  static build(materials) {
    const rig = RigBuilder.create();
    const group = new THREE.Group();
    group.name = 'Avatar';

    const torso = TorsoBuilder.build(rig, materials);
    group.add(torso.root);

    NeckBuilder.build(rig, materials, torso.chest, torso.chestWorldY);
    HeadBuilder.build(rig, materials, rig.get('neck'), AvatarConfig.neck.topY);

    const armR = ArmBuilder.build(rig, materials, torso.spine, 'R', torso.shoulderPositions.R);
    const armL = ArmBuilder.build(rig, materials, torso.spine, 'L', torso.shoulderPositions.L);

    return { group, rig, parts: { torso, armR, armL } };
  }
}
