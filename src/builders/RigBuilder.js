import * as THREE from 'three';

/**
 * RigBuilder
 * ----------
 * The avatar is *modeled* for animation, not animated after the fact: every
 * body-part builder creates real THREE.Bone objects and parents its meshes
 * directly to them (rigid-segment rig). Rotating a bone rotates its mesh and
 * every child bone below it — classic forward kinematics — while joint
 * spheres (see GeometryUtils.createJointSphere) hide the seams between
 * segments so the result reads as one continuous sculpt instead of a bag of
 * parts.
 *
 * This class is the shared registry + naming convention every builder plugs
 * into, plus small helpers for applying/clamping rotations from pose data.
 *
 * Bone naming convention (dot-separated, side suffix on limbs):
 *   root
 *   spine, chest
 *   neckBase, neck, head
 *   shoulder.R / .L, upperArm.R, foreArm.R, hand.R
 *   hand.R.thumb.cmc / .mcp / .ip
 *   hand.R.index.mcp / .pip / .dip   (same for middle, ring, pinky)
 */
export class Rig {
  constructor() {
    this.bones = new Map();
  }

  register(name, bone) {
    bone.name = name;
    this.bones.set(name, bone);
    return bone;
  }

  get(name) {
    const bone = this.bones.get(name);
    if (!bone) throw new Error(`Rig: unknown bone "${name}"`);
    return bone;
  }

  has(name) {
    return this.bones.has(name);
  }

  /** Sets a bone's rotation from an Euler-degrees triple, relative to its bind rotation. */
  setLocalEulerDeg(name, x = 0, y = 0, z = 0) {
    const bone = this.get(name);
    const bind = bone.userData.bindEuler || { x: 0, y: 0, z: 0 };
    bone.rotation.set(
      THREE.MathUtils.degToRad(bind.x + x),
      THREE.MathUtils.degToRad(bind.y + y),
      THREE.MathUtils.degToRad(bind.z + z)
    );
  }

  /** Stores the rest/bind rotation (in degrees) so pose deltas can be layered on top. */
  static bind(bone, x = 0, y = 0, z = 0) {
    bone.userData.bindEuler = { x, y, z };
    bone.rotation.set(THREE.MathUtils.degToRad(x), THREE.MathUtils.degToRad(y), THREE.MathUtils.degToRad(z));
    return bone;
  }

  /**
   * Stores a bone's rest/bind LOCAL POSITION (meters) so a pose can nudge
   * *where a joint is anchored* — not just how it's rotated — without
   * touching the geometry that set that position in the first place. Used
   * sparingly: today only a bone's own base offset (e.g. the thumb's CMC
   * attachment point) needs this, for the rare pose that reads wrong
   * because the anchor itself sits in the wrong spot on the palm, not
   * because of its rotation.
   */
  static bindPosition(bone) {
    bone.userData.bindPosition = bone.position.clone();
    return bone;
  }

  /** Sets a bone's local position from a bind position + a small per-letter offset (meters). Requires bindPosition() to have been called on it. */
  setLocalPositionOffset(name, dx = 0, dy = 0, dz = 0) {
    const bone = this.get(name);
    const bind = bone.userData.bindPosition;
    if (!bind) throw new Error(`Rig: bone "${name}" has no bind position — call Rig.bindPosition() on it first`);
    bone.position.set(bind.x + dx, bind.y + dy, bind.z + dz);
  }

  allNames() {
    return Array.from(this.bones.keys());
  }
}

/** Soft per-joint rotation limits (degrees) — used to keep hand-authored pose data anatomically plausible. */
export const JOINT_LIMITS = {
  mcpCurl: [-15, 100],
  pipCurl: [0, 110],
  dipCurl: [0, 95],
  mcpSpread: [-20, 20],
  thumbCmc: { x: [-40, 60], y: [-90, 50], z: [-30, 75] },
  thumbMcp: [-10, 80],
  thumbIp: [0, 90],
  wrist: { x: [-45, 45], y: [-70, 70], z: [-70, 70] },
};

export function clamp(value, [min, max]) {
  return THREE.MathUtils.clamp(value, min, max);
}

export default class RigBuilder {
  static create() {
    return new Rig();
  }
}
