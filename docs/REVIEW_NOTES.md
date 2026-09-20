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
