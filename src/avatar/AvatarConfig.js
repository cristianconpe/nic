/**
 * AvatarConfig
 * ------------
 * Single set of measurements (meters) shared by every builder, so the
 * torso, neck, head and arms always meet at consistent seams without each
 * file hardcoding the neighbor's numbers.
 */
// Hands are the whole point of a signing avatar, so they're built
// noticeably larger than strict anatomy would give — legibility of the
// handshape beats realism here. Only the hand/finger/thumb geometry is
// scaled; the forearm keeps its own size and the wrist joint gets a
// smaller, partial bump (a fraction of the hand's growth, not the full
// amount) so it reads as a taper into the bigger hand rather than either
// a sudden jump in radius or the whole forearm looking stretched.
// 1.85 = a ~48% bump over the previous 1.25 pass, in the requested 40-60% range.
const HAND_SCALE = 1.85;
const WRIST_BRIDGE_SCALE = 1 + (HAND_SCALE - 1) * 0.4;

export const AvatarConfig = {
  torso: {
    baseY: 0,
    baseRadius: 0.315, // hip/waist
    waistY: 0.58,
    waistRadius: 0.285,
    chestY: 1.02,
    chestRadius: 0.37,
    shoulderY: 1.38,
    shoulderRadius: 0.365,
    depthScale: 0.68, // front-to-back squash
    shoulderSpan: 0.42, // half-distance between shoulder joints
  },
  neck: {
    baseY: 1.38,
    topY: 1.565,
    baseRadius: 0.145,
    topRadius: 0.118,
  },
  head: {
    centerY: 1.85,
    capsuleRadius: 0.155,
    capsuleLength: 0.05,
    scaleY: 1.32,
    scaleZ: 0.9,
    scaleX: 0.97,
  },
  arm: {
    shoulderJointRadius: 0.1,
    upperLength: 0.315,
    upperBaseRadius: 0.092,
    upperTipRadius: 0.068,
    elbowJointRadius: 0.066,
    foreLength: 0.285,
    foreBaseRadius: 0.062,
    foreTipRadius: 0.05,
    wristJointRadius: 0.05 * WRIST_BRIDGE_SCALE,
    // Fixed "presentation" rest pose (degrees) so the signing hand reads
    // clearly to the viewer. Per-letter data only adds deltas on top of
    // the wrist entry below. TUNING IN PROGRESS.
    restShoulder: { x: 135, y: -8, z: 6 },
    restElbow: { x: -120, y: 0, z: 10 },
    restWrist: { x: -20, y: 0, z: 0 },
    // Left arm is the "resting" arm — ASL fingerspelling is one-handed, so
    // it just hangs relaxed at the side instead of mirroring the raised
    // signing pose (a 180ish deg flip around the shoulder's local X swings
    // it from "pointing up" in bind space down to a natural hang).
    restShoulderMirror: { x: 172, y: -6, z: -12 },
    restElbowMirror: { x: -16, y: 0, z: 4 },
    restWristMirror: { x: 0, y: 0, z: 0 },
  },
  hand: {
    palmLength: 0.1 * HAND_SCALE,
    palmWidth: 0.105 * HAND_SCALE,
    palmThickness: 0.032 * HAND_SCALE,
    palmRoundness: 0.62,
    fingerRadialSegments: 18,
    fingerCapSegments: 8,
  },
  // base: [x offset across the palm (pinky-side negative -> thumb-side positive), y offset added to palmLength for the knuckle arc]
  // All distances scaled by HAND_SCALE so fingers stay proportionally
  // placed on the now-larger palm — only the multiplier changed here,
  // not the underlying hand shape or finger proportions relative to each other.
  fingers: {
    index: {
      base: [0.024 * HAND_SCALE, 0.006 * HAND_SCALE],
      lengths: [0.041 * HAND_SCALE, 0.026 * HAND_SCALE, 0.021 * HAND_SCALE],
      radii: [0.0105 * HAND_SCALE, 0.0088 * HAND_SCALE, 0.0072 * HAND_SCALE],
    },
    middle: {
      base: [0.004 * HAND_SCALE, 0.012 * HAND_SCALE],
      lengths: [0.046 * HAND_SCALE, 0.029 * HAND_SCALE, 0.023 * HAND_SCALE],
      radii: [0.0108 * HAND_SCALE, 0.009 * HAND_SCALE, 0.0074 * HAND_SCALE],
    },
    ring: {
      base: [-0.017 * HAND_SCALE, 0.004 * HAND_SCALE],
      lengths: [0.042 * HAND_SCALE, 0.027 * HAND_SCALE, 0.021 * HAND_SCALE],
      radii: [0.0102 * HAND_SCALE, 0.0086 * HAND_SCALE, 0.007 * HAND_SCALE],
    },
    pinky: {
      base: [-0.037 * HAND_SCALE, -0.01 * HAND_SCALE],
      lengths: [0.034 * HAND_SCALE, 0.021 * HAND_SCALE, 0.018 * HAND_SCALE],
      radii: [0.0088 * HAND_SCALE, 0.0074 * HAND_SCALE, 0.0062 * HAND_SCALE],
    },
  },
  thumb: {
    // [cmc/thenar stub, proximal phalanx, distal phalanx]
    lengths: [0.02 * HAND_SCALE, 0.034 * HAND_SCALE, 0.028 * HAND_SCALE],
    radii: [0.0145 * HAND_SCALE, 0.0122 * HAND_SCALE, 0.0098 * HAND_SCALE],
    baseOffset: [0.034 * HAND_SCALE, -0.03 * HAND_SCALE, 0.016 * HAND_SCALE],
    // Rest orientation of the thumb's CMC bone relative to the palm plane
    // (degrees) — rotates it out of the finger plane so it can oppose them.
    // Right hand and its mirror (thumb sits on the opposite radial side).
    // Unchanged: rotations aren't sizes, and every letter's thumb pose was
    // tuned against this orientation — scaling geometry doesn't move it.
    restRotation: { x: -8, y: -14, z: -62 },
    restRotationMirror: { x: -8, y: 14, z: 62 },
  },
};

export default AvatarConfig;
