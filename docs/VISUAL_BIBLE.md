# One Spot — visual bible for generated assets

Every generated image or clip must look like it was shot in the same room, on the same day, of the same
objects that the website renders in real time. **The WebGL model is ground truth.** Generated media is
atmosphere and environment; it never carries state, UI or story beats (the real-time agents do that).

## 0. Method (do this in order)

1. Open `/lab` on the running site, pick the agent and mood, and capture stills (front, three-quarter left,
   three-quarter right). These are the **identity references**.
2. Generate the **character sheet** stills (section 3) with those references attached. Approve or regenerate
   until the object matches: two blocks, one seam, rectangular smoked glass, ONE point of light, ONE flat ring.
3. Only then generate video, always **image-to-video from an approved still** (start frame, and end frame where
   the shot list gives one). Never text-to-video for anything containing an agent.
4. If a generator drifts (adds a face, a lens, a second light, a spinning gyroscope), generate the environment
   alone and composite the agent from a three.js render. Do not fight the model.

## 1. The room

A black studio with no visible walls. Floor: dark polished stone or anodised metal, roughness about 0.3,
reflections soft and short. Air: clean, the faintest haze so rim light has something to catch; no smoke, no dust
motes, no particles. Colour: neutral to slightly cool (5600 to 6500 K). The only warm source is a very low,
very dim kicker at floor level. Nothing in the room is brighter than the agent's Spot.

Lighting rig (matches `src/gl/stage/environment.ts`):

| Source | Position | Quality | Job |
|---|---|---|---|
| Top softbox | overhead, slightly forward | large, soft, white | crown highlight, ring highlight |
| Rear strip, camera left | behind and left | tall, narrow, cool white, brightest source | rim light that separates graphite from black |
| Rear strip, camera right | behind and right | tall, narrow, cool white, half power | second rim |
| Front strips | either side of camera | very narrow, tall | the long vertical reflections in the glass |
| Front fill | behind camera, high left | very large, very dim | graphite sheen on the front face |
| Low kicker | floor level, camera right | thin, warm, dim | grounds the object |

## 2. Camera language

85 mm equivalent, shallow depth of field, eye level at the agent's Spot or slightly below it (the agent has
presence; we never look down on it). Moves are slow and single-axis: a push-in, a lateral slide on a slider, a
slow crane down. Speed: a push-in covers no more than 15% of frame scale in 6 s. No handheld, no whip pans,
no orbit faster than 8 degrees per second, no rack-focus gimmicks, no lens flares, no anamorphic streaks.
Grade: low-contrast blacks lifted to about 3%, highlights rolled off, no teal-and-orange.

## 3. Character lock

Department agent (substitute `[ACCENT]` and `[TARGET]`):

> A tall precision-machined monolith, an object not a creature: two stacked blocks of bead-blasted dark
> graphite anodised aluminium forming one upright rounded-rectangle slab, proportions 1 wide by 2.5 tall by
> 0.45 deep, softly radiused vertical edges. The upper block, two-thirds of the height, is turned a few degrees
> relative to the lower block; between them runs a thin horizontal seam glowing faintly [ACCENT]. The upper
> block's front is a flush panel of smoked black glass framed by a hairline polished chamfer. Behind the glass
> sits one small point of cool white light with a soft [ACCENT] halo, off-centre, looking toward [TARGET]. One
> thin flat satin-titanium ring floats around the upper third, tilted ten degrees, not touching. Hovering
> slightly above a dark reflective floor, near-black studio, long vertical softbox reflections, subtle rim
> light, 85mm lens, shallow depth of field, product-launch film still.

CEO Agent swap:

> taller 1:3 single block with no seam, full-height smoked glass front, pure white point of light, a second
> perfectly level outer ring carrying seven tiny inlaid marks, no floor dock, floating.

Negative prompt (always):

> robot, humanoid, head, face, two eyes, mouth, visor, helmet, limbs, neck, antenna, mascot, cartoon, cute, toy,
> red light, red eye, HAL 9000, circular camera lens, concentric lens rings, security camera, fisheye, glowing
> brain, neural lines, circuit patterns, hologram, neon, cyberpunk, lens flare, particles, sparks, smoke,
> multiple lights, LED strips, screen text, logos, watermark, speaker grille, smart speaker, doorbell, phone,
> buttons, screws, wires, chrome, gold, white plastic, planet, Saturn, atom, multiple spinning rings, gyroscope,
> low-poly, stock 3D render.

Accents: CEO `#F4F7FF` white · Marketing `#E887D5` orchid · Finance `#7EDDAD` mint · Sales `#CDDC6A` citron ·
Customer Service `#61D8E5` aqua · Operations `#61A0FF` signal blue · Internal Knowledge `#A585FF` violet ·
Administration `#D6C9B3` sand · Alert `#FFB347` amber (never red).

## 4. Hard rules for any frame containing an agent

- One Spot per agent. It never becomes a shape, never blinks, never duplicates, never leaves the glass.
- The ring is flat, nearly still, and never spins for show. Rings are static in generated video.
- The body is plumb. It may turn on its seam; it never nods, tilts, bounces or walks.
- No text, numbers or interface on any screen in generated footage. Screens in shot are dark glass with a soft
  glow; the real interface is composited by the website.
- No people. Hands and silhouettes are allowed only in the Before shot of the transformation sequence, and only
  out of focus.

## 5. The display (workstation hardware)

Thin dark-metal monitor, 16:9.5, machined bezel about 1% of width with one bright top edge, no logo, no stand
visible in most shots (it floats on an arm that is out of frame, or sits on a slim single-post stand). Screen
content in generated media: off, or a soft neutral glow. The agent floats above the top edge of its display,
centred, never touching it.
