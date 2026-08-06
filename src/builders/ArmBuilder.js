import * as THREE from 'three';
import { Rig } from './RigBuilder.js';
import { createLimbSegment, createJointSphere, makeMesh } from '../utils/GeometryUtils.js';
import { AvatarConfig } from '../avatar/AvatarConfig.js';
import HandBuilder from './HandBuilder.js';

/**
 * ArmBuilder
 * ----------
 * Three bones per arm (shoulder → foreArm → hand), each holding a tapered
 * lathe segment instead of a uniform cylinder — a subtle bicep/forearm
 * bulge rather than a straight tube — with joint spheres bridging shoulder,
 * elbow and wrist so the three segments plus the torso read as one
 * continuous limb. The rest pose is fixed here (a raised, bent
 * "presentation" position, like holding a sign up for a viewer); per-letter
 * pose data only nudges the wrist and drives the hand from there.
 */
export default class ArmBuilder {
  static build(rig, materials, spineBone, side, shoulderPos) {
    const cfg = AvatarConfig.arm;
    const mirror = side === 'L' ? -1 : 1;
    const restShoulder = side === 'L' ? cfg.restShoulderMirror : cfg.restShoulder;
    const restElbow = side === 'L' ? cfg.restElbowMirror : cfg.restElbow;
    const restWrist = side === 'L' ? cfg.restWristMirror : cfg.restWrist;

    // --- Shoulder / upper arm -----------------------------------------
    const shoulder = Rig.bind(new THREE.Bone(), restShoulder.x, restShoulder.y, restShoulder.z);
    rig.register(`shoulder.${side}`, shoulder);
    shoulder.position.copy(shoulderPos);
    spineBone.add(shoulder);

    const shoulderCap = makeMesh(createJointSphere(cfg.shoulderJointRadius, { squashY: 0.86 }), materials.body);
    shoulder.add(shoulderCap);

    const upperGeo = createLimbSegment(cfg.upperLength, cfg.upperBaseRadius, cfg.upperTipRadius, { bulge: 0.08 });
    const upperMesh = makeMesh(upperGeo, materials.body);
    shoulder.add(upperMesh);

    // --- Elbow / forearm -------------------------------------------------
    const foreArm = Rig.bind(new THREE.Bone(), restElbow.x, restElbow.y, restElbow.z);
    rig.register(`foreArm.${side}`, foreArm);
    foreArm.position.set(0, cfg.upperLength, 0);
    shoulder.add(foreArm);

    const elbowCap = makeMesh(createJointSphere(cfg.elbowJointRadius), materials.body);
    foreArm.add(elbowCap);

    const foreGeo = createLimbSegment(cfg.foreLength, cfg.foreBaseRadius, cfg.foreTipRadius, { bulge: 0.05 });
    const foreMesh = makeMesh(foreGeo, materials.body);
    foreArm.add(foreMesh);

    // --- Wrist / hand ------------------------------------------------------
    const hand = Rig.bind(new THREE.Bone(), restWrist.x, restWrist.y, restWrist.z);
    rig.register(`hand.${side}`, hand);
    hand.position.set(0, cfg.foreLength, 0);
    foreArm.add(hand);

    const wristCap = makeMesh(createJointSphere(cfg.wristJointRadius, { squashY: 0.9 }), materials.skin);
    hand.add(wristCap);

    const handParts = HandBuilder.build(rig, materials, hand, side);

    return { shoulder, foreArm, hand, handParts };
  }
}
