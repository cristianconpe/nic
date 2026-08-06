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

function finger(curl, spread = 0) {
  return { curl, spread };
}

function thumb(cmc, mcp = 0, ip = 0) {
  return { cmc, mcp, ip };
}

export const AlphabetPoses = {
  A: {
    desc: 'Puño cerrado con el pulgar apoyado al costado de los dedos.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(curled), middle: finger(curled), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: 14, y: -30, z: -18 }, 18, 8),
  },
  B: {
    desc: 'Mano plana, dedos juntos y extendidos, pulgar doblado sobre la palma.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(straight), middle: finger(straight), ring: finger(straight), pinky: finger(straight) },
    thumb: thumb({ x: 10, y: 55, z: 10 }, 85, 55),
  },
  C: {
    desc: 'Mano curvada formando la letra C, dedos y pulgar no se tocan.',
    wrist: { x: 0, y: -6, z: 0 },
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
    thumb: thumb({ x: 20, y: 20, z: -6 }, 62, 48),
  },
  F: {
    desc: 'Índice y pulgar unidos en un círculo; los otros tres dedos extendidos.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger([56, 58, 46]), middle: finger(straight), ring: finger(straight), pinky: finger(straight) },
    thumb: thumb({ x: 4, y: -34, z: 4 }, 46, 34),
  },
  G: {
    desc: 'Índice y pulgar extendidos apuntando hacia el costado.',
    wrist: { x: 4, y: 78, z: 0 },
    fingers: { index: finger(straight, -8), middle: finger(curled), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: -10, y: -46, z: 30 }, 6, 4),
  },
  H: {
    desc: 'Índice y medio extendidos juntos, apuntando hacia el costado.',
    wrist: { x: 4, y: 78, z: 0 },
    fingers: { index: finger(straight, -6), middle: finger(straight, 6), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: -8, y: 10, z: 6 }, 58, 36),
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
    thumb: thumb({ x: -18, y: -6, z: 30 }, 22, 12),
  },
  L: {
    desc: 'Pulgar e índice extendidos formando una L; los demás en puño.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(straight), middle: finger(curled), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: -18, y: -66, z: 34 }, 4, 2),
  },
  M: {
    desc: 'Pulgar cubierto por índice, medio y anular doblados encima.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger([96, 90, 68]), middle: finger([96, 90, 68]), ring: finger([96, 90, 68]), pinky: finger(curled) },
    thumb: thumb({ x: 24, y: 6, z: -22 }, 70, 50),
  },
  N: {
    desc: 'Pulgar cubierto por índice y medio doblados encima.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger([96, 90, 68]), middle: finger([96, 90, 68]), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: 22, y: -2, z: -16 }, 62, 42),
  },
  O: {
    desc: 'Todos los dedos curvados tocando el pulgar, formando un círculo.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger([54, 56, 46]), middle: finger([54, 56, 46]), ring: finger([54, 56, 46]), pinky: finger([54, 56, 46]) },
    thumb: thumb({ x: -4, y: -22, z: 20 }, 46, 34),
  },
  P: {
    desc: 'Como la "K" pero apuntando hacia abajo.',
    wrist: { x: -92, y: 4, z: 0 },
    fingers: { index: finger(straight, -14), middle: finger(straight, 14), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: -18, y: -6, z: 30 }, 22, 12),
  },
  Q: {
    desc: 'Como la "G" pero apuntando hacia abajo.',
    wrist: { x: -92, y: 6, z: 0 },
    fingers: { index: finger(straight, -8), middle: finger(curled), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: -10, y: -46, z: 30 }, 6, 4),
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
    thumb: thumb({ x: 26, y: 26, z: -30 }, 34, 20),
  },
  T: {
    desc: 'Pulgar entre el índice y el medio, con el puño cerrado encima.',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger([90, 82, 68]), middle: finger(curled), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: 18, y: -4, z: -4 }, 48, 28),
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
    thumb: thumb({ x: -14, y: -70, z: 40 }, 2, 0),
  },
  Z: {
    desc: 'Índice extendido trazando una Z en el aire (seña dinámica).',
    wrist: { x: 0, y: 0, z: 0 },
    fingers: { index: finger(straight), middle: finger(curled), ring: finger(curled), pinky: finger(curled) },
    thumb: thumb({ x: 6, y: -10, z: 8 }, 42, 30),
  },
};

export default AlphabetPoses;
