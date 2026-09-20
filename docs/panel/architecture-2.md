# One Spot — architecture red-team (scroll, motion, routing, mobile, accessibility)

No project files were created or modified. I ran the experiments below in a throwaway app at `/private/tmp/claude-501/-Users-joelhaymour/0980e701-d11d-4e20-b995-f35f44eeb371/scratchpad/r3f-smoke`. It reuses the project's installed packages through a symlink and was served from a production build.

## 1) Verified versions and peer-dependency compatibility

| Package | npm latest | Installed in `/Users/joelhaymour/Projects/one-spot` | Notes |
|---|---|---|---|
| next | 16.3.5 | 16.3.5 | Peers: react `^18.2 \|\| ^19`. `dynamicParams` is unavailable when `cacheComponents` is on. |
| react / react-dom | **19.3.0** | **19.2.8** | Stay on 19.2.x, do not move to 19.3.0. R3F caps its peers at `<19.3`. |
| three | 0.186.0 | ^0.186.0 | r186 logs "THREE.Clock … has been deprecated" because R3F uses it. It is harmless. |
| @react-three/fiber | 9.7.0 | 9.7.0 | Peers: react and react-dom `>=19 <19.3`, three `>=0.156`. It bundles reconciler 19.2.0 and depends on scheduler ^0.27. |
| @react-three/drei | 10.7.8 | 10.7.8 | Peers: react ^19, fiber ^9, three `>=0.159`. It is not in Next's default `optimizePackageImports` list, so add it. |
| gsap | 3.15.0 | ^3.15.0 | |
| @gsap/react | 2.1.2 | ^2.1.2 | Peer: gsap ^3.12.5. |
| lenis | 1.3.26 | ^1.3.26 | Relevant options (`stopInertiaOnNavigate`, `respectReducedMotion`, `autoRaf`, `anchors`, `syncTouch`) are covered under R8 and R6. |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | ^4 | No issues. |
| zustand | 5.0.15 | ^5.0.15 | R3F also depends on zustand ^5, so there is one copy. |

Four findings from the scratch app:

- **The App Router does not run the pinned React.**
  - In a production build, `React.version` in the browser was `19.3.0-canary-cbb046ab-20260731`. That is the copy Next vendors, not the 19.2.8 in package.json.
  - R3F therefore runs outside its declared peer range.
  - The smoke test still passed with zero errors. It covered a persistent `<Canvas>` in the root layout, drei `<View>`/`<View.Port>`, `eventSource=document.body`, a conditional mesh, client-side navigation and browser Back.
  - I only tested a webpack build, because the symlinked `node_modules` would not work with Turbopack. The Turbopack path is unverified, so check it on day 0.
- **Back-navigation scroll restoration depends on when the page gets its height.**
  - With the height set in `useLayoutEffect`, Back restored to 2500px.
  - With the height applied 400 ms after mount, Back landed at 0. That delay simulates a lazy-loaded story, or a pin-spacer created after a dynamic import.
- **Page-level `<View>` content unmounts and remounts on every route change.** In the smoke test the view's meshes swapped on navigation.
- **View transitions are built in.** The Next docs bundled in `node_modules` confirm the following, and `ViewTransition` types are present in the installed `@types/react`:
  - `<ViewTransition>` works in the App Router with no configuration.
  - `transitionTypes` exists on `<Link>` and `router.push` since 16.2.
  - `<Link onNavigate>` fires only for single-page navigations.
  - Prefetching happens in production only.
  - `ssr:false` dynamic imports are only allowed inside Client Components.

## 2) Risks, ranked

### R1 — Critical: the 3D layer runs on an unsupported React
R3F caps its peers at `<19.3` because its bundled scheduler is 0.27 while React 19.3 ships 0.28. Next vendors a 19.3 canary regardless of what you install. It works today, but any Next patch can move that canary.

- Exact-pin `next`, `react`, `react-dom`, `@react-three/fiber`, `@react-three/drei` and `three`, with no carets.
- Never use `--legacy-peer-deps` to get to react 19.3, because that puts two scheduler copies under one renderer.
- Wrap the 3D layer in an error boundary and a context-loss handler that drop to the SVG tier.
- Add a Playwright smoke test that runs on every dependency bump.

```tsx
<GLBoundary onError={() => setTier('static')}><Suspense fallback={null}><Scene/></Suspense></GLBoundary>
// in onCreated: gl.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); setTier('static') })
```

### R2 — Critical: `pin:true` plus lazy sections breaks the return to the HUD
ScrollTrigger pinning creates the scroll distance in JavaScript through a pin-spacer, and the proposal lazy-loads heavy scenes.

- That is exactly the late-height case I measured, where Back landed at 0.
- `ScrollTrigger.refresh()` also rewrites `history.scrollRestoration` and replays its own recorded positions.
- Pin-spacers reparent nodes that React owns.

Replace pinning with CSS sticky tracks whose height is server-rendered. ScrollTrigger then only measures:

```tsx
<section style={{ height: `calc(${steps} * 100svh)` }}>
  <div className="sticky top-0 h-svh overflow-clip">{stage}</div>
</section>
```
```ts
ScrollTrigger.create({ trigger: track, start: 'top top', end: 'bottom bottom',
  onUpdate: s => setStep(Math.min(steps - 1, Math.floor(s.progress * steps))) })
```

- No ancestor of a sticky stage may use `overflow:hidden` or `overflow:auto`. Use `overflow-x: clip` instead.
- Never lazy-load anything that changes the document height.
- Sticky positioning is compositor-driven, so this also removes pin jitter on iOS.

### R3 — High: the zoom-then-push transition has several holes
- There is no hold state. `router.push` returns nothing, development builds have no prefetch, and on a slow network the zoom finishes before the page arrives. The visitor sees a frozen screen.
- There is no Back path. Browser Back (popstate) has already swapped the page before GSAP can act.
- Interruptions are not handled: a double click, the Escape key, or a second tile.
- Scaling a text and `backdrop-filter` subtree 8–12x produces a blurry bitmap, and Safari can drop the layer when it exceeds its texture limit.
- Lenis inertia carries into the new page, which then opens part-scrolled (Lenis #319 and discussion #244).

What I would build instead:

- Run a state machine `idle → anticipate → dive → hold → arrive`, and keep the overlay in the root layout so it persists across the route change.
- Animate one tile clone from its tile rect to the full viewport (FLIP). Stage scale stays at or below about 1.15. Do not scale the whole HUD.
- Switch the glass effect off for the duration with `[data-transitioning] .glass { backdrop-filter: none }`.

```tsx
<Link href={href} onPointerEnter={() => { router.prefetch(href); setHover(slug) }}
  onFocus={() => setHover(slug)} onBlur={() => setHover(null)}
  onNavigate={e => { if (tier === 'static') return; e.preventDefault(); dive(slug, e.currentTarget) }} />
```
```ts
async function dive(slug, el) {
  if (get().phase !== 'idle') return
  lenis.stop()
  try { set({ phase: 'dive', target: href }); await flipToViewport(el); set({ phase: 'hold' }); router.push(href) }
  catch { set({ phase: 'idle' }); lenis.start() }
}
// TransitionLayer, in the layout:
useEffect(() => { if (phase === 'hold' && pathname === target) set({ phase: 'arrive' }) }, [pathname])
// the department page reveals itself, then calls lenis.start() and sets phase 'idle'
```

Use React `<ViewTransition name={`dept-${slug}`}>` for the return link and for browser Back. It gives a reverse morph on popstate that GSAP cannot.

- Give the fixed canvas its own `view-transition-name` with `animation: none`, so it is not cross-faded as a bitmap.
- Set `::view-transition { pointer-events: none }`.
- Add the reduced-motion CSS block from the bundled guide.
- Per the docs, the morph only plays when the destination commits in the same render. That holds for a prefetched static route.

### R4 — High: separate animation loops make agents drift against their DOM frames
Lenis runs on the GSAP ticker, R3F runs its own `requestAnimationFrame` loop, and drei `View` reads element rects inside `useFrame`.

- When R3F's callback runs first, the scissor rectangle is one frame stale. The 3D agent visibly slides against its DOM frame.
- On touch devices, native momentum scrolling happens on the compositor thread. A fixed canvas repaints on the main thread and always lags it.

Drive everything from one clock:

```ts
// Lenis autoRaf:false, <Canvas frameloop="never">
gsap.ticker.lagSmoothing(0)
gsap.ticker.add(t => { lenis.raf(t * 1000); if (!document.hidden && anyViewVisible) advance(t * 1000) })
lenis.on('scroll', ScrollTrigger.update)
```

- `advance` and `frameloop` are present in the 9.7.0 typings.
- Place agents only inside sticky stages, where their rect does not move.
- On touch devices and the lite tier, never track a scrolling element with a fixed canvas.
- Page-level `<View>` content remounting on every route change means GPU resources are disposed and recreated at the most cinematic moment. Move the agent rigs into the persistent layout scene. Pages then register anchors with something like `useAnchor('ceo', ref)`, and the rig eases towards the active anchor.
- Post-processing and bloom do not work across scissored Views. Fake any glow with additive sprites.

### R5 — High: pinned stories and canvas-only scenes fail keyboard and screen-reader users
- Step copy hidden with `visibility`, `display` or `aria-hidden` cannot be read by assistive technology.
- A screen reader's reading position does not move the scroll position, so the visuals and the text being read drift apart.
- The Agent Network and Autonomous Scaling scenes are canvas only. They have no DOM text, which also means nothing for SEO.
- A HUD that stays "alive" is auto-updating content with no pause control, which fails WCAG 2.2.2.
- Reactions that fire only on hover exclude keyboard users.

Fixes:

- Keep all step text in the accessibility tree at all times, and animate only opacity and transform.
- Make each step `100svh` tall, so PageDown or Space advances exactly one step.
- Build the stepper (Observe, Think, Act, Learn, Report) from real buttons with `aria-current="step"`.
- Add a "Skip sequence" link at the start of each pinned story.
- Make focus drive the step:

```tsx
<li onFocusCapture={() => lenis.scrollTo(track.offsetTop + i * innerHeight, { immediate: reduced })}>
```

- Set `aria-hidden` on the canvas. Give each WebGL scene visible DOM captions in an `<ol>`.
- Add a Pause motion control bound to the same flag as reduced motion.
- Make the tiles `<a>` elements in a `<ul>` inside `<nav aria-label="Departments">`.
- After arrival, move focus to `<h1 tabIndex={-1}>`.
- Give each department page a unique `<title>`.
- Rebuild triggers when the user's motion preference changes:

```ts
gsap.matchMedia().add({ motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width:1024px)' },
  c => { if (!c.conditions!.motion) return; /* build triggers; they auto-revert when the query flips */ })
```

- Contrast, by my calculation: `--text-3` on `--bg-0` is about 2.5:1, so use it for decoration only. `--text-2` is about 5.2:1 and passes.

### R6 — Medium-high: iOS Safari viewport changes
- `100vh` on iOS is the large viewport, so pinned content sits under the toolbar.
- `dvh` changes continuously while the address bar collapses, which shifts layout and trigger positions.
- When the bar collapses, the fixed canvas's layout box resizes. R3F then reallocates its buffer, and the visitor sees a black flash mid-scroll.
- `ignoreMobileResize` is already set in `/Users/joelhaymour/Projects/one-spot/src/lib/gsap.ts`. It covers neither CSS units nor the canvas.

Fixes:

- Size sticky stages in `svh` and let backgrounds bleed to `lvh`.
- Give the canvas a height of `100lvh`.

```tsx
<Canvas resize={{ scroll: false, debounce: { scroll: 0, resize: 250 } }} dpr={dprFor(tier)} frameloop="never" />
```

- Never enable Lenis `syncTouch`. Its README calls it unstable on iOS below 16.
- Never use `ScrollTrigger.normalizeScroll()` alongside Lenis.
- Refresh triggers only on a width change or an orientation change.
- In Low Power Mode, `requestAnimationFrame` runs at 30 fps and autoplay is blocked. Catch `video.play()` rejections and keep the poster.

### R7 — Medium: hydration mismatch and flash of content
- `detectTier()` returns `static` on the server and `full` on the client. Reading it during render causes a hydration mismatch.
- "Today" in a statically generated HUD is the build date, and `toLocale*` formatting differs between server and visitor.
- `gsap.from()` runs after hydration, so content flashes visible before it hides. Hiding it in CSS instead leaves it blank forever if the chunk fails.

Fixes:

- Read the tier with `useSyncExternalStore(sub, getClient, () => 'static')`.
- Pre-hide content only under a flag set by an inline script, with a fail-safe:

```html
<script>try{if(matchMedia('(prefers-reduced-motion: no-preference)').matches)document.documentElement.dataset.motion='on';setTimeout(function(){if(!window.__gsapReady)delete document.documentElement.dataset.motion},3000)}catch(e){}</script>
```
```css
html[data-motion=on] [data-reveal] { opacity: 0 }
```

- Use deterministic, fictional HUD data with relative labels such as "Today" or "Thu".
- Keep pages as Server Components, and pass copy as `children` into the client stage shells. The text then ships as HTML, not as JavaScript props.

### R8 — Medium: trigger lifecycle across routes
- A persistent layout means anything created outside a `useGSAP` scope leaks into the next route.
- The Geist font swap and late-loading chunks shift trigger positions.
- Keep `cacheComponents` off. With it on, routes are hidden with `<Activity>` (`display:none`) instead of being unmounted.
  - GSAP inline styles persist on the hidden page.
  - Effects are cleaned up and re-run on return.
  - drei Views track 0×0 rects while hidden.
  - `dynamicParams` is unavailable.
- Set `stopInertiaOnNavigate: true` on Lenis.
- Assert in development that `ScrollTrigger.getAll().length` returns to its baseline after leaving a page.

```ts
useEffect(() => { const f = () => (pop.current = true); addEventListener('popstate', f); return () => removeEventListener('popstate', f) }, [])
useLayoutEffect(() => {
  if (!pop.current) lenis?.scrollTo(0, { immediate: true, force: true }); pop.current = false
  const id = requestAnimationFrame(() => ScrollTrigger.refresh()); return () => cancelAnimationFrame(id)
}, [pathname])
// also: document.fonts.ready.then(() => ScrollTrigger.refresh()), and a debounced ResizeObserver on <main>
```

### R9 — Medium: event plumbing
- `eventSource=document.body` means a raycast on every pointer move, across the whole page.
- Storing hover state in React state re-renders the HUD at up to 120 Hz.
- The HUD is DOM, so R3F pointer events are not needed at all.
  - If you keep them, `eventPrefix="client"` is required.

```ts
const pointer = { x: 0, y: 0 }
addEventListener('pointermove', e => { pointer.x = e.clientX / innerWidth * 2 - 1; pointer.y = 1 - e.clientY / innerHeight * 2 }, { passive: true })
useFrame((_, dt) => { head.rotation.y = damp(head.rotation.y, pointer.x * 0.35, 6, dt) })
```

React should subscribe only to discrete selectors: `hoveredDept`, `phase` and `tier`.

### R10 — Low-medium: static generation and prefetch
- Use `generateStaticParams` with `export const dynamicParams = false`. Unknown slugs then return 404, not an on-demand render.
- In Next 16, `await params` and type the page with `PageProps<'/departments/[slug]'>`.
- Prefetching is production-only, so development builds always exercise the hold state. That is useful for testing.
- Warm the workstation chunk with `import()` on hover and focus.

## 3) Changes I would make to the proposal

1. Replace `pin:true` with CSS sticky tracks that carry a server-rendered height. ScrollTrigger only measures progress, and nothing that loads late may change the document height.
2. Run one clock. The GSAP ticker drives `lenis.raf` and then R3F `advance()`, with `frameloop="never"`.
3. Put agent rigs in the persistent layout scene with an anchor registry.
   - Use `<View>` only for page-local scenes.
   - Use no R3F pointer events and no post-processing.
4. Rebuild the transition.
   - Use a five-phase state machine with a hold state.
   - Animate a tile clone to the viewport (FLIP), not a whole-HUD zoom.
   - Intercept the click with `<Link onNavigate>`.
   - Handle return and popstate with React `<ViewTransition>`.
   - Wrap `lenis.stop()` and `lenis.start()` in `try/finally`.
5. Exact-pin versions and stay on react 19.2.x.
   - Add an error boundary and a context-loss fallback to the SVG tier.
   - Run a Turbopack smoke test on day 0.
6. Keep `cacheComponents` off, set `dynamicParams=false`, and add `optimizePackageImports: ['@react-three/drei']`.
7. Decide mobile versus desktop layout in CSS media queries, so the server HTML is identical on every device. Do not branch in JavaScript after hydration. `gsap.matchMedia` then only adds triggers on wide, motion-allowed screens.
8. Configure Lenis for fine pointers only, with `autoRaf:false`, `stopInertiaOnNavigate:true` and `anchors:true`. Do not create a Lenis instance at all on touch devices.
9. Build accessibility in from the start: a stepper made of real buttons, focus-driven steps, DOM captions for every WebGL scene, a global Pause control, and focus moved to the `<h1>` on arrival.
10. Read the tier through `useSyncExternalStore`, pre-hide content through an inline motion flag with a fail-safe, and use deterministic HUD data.

## 4) Checklist the build must pass

- [ ] A production build on Turbopack shows the canvas created, zero console errors, and `React.version` logged. Re-run on every dependency bump.
- [ ] Scroll to the third story, enter a department, and press browser Back. The visitor returns to the same scroll position and step, with no HUD in a zoomed state. Repeat with CPU throttled 4x.
- [ ] With the network throttled to Slow 3G, clicking a tile never shows a frozen or blank frame. Hold is visible, Escape and Back cancel the transition, and a double click is ignored.
- [ ] Cmd-click and middle-click on a tile open the department in a new tab.
- [ ] After the first visit and return from a department, `ScrollTrigger.getAll().length` matches its initial count, and again after a second visit. There are no "removeChild" errors in StrictMode.
- [ ] On iOS Safari, scrolling through a story with the address bar collapsing causes no jump and no canvas flash. Low Power Mode is usable.
- [ ] The agent and its DOM frame never drift by more than 1px during fast wheel scrolling on desktop. Nothing scroll-tracked through the fixed canvas exists on touch devices.
- [ ] Using the keyboard only, tiles are reachable with a visible focus ring, the CEO agent reacts on focus, and Enter dives into the department.
  - Focus lands on the department `<h1>`.
  - The stepper buttons work, and Tab into a step scrolls to it.
  - Every story has a skip link.
- [ ] With VoiceOver or NVDA, every step's text is readable in order. The canvas is ignored, the network and scaling scenes have text equivalents, and the route change is announced.
- [ ] With `prefers-reduced-motion` on, there is no Lenis smoothing, no sticky choreography, static final states, and view transitions run at 0s. Toggling the setting live rebuilds or reverts cleanly. A Pause control exists.
- [ ] With JavaScript disabled, or with the GSAP chunk blocked, all copy is visible because the fail-safe removes the pre-hide. View-source contains every headline and recommendation string.
- [ ] No hydration warnings appear, including with a non-US locale and timezone.
- [ ] Layout shift is near zero on `/` and `/departments/*`. The 3D chunk is absent from the first-load JavaScript, and the SVG agent paints first.
- [ ] `/departments/unknown` returns 404, and all seven slugs are listed as static in the build output.
- [ ] A forced `webglcontextlost` event drops the page to the SVG tier without a reload.

Sources:
- [PortOS #7370 — R3F's <19.3 peer cap and the scheduler 0.27/0.28 split](https://github.com/atomantic/PortOS/issues/7370)
- [R3F v9 reconciler upgrade PR #3224](https://github.com/pmndrs/react-three-fiber/pull/3224)
- [R3F releases](https://github.com/pmndrs/react-three-fiber/releases)
- [Next.js + R3F reproduction repo (bundled-reconciler note)](https://github.com/chrisweb/nextjs_three-fiber_reproduction)
- [Lenis #319 — page starts part-scrolled after App Router navigation](https://github.com/darkroomengineering/lenis/issues/319)
- [Lenis discussion #244 — Next.js Link and Lenis not starting at the top](https://github.com/darkroomengineering/lenis/discussions/244)
- [GSAP forum — ScrollTrigger and Next.js scroll position after route change](https://gsap.com/community/forums/topic/28592-scrolltrigger-and-nextjs-scroll-position-after-route-change/)
- [GSAP forum — ScrollTrigger not updating on route change with a pinned trigger below](https://gsap.com/community/forums/topic/42182-scrolltrigger-not-updating-on-nextjs-route-change-when-there-is-a-second-scrolltrigger-that-is-pinned-below-it/)
- [Next.js smooth scrolling with Lenis and GSAP — single RAF loop, autoRaf:false](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap)
- [drei View docs — eventSource and View.Port](http://drei.docs.pmnd.rs/portals/view)
- Local: Next 16.3.5 bundled docs under `/Users/joelhaymour/Projects/one-spot/node_modules/next/dist/docs/01-app/` — `02-guides/view-transitions.md`, `02-guides/preserving-ui-state.md`, `02-guides/lazy-loading.md`, `02-guides/preventing-flash-before-hydration.md`, `03-api-reference/02-components/link.md`, `03-api-reference/04-functions/use-router.md`, `03-api-reference/03-file-conventions/02-route-segment-config/dynamicParams.md`