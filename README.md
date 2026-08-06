# ASL Avatar

A 3D American Sign Language fingerspelling avatar, generated **entirely by code** with
[Three.js](https://threejs.org/) — no Blender, no imported models, no textures. Every
surface is procedural geometry (lathes, capsules, a hand-rolled superellipsoid box),
and every joint is a real bone you can drive from a rotation value.

Stage one — this repo — is the manual alphabet (A–Z). It exists to prove out the hand
rig: finger curl range, thumb opposition, wrist orientation, and geometry quality, all
under one architecture that's meant to grow into words and full signs next.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

Click a letter in the bottom panel, or check "Reproducir A→Z" to autoplay the whole
alphabet. Drag to orbit, scroll to zoom — you can zoom in close enough to inspect
individual knuckles.

`npm run build` produces a static `dist/` bundle; there's no backend.

## Architecture

Nothing is a monolith. Each part of the body is an independent builder that knows how
to make *itself* and nothing else:

```
src/
  builders/
    MaterialBuilder.js    matte PBR materials (body white, hand skin-tone)
    LightingBuilder.js    3-point studio lighting + hemisphere fill
    RigBuilder.js         Rig class: bone registry, naming convention, joint limits
    TorsoBuilder.js       lathe-based torso (hips -> waist -> chest -> shoulders)
    NeckBuilder.js        short curved lathe blending torso into head
    HeadBuilder.js        CapsuleGeometry stretched into an egg
    ArmBuilder.js         tapered lathe upper-arm/forearm + joint spheres
    HandBuilder.js        superellipsoid palm + wires up 4×FingerBuilder + thumb
    FingerBuilder.js      generic N-bone jointed digit (used for fingers AND thumb)
    AvatarBuilder.js      orchestrator: wires the above into one rig + mesh group
  utils/
    GeometryUtils.js      shared primitives: rounded-box, smooth lathe, tapering,
                           joint spheres, smooth capsules
  avatar/
    AvatarConfig.js       every measurement (lengths, radii, rest-pose angles) in
                           one place, so builders never hardcode a neighbor's numbers
  asl/
    AlphabetPoses.js      the A–Z data table (see below)
    PoseController.js     turns pose data into bone rotations, eases between letters
  core/
    SceneManager.js       renderer/camera/controls/animation loop (no avatar knowledge)
  ui/
    UIPanel.js, style.css HUD + letter grid, framework-free DOM
  main.js                 wires it all together
```

Every builder is a static class with a `build(...)` method that takes what it needs
(a `Rig`, some materials, a parent bone) and returns the bones/meshes it created. No
builder reaches into another builder's internals — `AvatarConfig.js` is the only shared
state, and it's just numbers.

## Why it looks the way it does (not boxes and cylinders)

- **Head** — a real `CapsuleGeometry`, stretched and squashed into an egg. A capsule
  already has zero hard seams anywhere on its surface.
- **Torso / neck** — `LatheGeometry` revolved from a hand-drawn radius profile (hip →
  waist → chest → shoulder), so the whole silhouette is one continuous curve instead of
  a stacked cylinder. Squashed non-uniformly front-to-back for a flatter chest.
- **Arms** — also lathes, not plain cylinders: each segment tapers with a slight
  bicep/forearm bulge (`GeometryUtils.createLimbSegment`).
- **Palm** — `GeometryUtils.createRoundedBox`, a from-scratch superellipsoid: a
  subdivided box whose vertices are blended toward a sphere by a `roundness` factor.
  That's what gives it soft pillowed edges instead of beveled-box corners. It's then
  tapered narrower toward the wrist (`taperAlongY`) so it reads as a continuation of
  the forearm.
- **Fingers** — high-resolution `CapsuleGeometry` phalanges, sized so each segment's
  rounded cap sits exactly on the joint pivot. Two adjoining capsules end up as
  concentric hemispheres around the same point, so they nest like a tiny ball joint —
  seamless at any bend angle, no separate joint-cover mesh needed except at the
  MCP knuckle row, where a slightly larger sphere adds a soft knuckle bump.

Nothing has hard edges by construction; there was no beveling step to remember.

## The rig

This is a **rigid-segment rig**: every bone is a real `THREE.Bone`, and body meshes are
parented directly to the bone that should move them (no skin-weight painting). Rotating
`hand.R.index.pip` rotates that phalanx and its child (`.dip`) with it — ordinary
forward kinematics. Joint spheres exist specifically to hide the seam between two rigid
segments, which is what makes a rig with no smooth skinning still read as one
continuous sculpt.

Bone naming convention (see `RigBuilder.js`):

```
root -> spine -> chest -> neckBase -> neck -> head
              -> shoulder.{R,L} -> foreArm.{R,L} -> hand.{R,L}
                                                   -> hand.{S}.thumb.{cmc,mcp,ip}
                                                   -> hand.{S}.index.{mcp,pip,dip}
                                                   -> hand.{S}.middle.{mcp,pip,dip}
                                                   -> hand.{S}.ring.{mcp,pip,dip}
                                                   -> hand.{S}.pinky.{mcp,pip,dip}
```

The right arm (`R`) is the signing arm and holds a fixed "presentation" rest pose
(raised, elbow bent, palm toward the viewer) defined once in `AvatarConfig.arm.rest*`.
The left arm hangs relaxed at the side. Only the right hand's fingers/thumb/wrist are
driven by letter data — this matches how ASL fingerspelling is actually signed
(one-handed).

## ASL pose data

`src/asl/AlphabetPoses.js` has one entry per letter, written to be readable and
tunable without touching any rig code:

```js
A: {
  desc: 'Puño cerrado con el pulgar apoyado al costado de los dedos.',
  wrist: { x: 0, y: 0, z: 0 },
  fingers: { index: finger(curled), middle: finger(curled), ... },
  thumb: thumb({ x: 14, y: -30, z: -18 }, 18, 8),
}
```

- Finger curl is a **percentage** (0 = straight, 100 = full curl) per joint
  (MCP/PIP/DIP), mapped to degrees through `RigBuilder.JOINT_LIMITS` — so retuning the
  global maximum curl angle is a one-line change, not a 26-letter rewrite.
- Spread (abduction) is likewise a -100..100 percentage.
- The thumb gets raw CMC rotation degrees (its motion is too non-linear for a clean
  percentage) plus MCP/IP curl percentages.
- `PoseController` eases every joint from the previous letter's angle to the new one
  over ~450 ms (cubic ease) rather than snapping, and exposes `onLetterChange` so the
  UI can update its caption.

J and Z are historically **traced**, not static, handshapes; they're included with
their nearest static approximation and a note in the description, ready to become real
motion curves once word-level animation is added.

## Extending to words

The architecture is meant to carry straight through:

1. **Coarticulation** — `PoseController` already blends between two full hand poses;
   driving it from a sequence of letters (or word-level handshapes) instead of one
   click is the same code path.
2. **Motion signs** (like J/Z, or real ASL vocabulary) — add a position/rotation
   *keyframe track* per bone instead of a single target, and have `PoseController`
   interpolate along it over the sign's duration.
3. **Two-handed signs** — `PoseController` already takes a `side` parameter; a second
   instance driving `hand.L.*` is enough to pose the left hand independently instead of
   leaving it relaxed.
4. **New body parts** (facial expression, torso lean for grammar) — add a builder that
   registers its bones into the same `Rig`, following the existing naming convention.

## Dev tooling

`scripts/screenshot.mjs` drives a headless Chromium (the one already installed in this
environment) against a running dev server to grab a screenshot — optionally selecting a
letter and repositioning the camera first. That's how the rig and pose data in this
repo were actually tuned (no Blender viewport, but the same idea: look at it, adjust a
number, look again).

```bash
npm run dev &
LETTER=F OUT_FILE=f.png npm run shot
CAM_POS="0.5,1.8,0.4" CAM_TARGET="0.2,1.7,-0.1" npm run shot   # close-up on the hand
```
