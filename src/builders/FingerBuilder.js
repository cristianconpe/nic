import * as THREE from 'three';
import { Rig } from './RigBuilder.js';
import { createSmoothCapsule, createJointSphere, makeMesh } from '../utils/GeometryUtils.js';

/**
 * FingerBuilder
 * -------------
 * Builds one jointed digit as a chain of bones, generic enough to serve
 * both the four fingers and the thumb (which just uses a different segment
 * count/orientation). Each phalanx is a high-resolution capsule sized so
 * its rounded caps sit exactly on the joint pivots — the capsule at one
 * segment and the capsule at the next both have a hemisphere centered on
 * the same point, so they nest like a small ball joint and stay seamless
 * at any bend angle, no matter how tightly the finger curls.
 */
export default class FingerBuilder {
  /**
   * @param {object} opts
   * @param {Rig} opts.rig
   * @param {THREE.Material} opts.material
   * @param {THREE.Object3D} opts.parentBone - bone the chain hangs from (already positioned at the knuckle base)
   * @param {string} opts.prefix - bone name prefix, e.g. "hand.R.index"
   * @param {string[]} opts.jointNames - e.g. ["mcp", "pip", "dip"]
   * @param {number[]} opts.lengths - segment lengths, base to tip
   * @param {number[]} opts.radii - segment radii, base to tip
   * @param {number} [opts.knuckleRadius] - if set, adds a soft joint sphere at the base knuckle
   */
  static build({
    rig,
    material,
    parentBone,
    prefix,
    jointNames,
    lengths,
    radii,
    knuckleRadius,
    baseOffset = [0, 0, 0],
    baseRotationDeg = { x: 0, y: 0, z: 0 },
  }) {
    const bones = [];
    let parent = parentBone;

    if (knuckleRadius) {
      const knuckle = makeMesh(createJointSphere(knuckleRadius, { widthSegments: 20, heightSegments: 16 }), material);
      knuckle.position.set(...baseOffset);
      parentBone.add(knuckle);
    }

    for (let i = 0; i < jointNames.length; i++) {
      const bone = i === 0
        ? Rig.bind(new THREE.Bone(), baseRotationDeg.x, baseRotationDeg.y, baseRotationDeg.z)
        : Rig.bind(new THREE.Bone(), 0, 0, 0);
      rig.register(`${prefix}.${jointNames[i]}`, bone);

      if (i === 0) {
        bone.position.set(...baseOffset);
      } else {
        bone.position.set(0, lengths[i - 1], 0);
      }
      parent.add(bone);

      const segLength = lengths[i];
      const segRadius = radii[i];
      const capsule = createSmoothCapsule(segRadius, segLength, { capSegments: 10, radialSegments: 18 });
      const mesh = makeMesh(capsule, material);
      mesh.position.set(0, segLength / 2, 0);
      bone.add(mesh);

      bones.push(bone);
      parent = bone;
    }

    const tip = new THREE.Object3D();
    tip.position.set(0, lengths[lengths.length - 1], 0);
    parent.add(tip);

    return { bones, tip };
  }
}
