import * as THREE from 'three';
import FingerBuilder from './FingerBuilder.js';
import { createRoundedBox, taperAlongY, makeMesh } from '../utils/GeometryUtils.js';
import { AvatarConfig } from '../avatar/AvatarConfig.js';

/**
 * HandBuilder
 * -----------
 * The most important component in the system. The palm is a single
 * superellipsoid slab (see GeometryUtils.createRoundedBox) — soft pillowed
 * edges, no hard corners — tapered narrower toward the wrist so it reads as
 * a continuation of the forearm rather than a paddle bolted onto it. Five
 * FingerBuilder chains attach along the knuckle row with an anatomical
 * arc (middle finger highest, pinky lowest) and the thumb is built with
 * its own out-of-plane rest rotation so it can properly oppose the fingers,
 * which is the single most important degree of freedom for ASL
 * fingerspelling (A vs S vs T vs the O/F/... shapes all hinge on it).
 */
export default class HandBuilder {
  static build(rig, materials, handBone, side) {
    const cfg = AvatarConfig.hand;
    const mirror = side === 'L' ? -1 : 1;

    // --- Palm -------------------------------------------------------
    const palmGeo = createRoundedBox(cfg.palmWidth, cfg.palmLength, cfg.palmThickness, 8, cfg.palmRoundness);
    taperAlongY(palmGeo, {
      yMin: -cfg.palmLength / 2,
      yMax: cfg.palmLength / 2,
      scaleAtMin: 0.68,
      scaleAtMax: 1,
    });
    const palmMesh = makeMesh(palmGeo, materials.skin);
    palmMesh.position.set(0, cfg.palmLength / 2, 0);
    handBone.add(palmMesh);

    // --- Fingers ------------------------------------------------------
    const fingerNames = ['index', 'middle', 'ring', 'pinky'];
    const fingerChains = {};

    for (const name of fingerNames) {
      const f = AvatarConfig.fingers[name];
      const prefix = `hand.${side}.${name}`;
      fingerChains[name] = FingerBuilder.build({
        rig,
        material: materials.skin,
        parentBone: handBone,
        prefix,
        jointNames: ['mcp', 'pip', 'dip'],
        lengths: f.lengths,
        radii: f.radii,
        knuckleRadius: f.radii[0] * 1.2,
        baseOffset: [f.base[0] * mirror, cfg.palmLength + f.base[1], cfg.palmThickness * 0.08],
      });
    }

    // --- Thumb ----------------------------------------------------------
    const t = AvatarConfig.thumb;
    const thumbRot = side === 'L' ? t.restRotationMirror : t.restRotation;
    const thumbChain = FingerBuilder.build({
      rig,
      material: materials.skin,
      parentBone: handBone,
      prefix: `hand.${side}.thumb`,
      jointNames: ['cmc', 'mcp', 'ip'],
      lengths: t.lengths,
      radii: t.radii,
      knuckleRadius: t.radii[0] * 1.25,
      baseOffset: [t.baseOffset[0] * mirror, t.baseOffset[1], t.baseOffset[2]],
      baseRotationDeg: thumbRot,
    });

    return { palmMesh, fingers: fingerChains, thumb: thumbChain };
  }
}
