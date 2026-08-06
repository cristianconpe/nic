import * as THREE from 'three';
import { Rig } from './RigBuilder.js';
import { createSmoothLathe, makeMesh } from '../utils/GeometryUtils.js';
import { AvatarConfig } from '../avatar/AvatarConfig.js';

/**
 * NeckBuilder
 * -----------
 * A short, subtly-curved lathe that blends the torso into the head. Not a
 * straight cylinder: it necks in slightly at the middle and flares softly
 * at both ends so it reads as part of the same sculpted surface as the
 * chest and jaw rather than a separate stacked part.
 */
export default class NeckBuilder {
  static build(rig, materials, parentBone, parentWorldY) {
    const cfg = AvatarConfig.neck;
    const height = cfg.topY - cfg.baseY;

    const neckBase = Rig.bind(new THREE.Bone(), 0, 0, 0);
    rig.register('neckBase', neckBase);
    neckBase.position.set(0, cfg.baseY - parentWorldY, 0);
    parentBone.add(neckBase);

    // `neck` sits at the TOP of the neck mesh (base-of-skull pivot) so the
    // head, and any future head-nod rotation, hangs from the right point.
    const neck = Rig.bind(new THREE.Bone(), 0, 0, 0);
    rig.register('neck', neck);
    neck.position.set(0, height, 0);
    neckBase.add(neck);

    const profile = [
      { x: cfg.baseRadius * 1.06, y: 0 },
      { x: cfg.baseRadius * 0.94, y: height * 0.18 },
      { x: cfg.baseRadius * 0.86, y: height * 0.48 },
      { x: cfg.topRadius * 0.96, y: height * 0.82 },
      { x: cfg.topRadius * 1.08, y: height },
    ];

    const geometry = createSmoothLathe(profile, { radialSegments: 40, samples: 32 });
    const mesh = makeMesh(geometry, materials.body);
    neckBase.add(mesh);

    return { neckBase, neck, topWorldY: cfg.topY };
  }
}
