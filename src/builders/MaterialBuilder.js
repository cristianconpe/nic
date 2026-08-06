import * as THREE from 'three';

/**
 * MaterialBuilder
 * ---------------
 * Single source of truth for every surface in the scene. Kept intentionally
 * tiny: simple PBR (MeshStandardMaterial), no textures, no normal maps —
 * the geometry itself is the protagonist. Matte white body, warm-neutral
 * skin tone for the hands (the part that carries the meaning).
 */
export default class MaterialBuilder {
  static build() {
    const body = new THREE.MeshStandardMaterial({
      color: 0xf3f3f1,
      roughness: 0.82,
      metalness: 0.04,
      envMapIntensity: 0.6,
    });

    // Slightly darker/cooler variant for crevices (inner ear-less head base,
    // underside of chin) — used sparingly to add depth without texturing.
    const bodyShadowed = body.clone();
    bodyShadowed.color = new THREE.Color(0xe9e9e6);

    const skin = new THREE.MeshStandardMaterial({
      color: 0xe3ab84,
      roughness: 0.72,
      metalness: 0.02,
      envMapIntensity: 0.6,
    });

    const ground = new THREE.MeshStandardMaterial({
      color: 0x08080a,
      roughness: 1,
      metalness: 0,
    });

    return { body, bodyShadowed, skin, ground };
  }
}
