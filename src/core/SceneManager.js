import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * SceneManager
 * ------------
 * Owns the renderer, camera, controls and animation loop. Nothing here
 * knows about avatars or ASL — it is pure Three.js plumbing so the rest of
 * the app can stay focused on the avatar system itself.
 */
export default class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0b0d);
    this.scene.fog = new THREE.Fog(0x0b0b0d, 5, 11);

    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.05, 50);
    this.camera.position.set(0, 1.62, 4.1);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 1.58, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 0.28;
    this.controls.maxDistance = 5;
    this.controls.maxPolarAngle = Math.PI * 0.62;
    this.controls.update();

    this._callbacks = [];
    this._clock = new THREE.Clock();

    window.addEventListener('resize', () => this._onResize());
  }

  addGround() {
    const geo = new THREE.CircleGeometry(3.2, 64);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 1, metalness: 0 });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    return ground;
  }

  onTick(fn) {
    this._callbacks.push(fn);
  }

  start() {
    const loop = () => {
      const dt = Math.min(this._clock.getDelta(), 0.1);
      for (const cb of this._callbacks) cb(dt);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}
