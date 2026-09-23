# One Spot — creative and technical plan

Decided by a three-track design panel (3 copywriters + judge, 3 agent designers + judge, 2 architecture
red-teamers). Raw panel output lives in `docs/panel/`. This document is the decision record.

## 1. Narrative

> Written for v1. The beats below are the original panel argument. Since v4 the film opens with the eight
> tools before and after (beat 6 lives in the hero), has four typographic pauses, and runs in the order given
> in the v5 note in section 2.

One idea, told as a product film: **a company is a set of departments that do not talk to each other, and the
owner is the wiring. One Spot replaces the wiring.**

The visitor never gets AI explained to them. They are handed a company and allowed to walk through it:

1. *Here is a whole business on one display.* (understanding: "it sees everything")
2. *Go inside a department and watch one agent do a full shift.* ("it does real work, not chat")
3. *Watch the agents hand work to each other.* ("it is an organisation, not a tool")
4. *Watch one agent realise it is the bottleneck and call in specialists.* ("it scales like a team")
5. *Here is how I build this around your company.* ("this is a service I can buy")
6. *Same software. Different company.* ("nothing gets ripped out")
7. *Show me how your company works.* (action)

Five full-screen typographic pauses separate the scenes. Nothing moves during them.

## 2. Structure

> **v5 (2026-09-22): counters, the two-tab Hub, and three routed scenarios.** The hero drawing now counts a
> working day under it: tab switches 325 -> 14, copy-pastes 144 -> 0, things waiting on you 41 -> 3. The Hub
> chapter is a four-step sequence on one straight display with two tabs: "See more." -> the dashboard's
> middle (revenue, four key metrics, the seven doors) -> "Do less." -> the To Do tab (calendar and deadlines,
> waiting on you and needs attention, three recommendations). The Network chapter (the WebGL relay) was
> replaced by "In action": the after ring with three scenarios (a new job comes in; a customer hasn't paid;
> a contract renews Friday) played as full time-based animations, one per scroll step, each following the
> same pattern (something happens -> One Spot finds the relevant information -> work moves between the right
> systems -> One Spot connects the dots -> you receive one clear decision), with only the relevant systems
> lit. Nav label: "In action". Current order: hero -> 01 How we work -> 02 The Hub -> 03 Scaling ->
> 04 Agents at work -> 05 In action -> payoff -> Contact.


> **v4 (2026-09-22): the opening.** The hero copy is now "Run the business. Not every task." /
> "Organizing your business, made simple." with the eyebrow "Custom business operating system" and the cue
> "See how we work". The hero animation is the eight-tools before / after picture, auto-playing on a clock
> (before 2.6 s, morph 1.5 s, after 6.5 s, cut, loop), captioned Before / After. The standalone Before /
> After section was removed because the hero now makes that argument at the top. The Hub moved directly
> after How we work. New order: hero -> 01 How we work -> 02 The Hub -> 03 Scaling -> 04 Agents at work ->
> 05 Network -> payoff -> Contact. How we work lost its lead line and "Not with AI"; step 05 is "Assign the
> work." (the goal is fewer things depending on you). The site opens with a logo sequence (mark in, slides
> left, wordmark in, lockup flies to the nav) that reduced-motion and no-JS visitors never see.


> **v3 (2026-09-22): positioning correction.** One Spot is the custom business operating system, not an
> AI-agent service. Hierarchy: One Spot (system) > One Spot Hub (central command center) > Agents (digital
> workforce, the execution layer inside One Spot) > Intelligence (what the operating history becomes) >
> Owner (governor: approvals, exceptions, decisions). Promise: "See more. Do less." The homepage is the
> simple sales presentation (learn the business -> map -> connect the software -> automate the right work ->
> organise it through One Spot -> only what needs you comes back); examples are universal and operational
> (work orders, inventory, scheduling, invoicing, receivables, customer questions), never marketing. The
> six-step method is: learn, map the operation, find the friction (classified: redesign / connect /
> automate / agent / human), build your One Spot, put the system to work (smallest solution that works),
> see more, do less. The system can recommend its own expansion; it cannot grant itself headcount.
> Not public: the personalised One Spot reveal after shadowing a business stays inside the sales process.


> **v2 (2026-09-21):** the homepage was re-sequenced so the film ends on the display the visitor can
> step into. Order: hero (copy + a short overview animation: tools -> hub -> CEO Agent -> owner) ->
> 01 How we work -> 02 Before / After -> 03 Autonomous scaling -> 04 Agents at work -> 05 Agent network ->
> 06 The Business (the interactive display, its reveal and the seven doors) -> Contact. Company narration
> is plural ("we"); individual agents still speak as "I". The table below is the v1 order.


| # | Section | Medium |
|---|---------|--------|
| 0 | Hero: CEO Agent + The Business display. "Your whole business. One spot." | DOM display, WebGL agent |
| 1 | Pause: "Every company has an operating layer. Usually it's the owner." | type |
| 2 | The Business: the display straightens, fills the frame, becomes interactive. Seven doors. | DOM, sticky |
| 3 | Pause: "A chatbot waits to be asked. An agent has a job." | type |
| 4 | The loop: Observes / Thinks / Acts / Learns / Reports, shown once on the Marketing agent in miniature, with a door into each department | DOM |
| 5 | Agent network: demand spike travels Marketing -> CEO -> Operations -> CEO -> owner | WebGL + DOM captions |
| 6 | Pause: "You wouldn't hire one person to do every job." | type |
| 7 | Scaling: one agent saturates, signals, two specialists extrude into place, load splits | WebGL + DOM queue |
| 8 | How I work: six steps over a company map that gets progressively wired | SVG, sticky |
| 9 | Pause: "Your software works. It just doesn't work together." | type |
| 10 | Before / After: eight tools, you in the middle -> eight tools, One Spot in the middle | SVG, scrubbed |
| 11 | Pause: "You still run the company. Now you can see all of it." | type |
| 12 | CTA: the CEO Agent collapses into the logo. "Show me how your company works." | WebGL -> SVG, form |
| — | `/departments/[slug]` x7: workstation + department agent + full scroll story | DOM display, WebGL agent |

Changes from the brief: "Explore" and the hero are one continuous move rather than two sections; the ten-step
marketing list became a **five-beat loop** that every department shares, so after one department the visitor
can read all seven; department sequences live on their own routes (shareable, code-split, SEO) instead of
making the homepage 60 screens long.

## 3. Journey

> The v1 journey. Since v4 the visitor lands on a logo sequence, then the headline beside the eight tools
> resolving around One Spot, then How we work, then the display (section 2, v4 note).

Land -> read five words -> notice the display is alive -> scroll, the camera pushes in -> point at a department,
the CEO Agent looks at it -> click, fall through the display into that department -> scroll the agent's shift ->
its report flies up to the CEO Agent -> step back out to the same place on the display, or walk to the next
department -> continue down the homepage film -> CTA.

## 4. CEO Agent

DATUM family, monobloc variant (section 6). Taller (1 : 3), one seamless block, full-height smoked glass so its
Spot can travel down to read the display, pure white Spot, no dock: it has no desk. Two rings with jobs:
an inner **bearing ring** that inclines toward what it attends to, and a dead-level outer **register ring**
carrying seven inlaid ticks at the true bearings of the seven departments. A tick lights in a department's
colour when that department is hovered or reports. Messages physically run around the register ring from the
sender's tick to the recipient's tick: "via the CEO Agent" is visible without a flowchart.
It never tracks the cursor. It surveys the display, and looks at what the visitor points at.

## 5. The Business (HUD)

A DOM dashboard authored at a fixed 1280 x 760 virtual resolution inside `VirtualDisplay` (machined chassis,
one glass reflection, light spill), scaled to fit, with a camera that can push into any region.
Visitor-facing copy never says "HUD". Layout (v5): a bar with two tabs. Dashboard: revenue vs target,
four key metrics, seven department doors and the open dock. To Do: calendar and deadlines, waiting on you
and needs attention, three CEO Agent recommendations. (v1 had a left and a right rail around the centre.) One fictional mid-market company with internally consistent numbers.
Liveness is scripted and budgeted: one event roughly every 2.6 s (a number ticks, a to-do completes with an
agent's name on it, an activity line arrives, a recommendation is typed). Never two at once. A Pause control
stops it (WCAG 2.2.2). Recommendations carry Approve / Review / Not now.

## 6. Agent system: DATUM

A precision-machined object, not a creature. Two stacked graphite blocks forming one plumb rounded slab;
the upper block (64%) turns on a thin lit **seam**; its front is smoked black glass with **one travelling
point of light, the Spot**, which is the brand mark and the agent's gaze; one flat titanium **ring** with an
index tick floats around it. Collapsed to 16 px it is a spot inside a ring: the logo.

State vocabulary (double-encoded by Spot and ring, so it reads without colour):
idle (breathes, drifts) / observes (Spot travels, block then ring follow in a cascade: 260 ms, 600 ms, 900 ms) /
thinks (Spot contracts and holds dead still, ring levels and dials) / acts (Spot snaps between work items,
seam fills as a load gauge) / learns (a permanent record mark lights at the foot of the glass) /
reports (three-beat pulse 90/90/240 ms, a bead leaves the tick) / alert (amber, never red, slow ping) /
arrives (Spot appears, ring draws around it, the logo forms in the air, the body extrudes from the ring plane).

Departments share the body and differ by accent and ring cut: Marketing orchid, open 300 deg arc;
Finance mint, twin bands; Sales citron, rider block that advances with pipeline stage; Customer Service aqua,
dished band; Operations signal blue, four segments; Knowledge violet, laminated stack; Administration sand,
twelve studs. Amber is reserved for alerts, white for the CEO. Forbidden: overshoot, bounce, nodding, faces,
red, show-off ring spin.

## 7. Scroll sequences

`ScrollStory`: a tall track with a CSS-sticky stage. Scroll picks a **discrete step**; everything inside a step
is time-based, so a fast flick can never leave a half-animated state. Only camera moves are scrubbed.
Department stories: 6 to 10 steps on a shared five-beat rail; each step = a caption, an agent mood, a camera
focus on one of five standard console regions (A main, B side, C, D, E agent log), and a line in the agent's
log. Standard regions make seven consoles read as one family and give phones a readable view: on small
screens the camera pushes fully into the focused region.

## 8. Agent-to-agent communication

> Replaced in v5 by In action (section 2): the after ring with three routed scenarios, SVG and DOM on one GSAP
> timeline. The v1 design follows.

One sticky WebGL stage. CEO Agent raised at centre-back, departments on an arc in depth. A four-beat relay:
`Marketing: enquiries up 46%` -> `CEO Agent: checking capacity` -> `Operations: 88% booked, 12 slots can open`
-> `To you: one decision needed`. Beads travel on shallow arcs, land on the sender's register tick, run the
ring, leave for the recipient, whose Spot turns to meet the bead 200 ms before it lands. Beads never travel
department to department. Every beat has a DOM caption in an ordered list (accessibility and SEO).

## 9. Scaling scene

One agent, one queue. Work arrives faster than it clears; the seam gauge saturates; the Spot glances at it
twice; the agent writes `Workload at 140% of capacity. I am becoming the bottleneck. Requesting two specialists.`
Three white beads rise. Two seed Spots return and each runs the arrival sequence beside the original at 0.8
scale. Two thirds of the gauge drains across as beads; three seams settle near 33%; DOM lanes are labelled
Research, Execution, Reporting; throughput climbs. No whistle, no drop-in, no bounce.

## 10. Visual style

Void #040506 to graphite #1d2228; hairline borders at 8% white; type #f3f5f8 / #b4bac4 / #7a828e.
Geist for everything, Geist Mono uppercase for telemetry labels. Accent pixels under 2% of any frame;
only the hovered or active department runs at full saturation. Film grain overlay and dithered gradients to
stop near-black banding. No backdrop-filter over live canvases.

## 11. Motion style

"Slew, settle, hold": a camera gimbal, a damped hi-fi knob. Critically damped springs, zero overshoot.
UI responds in 180 to 480 ms (expo out); cameras breathe in 1.1 to 1.4 s (power3 in-out). Motion budget:
one thing moves at a time; pauses are truly still. Every move answers "what is the agent looking at or doing".

## 12. Stack

Next.js 16.3 App Router (static), React 19.2, TypeScript, Tailwind 4. GSAP 3.15 + ScrollTrigger as the single
clock; Lenis on fine pointers only, driven by the GSAP ticker; R3F 9.7 with `frameloop="never"`, advanced from
the same ticker. three.js without drei. zustand for discrete cross-component state. Exact version pins
(R3F caps React below 19.3 while Next vendors a 19.3 canary; an error boundary drops to SVG agents if the
3D layer ever throws). No GSAP pins anywhere: sticky tracks with server-rendered height, so Back restores scroll.

| Layer | Medium | Why |
|---|---|---|
| Displays, consoles, captions, charts | DOM + SVG | real text, crisp, accessible, indexable, cheap |
| Agents, scaling (network until v5) | WebGL, in-flow canvases inside sticky stages | reflections and gaze need real 3D; in-flow canvases cannot drift against the DOM |
| Environments and atmosphere | Higgsfield video, optional | poster-first enhancement, never load-bearing |

Route transition: state machine idle -> dive -> hold -> arrive. A cover FLIPs from the clicked tile to the
viewport while the stage scales to 1.6 at most and fades (never an 8x zoom of text: it exceeds texture limits and
blurs). Route is prefetched on pointer-enter and committed only behind the opaque cover. Tiles are real links:
cmd-click works, keyboard works, no-JS works.

## 13. Higgsfield

The WebGL model is ground truth; generated video is atmosphere. Shot list, prompts and the character lock are
in `docs/VISUAL_BIBLE.md` and `docs/HIGGSFIELD_SHOTS.md`. Workflow: render stills of the real 3D agent ->
use them as start frames for image-to-video -> short (4 to 8 s), slow camera, static rings, no audio.
Planned: hero environment loop, seven department environment plates, the arrival cutaway, OG image. Measured
cost: 2 credits per 2K still, 72 credits per 8 s 1080p clip; the full list is about 675 credits. **The connected
account currently has 0 credits on the free plan, so nothing has been generated.**
Every slot has a procedural fallback, so the site is complete without them.

## 14. Performance

Three.js is never in the first-load bundle: `src/gl/**` is the only code that imports it, loaded after the hero
has painted and only on a WebGL tier. SVG agent paints first and cross-fades when shaders have compiled
(`compileAsync`). One procedural PMREM environment, three material families, no shadow maps, no transmission,
no post-processing (glow is additive sprites). DPR from an 8 MP pixel budget, capped at 2. Canvases only
advance while visible and the tab is focused. Numbers tick via `textContent`, hover never re-renders the HUD at
pointer rate. LCP element is the H1 and is never hidden on first paint.

## 15. Mobile

Same HTML everywhere; layout decided in CSS. No Lenis on touch. Sticky stories work natively on iOS (svh units).
Displays stay in frame as the "film" while the camera pushes fully into the region being discussed, so text
is readable. The Business gets a native list of department doors beneath the display. Lite tier: capped DPR,
fewer agents in the WebGL scenes. Static tier (reduced motion, save-data, no WebGL): SVG agents, final states,
zero 3D download.

## 16. Positioning and copy

Eyebrow: THE AI OPERATING LAYER. Headline: **Your whole business. One spot.**
Sub: I build AI agents that work across the people and software you already have. They watch. They act.
They report to you. Alternates: "A business that reports to you." / "See everything. Chase nothing."
CTA: **Show me how your company works.** Button: **Map my company.** Full deck: `docs/panel/copy.md`.
The headline wins because only this company can run it, it captions exactly what is on screen, and it has no
AI word in it for an owner to distrust.

v4: hero copy per the note in section 2.
