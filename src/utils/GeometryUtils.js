import * as THREE from 'three';

/**
 * GeometryUtils
 * -------------
 * Low-level procedural geometry helpers shared by every body-part builder.
 * Nothing here knows about "arms" or "fingers" — it only knows how to make
 * smooth, continuous surfaces out of math, so the same primitives can be
 * reused for a knuckle, a shoulder, or a waist.
 */

/**
 * Builds a "superellipsoid box": a BoxGeometry with enough segments to bend,
 * whose vertices are pulled toward a sphere by `roundness` (0 = sharp box,
 * 1 = full ellipsoid). This is what gives the palm / palm-pad its soft,
 * pillow-like edges instead of a beveled-box look.
 */
export function createRoundedBox(width, height, depth, segments = 10, roundness = 0.6) {
  const geometry = new THREE.BoxGeometry(width, height, depth, segments, segments, segments);
  const pos = geometry.attributes.position;
  const hx = width / 2;
  const hy = height / 2;
  const hz = depth / 2;

  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    // Normalized box coordinates in [-1, 1]
    const nx = v.x / hx;
    const ny = v.y / hy;
    const nz = v.z / hz;

    // Superellipsoid blend: push each normalized coordinate toward the
    // unit sphere, then scale back into box space. Blending by `roundness`
    // keeps flat "pillow" faces near the center while rounding corners/edges.
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    const sx = nx / len;
    const sy = ny / len;
    const sz = nz / len;

    const bx = THREE.MathUtils.lerp(nx, sx, roundness) * hx;
    const by = THREE.MathUtils.lerp(ny, sy, roundness) * hy;
    const bz = THREE.MathUtils.lerp(nz, sz, roundness) * hz;

    pos.setXYZ(i, bx, by, bz);
  }

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Revolves a 2D profile (array of {x, y} radius/height pairs, x = radius,
 * y = height along the local Y axis) into a smooth LatheGeometry. The
 * profile is resampled through a Catmull-Rom spline so a handful of control
 * points produces a continuously curved surface with no visible facets.
 */
export function createSmoothLathe(profile, { radialSegments = 48, samples = 48, closed = false } = {}) {
  const points = profile.map((p) => new THREE.Vector2(Math.max(p.x, 0.0001), p.y));
  const curve = new THREE.SplineCurve(points);
  const sampled = curve.getPoints(samples);
  const geometry = new THREE.LatheGeometry(sampled, radialSegments);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * A tapered limb segment (upper arm, forearm, phalanx) built as a lathe so
 * it can bulge/taper smoothly instead of being a uniform cylinder/capsule.
 * `radii` is an array of relative radius stops from base to tip (0..1 each),
 * `bulge` pushes the midpoint outward for a subtle muscle-like curve.
 */
export function createLimbSegment(length, baseRadius, tipRadius, { bulge = 0.06, radialSegments = 24, capBase = true } = {}) {
  const midRadius = THREE.MathUtils.lerp(baseRadius, tipRadius, 0.42) * (1 + bulge);
  const profile = [];
  if (capBase) profile.push({ x: 0.0001, y: 0 });
  profile.push({ x: baseRadius, y: length * 0.04 });
  profile.push({ x: midRadius, y: length * 0.42 });
  profile.push({ x: THREE.MathUtils.lerp(midRadius, tipRadius, 0.6), y: length * 0.78 });
  profile.push({ x: tipRadius, y: length * 0.96 });
  profile.push({ x: 0.0001, y: length });

  return createSmoothLathe(profile, { radialSegments, samples: 40 });
}

/**
 * A high-resolution joint sphere used to visually bridge two adjoining
 * segments (knuckle, elbow, shoulder cap) so the seam between two separate
 * meshes reads as one continuous sculpted surface.
 */
export function createJointSphere(radius, { widthSegments = 32, heightSegments = 24, squashY = 1 } = {}) {
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  geometry.scale(1, squashY, 1);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Capsule wrapper with sane high-resolution defaults, used for finger
 * phalanges where we want maximum smoothness in a small package.
 */
export function createSmoothCapsule(radius, length, { capSegments = 10, radialSegments = 20 } = {}) {
  const geometry = new THREE.CapsuleGeometry(radius, length, capSegments, radialSegments);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Scales vertices along X/Z as a function of their Y position — used to
 * taper the palm narrower toward the wrist without modeling it as a
 * separate piece, keeping the palm a single continuous slab.
 */
export function taperAlongY(geometry, { yMin, yMax, scaleAtMin = 1, scaleAtMax = 1, axes = ['x', 'z'] } = {}) {
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const t = THREE.MathUtils.clamp((v.y - yMin) / (yMax - yMin), 0, 1);
    const s = THREE.MathUtils.lerp(scaleAtMin, scaleAtMax, t);
    if (axes.includes('x')) v.x *= s;
    if (axes.includes('z')) v.z *= s;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Builds an Object3D mesh, positioned/oriented, with shadows enabled. */
export function makeMesh(geometry, material, { castShadow = true, receiveShadow = true } = {}) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  return mesh;
}
