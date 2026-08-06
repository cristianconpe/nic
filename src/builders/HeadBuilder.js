import * as THREE from 'three';
import { Rig } from './RigBuilder.js';
import { makeMesh } from '../utils/GeometryUtils.js';
import { AvatarConfig } from '../avatar/AvatarConfig.js';

/**
 * HeadBuilder
 * -----------
 * The head is a genuine CapsuleGeometry (not a sphere) — two hemispherical
 * caps joined by a short cylindrical waist — stretched vertically and
 * squashed slightly front-to-back into a soft egg. A capsule already has no
 * hard seams anywhere on its surface, which is exactly the "single
 * continuous sculpture" look we want for a faceless mannequin head.
 */
export default class HeadBuilder {
  static build(rig, materials, parentBone, parentWorldY) {
    const cfg = AvatarConfig.head;

    const head = Rig.bind(new THREE.Bone(), 0, 0, 0);
    rig.register('head', head);
    head.position.set(0, cfg.centerY - parentWorldY, 0);
    parentBone.add(head);

    const geometry = new THREE.CapsuleGeometry(cfg.capsuleRadius, cfg.capsuleLength, 24, 48);
    geometry.scale(cfg.scaleX, cfg.scaleY, cfg.scaleZ);
    geometry.computeVertexNormals();

    const mesh = makeMesh(geometry, materials.body);
    // Capsule is centered on its bone; nudge so the flatter jaw side sits
    // slightly forward like a subtle chin, keeping the crown fuller.
    mesh.position.set(0, cfg.capsuleLength * 0.15, 0.006);
    head.add(mesh);

    return { head };
  }
}
