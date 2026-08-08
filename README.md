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

Type a word into the box above the avatar and hit ▶ to watch it fingerspelled letter by
letter, or click a letter in the bottom panel directly, or check "Reproducir A→Z" to
autoplay the whole alphabet. Drag to orbit, scroll to zoom — you can zoom in close
enough to inspect individual knuckles.

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
    TextParser.js         text -> sequence of {letter} / {pause} steps
    AnimationQueue.js      sequence -> timed playback, via callback (no avatar knowledge)
  core/
    SceneManager.js       renderer/camera/controls/animation loop (no avatar knowledge)
  ui/
    UIPanel.js             A-Z grid + autoplay toggle
    TextSignPanel.js       text box, Play/Replay/Clear, letter-progress chips
    style.css
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

**Hand size.** The hands are intentionally bigger than strict anatomy — `HAND_SCALE`
in `AvatarConfig.js` (currently 1.85, after a couple of legibility passes) scales every
hand/finger/thumb dimension so the handshape reads as the focal point of the avatar
without needing to zoom in for every letter. It's a genuine remodel, not a runtime
`.scale()` on the hand bone: every length, radius, and base offset in
`hand`/`fingers`/`thumb` is multiplied by the same constant, so finger proportions and
joint spacing scale together correctly, and per-letter poses (all expressed as
rotations, not positions) don't need to change at all. The forearm keeps its own
unscaled size — only `arm.wristJointRadius` gets a smaller, separate bump, derived as a
fraction of `HAND_SCALE`'s own growth so it stays a taper rather than a step
(`WRIST_BRIDGE_SCALE`, 1.12) so the joint sphere tapers smoothly into the larger palm
instead of the palm suddenly stepping up in size right where the wrist meets it.

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

The right arm (`R`) is the signing arm and holds a fixed anatomical rest pose defined
once in `AvatarConfig.arm.rest*`: shoulder close to its natural hang (a ~135° bend off
the bone's "straight up" bind axis, not a raised/lifted shoulder), most of the lift done
by elbow flexion, and a small wrist correction so the palm reads flat toward the viewer.
The hand ends up at roughly shoulder height, just in front of the chest — the interpretation
zone between chest, shoulder and chin — instead of reaching up above the head. The left
arm hangs fully relaxed at the side. Only the right hand's fingers/thumb/wrist are driven
by letter data — this matches how ASL fingerspelling is actually signed (one-handed), and
per-letter wrist deltas (used by e.g. G/H/P/Q to rotate the hand sideways or downward) are
layered on top of this rest pose as small offsets, so they didn't need to change when the
rest pose did.

Tuning a 3-bone arm chain by eyeballing screenshots doesn't converge fast — Euler angles
on a bent chain aren't intuitive. `scripts/fk_probe.mjs` builds the same
shoulder→foreArm→hand bone chain headlessly (no renderer) and prints the hand's world
position plus its palm-normal/finger-direction vectors for a given set of angles, so the
rest pose was solved numerically (hand height in the chest/shoulder band, palm normal
≈ +Z) before ever taking a screenshot to confirm it visually.

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

## Text-to-sign playback

Typing a word doesn't touch the avatar directly — it flows through a decoupled pipeline
that mirrors the one used for the A→Z demo button:

```
Text --[TextParser]--> Sequence --[AnimationQueue]--> onLetter(letter) --[PoseController]--> Avatar
```

- **`TextParser.parseText(text)`** knows nothing about 3D. It turns a string into an
  array of `{ type: 'letter', letter }` / `{ type: 'pause', ms }` steps, uppercasing and
  dropping any character with no defined handshape (digits, punctuation — only the
  manual alphabet exists today). Consecutive whitespace collapses into one pause so word
  gaps read as a single beat, not a stutter.
- **`AnimationQueue`** turns that sequence into a timed performance. It only knows about
  `setTimeout` and a step index — it calls `onLetter(letter, index)` and `onStep(index)`
  at the right moments and has no reference to a `Rig`, a `PoseController`, or a scene.
  `main.js` is the only place that wires `onLetter` to `pose.setLetter(letter)`, which is
  what actually moves the avatar (and reuses `PoseController`'s existing easing, so
  letter-to-letter transitions are already smooth).
- **`TextSignPanel`** is DOM-only: the input box, Play/Replay/Clear buttons above the
  avatar, and the small per-letter progress chips. It parses on every keystroke (so the
  chips preview the sequence before you even hit play) and calls `onPlay(sequence)` —
  same shape as `UIPanel`'s `onSelect(letter)` for a single click.

Because none of these layers hold a reference to the ones below them, the text box
could be swapped for a speech-to-text input, a scripted demo sequence, or a websocket
feed without touching `PoseController`, the rig, or a single geometry file. Playback
sources are mutually exclusive by convention, not by coupling: clicking a letter, or
starting A→Z autoplay, calls `queue.stop()` first, and starting the text queue calls
`ui.stopAutoplay()` — both are one-line calls in `main.js`, the only file that knows all
three UI pieces exist.

## Extending to words

Fingerspelling full words already works end to end (see above). The architecture is
meant to carry straight through to real ASL vocabulary next:

1. **Word-level signs, not just spelled-out letters** — `AlphabetPoses` is a lookup
   table from a key to a pose; a `WordSigns` table with the same shape (keyed by word
   instead of letter) would let `TextParser` emit a whole-word step when it recognizes
   one, falling back to fingerspelling letter-by-letter otherwise.
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

`scripts/fk_probe.mjs` is the numeric counterpart, used for the arm chain specifically:
it builds the shoulder→foreArm→hand bones with no renderer at all and prints the hand's
world position and orientation for a given set of rest-pose angles, so a new arm pose
can be solved for (hand height, forward clearance from the torso, palm direction) before
spending a screenshot round-trip on it.

```bash
SHOULDER='{"x":135,"y":-8,"z":6}' ELBOW='{"x":-120,"y":0,"z":10}' WRIST='{"x":-20,"y":0,"z":0}' node scripts/fk_probe.mjs
```

Two more, same idea, for authoring individual handshapes against a real ASL reference
(used to get L/M/N/O to match the official chart precisely): `scripts/thumb_probe.mjs`
builds just the thumb chain and prints which way it's actually reaching in hand-local
space — the axis that decides "does the thumb open out to the side (L) or tuck under
the fingers (M/N)" is not obvious from the raw Euler numbers alone. `scripts/circle_probe.mjs`
builds the thumb AND the index finger and reports the literal gap between their
tips, for letters like O where the two need to touch.

```bash
CMC='{"x":0,"y":0,"z":-30}' MCP=0 IP=0 node scripts/thumb_probe.mjs
CMC='{"x":0,"y":-10,"z":55}' MCP=30 IP=15 IDX_MCP=68 IDX_PIP=73 IDX_DIP=58 node scripts/circle_probe.mjs
```
