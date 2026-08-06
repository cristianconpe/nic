import * as THREE from 'three';

// Mirrors ArmBuilder's bone chain (shoulder -> foreArm -> hand) so we can
// solve for rest-pose angles numerically instead of guessing via screenshots.
const cfg = {
  upperLength: 0.315,
  foreLength: 0.285,
  shoulderPos: new THREE.Vector3(0.42, 1.36, 0),
};

function deg2rad(d) {
  return (d * Math.PI) / 180;
}

function build(shoulderDeg, elbowDeg, wristDeg) {
  const shoulder = new THREE.Bone();
  shoulder.position.copy(cfg.shoulderPos);
  shoulder.rotation.set(deg2rad(shoulderDeg.x), deg2rad(shoulderDeg.y), deg2rad(shoulderDeg.z));

  const foreArm = new THREE.Bone();
  foreArm.position.set(0, cfg.upperLength, 0);
  foreArm.rotation.set(deg2rad(elbowDeg.x), deg2rad(elbowDeg.y), deg2rad(elbowDeg.z));
  shoulder.add(foreArm);

  const hand = new THREE.Bone();
  hand.position.set(0, cfg.foreLength, 0);
  hand.rotation.set(deg2rad(wristDeg.x), deg2rad(wristDeg.y), deg2rad(wristDeg.z));
  foreArm.add(hand);

  shoulder.updateWorldMatrix(true, true);

  const elbowPos = new THREE.Vector3();
  foreArm.getWorldPosition(elbowPos);
  const handPos = new THREE.Vector3();
  hand.getWorldPosition(handPos);

  const q = new THREE.Quaternion();
  hand.getWorldQuaternion(q);
  const fingerDir = new THREE.Vector3(0, 1, 0).applyQuaternion(q); // local +Y
  const palmNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(q); // local +Z

  return { elbowPos, handPos, fingerDir, palmNormal };
}

const shoulderDeg = JSON.parse(process.env.SHOULDER || '{"x":155,"y":10,"z":18}');
const elbowDeg = JSON.parse(process.env.ELBOW || '{"x":-130,"y":-10,"z":0}');
const wristDeg = JSON.parse(process.env.WRIST || '{"x":0,"y":0,"z":0}');

const { elbowPos, handPos, fingerDir, palmNormal } = build(shoulderDeg, elbowDeg, wristDeg);

function fmt(v) {
  return `(${v.x.toFixed(3)}, ${v.y.toFixed(3)}, ${v.z.toFixed(3)})`;
}

console.log('elbow world pos:', fmt(elbowPos));
console.log('hand   world pos:', fmt(handPos));
console.log('finger direction (should point roughly +Y, some +Z):', fmt(fingerDir));
console.log('palm normal       (should point roughly +Z, toward viewer):', fmt(palmNormal));
console.log('--- targets: hand Y in [1.05, 1.45], hand Z > 0.1, hand X in [0.05, 0.3] ---');
