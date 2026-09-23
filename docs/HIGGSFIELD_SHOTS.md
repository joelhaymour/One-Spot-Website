# One Spot — Higgsfield shot list

Read `docs/VISUAL_BIBLE.md` first. Every prompt below assumes its character lock, negative prompt, room,
lighting rig and camera language, and states only what is specific to the shot.

**Status: nothing generated yet.** The connected Higgsfield account is on the free plan with 0 credits
(checked 2026-09-20). Measured prices: 2 credits per 2K still (`nano_banana_pro`), 72 credits per 8 s 1080p clip
(`seedance_2_0`, std mode, no audio). Budget for everything below: about 45 credits of stills + about 630
credits of video = **about 675 credits**. Minimum useful set (S1, S2, S10, S13): about 300 credits.

Every slot on the site already has a real-time or CSS fallback, so the site is complete without these.
To install a clip: export per "Delivery", drop the files in `public/media/`, and fill in the slot in
`src/content/media.ts`. Nothing else changes.

## Models and settings

| Use | Model | Settings |
|---|---|---|
| Stills (character sheets, start and end frames, OG) | `nano_banana_pro` | 16:9, 2k, identity refs from `/lab` captures attached as `image_references` |
| Video with start + end frame | `seedance_2_0` | 16:9, 1080p, mode std, `generate_audio: false`, genre auto |
| Video needing 2K or mixed refs | `minimax_h3` | 16:9, 2K, start_image + end_image |

Shots are 4 to 8 s, one slow camera move, static rings, no state animation. Generate 2 variants per shot
(`count: 2`) and keep the calmer one.

## Delivery (per clip)

1. Trim to a clean loop where marked LOOP (cross-dissolve last 12 frames onto the first 12).
2. Add fine grain before encoding (dark 8-bit footage bands otherwise).
3. Encode three files, no audio track, 2.5 MB or less each:
   `ffmpeg -i in.mp4 -an -vf "scale=1920:-2,noise=alls=6:allf=t" -c:v libx265 -tag:v hvc1 -crf 26 -preset slow out.hevc.mp4`
   `ffmpeg -i in.mp4 -an -vf "scale=1920:-2,noise=alls=6:allf=t" -c:v libsvtav1 -crf 38 out.av1.mp4`
   `ffmpeg -i in.mp4 -an -vf "scale=1920:-2,noise=alls=6:allf=t" -c:v libx264 -crf 24 -preset slow -movflags +faststart out.h264.mp4`
4. Poster: first frame as AVIF and JPEG at 1920 wide.

---

## S0. Character sheets (stills, 16 images, about 32 credits)

One front elevation and one three-quarter view per agent (CEO + 7 departments), neutral pose, Spot at home.
- **Composition:** agent centred, full object in frame with 15% headroom, floor visible, horizon on the lower third.
- **Prompt:** character lock + `orthographic-feeling front view` / `three-quarter view from camera left, 30 degrees`.
- **Use:** identity references for every later shot. Not shown on the site.

## S1. `hero-room` — the room behind the hero (video, 8 s, LOOP, about 72 credits)

- **Slot:** `hero-room` behind the hero, and `business-room` behind The Business (same plate, two slots), full-bleed, 35% opacity, feathered into the void.
- **Agent:** none. The real-time CEO Agent is composited by the site.
- **Environment:** the black studio floor receding to darkness; two tall cool strip lights far behind, out of
  focus; the faintest haze.
- **Camera:** locked off. The only motion is light: the rear-left strip brightens 10% and returns, over 8 s.
- **Start frame = end frame** (loop): empty floor, strips at rest.
- **Prompt:** `Empty black photography studio, dark polished stone floor with soft short reflections, two tall
  narrow cool-white strip lights far in the background out of focus, faint clean haze, no objects, no people,
  static camera, 85mm, extremely subtle slow change in light intensity, product-launch film, low contrast blacks.`
- **Fallback in place:** CSS radial light spill under the display.

## S2. `ceo-establishing` — the CEO Agent above The Business (video, 8 s, about 72 credits + 2 stills)

- **Slot:** Open Graph video / social cut; poster for the static tier hero.
- **Agent:** CEO Agent (lock + CEO swap), Spot low on the glass, looking down at the display beneath it.
- **Environment:** one dark display floating below the agent, screen glowing softly neutral, no readable content.
- **Camera:** slow push-in on axis, eye level at the Spot. 12% scale change over 8 s.
- **Start frame:** wide. Agent and display occupy the centre 40% of frame; floor reflection visible.
- **End frame:** medium-close. Glass fills the upper half of frame; Spot sharp; ring crossing frame; display soft below.
- **Motion in frame:** none except a 2% drift of the Spot downward. Rings static.
- **Prompt:** lock + CEO swap + `floating above a thin dark monitor whose screen glows softly, slow cinematic
  push-in toward the smoked glass, the single point of white light looking down at the screen`.

## S3 to S9. `dept-<slug>-room` — seven department plates (video, 6 s each, LOOP, about 54 credits each)

- **Slot:** department intro, behind the workstation, 30% opacity, masked to a soft ellipse.
- **Agent:** that department's agent above its display, Spot looking down at the work, seam faintly lit.
- **Environment:** same room; the only difference is a very low wash of the department accent on the floor
  directly beneath the agent (the underglow), about 5% of frame.
- **Camera:** lateral slider move, camera left to right, 4% of frame width over 6 s.
- **Start / end frame:** identical composition offset by the slide; loop by ping-pong in the edit.
- **Prompt:** lock with `[ACCENT]` + `floating above a thin dark monitor, very slow lateral camera slide, faint
  [ACCENT] glow on the floor beneath it`.
- **Per department `[ACCENT]` / `[TARGET]`:** marketing orchid / the monitor below · finance mint · sales citron ·
  customer-service aqua · operations signal blue · internal-knowledge violet · administration sand.
- **Ring variation** must match the still from `/lab` (open arc, twin bands, rider, dished, four segments,
  laminated stack, twelve studs): always attach that department's still as `start_image`.

## S10. `arrival` — a specialist arrives (video, 6 s, about 54 credits + 2 stills)

- **Slot:** scaling section, behind the WebGL scene at beat 4, 25% opacity; also a social cutaway.
- **Camera:** macro, locked off, slightly below the ring plane, shallow depth of field.
- **Start frame:** empty dock disc on the dark floor, one small white point of light hanging in the air above it.
- **End frame:** the finished department agent (marketing accent) standing over the dock, ring tilted ten degrees,
  Spot tinted orchid.
- **Motion:** a thin titanium ring draws itself around the point of light, then the graphite body grows upward and
  downward out of the ring's plane, its cut faces capped by a thin white line. No bounce, no sparks.
- **Prompt:** `Macro product film. A single small point of white light hangs in the air above a dark metal disc.
  A thin flat titanium ring draws itself as a circle around the light. A dark graphite machined slab extrudes
  smoothly upward and downward from the plane of the ring, precise and silent, until it forms [lock]. No sparks,
  no particles, no glow bursts.`
- **Fallback in place:** this exact sequence runs in real time in `AgentRig.arrive()`.

## S13. `cta-macro` — the agent is the logo (video, 6 s, about 54 credits + 2 stills)

- **Slot:** contact section background, right half, 40% opacity.
- **Camera:** extreme close-up, locked off, looking straight at the CEO glass.
- **Start frame:** the white Spot behind smoked glass, soft halo, long vertical reflections, ring crossing the
  top of frame out of focus.
- **End frame:** the ring has rotated to face the camera square-on, a perfect thin circle around the Spot: the logo.
- **Motion:** only the ring turns, 90 degrees over 6 s.

## S14. OG image (still, 2 credits)

1200 x 630 crop of the S2 end frame with 40% clear space on the left for the headline set by
`src/app/opengraph-image.tsx`.
