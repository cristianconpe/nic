import * as THREE from 'three';
import { Rig } from './RigBuilder.js';
import { createSmoothLathe, makeMesh } from '../utils/GeometryUtils.js';
import { AvatarConfig } from '../avatar/AvatarConfig.js';

/**
 * TorsoBuilder
 * ------------
 * No cylinder. The torso is a single smooth lathe profile — hip, waist,
 * chest, shoulder line — revolved around the vertical axis and then
 * squashed front-to-back so it reads as an organic ribcage/chest instead of
 * a tube. Shoulders aren't a separate box: they're just the widest point of
 * the same continuous curve, with the arm joints (built by ArmBuilder)
 * overlapping just past its radius to blend into one silhouette.
 */
export default class TorsoBuilder {
  static build(rig, materials) {
    const cfg = AvatarConfig.torso;

    const root = Rig.bind(new THREE.Bone());
    rig.register('root', root);

    const spine = Rig.bind(new THREE.Bone());
    rig.register('spine', spine);
    root.add(spine);

    const chest = Rig.bind(new THREE.Bone());
    rig.register('chest', chest);
    chest.position.set(0, cfg.shoulderY, 0);
    spine.add(chest);

    const profile = [
      { x: cfg.baseRadius * 0.9, y: cfg.baseY },
      { x: cfg.baseRadius, y: cfg.baseY + 0.03 },
      { x: cfg.waistRadius, y: cfg.waistY },
      { x: cfg.chestRadius * 0.94, y: cfg.chestY - 0.12 },
      { x: cfg.chestRadius, y: cfg.chestY },
      { x: cfg.shoulderRadius, y: cfg.shoulderY - 0.06 },
      { x: cfg.shoulderRadius * 0.82, y: cfg.shoulderY + 0.02 },
    ];

    const geometry = createSmoothLathe(profile, { radialSegments: 56, samples: 44 });
    geometry.scale(1, 1, cfg.depthScale);

    const mesh = makeMesh(geometry, materials.body);
    spine.add(mesh);

    return {
      root,
      spine,
      chest,
      chestWorldY: cfg.shoulderY,
      shoulderPositions: {
        R: new THREE.Vector3(cfg.shoulderSpan, cfg.shoulderY - 0.02, 0),
        L: new THREE.Vector3(-cfg.shoulderSpan, cfg.shoulderY - 0.02, 0),
      },
    };
  }
}
