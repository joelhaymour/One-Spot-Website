# Review notes (2026-09-20)

Four independent reviewers (lifecycle, performance, accessibility/responsive, spec/SEO) read the code after
the build. 45 findings, none critical. Raw output: `docs/panel/review-findings.json`.

## Fixed

- First load on a Lenis tier was force-scrolled to 0 (guard keyed on a boolean, defeated by the Lenis
  dependency). Guard is now keyed on the pathname; hash deep links and the saved HUD position are honoured.
- "Back to The Business" / browser Back landed on the hero unless the visit began at a HUD door. Scroll is now
  recorded for every department entry, and `leave()` targets `/#business` when there is no display position.
- The GL error boundary lived inside the lazy chunk it guarded. `GlBoundary` now wraps all three dynamic
  entry points from the DOM side; `app/error.tsx` is the last resort.
- "Pause motion" did not reach WebGL agents; and the pause CSS could freeze `.rise-in` entrances invisible.
  Single-agent stages now settle then stop rendering while paused, and wake on any state change.
- Stages rendered before `compileAsync` resolved (first frame blocked on shader linking). Now gated.
- Canvas measured the transformed bounding box (hero agent is CSS-scaled while scrolling): `offsetSize`.
- Agent canvases mounted on a timer with no viewport gate. Now created only when approached.
- Stale `hoveredDept` / `gazeTarget` after returning from a department. Cleared on unmount.
- Hero copy collided with the display at short laptop heights (1366x650 etc.). Headline now scales with
  height and the display's landing position is computed from the copy's real bottom edge.
- Loop scene overflowed one screen on phones and its console overflowed horizontally. Compact beat rail.
- `Reveal` server-rendered `opacity:0`: copy was invisible without JS. Now progressive (boot script +
  fail-safe), visible in server HTML.
- Display doors were `inert` in server HTML (dead without JS). Now only after mount on phones.
- Keyboard focus could land on doors below the fold; reduced-motion visitors still got the scrubbed hero move
  and smooth `goTo`. All handled.
- Data consistency: revenue arc drifted from its own copy (58% / 92%); 88% vs 94% capacity in one frame;
  "HUD" in three captions; loop miniature vs Marketing console figures; console clock vs panel timestamps;
  section numbering 01..06.
- SEO: one `SITE_URL` helper (no placeholder domain, warns when unset), canonical + `og:url`, share image on
  department pages, heading order on department pages.
- Contact API: exact content-type match, same-site check, trustworthy client key, bounded limiter memory,
  honest error copy (no "email me directly" without an address; 429 says so).
- Text equivalents for scaling beats and process steps on small screens; 40px tap targets; AA contrast on
  loop beat labels; grain overlay without a blend mode; single-layer canvas feather.

## Accepted, not changed

- WebGL stages stay mounted once created (at most five contexts on the homepage, each renders only while
  visible). Unmounting when far would trade that for repeated shader compiles and the module-cache
  retention below.
- Module-level geometry/material caches keep a destroyed renderer's bookkeeping reachable. Small, bounded by
  the number of canvases ever mounted in one visit.
- "Pause motion" is last in the tab order. It is reachable, and first would push the skip link down.

## Still to verify by eye on real hardware

Safari (macOS + iOS) rendering of the additive glow over a transparent canvas; 120 Hz frame pacing in Chrome
on ProMotion; Low Power Mode; a real phone for the department camera push (strength 1 below 640px).

## v2 reorder review (2026-09-21)

Three reviewers (regressions, spec/copy, responsive/a11y) read the reorder. Raw output:
`docs/panel/review-findings-v2.json`. Fixed: footer department links were classified as display doors
(door test now scoped to `#business`); the keyboard door-focus helper and the non-door return path
targeted the chapter's landing pose instead of the doors (restored a `#business-doors` anchor at the
explore pose); the hero overview collapsed to 155-290px at 1024-1180px (overview column floor 26rem);
the final still for reduced-motion / paused visitors dimmed the tools to ~1.8:1 (floor recedes only while
the live loop delivers); three singular company-voice strings; unused `HERO.overview`; inert chips exposed
to screen readers; card overhang on short laptops; first-paint label size estimates; and the two pauses
that had drifted from the scenes they were written for. Also found during verification: Lenis clamps
`scrollTo` to a cached page height, so restoring a deep position on the first frame of a new route landed
at the previous route's maximum (fixed with `lenis.resize()` before the jump).

## v3 positioning review (2026-09-22)

Three reviewers (regressions, message fidelity, responsive/a11y) read the v3 diff. Raw output:
`docs/panel/review-findings-v3.json`. Fixed: marketing examples still playing on the Hub feed and
to-do rail (now operational: PO-0878, part 2210); the scaling recommendation card covered the agent it
was about (it now sits under the beat-4 caption, and the decision state lives in ScalingSection); the
longer six-step bodies overflowed 720-899px-tall laptops (inactive bodies trim, visually only, so the
notes stay in the accessibility tree); "Pause motion" let the approval overtake the still-typing
recommendation (only reduced motion short-circuits now); the loop demo contradicted the Operations
door (stock 18, Team B); the return cover, the Hub story region and the department breadcrumb still
said "The Business" / "CEO Agent"; the Hub summarised the scaling event as 14 days vs three weeks and
gave a stray +22%; the hero's one-line workforce label crossed the DOM stem on phones; the loop
re-typed its reasoning when scrolling back; "N approvals" over a list of calls and reviews.
Accepted: the "Needs you" chips overhang their line by ~13px on 360px phones (cosmetic).

## v4 opening review (2026-09-22)

Four reviewers (runtime, motion and accessibility, copy and brand, layout) read the v4 diff and two
refuters checked every finding against the code. Raw output: `docs/panel/review-findings-v4.json`
(14 confirmed, 4 refuted). Fixed: the opening cover was the last element in a 350 KB body, so a slow
connection could paint the nav, the hero copy and the tangle before the cover existed (the Intro is now
the first child of the body, so its markup is in the first bytes and the mark's CSS entrance really does
start at first paint); the slide waited on an animation event that background tabs and headless renderers
hold back (it is now a timer from the animation's own start time, with first paint as the fallback); a
Tab during the sequence landed on invisible controls (everything under the cover is `inert` while it is
up); stopping Lenis changed the viewport width on classic-scrollbar desktops and shifted the centred
lockup (`scrollbar-gutter: stable`); reduced-motion visitors saw the tangle until hydration and then a
cut (the After still is now server HTML that CSS shows instead of the live drawing); the hero drawing
inherited first-paint label sizes tuned for the process drawing (it has its own estimates now); landscape
phones got a 180px drawing (a height-keyed budget); the Hub's comment and fallback number still said it was
the closing chapter; the pause before the Hub was still named `afterHero`; the removed Before / After
section's footage slot and shot S12 lingered; the plan's v1 narrative and journey read as current;
"organised" beside the owner's "Organizing" (visitor copy is US English now: inquiries, license,
fulfillment, labor); the hero comment called the headline "the promise". Also found during verification:
the hero caption could run ahead of the drawing because the phase timer and the morph tween were on
different clocks (the move to `after` now happens when the tween lands). Refuted: hard-coded "06" on the
phone Hub heading (it takes the index), "no hero reveals to release" (the gate is for the sections below),
a reduced-motion edge during the fade (the still is CSS now), and the default index (fixed anyway).

## v5 review: counters, the two-tab Hub, In action (2026-09-23)

Four reviewers (flows runtime, Hub runtime, accessibility and motion, copy and layout) read the v5 diff
and two refuters checked every finding. Raw output: `docs/panel/review-findings-v5.json` (23 confirmed,
2 refuted). Fixed: the Hub's tab bar came after the panes in the DOM, so keyboard and screen-reader users
who opened the Dashboard with the tab could not reach the doors (the bar is first now); the server still
of the Hub was a black screen with both panes inert (the Dashboard is the still before mount and without
JS, with seven real door links); on phones the story step jumped to 3 under the native flow (phones are
pinned to step 0 and the display shows the Dashboard by CSS); the Dashboard tab read "pressed" while its
pane was inert; three phone labels sat below 3:1 contrast; the flows readout cards clipped most lines on
phones and tablets (wider cards on narrow frames, three-row clamps for the recommendation and the decision);
the decision and log chips did not wrap ("Notify Michael + send reminder" ran out of its card); the top
tiles' cards covered their labels on phones (the card's top now follows the same 26k + 15u the label uses,
in CSS and in the camera box); the zoom and card measurements were frozen at build time across a breakpoint
change; the Chat epilogue message never fit its two rows (split into two readout lines); dead copy
(prompt, hint), dead state (the activity feed), stale labels and comments; the README and the plan still
describing the camera reveal, the right rail and the WebGL relay as current; the two docs disagreeing on
the Higgsfield budget. Accepted: at the One Spot beat the checks card covers part of the Support and Calendar
tiles; it is the focus of that beat and there is no free space inside the ring for a card that size.
Refuted: the flows reduced-motion still (it is rendered from the finished picture on the server too), and a
hard-coded chapter index on the phone Hub heading (it takes the index).
