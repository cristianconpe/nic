/**
 * AvatarConfig
 * ------------
 * Single set of measurements (meters) shared by every builder, so the
 * torso, neck, head and arms always meet at consistent seams without each
 * file hardcoding the neighbor's numbers.
 */
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
    wristJointRadius: 0.05,
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
    palmLength: 0.1,
    palmWidth: 0.105,
    palmThickness: 0.032,
    palmRoundness: 0.62,
    fingerRadialSegments: 18,
    fingerCapSegments: 8,
  },
  // base: [x offset across the palm (pinky-side negative -> thumb-side positive), y offset added to palmLength for the knuckle arc]
  fingers: {
    index: { base: [0.024, 0.006], lengths: [0.041, 0.026, 0.021], radii: [0.0105, 0.0088, 0.0072] },
    middle: { base: [0.004, 0.012], lengths: [0.046, 0.029, 0.023], radii: [0.0108, 0.009, 0.0074] },
    ring: { base: [-0.017, 0.004], lengths: [0.042, 0.027, 0.021], radii: [0.0102, 0.0086, 0.007] },
    pinky: { base: [-0.037, -0.01], lengths: [0.034, 0.021, 0.018], radii: [0.0088, 0.0074, 0.0062] },
  },
  thumb: {
    // [cmc/thenar stub, proximal phalanx, distal phalanx]
    lengths: [0.02, 0.034, 0.028],
    radii: [0.0145, 0.0122, 0.0098],
    baseOffset: [0.034, -0.03, 0.016],
    // Rest orientation of the thumb's CMC bone relative to the palm plane
    // (degrees) — rotates it out of the finger plane so it can oppose them.
    // Right hand and its mirror (thumb sits on the opposite radial side).
    restRotation: { x: -8, y: -14, z: -62 },
    restRotationMirror: { x: -8, y: 14, z: 62 },
  },
};

export default AvatarConfig;
