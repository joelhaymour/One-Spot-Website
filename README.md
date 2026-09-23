# One Spot

The website for One Spot, a custom business operating system: an interactive product film that shows a
company run through one command center (the Hub) with a digital workforce doing the work inside it.
Every department is a door; behind each door an agent works a full shift (observes, thinks, acts, learns,
reports). The owner sees more and does less.

Start with `docs/CREATIVE_PLAN.md`. It is the decision record for narrative, design language, motion and
architecture. `docs/VISUAL_BIBLE.md` and `docs/HIGGSFIELD_SHOTS.md` cover generated footage.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
npm run build
```

`/lab` is an internal bench for the agent family (every agent, every mood). It is excluded from robots.

## Stack

Next.js 16 (App Router, static) · React 19.2 · TypeScript · Tailwind 4 · GSAP + ScrollTrigger (the single clock)
· Lenis (fine pointers only) · three.js through @react-three/fiber (no drei) · zustand.

Versions are pinned exactly. @react-three/fiber 9 caps React below 19.3 while Next vendors a 19.3 canary; it
works, and an error boundary drops the site to SVG agents if the 3D layer ever throws. Re-test `/lab` and the
homepage after any dependency bump.

## How it is put together

| Path | What lives there |
|---|---|
| `src/content/` | All copy and data: `copy.ts` (deck), `departments.ts` (agents, stories, console regions), `hud.ts` (the fictional company + liveness script), `media.ts` (optional footage slots) |
| `src/components/motion/` | `SmoothScroll` (Lenis on the GSAP ticker), `ScrollStory` (sticky scroll-film engine), `Transition` (stepping through the display) |
| `src/components/display/VirtualDisplay.tsx` | The "computer": content authored at 1280 x 760 virtual px, scaled to fit, with a camera |
| `src/components/hero/` | The opening frame: copy plus `HeroOverview` (tools -> hub -> CEO Agent -> owner) |
| `src/components/hud/`, `business/` | The Business display, its camera reveal and the seven doors (the closing chapter) |
| `src/components/department/` | Department route shell, console frame, and the seven console screens |
| `src/components/network/`, `scaling/`, `process/`, `beforeafter/`, `cta/`, `chrome/` | Homepage scenes and site chrome |
| `src/components/agent/` | `AgentSlot` (SVG first, WebGL after), `AgentSvg`, `Mark` (the logo) |
| `src/gl/` | The only code allowed to import three.js. `agent/rig.ts` is the DATUM agent; `stage/GLStage.tsx` is the in-flow canvas |

Rules that keep it fast and correct:

- **No GSAP pins.** Scroll scenes are CSS-sticky tracks with server-rendered height (`ScrollStory`), so Back
  restores scroll and iOS never jitters. Scroll selects a discrete step; everything inside a step is time-based.
- **three.js never loads on first paint.** DOM code reaches WebGL only through `next/dynamic(..., { ssr: false })`
  and only on the `full` / `lite` tiers (`src/lib/capabilities.ts`). Reduced-motion, save-data and no-WebGL
  visitors get SVG agents and final states, and never download the 3D chunk.
- **One clock.** GSAP's ticker drives Lenis, then tweens, then each visible canvas (`frameloop="never"`).
- **Real text in the DOM.** Every caption, step and recommendation is server-rendered HTML; canvases are
  `aria-hidden` with DOM equivalents. A Pause motion control stops all ambient animation.
- Component classes in `globals.css` live in `@layer components` so Tailwind utilities can override them.

## Environment

See `.env.example`. The contact form needs either `RESEND_API_KEY` + `CONTACT_TO_EMAIL`, or
`CONTACT_WEBHOOK_URL`. Without either it logs in development and returns 503 in production (so enquiries are
never silently dropped). Set `NEXT_PUBLIC_SITE_URL` for sitemap, robots and Open Graph URLs.

## Generated footage

Every cinematic slot is optional and ships empty. To add a clip: follow `docs/HIGGSFIELD_SHOTS.md`, put the
encoded files in `public/media/`, and fill in the slot in `src/content/media.ts`.
