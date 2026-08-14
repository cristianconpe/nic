/**
 * AlphabetPoses
 * -------------
 * Data, not code: one entry per ASL fingerspelling letter. Every finger is
 * expressed as a percentage of its curl range (0 = fully extended, 100 =
 * fully curled into the fist) plus an optional spread percentage
 * (abduction, -100..100). The thumb — the joint that actually distinguishes
 * most of these letters from each other — gets its own CMC rotation in
 * degrees (it moves through too complex a path to reduce to a percentage)
 * plus MCP/IP curl percentages.
 *
 * `wrist` is a small Euler-degree delta layered on top of the arm's fixed
 * presentation rest pose (see AvatarConfig.arm.rest*), used only by the
 * handful of letters that read as a rotated hand (G, H, P, Q).
 *
 * This table is intentionally hand-authored and editable in place — tune
 * any single number here without touching rig or geometry code.
 */

const straight = [0, 0, 0];
const curled = [92, 92, 82];
const hook = [15, 88, 82]; // bent at the two outer joints, base joint stays low

function finger(curl, spread = 0, basePos = null) {
  // basePos is the same rare escape hatch as the thumb's: {x,y,z} in
  // meters, nudging where this finger's MCP knuckle is anchored on the
  // palm (not its rotation). Only touch this when a pose reads right in
  // curl/spread but the whole hand needs a longer visual bridge between
  // the fingers and the wrist than the rig's normal anatomy provides.
  return { curl, spread, basePos };
}

function thumb(cmc, mcp = 0, ip = 0, basePos = null) {
  // basePos is a rare escape hatch: {x,y,z} in meters, nudging where the
  // thumb's CMC joint is anchored on the palm (not its rotation). Every
  // letter's rotation was solved from the thumb's normal anchor point;
  // only touch this when a pose is right in flexion/orientation but the
  // anchor itself reads too low/high/off to one side against the reference.
  return { cmc, mcp, ip, basePos };
}

export const AlphabetPoses = {
  A: {
    desc: 'Puño cerrado con el pulgar apoyado al costado de los dedos.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(curled), middle: finger(curled), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: 0, y: 10, z: 55 }, 15, 8),
  },
  B: {
    desc: 'Mano plana, dedos juntos y extendidos, pulgar doblado sobre la palma.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(straight), middle: finger(straight), ring: finger(straight), pinky: finger(straight) },
    thumb: thumb({ x: 0, y: -70, z: 62 }, 55, 35, { x: 0, y: 0.045, z: 0 }),
  },
  C: {
    desc: 'Mano curvada formando la letra C, dedos y pulgar no se tocan.',
    wrist: { x: 0, y: -55, z: 0 },
    fingers: { index: finger([42, 46, 34]), middle: finger([42, 46, 34]), ring: finger([42, 46, 34]), pinky: finger([42, 46, 34]) },
    thumb: thumb({ x: -6, y: -12, z: 22 }, 32, 22),
  },
  D: {
    desc: 'Índice extendido hacia arriba; los demás dedos tocan el pulgar.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(straight), middle: finger(curled), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: 6, y: -10, z: 8 }, 42, 30),
  },
  E: {
    desc: 'Dedos curvados hacia abajo, puntas cerca del pulgar doblado.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger([78, 88, 82]), middle: finger([78, 88, 82]), ring: finger([78, 88, 82]), pinky: finger([78, 88, 82]) },
    thumb: thumb({ x: 0, y: -10, z: 60 }, 30, 20),
  },
  F: {
    desc: 'Índice y pulgar unidos en un círculo; los otros tres dedos extendidos.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger([56, 58, 46]), middle: finger(straight), ring: finger(straight), pinky: finger(straight) },
    thumb: thumb({ x: 4, y: -34, z: 4 }, 46, 34),
  },
  G: {
    desc: 'Índice y pulgar extendidos apuntando hacia el costado.',
    wrist: { x: -15, y: 0, z: 60 },
    fingers: { index: finger(straight, -8), middle: finger(curled), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: -10, y: -46, z: 30 }, 6, 4),
  },
  H: {
    desc: 'Índice y medio extendidos juntos, apuntando hacia el costado.',
    wrist: { x: -15, y: 0, z: 60 },
    fingers: { index: finger(straight, -6), middle: finger(straight, 6), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: -8, y: 10, z: 6 }, 58, 36, { x: 0, y: 0.045, z: 0 }),
  },
  I: {
    desc: 'Meñique extendido hacia arriba; los demás dedos en puño.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(curled), middle: finger(curled), ring: finger(curled), pinky: finger(straight) },
    thumb: thumb({ x: 14, y: 8, z: -6 }, 66, 40),
  },
  J: {
    desc: 'Como la "I", trazando en el aire la forma de una J (seña dinámica).',
    wrist: { x: 6, y: 10, z: -14 },
    fingers: { index: finger(curled), middle: finger(curled), ring: finger(curled), pinky: finger(straight) },
    thumb: thumb({ x: 14, y: 8, z: -6 }, 66, 40),
  },
  K: {
    desc: 'Índice y medio en V, pulgar tocando la base del medio.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(straight, -14), middle: finger(straight, 14), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: -20, y: -20, z: 55 }, 30, 15),
  },
  L: {
    desc: 'Pulgar e índice extendidos formando una L; los demás en puño.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(straight), middle: finger(curled), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: 0, y: 0, z: -30 }, 0, 0),
  },
  M: {
    desc: 'Pulgar cubierto por índice, medio y anular doblados encima.',
    wrist: { x: 45, y: 0, z: 0 },
    fingers: { index: finger([100, 5, 5]), middle: finger([100, 5, 5]), ring: finger([100, 5, 5]), pinky: finger([100, 90, 80]) },
    thumb: thumb({ x: 0, y: -90, z: 70 }, 65, 50),
  },
  N: {
    desc: 'Pulgar cubierto por índice y medio doblados encima.',
    wrist: { x: 45, y: 0, z: 10 },
    fingers: { index: finger([100, 5, 5]), middle: finger([100, 5, 5]), ring: finger([100, 90, 80]), pinky: finger([100, 90, 80]) },
    thumb: thumb({ x: 0, y: -90, z: 70 }, 65, 50),
  },
  O: {
    desc: 'Todos los dedos curvados tocando el pulgar, formando un círculo.',
    wrist: { x: -20, y: -90, z: 0 },
    fingers: {
      index: finger([50, 55, 45], 15, { x: 0, y: -0.08, z: 0 }),
      middle: finger([50, 55, 45], 5, { x: 0, y: -0.08, z: 0 }),
      ring: finger([50, 55, 45], -5, { x: 0, y: -0.08, z: 0 }),
      pinky: finger([50, 55, 45], -15, { x: 0, y: -0.08, z: 0 }),
    },
    thumb: thumb({ x: 0, y: -10, z: 55 }, 25, 12, { x: -0.015, y: 0.02, z: 0.06 }),
  },
  P: {
    desc: 'Como la "K" pero apuntando hacia abajo, pulgar tocando el índice.',
    wrist: { x: 90, y: -10, z: 70 },
    fingers: {
      index: finger([100, 0, 0], 0),
      middle: finger([20, 15, 10], 0),
      ring: finger([55, 15, 10], -6),
      pinky: finger([20, 15, 10], 0),
    },
    thumb: thumb({ x: -10, y: -10, z: 35 }, 80, 40, { x: -0.01, y: 0.14, z: 0.03 }),
  },
  Q: {
    desc: 'Como la "P" pero con índice y pulgar separados y el resto oculto.',
    wrist: { x: 90, y: -10, z: 70 },
    fingers: {
      index: finger([100, 0, 0], 0),
      middle: finger(curled, 0),
      ring: finger(curled, 0),
      pinky: finger(curled, 0),
    },
    thumb: thumb({ x: -10, y: -10, z: 35 }, 60, 20),
  },
  R: {
    desc: 'Índice y medio cruzados; los demás dedos en puño.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger([8, 10, 0], 10), middle: finger([10, 16, 0], -12), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: 6, y: 12, z: 4 }, 56, 36),
  },
  S: {
    desc: 'Puño cerrado con el pulgar cruzado por delante de los dedos.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(curled), middle: finger(curled), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: 0, y: -60, z: 60 }, 55, 35, { x: 0, y: 0.08, z: 0.01 }),
  },
  T: {
    desc: 'Pulgar entre el índice y el medio, con el puño cerrado encima.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger([90, 82, 68]), middle: finger(curled), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: -30, y: 0, z: 70 }, 40, 30),
  },
  U: {
    desc: 'Índice y medio juntos extendidos hacia arriba.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(straight, -4), middle: finger(straight, 4), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: -8, y: 10, z: 6 }, 58, 36),
  },
  V: {
    desc: 'Índice y medio separados en V; los demás dedos en puño.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(straight, -16), middle: finger(straight, 16), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: -8, y: 10, z: 6 }, 58, 36),
  },
  W: {
    desc: 'Índice, medio y anular extendidos y separados.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(straight, -18), middle: finger(straight, 0), ring: finger(straight, 18), pinky: finger(curled) },
    thumb: thumb({ x: 8, y: 4, z: -4 }, 30, 18),
  },
  X: {
    desc: 'Índice curvado en gancho; los demás dedos en puño.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(hook), middle: finger(curled), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: 14, y: -30, z: -18 }, 18, 8),
  },
  Y: {
    desc: 'Pulgar y meñique extendidos ("colgar diez"); los demás en puño.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(curled), middle: finger(curled), ring: finger(curled), pinky: finger(straight) },
    // y clamped to -50 explicitly (not -70) to reproduce this letter's
    // exact pre-existing pose now that JOINT_LIMITS.thumbCmc.y was widened
    // to -90 for M/N — Y wasn't part of this precision pass.
    thumb: thumb({ x: -14, y: -50, z: 40 }, 2, 0),
  },
  Z: {
    desc: 'Índice apuntando hacia la cámara, trazando una Z en el aire (seña dinámica).',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: {
      index: finger([75, 5, 0], 15),
      middle: finger(curled, 0, { x: 0, y: 0, z: -0.06 }),
      ring: finger(curled, 0, { x: 0, y: 0, z: -0.06 }),
      pinky: finger(curled, 0, { x: 0, y: 0, z: -0.06 }),
    },
    thumb: thumb({ x: 0, y: 10, z: 55 }, 45, 25),
  },
};

export default AlphabetPoses;
