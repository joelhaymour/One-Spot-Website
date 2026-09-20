## 1. Scoring

| Criterion (max) | P1 Datum monolith | P2 Gimballed optic | P3 Attendant bust |
|---|---|---|---|
| Ownability / memorability (30) | 24 | 23 | 21 |
| Sophistication, no cheese (25) | 22 | 19 | 17 |
| Procedural buildability at quality (25) | 23 | 19 | 21 |
| Family clarity (10) | 9 | 9 | 7 |
| AI-video reproducibility (10) | 8 | 5 | 5 |
| **Total** | **86** | **75** | **71** |

**Verdict: P1 wins as the chassis, with grafts from both runners-up.**

- **Why P2 loses.** A round smoked lens with a centred light and concentric baffles is the HAL and CCTV silhouette. Its own negative prompt ("camera lens barrel, security camera, eyeball") describes the object itself. It also needs sorted transparent glass and about twice the triangles.
- **Why P3 loses.** A floating head drifts toward a mascot, and AI video generators tend to add faces to it. Its ghost spots also break the one-Spot rule.
- **What P3 gets right.** A dot sliding on a front-facing plate is unreadable at 40–80 px and off-axis.

**Grafts from P3**
- **Bearing seam.** The light seam becomes a yaw bearing, so the upper block turns against the base. This gives P3's small-size legibility with no head: the split is 64/36, not 1:4.
- A motion budget and golden-ratio phase offsets.
- Hairline filaments from the seam to the console panels.
- Object-word prompt discipline ("block", never "head" or "torso").
- Dither on near-black, and CSS grain.

**Grafts from P2**
- Gaze comes out of two springs of different speed and is never keyframed.
- The CEO register ring works as a switchboard that packets physically travel around.
- The CEO Spot briefly takes the sender's tint.
- A "learns" mark that stays lit.
- A yaw clamp so the glass never goes edge-on.
- Slow environment rotation.

**Own additions**
- The body extrudes out of the ring plane on arrival.
- At the CTA the agent collapses into the logo.

---

# FINAL SPEC

## 1. Concept name and one-sentence idea

**DATUM — the monolith with one bearing.**

- A datum is the single reference point every other measurement is taken from.
- Each agent is a plumb, two-block machined graphite monolith.
- Its only expressive feature is one travelling point of light (the Spot) behind smoked glass, encircled by one flat bezel ring.
- The Spot shows what it is looking at.
- The ring shows who it is talking to.
- The upper block turns on its lit seam to show where it is working.
- At any zoom the agent collapses to the logo: a spot inside a ring.

## 2. Silhouette and proportions

1 U = 1 three.js unit = a department agent's body width.

- **Body.** An upright rounded-rect slab, 1.0 W × 2.512 H × 0.44 D. Plan corner radius is 0.18, and top and bottom edges have a 0.03 soft bevel. It stands perfectly plumb and never rolls.
- **Two blocks.**
  - The base is bare metal, 0.90 high.
  - Above it is the bearing seam, 0.012 high, recessed and lit.
  - Above that is the upper block, 1.60 high.
  - The upper block yaws on the seam. The base follows at 20%.
  - The misalignment of the two rounded rectangles is the small-size attention cue.
- **Faceplate.** 0.60 × 1.48, corner radius 0.10, flush on the upper block front and centred on it. It is framed by a 0.012-wide polished chamfer. Faceplate-local origin is its centre.
- **The Spot.**
  - The core is 0.07 across at idle and never exceeds 0.10.
  - Home is faceplate-local (0, +0.138), which is 74% of body height.
  - Travel is clamped to an ellipse with semi-axes 0.23 × 0.62.
  - It sits 0.035 behind the glass, which gives real parallax.
- **The record.** A row of up to 12 hairline marks sits at the foot of the glass at local y = −0.66. Each mark is 0.004 × 0.03 on a 0.022 pitch. Marks are drawn in the faceplate shader, and one lights permanently at 20% per learning event.
- **Ring.**
  - One flat band, centreline radius 0.85, section 0.022 radial × 0.05 axial.
  - It is centred on the body axis at Spot height.
  - It rests inclined 10° with the front low, and carries one inlaid index tick.
  - It never touches the body, whose half-diagonal is 0.55.
- **Stance.** The agent hovers 0.12 above a dock disc (radius 0.7, thickness 0.02), with accent underglow in the gap.
- **Memory sketch.** A tall rounded slab with black glass on top and metal below, a lit line between them, one dot and one tilted ring.

## 3. Materials and finish

- **Body:** bead-blasted graphite anodise #2B2E33, satin. It is never black, so it separates from the background.
- **Faceplate:** opaque smoked black glass #050607, high gloss, showing long vertical strip reflections.
- **Chamfer frame:** diamond-cut polished #B9BEC6. This is the line that draws the object in the dark.
- **Ring:** satin titanium #9299A3 with crisp edges.
- **Accent** appears in exactly four places: the Spot halo, the seam, the ring tick and the record marks. It stays under 2% of frame pixels. The Spot core is always white.
- **Exclusions:** screws, grilles, buttons, text, LED strips, chrome, gold, holograms, particles, circuit textures.

## 4. Focal feature and state vocabulary

**Rules**
- One Spot per agent, always.
- The Spot never becomes a shape, never blinks, never gets an eyelid, never duplicates and never leaves the glass.
- The bearing handles yaw, and the Spot alone carries elevation.
- Every state is double-encoded by Spot and ring, so it reads without colour.

All springs are critically damped, so there is zero overshoot. ω values are in rad/s:

| Element | ω |
|---|---|
| Spot | 18 |
| Upper block | 8 |
| Ring | 5 |
| Base | 3.5 |
| Scalars (size, intensity) | 12 |

| State | Spot (core r / halo σ / intensity) | Ring | Body / seam |
|---|---|---|---|
| Idle | 0.035 / 0.11 / 0.60. Breathes ±6% at 0.12 Hz. Every 4–9 s (randomised) it drifts 0.03–0.06 to a new rest point. | 10° incline. The tilt axis precesses once every 90 s. Tick at 15%. | Hover ±0.015 at 0.17 Hz. Upper-block yaw drift ±2° on 11 s and 17 s sines. Seam at 30%. Rest yaw is biased 15% toward the CEO. |
| Attending | Target = home + 0.6 × (target direction in faceplate space).xy, clamped to the travel ellipse. 0.05 / 0.17 / 1.0. As the block catches up, the Spot recentres part-way. | Inclines to 18° toward the target (ω 5, so it arrives last). | Upper block yaws 70% of the bearing error, up to ±40° from rest and clamped to ±50° from the camera. Base follows at 20%, up to ±8°. A hover under 150 ms moves the Spot only. |
| Thinking | Returns home. 0.02 / 0.05 / 1.3. Holds perfectly still. | Levels to 0° and turns steadily at 40°/s, like a bezel being dialled. | Motionless, with hover amplitude × 0.3. |
| Acting | Snaps between work items with 250–400 ms dwells. Stretches up to 1.6× along its velocity. 0.035 / 0.11 / 0.9. One 80 ms halo stroke (σ → 0.2 and back) per completed action, synced to the UI change. | Tick locks onto the work bearing at 100%. | Whole body pitches 1.5° toward the work. The seam becomes a load gauge that fills symmetrically from the front centre. From the seam, 1–3 hairline filaments at 25% opacity run to the console panels. |
| Transmitting | Three-beat signature of 90 / 90 / 240 ms, intensity 1.0 → 1.6. | The tick emits the bead. The ring gives a 2° detent kick on send and on receive (ω 14 impulse). | Upper block faces the recipient, which is always the CEO. Seam flashes once for 150 ms. |
| Alert | Rises to the top of the ellipse at intensity 1.0. Halo turns amber #FFB347, never red. A ring of 0.18 final radius pings outward every 1.6 s, or 0.9 s when critical, and never faster. | Snaps level. Tick points at the CEO. | Upper block yaws to the owner's HUD. Seam turns amber. No shaking, no strobing. |
| Learns | One 80 ms stroke, then one more record mark lights and stays at 20%. | — | — |

**Arriving (1.8 s)**

| Time | Event |
|---|---|
| 0–250 ms | A white Spot appears alone in space. |
| 250–750 ms | The ring draws 0 → 360° around it facing the camera, so the logo forms in the air. |
| 750–1100 ms | The ring tips to a 10° incline. |
| 1000–1600 ms | The body extrudes out of the ring's plane, upward and downward at once. Each cut is capped by a thin white machining front, because everything is measured from the datum. |
| 1600–1800 ms | The Spot tints from white to its accent. The seam sweeps up to 30%. The tick turns toward the CEO and the handshake bead leaves. There is one 0.01 settle and no bounce. |

**Five-verb mapping**

| Verb | State |
|---|---|
| Observes | Attending |
| Thinks | Thinking |
| Takes action | Acting |
| Learns | A record mark lights |
| Reports back | Transmitting |

**Scaling scene**
1. The seam gauge saturates. The Spot makes two glances at the seam. Three white beads go up to the CEO.
2. The CEO thinks for 400 ms. Two white seed Spots then leave its register ring from that department's tick.
3. Each seed runs the arrival sequence beside the original. The specialists are 0.8 scale, with the same accent and the same ring variant.
4. Two-thirds of the original gauge drains across to the newcomers as beads.
5. Three seams now read about 33% each.
6. DOM labels read Research, Execution and Reporting.

## 5. CEO Agent vs department agents

- **Monobloc.**
  - 1.2 × 3.6 × 0.5, cut from one piece, with no seam and no bearing.
  - The faceplate is full height (0.76 × 3.30, r 0.12), so its Spot can travel down to read the HUD.
  - Spot home is at 80% of body height.
  - It has no dock and floats 0.2 above the HUD plane, because it has no desk.
- **White Spot.** #F4F7FF in both core and halo. When it receives a report, the halo takes a 15% tint of the sender's colour for 1 s.
- **Two rings, each with a job.**
  - The inner bearing ring (radius 1.02) behaves like a department's ring.
  - The outer register ring (radius 1.45, section 0.022 × 0.04) stays dead level and never moves.
  - The register ring carries seven index ticks at the true scene azimuths of the seven departments: `atan2(dx, dz)`.
  - A tick lights in its department's accent when that department reports or is hovered.
- **Switchboard routing.**
  1. The sender's bead lands on the sender's register tick.
  2. The bead runs along the register ring by the shorter arc, at 140°/s, to the recipient's tick.
  3. It departs white with a core in the sender's colour.
  4. Meanwhile the Spot glances at the sender's tick, contracts for 400 ms, then looks at the recipient's tick.
  5. This makes "via the CEO Agent" legible with no flowchart.
- **Economy of motion.**
  - All ω are × 0.6.
  - It has no hover bob and whole-body yaw is limited to ±10°.
  - At idle the Spot surveys the HUD, dwelling about 2.5 s on each region.
  - It never tracks the cursor.
- **Hover reaction.**
  - At 0 ms the hovered department's register tick lights to 100% and the Spot moves toward it.
  - At 120 ms the inner ring begins inclining toward that department.
  - After 400 ms of dwell the body yaws at 35% gain.
  - The hovered department's Spot then glances back at the CEO.
- **Click.** The tick pulses, a white bead leaves it for the department's HUD tile, and the camera follows the bead through the HUD.
- **CTA.**
  1. This is the only time the CEO faces the camera, and it holds for 2 s.
  2. The body then un-extrudes back into the ring plane over 700 ms.
  3. The ring turns 90° to face the camera.
  4. Spot plus ring is the logo lockup, which cross-fades to the SVG mark beside the CTA line.
- **Exclusions:** no crown, no gold, no plinth, no bigger glow.

## 6. Seven department variations

All bodies are identical. The rings are cut from the same blank.

| Department | Accent | Ring variation |
|---|---|---|
| Marketing | Orchid #E887D5 | Open arc, 300°, with a 60° aperture facing away from the CEO |
| Finance | Mint #7EDDAD | Twin parallel bands, each 0.02 axial, 0.03 apart |
| Sales | Citron #CDDC6A | Plain ring with a rider block (0.06 × 0.03 × 0.06) that advances round the ring with the pipeline stage |
| Customer Service | Aqua #61D8E5 | Dished band, with the wall coned 15° inward like a receiver |
| Operations | Signal blue #61A0FF | Four equal segments with 6° gaps |
| Internal Knowledge | Violet #A585FF | Laminated stack of three 0.044 bands with 0.009 gaps, like an archive spine |
| Administration | Sand #D6C9B3 | Plain band with 12 index studs (0.02 × 0.02 × 0.03) |

- Reserved colours are CEO white #F4F7FF and alert amber #FFB347.
- Only the hovered or active department runs at 100% accent intensity. Every other department sits at 35%.
- At most three departments run at full intensity at once.

## 7. Motion language

**Slew, settle, hold.** The reference is a camera gimbal or a damped hi-fi knob.

- **Forbidden motion:** overshoot, anticipation, squash, roll, nodding. Rings never spin for show.
- **Gaze cascade.** The Spot settles in about 260 ms, the upper block in about 600 ms, the ring in about 900 ms and the base in about 1.3 s. No agent holds a camera stare longer than 2 s.
- **Motion budget.**
  - Only the CEO and the focused agent run at full idle amplitude. The others run at 40%.
  - Agent i's idle phase is offset by i × 0.618 × 2π.
  - No two Spot drifts start within the same 300 ms window.
- **Handoff.**
  1. The sender's Spot gives the three-beat pulse.
  2. The sender's tick emits a bead of 0.05 core.
  3. The path is a quadratic bezier with its control point at the chord midpoint plus up × 0.18 × the chord length.
  4. A hairline draws ahead at 10% opacity and fades behind.
  5. Duration is clamp(chord / 2.4 U/s, 0.7, 0.9 s), with easeInOutCubic.
  6. The bead travels round the CEO register ring.
  7. It continues to the recipient, whose Spot turns to the bead 200 ms before it lands.
  8. The recipient dilates on receipt and its ring gives the detent kick.
  9. Beads never travel department to department.

## 8. Procedural three.js build recipe (@react-three/fiber + drei)

**Structure**
- `useAgentParts()` memoises the shared geometries and materials once.
- `<Agent dept state target spawnable/>` builds the per-agent graph.
- One `<AgentSystem>` runs a single `useFrame` that updates every spring from a `Float32Array`, with no per-agent hooks and no allocation.

Spring step:
```js
function damp(s,g,w,dt){const a=s.x-g,e=Math.exp(-w*dt),b=s.v+w*a; s.x=g+(a+b*dt)*e; s.v=(s.v-w*b*dt)*e;}
```

Scene graph:
```
agent (hover) ─ dock, underglow, contactShadow, backlightCard
              ─ base (yaw ×0.2) ─ seamCore
              ─ upper (yaw) ─ block, frame, faceplate, glowSprite
              ─ ringPivot (inclineAxis, incline, spin) ─ ring, tick [, rider/studs]
```

**Geometry**
- Every extrusion is followed by `toCreasedNormals(geo, 0.7)` from `BufferGeometryUtils`.
- `ExtrudeGeometry` is otherwise flat-shaded, and the facets would show in the strip reflections.

| Part | Constructor |
|---|---|
| Blocks | Rounded-rect `Shape` 1.0 × 0.44, r 0.18. `ExtrudeGeometry({depth: h−0.06, bevelEnabled:true, bevelSize:0.03, bevelThickness:0.03, bevelOffset:-0.03, bevelSegments:3, curveSegments:24})`, then `rotateX(-Math.PI/2)`. h = 0.90 for the base and 1.60 for the upper block. About 1.7k triangles each. |
| Seam core | The same shape × 0.97, `depth:0.012`, no bevel. |
| Faceplate | `ShapeGeometry(roundedRect(0.60,1.48,0.10), 12)`, z = +0.2205. |
| Frame | The same shape grown by 0.012, with the faceplate as a hole. `depth:0.006`, bevel 0.002 × 1. |
| Ring | Annulus `Shape` with `absarc(0,0,0.861,…)` and a hole `absarc(0,0,0.839,…)`. `depth:0.05`, bevel 0.004 × 1, `bevelOffset:-0.004`, `curveSegments:96`, centred on its depth. Arcs and segments: outer `absarc(a0→a1)`, then inner `absarc(a1→a0, clockwise)`, then `closePath`. |
| Dished ring (Customer Service) | `LatheGeometry` with the closed profile [(0.839,−0.025), (0.861,−0.025), (0.874,0.025), (0.852,0.025), first point], 96 segments, then `toCreasedNormals(geo,0.5)`. |
| Tick | `BoxGeometry(0.05,0.012,0.03)` inlaid on the ring's top face. |
| Studs | `InstancedMesh` ×12. |
| Dock | `CylinderGeometry(0.7,0.7,0.02,64)`. |
| CEO | Shape 1.2 × 0.5, r 0.20, one block, h 3.6. Rings at 1.02 and 1.45. Seven ticks as an `InstancedMesh` with `instanceColor`. |

**Materials**
- **Body:** `MeshStandardMaterial{color:'#2B2E33',metalness:1,roughness:1,roughnessMap:noise}`. The noise is a 256 px canvas value-noise texture with its G channel in 0.38–0.50, repeat 6. `envMapIntensity:1.0`.
- **Frame:** `{color:'#B9BEC6',metalness:1,roughness:0.14,envMapIntensity:1.3}`.
- **Ring:** `{color:'#9299A3',metalness:1,roughness:0.25}`.
  - A vertex inflate is added through `onBeforeCompile`: `transformed += normal*uInflate`.
  - `uInflate` is set so the band never falls below 1.5 px.
- **Tick:** `MeshBasicMaterial{color: accent.multiplyScalar(0.15…2.5)}`.
- **Seam:** `MeshBasicMaterial` with `onBeforeCompile`.
  - `a = abs(atan(vP.x, vP.z)) / PI`
  - `lit = step(a, uLoad)`
  - colour = `uAccent * (0.3*uSeam + 2.2*lit)`
- **Faceplate:** opaque, with no `transmission`.
  - Parameters: `MeshPhysicalMaterial{color:'#050607',metalness:0,roughness:0.08,clearcoat:1,clearcoatRoughness:0.04,envMapIntensity:1.2}`.
  - Set `customProgramCacheKey = ()=>'spot'`.
  - Each agent gets a clone with its own uniforms.
- **Dock:** `{color:'#15171A',metalness:1,roughness:0.35}`.
- **Floor:** `{color:'#08090B',metalness:0.9,roughness:0.32,envMapIntensity:0.6}`.

**Spot shader**
- The vertex shader adds `varying vec2 vP; vP = position.xy;`.
- The fragment code is injected after `#include <emissivemap_fragment>`:

```glsl
vec3 vd = normalize(vec3(vP,0.) - uEye);                 // uEye = camera in faceplate-local space (CPU, per frame)
vec2 q = vP + vd.xy * (0.035 / max(-vd.z, 0.25));        // exact parallax to the Spot plane
vec2 d = q - uC; d = vec2(dot(d,uDir), dot(d,vec2(-uDir.y,uDir.x))) / vec2(1.+uStretch,1.);
float r = length(d);
float core = smoothstep(uCore, uCore*.55, r);
float halo = exp(-r*r/(uHalo*uHalo));
float ping = smoothstep(.006,0.,abs(r-uPingR))*uPingA;
vec2 m = vP - vec2(-.121,-.66); float ix = floor(m.x/.022+.5);
float mark = step(0.,ix)*step(ix,uMarks-.5)*step(abs(m.x-ix*.022),.002)*step(abs(m.y),.015);
float n = fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5;
totalEmissiveRadiance += vec3(1.)*core*uI*6. + uAccent*(halo*uI*1.4 + ping*2. + mark*.35) + n/255.;
```

- Because the glass reflections are added after the emissive term, they sit physically over the Spot.
- `uDir` defaults to (1,0).

**Arrival clipping**
- Set `gl.localClippingEnabled = true`.
- Spawnable agents get cloned materials with two `clippingPlanes` (±Y from the ring plane). These are animated, and parked at ±99 after arrival.
  - They are never set to null, so nothing recompiles.
- Two white `ShapeGeometry` caps (`MeshBasicMaterial` at 0.8) ride the planes.
- The ring draws on through a fragment `discard` where `atan(vP.y,vP.x) > uDraw`.

**Environment (drei, no files)**

```jsx
<Environment resolution={256} frames={1} background={false}>
  <color attach="background" args={['#020203']} />
  {/* five Lightformers, all form="rect" — see the table below */}
</Environment>
```

| Lightformer | intensity | color | position | target | scale |
|---|---|---|---|---|---|
| Top softbox | 6 | #ffffff | [0,6,1] | none. `rotation-x={Math.PI/2}` | [7,2,1] |
| Rear-left strip | 9 | #CFE0FF | [-5,2,-3] | [0,1.5,0] | [0.5,7,1] |
| Rear-right strip | 5 | #CFE0FF | [5,2,-2.5] | [0,1.5,0] | [0.35,6,1] |
| Front-left glass strip | 3 | #ffffff | [-3,2.5,5] | [0,1.5,0] | [0.25,5,1] |
| Low warm kicker | 1.2 | #FFE9D6 | [3,-1.5,3] | [0,1,0] | [3,0.3,1] |

- **Living reflections.** `scene.environmentRotation.y = 0.15*sin(t*2π/40)`. This changes a uniform only.
- **Lights.**
  - `directionalLight` #E6EEFF, intensity 1.1, at [3,6,4].
  - `hemisphereLight('#1a1f2a','#000',0.25)`.
  - No shadow maps and no per-agent lights.
- **Atmosphere.**
  - `fogExp2('#07080A',0.045)`.
  - Camera fov 26, elevation at least 12°.
  - `ACESFilmicToneMapping`, exposure 0.9, sRGB output.

**Glow with no EffectComposer**
- **Texture.** One 128 px radial `CanvasTexture`.
- **Spot sprite.** Each agent has one additive `Sprite` with `depthWrite:false, toneMapped:false`.
  - It is placed at the apparent Spot position, `c + uEye.xy*0.035/(uEye.z+0.035)`, at z +0.01.
  - Scale is `max(8*uHalo, 6 px in world units)`.
  - Opacity is `(0.12 + 0.28*uI) * smoothstep(0, .25, dot(faceNormal, toCamera))`.
- **Underglow.** An additive accent plane 1.6 wide, opacity 0.06–0.12 × intensity.
- **Contact shadow.** A plane 2.2 wide with a black radial gradient at 0.5 opacity.
- **Backlight card.** A 3 × 4 plane at z −1.2 with a #9FB4D8 radial gradient at opacity 0.08, `fog:false`.
- **Beads.** One white sprite at 0.05 plus an accent sprite at 0.14, with a velocity-stretched quad trail 0.25 long.
- **Hairlines.** drei `<Line>` (Line2), `lineWidth={1}`.
- **Grain and vignette.** These are CSS overlays.

**Budget**

| | Triangles | Draw calls |
|---|---|---|
| Department agent | about 6k | about 12 |
| CEO Agent | about 8k | about 12 |
| Whole scene | about 50k | about 100 |

**Performance**
- I have not measured frame rate. Profile with stats-gl.
- **Canvas settings.**
  - `gl={{antialias:true, powerPreference:'high-performance'}}`.
  - `dpr` is kept in state, starting at `min(devicePixelRatio, 2)`.
- **DPR governor.**
  - drei `<PerformanceMonitor onDecline>` steps dpr down by 0.25, to a floor of 1.0.
  - After that, drop the backlight cards.
  - After that, swap the roughness map for a scalar 0.44.
- **Preload.** Call `gl.compileAsync(scene,camera)` in the preloader, including the clipped variants.
- **Render on demand.** Use `frameloop="demand"` with `invalidate()` during the typographic scenes.
- **Pause.** Use `IntersectionObserver` and `visibilitychange`.
- **HUD.** Build it as DOM or CSS, never as 3D text.
- **Transparency.** Allow at most three additive layers per agent.

## 9. 2D SVG fallback

- **Body.**
  - Front elevation is a 100 × 251 rounded rect (r 18), split by the seam into two rects at y = 160.
  - The fill is a linear gradient from #2E3136 to #1B1D21.
  - A 1 px left-edge highlight at 14% white stands in for the rim light.
- **Faceplate.** A 60 × 148 rect (r 10) with a gradient from #07080A to #0D0F12 and a 0.75 px #A9AFB8 stroke. A 5%-opacity vertical gloss bar stands in for the strip reflection.
- **Seam.** A 1.5 px accent line under a wider copy at 25% opacity. No filter blur.
- **Spot.** A white circle (r 3.5) plus a `radialGradient` accent halo (r 16).
- **Record marks.** 0.5 × 3 rects.
- **Ring.**
  - An ellipse (rx 85, ry 15) stroked 1.5 px in #9AA1AB, drawn as two paths.
  - The back arc sits under the body at 45% opacity and the front arc sits over it. This weave is mandatory.
  - The tick is a 4 × 2 accent rect.
  - Variants:
    - `stroke-dasharray` for the open arc, the four segments and the 12 studs.
    - A double ellipse for Finance.
    - A triple ellipse for Internal Knowledge.
    - A rider rect for Sales.
    - A gradient-width stroke for Customer Service.
- **CEO Agent.** One 120 × 360 rect with full-height glass, a second level ellipse (rx 145) carrying seven ticks, and a white Spot.
- **Attention.**
  - The Spot translates up to 10 px over 280 ms with `cubic-bezier(.2,.8,.2,1)`.
  - The upper rect takes `scaleX(.94)` and a 2 px shift to fake the yaw.
  - The matching register tick lights.
- **Reduced motion.** No idle motion. Positions cross-fade in 150 ms. State is carried by Spot size, tick and seam fill, plus a text label.
- **Low power.** A WebP poster rendered from the WebGL model, with the SVG agents laid over it.
- **16 px.** The drawing collapses to spot plus ring, which is the favicon and the logo.

## 10. Character lock

**Process**
- The WebGL model is the ground truth.
- Every image-to-video shot starts from a three.js still: front, three-quarter or side.
- Shots run 4 s or less, camera moves are slow, and rings stay static.
- All state animation stays in WebGL. AI video is used only for environments and atmospheric cutaways.
- If a generator drifts despite this, generate the environments alone and composite the agents from three.js renders.

**Lock paragraph**

> A tall precision-machined monolith, an object not a creature: two stacked blocks of bead-blasted dark graphite anodised aluminium forming one upright rounded-rectangle slab, proportions 1 wide by 2.5 tall by 0.45 deep, softly radiused vertical edges. The upper block, two-thirds of the height, is turned a few degrees relative to the lower block; between them runs a thin horizontal seam glowing faintly [ACCENT]. The upper block's front is a flush panel of smoked black glass framed by a hairline polished chamfer. Behind the glass sits one small point of cool white light with a soft [ACCENT] halo, off-centre, looking toward [TARGET]. One thin flat satin-titanium ring floats around the upper third, tilted ten degrees, not touching. Hovering slightly above a dark reflective floor, near-black studio, long vertical softbox reflections, subtle rim light, 85mm lens, shallow depth of field, product-launch film still.

**CEO swap:** "taller 1:3 single block with no seam, full-height glass front, pure white point of light, a second perfectly level outer ring carrying seven tiny inlaid marks, no floor dock."

**Negative prompt:** robot, humanoid, head, face, two eyes, mouth, visor, helmet, limbs, neck, antenna, mascot, cartoon, cute, toy, red light, red eye, HAL 9000, circular camera lens, concentric lens rings, security camera, fisheye, glowing brain, neural lines, circuit patterns, hologram, neon, cyberpunk, lens flare, particles, sparks, smoke, multiple lights, LED strips, screen text, logos, watermark, speaker grille, smart speaker, doorbell, phone, buttons, screws, wires, chrome, gold, white plastic, planet, Saturn, atom, multiple spinning rings, gyroscope, low-poly, stock 3D render.

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Reads as HAL or a surveillance eye | The Spot is small, mobile and white-cored. The glass is rectangular, and nothing is concentric except the brief alert ping. Alerts are amber, never red. Agents look at the work and never track the cursor. A camera stare lasts 2 s at most and happens only at the CTA. |
| Reads as a doorbell, speaker or phone | The ring encircles the whole body. The body is a two-block form that floats and turns on its seam, and it is 0.44 deep. No grilles or buttons. Its scale is set against the HUD. |
| The articulated upper block drifts toward a bust or mascot | The split is 64/36, not a head ratio. Both blocks have identical plan sections. The bearing gives yaw only, with no pitch, roll or nod. Timing is critically damped. The lock uses "block" words only. |
| Ring reads as Saturn, an atom or a gyroscope | One flat band, almost still, that moves only with intent and carries an index tick. The CEO's second ring is level and static. The ring spins continuously only while thinking. |
| Gaze unreadable at 40–80 px | Upper-block misalignment. A 6 px minimum glow sprite and a 1.5 px ring floor. The active agent is the only saturated one. |
| Dark object vanishes on near-black | Graphite body rather than black, the polished chamfer, rear vertical strips, the backlight card and fog. |
| Thinking reads as a loading spinner | The Spot holds still while the ring dials slowly with a single tick. |
| Seven accents become colour soup | The 35% rule, a maximum of three at full intensity, accent under 2% of pixels, and a white CEO. |
| Faceted reflections or CG-plastic look | `toCreasedNormals`, `curveSegments` 24, the bead-blast roughness noise and CSS grain. |
| Shimmer and banding | Band geometry with the pixel floor, MSAA, Line2 hairlines, and shader dither on the glass. |
| Clip-plane arrival shows a hollow shell | White cap plates ride both planes. Planes are parked and never nulled, so nothing recompiles. |
| Drift between WebGL and AI video | Image-to-video from real renders, the lock and negative prompt, short shots, static rings, and compositing as the fallback. |
| Performance traps | No transmission, no per-agent lights, no shadow maps, no composer. DPR is governed. Rendering is on demand in typographic scenes. |

No files were created.