import * as THREE from 'three';

/**
 * LightingBuilder
 * ---------------
 * Clean studio three-point setup + soft hemisphere fill, matching the
 * "product photography" reference: dark background, soft key light,
 * gentle falloff, no harsh specular hot-spots (materials are matte anyway).
 */
export default class LightingBuilder {
  static build(scene) {
    const group = new THREE.Group();
    group.name = 'Lighting';

    const hemi = new THREE.HemisphereLight(0xffffff, 0x1a1a1e, 0.55);
    group.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(2.6, 3.6, 3.2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 12;
    key.shadow.camera.left = -2.5;
    key.shadow.camera.right = 2.5;
    key.shadow.camera.top = 2.5;
    key.shadow.camera.bottom = -2.5;
    key.shadow.bias = -0.0025;
    key.shadow.radius = 4;
    group.add(key);
    group.add(key.target);

    const fill = new THREE.DirectionalLight(0xdfe8ff, 0.6);
    fill.position.set(-3.2, 1.6, 1.8);
    group.add(fill);

    const rim = new THREE.DirectionalLight(0xffe8d0, 1.1);
    rim.position.set(-1.2, 3.4, -3.4);
    group.add(rim);

    scene.add(group);
    return group;
  }
}
