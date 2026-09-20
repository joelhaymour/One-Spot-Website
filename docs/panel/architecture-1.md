# One Spot — rendering and performance red-team of the proposed architecture

I checked versions against npm and the installed `/Users/joelhaymour/Projects/one-spot/node_modules`. I also read Next's bundled docs under `node_modules/next/dist/docs` and the drei and fiber source. No project files were created or modified.

## 1) Verified versions and peer compatibility (npm, 2026-09-20)

| Package | npm latest | In repo | Peer and compatibility notes |
|---|---|---|---|
| next | 16.3.5 | 16.3.5 | Peers `react ^18.2 \|\| ^19`. The App Router vendors its own React, `19.3.0-canary-cbb046ab-20260731` (read from `next/dist/compiled/react`). Turbopack is the default bundler. |
| react / react-dom | 19.3.0 (released 2026-09-09) | 19.2.8, pinned | The pin is needed at install time because fiber caps React at `<19.3`. It has no effect at runtime, where client components run on Next's vendored 19.3 canary. |
| three | 0.186.0 (2026-09-08) | 0.186.0 | The installed package ships no minified build. Source is 1.46 MB (core) plus 0.66 MB (module), about 415 KB gzipped unminified. My estimate for minified and gzipped is 180–200 KB. |
| @react-three/fiber | 9.7.0 (v10 is alpha.5 only) | 9.7.0 | Peers `react >=19 <19.3`, `three >=0.156`. It bundles its own reconciler at 19.2.0 (react-reconciler 0.33) and depends on `scheduler ^0.27`. It calls `extend(THREE)` on the whole namespace, so three is never tree-shaken. |
| @react-three/drei | 10.7.8 (v11 is alpha only) | 10.7.8 | Peers `react ^19`, `three >=0.159`, `fiber ^9`. Hard dependencies include hls.js, mediapipe, troika, three-mesh-bvh and detect-gpu. It declares `sideEffects: false`, but confirm the output with `npx next experimental-analyze`. |
| gsap | 3.15.0 | 3.15.0 | No peers. Flip and SplitText are free. About 28 KB gzipped, plus 18 KB for ScrollTrigger. |
| @gsap/react | 2.1.2 | 2.1.2 | Peers `gsap ^3.12.5`, `react >=17`. |
| lenis | 1.3.26 | 1.3.26 | Peer `react >=17`. About 5 KB gzipped. Issue #103, "MacOS Safari position:fixed jitter", is still open. |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | 4.3.3 | No React peers. |
| zustand | 5.0.15 | 5.0.15 | fiber (`^5.0.3`) and drei (`^5.0.1`) dedupe to this copy. tunnel-rat nests a separate zustand 4.x, which is negligible. |

Three compatibility facts that affect the build:

- **Version mismatch.** R3F 9.7.0's React 19.2 reconciler runs against Next's vendored React 19.3 canary.
  - fiber issue #3915 and PR #3916 are both open. Under React 19.3, calling `useTransition()` inside the R3F tree while updating DOM-tree state throws `Cannot read properties of undefined (reading 'length')`.
  - Next's vendored `react-dom-client` contains the same unguarded code (`newEventTime = transition.types; if (null !== newEventTime)`), so the bug applies here regardless of the 19.2.8 pin.
- **Deprecation warning.** three r183 and later deprecates `THREE.Clock`. fiber 9.7 still constructs one, so every Canvas mount logs a console warning. This is cosmetic.
- **Preload is broken.** drei's `<Preload>` does nothing on three r184 and later (drei #2722). Use `gl.compileAsync` instead.

## 2) Risks, ranked

### R1 — Critical: reconciler mismatch can take down the 3D site-wide

Any `useTransition()` inside the Canvas tree that touches DOM-tree state throws into an error boundary. The likely trigger is calling `router.push` from a 3D click handler or from the transition store.

**Mitigation:**
- Ban `useTransition` under `src/gl/**`.
- Start all navigation from DOM code, using `startTransition` imported from `react`.
- Wrap the Canvas in an error boundary that drops to the SVG tier.
- Pin exact versions for next, react, fiber, drei and three, with no carets.
- Do not move to React 19.3 until fiber PR #3916 ships.

```js
// eslint.config.mjs
{ files: ['src/gl/**'], rules: { 'no-restricted-imports': ['error', { paths: [
  { name: 'react', importNames: ['useTransition'], message: 'r3f #3915: crashes on Next-vendored React 19.3' }] }] } }
```

### R2 — Critical: drei `<View>` on the DOM side pulls three into the initial bundle

`drei/web/View.js` imports `three`, `@react-three/fiber` and tunnel-rat at module scope. Any page that statically imports `View` therefore loads about 250 KB gzipped (three, fiber with its reconciler, and drei) into the hero's critical path, and the "lazy 3D chunk" stops being lazy.

**Mitigation:**
- Make the DOM side a plain `<div>` that registers itself in a zustand slot registry.
- Create `<View track>` only inside the lazy chunk.
- Decide the quality tier before importing, so SVG-tier users never download three.

```tsx
// dom (no three imports)
export function AgentSlot({ id }: { id: AgentId }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => slots.getState().register(id, ref.current!), [id]) // returns unregister
  return <div ref={ref} data-gl="pending"><AgentSvg id={id} /></div>
}
// src/gl/Scene.tsx, the ONLY module that imports three/fiber/drei
{entries.map(([id, el]) => <View key={id} track={{ current: el }}><Agent id={id} /></View>)}
// layout client island
const Scene = dynamic(() => import('@/gl/Scene'), { ssr: false }) // render only when tier !== 'svg' and the hero timeline is complete
```

### R3 — High: tracked Views drift against the DOM

drei's View calls `getBoundingClientRect()` once per view per frame, inside R3F's own requestAnimationFrame loop. The order of that loop relative to GSAP's ticker is undefined, so the 3D can lag the DOM by one frame whenever the HUD scales or scrolls. Wherever scroll is handled off the main thread, the lag is two to three frames and the agents visibly swim. That covers:
- touch devices, because Lenis leaves touch scrolling native by default;
- any session where Lenis is disabled;
- Safari Low Power Mode, which caps requestAnimationFrame at 30 fps. The Lenis maintainer's advice in issue #103 is to turn Lenis off in that mode.

Lenis also prevents default on wheel events, so scrolling runs on the main thread and every long task shows up as scroll stutter.

**Mitigation:**
- Run everything from one clock: Lenis first, then GSAP tweens, then the R3F frame.
- Never give a WebGL agent a tight DOM frame or border. It should float on near-black so a one-frame lag is invisible.
- WebGL content should be either pinned or faded while it moves.
- On mobile, use no tracked Views.
- Probe requestAnimationFrame cadence at boot. If it is above about 25 ms, disable Lenis and lower the tier.

```ts
gsap.ticker.lagSmoothing(0)
gsap.ticker.add(t => lenis.raf(t * 1000), false, true)      // prioritized: runs before tweens
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((t, _d, f) => {                              // runs after all DOM writes
  if (!gl.anyViewVisible || document.hidden) return
  if (gl.halfRate && (f & 1)) return
  advance(t * 1000)                                          // <Canvas frameloop="never">
})
```

### R4 — High: the "zoom the HUD until the tile fills the viewport, then `router.push`" transition

This has three problems:
- **Raster size.** A tile about 200 px wide in a 1512 px viewport needs roughly 7.5× scale. At DPR 2 that is a layer about 22,000 px wide, above the 16,384 px maximum texture size. The browser then either re-rasterizes every frame, which janks, or upscales a cached layer, which blurs the text.
- **Dead time.** After the zoom finishes there is a frozen wait for the route to load.
- **Contention.** The new route's commit and hydration happen on the same main thread as the tween.

**Mitigation:**
- Put a persistent cover in the layout that expands FLIP-style from the tile's rectangle, using transform only.
- Let the stage scale to at most about 1.6× while it fades out.
- Call `router.prefetch` on `pointerenter`.
- Commit the route only once the cover is fully opaque, so any jank is hidden.
- Reveal the department page when it signals it is ready.
- Set `visible={false}` on every View except the target one at the start of the transition.

```ts
async function enterDepartment(slug: string, tile: HTMLElement) {
  router.prefetch(`/departments/${slug}`)
  cover.placeAt(tile.getBoundingClientRect()); gl.only(slug)
  await gsap.timeline()
    .to(stage, { scale: 1.6, autoAlpha: 0, duration: .9, ease: 'power3.inOut' }, 0)
    .to(cover.el, { x: 0, y: 0, scaleX: cover.sx, scaleY: cover.sy, duration: .9, ease: 'power3.inOut' }, 0)
  startTransition(() => router.push(`/departments/${slug}`))   // page swap hidden by the cover
}
// department page: useLayoutEffect(() => { document.fonts.ready.then(transition.arrived) }, [])
```

Next 16.3 also offers native `<ViewTransition>` and `router.push(href, { transitionTypes })`, which run on the compositor. If you try it, treat it as progressive enhancement only: the fixed canvas is captured as a static snapshot during the transition, and Safari behaves differently.

### R5 — High: pixel budget and 120 Hz displays

- A full-viewport alpha canvas on a 14″ MacBook Pro is 1512×982 CSS pixels, which at DPR 2 is 5.9 MP. 4× MSAA colour and depth buffers at that size are on the order of 200 MB.
- On a Studio Display the canvas is 14.7 MP, and about 20 MP on a Pro Display XDR. Safari also composites the full alpha layer on every present.
- Chrome on ProMotion displays runs requestAnimationFrame at 120 Hz, so the real frame budget is 8.3 ms. Safari defaults to 60 Hz.

**Mitigation:**
- Set DPR from a fixed pixel budget.
- Debounce resize handling.
- Drop the GL to every other frame when it costs more than about 6 ms on displays above 90 Hz.
- Never change DPR in the middle of a transition.
- Set `visibility: hidden` on the canvas whenever no View is active, for example during the typographic, "How I Work" and Before/After scenes.

```tsx
const BUDGET = 8e6
const dpr = Math.max(1, Math.min(devicePixelRatio, 2, Math.sqrt(BUDGET / (innerWidth * innerHeight))))
<Canvas frameloop="never" flat dpr={dpr}
  gl={{ antialias: tier === 'desktop', alpha: true, stencil: false, powerPreference: 'high-performance' }}
  resize={{ scroll: false, debounce: { scroll: 0, resize: 150 } }} />
```

### R6 — High: what View actually does

- `preserveDrawingBuffer` is false, so the shared buffer clears on every present. Every visible View must therefore re-render on every frame that any View renders. You cannot freeze or cache a single tile.
- CEO plus seven department tiles means eight `gl.render` passes and eight layout reads per frame.
- Any material that renders to an FBO, such as MeshTransmissionMaterial, adds its cost once per view.
- Post-processing cannot be scissored per view.

**Mitigation:**
- Allow at most two or three live Views: the CEO plus the focused department.
- Tile agents become SVG glyphs, since a 3D agent in a 200 px tile is not readable anyway.
- Bring the WebGL department agent in on hover intent of around 150 ms, or only on its department page.
- Copy View's roughly 150 lines into the repo so you control it. That lets you batch the rect reads, cache them when nothing is dirty, and guarantee that all DOM writes happen after the reads.

### R7 — Medium-High: pins, Lenis state and navigation

- ScrollTrigger pins use `position: fixed`. Any ancestor carrying `transform`, `filter`, `will-change` or `contain: paint` breaks them, and a residual transform from the arrival animation would do exactly that.
- Lenis keeps its own scroll target across `router.push`, so it can carry the old position into the new page.
- If `cacheComponents` is switched on later, routes are hidden with `<Activity>` (`display: none`) instead of unmounting. Test back and forward navigation in that mode.

```ts
useGSAP(() => {
  if (phase !== 'arrived') return
  gsap.set(page.current, { clearProps: 'transform,filter,willChange' })
  lenis.scrollTo(0, { immediate: true, force: true }); ScrollTrigger.clearScrollMemory()
  buildStory(); ScrollTrigger.refresh()                     // create pins only at this point
}, { dependencies: [phase], scope: page })
```

### R8 — Medium: context loss kills 3D on every route

Safari under memory pressure and iOS in general will drop WebGL contexts, and the single persistent canvas means one loss affects the whole site.

```ts
onCreated={({ gl }) => {
  const c = gl.domElement
  c.addEventListener('webglcontextlost', e => { e.preventDefault(); q.setState({ gl: 'lost' }) })   // SVG tier takes over
  c.addEventListener('webglcontextrestored', () => q.setState(s => ({ gl: 'ok', epoch: s.epoch + 1 }))) // key={epoch} rebuilds PMREM and render targets
}}
```

Before importing the chunk, probe a throwaway canvas with `getContext('webgl2', { failIfMajorPerformanceCaveat: true })`, then release it with `WEBGL_lose_context`.

### R9 — Medium: compile and PMREM hitches, and drei's Environment weight

- The first render of each material compiles its shader synchronously.
- Using drei's `<Environment>` in each View generates a PMREM per view. It also bundles RGBELoader, EXRLoader and gainmap-js, even when the environment is procedural.
- Navigating between routes disposes and recompiles everything.

**Mitigation:** build one shared environment texture, compile asynchronously before the SVG-to-GL crossfade, and cache assets at module level.

```ts
const pmrem = new PMREMGenerator(gl); const env = pmrem.fromScene(buildSoftboxRig(), 0.03).texture; pmrem.dispose()
await gl.compileAsync(agentScene, camera); slotEl.dataset.gl = 'ready'   // CSS crossfades SVG to GL
<primitive object={agentCache.get(id)} dispose={null} />                  // same instance in the HUD and on the department page
```

Keep to three or fewer material variants across all agents.

### R10 — Medium: Core Web Vitals on a live DOM hero

- The canvas is never the LCP element. LCP will be the H1, or a late-fading panel if one is larger than the H1.
- An element at `opacity: 0` on first paint drops out of LCP candidacy, so the H1 must not start hidden.
- `gsap.from` on server-rendered HTML flashes the final state before animating.
- Calling `new Date()` inside the HUD render causes a hydration mismatch.
- Hover state that goes through React re-renders hurts INP.

```html
<script>document.documentElement.classList.add('anim')</script>
<style>.anim [data-boot]{opacity:0}</style> <!-- never apply this to the H1 -->
```

```ts
useFrame(() => { const t = useHud.getState().gazeTarget /* slerp toward it; no React render */ })
```

- Use `tabular-nums` and fixed-`ch` widths for ticking numbers, and update them by writing `textContent` through refs.
- Keep ambient loops as CSS animations on transform and opacity, paused with `animation-play-state` when off-screen.
- Start the three import only after the hero entrance timeline completes, so evaluating it (about 60–120 ms on M-series, my estimate) never lands inside the boot animation.
- Use fixed fictional dates in the HUD.

### R11 — Medium: glow, glass, banding and colour

- The default ACES tone mapping shifts accent colours away from the CSS tokens. Use `flat` plus `toneMapped={false}`.
- Near-black gradients band in both CSS and GL. Set `dithering` on materials, add a blue-noise term to glow shaders, and lay a 2–3% tiled noise PNG over the DOM.
- A `backdrop-filter` anywhere over a live canvas re-blurs on every frame, which is very slow in Safari. Fake the glass instead with a gradient fill, a 1 px highlight and noise. Do not animate SVG `feGaussianBlur`, `filter: blur` or `box-shadow`.
- For glow without post-processing, use baked radial sprites or a fresnel term. The blend below adds light over the DOM behind a premultiplied canvas. I have not tested it in Safari, so verify it there.

```ts
{ blending: CustomBlending, blendSrc: OneFactor, blendDst: OneFactor,
  blendSrcAlpha: ZeroFactor, blendDstAlpha: OneFactor, depthWrite: false, toneMapped: false }
```

### R12 — Medium-Low: video

- Safari decodes AV1 only in hardware, which means M3 or later. Ship HEVC (`hvc1`) plus AV1 or VP9, with H.264 as the fallback.
- Play one clip at a time, and never scrub `currentTime`.
- Release the decoder when the clip is far off-screen: `v.pause(); v.removeAttribute('src'); v.load()`.
- Use `preload="none"` and an IntersectionObserver with `rootMargin: '100% 0px'`.
- Dark 8-bit footage bands and blocks, so add grain before encoding and raise the bitrate.
- Black levels differ between browsers, so always feather the clip's edges into `--bg-0` with a CSS vignette.
- Keep posters below the fold, because a poster image is an LCP candidate.
- Aim for 2.5 MB or less per clip, with no audio track.

### R13 — Low

- Do not use drei's `useDetectGPU`. It fetches benchmark JSON from a CDN at runtime.
- Drop `eventSource`. With `pointer-events: none` on the canvas and hover handled in the DOM, R3F raycasting never runs.

## 3) Changes I would make to the proposal

1. Keep react pinned at 19.2.8 with exact versions, and add the `useTransition` lint ban and an error boundary around the Canvas (R1).
2. Replace DOM-side drei `<View>` with `AgentSlot` plus a slot registry, and vendor View into `src/gl` (R2, R6).
3. Use one clock: `frameloop="never"`, a prioritized `lenis.raf`, and `advance()` called from the GSAP ticker. Remove `eventSource` (R3, R13).
4. Allow at most two or three concurrent WebGL agents. HUD tiles become SVG glyphs, and the agent model instance is shared between the HUD and the department page (R6, R9).
5. Use a cover-based FLIP transition with the stage scaled to 1.6× or less, prefetch on hover, commit the route behind the opaque cover, and wait for an arrival handshake (R4).
6. Do not use drei's `<Environment>` or `<Preload>`. Use one shared procedural PMREM and `compileAsync` (R9).
7. Set `flat`, a DPR budget of 8 MP, debounced resize, half-rate GL on high-refresh displays, and hide the canvas when it is idle (R5).
8. Do not use `backdrop-filter`. Add dithering everywhere (R11).
9. On mobile, use SVG agents and CSS animation with optional poster video. At most one sticky in-flow canvas for the network scene on the high tier, and never a fixed tracked canvas.
10. Leave `cacheComponents` off for now. Create pins only after `clearProps` has run (R7).
11. For the network and scaling scenes, use instanced points and ribbon lines, because native GL lines are limited to 1 px on Mac. Animate pulses in the shader through `uTime`. Keep labels as DOM elements moved by transform through refs, with no troika text. Hold overdraw to at most twice full-screen.

## 4) Build checklist

- [ ] `npx next experimental-analyze` shows that no chunk on `/` or `/departments/*` before interaction contains three, fiber or drei. The 3D chunk is requested only after the hero timeline completes and only on a GL tier.
- [ ] `grep -r useTransition src/gl` returns nothing. A forced throw inside the Canvas results in SVG agents and leaves the page fully usable.
- [ ] Lab LCP is 1.8 s or less on Fast 4G with 4× CPU throttling, and the LCP element is the H1. CLS is 0.02 or less. INP for tile hover and click is under 100 ms. No hydration warnings.
- [ ] Chrome at 120 Hz and Safari at 60 Hz on a 14″ M-series, and on an external 5K display:
  - the HUD idles with no long frames;
  - the zoom transition drops no more than two frames;
  - the network scene's GPU frame time is 6 ms or less.
- [ ] Safari Low Power Mode and a 30 fps requestAnimationFrame cap: Lenis switches itself off, no pin jitter, and agents do not swim.
- [ ] DOM and GL stay aligned to within one pixel during scrubbed moves. The Performance panel shows no forced-reflow warnings from `src/gl`.
- [ ] When no View is visible, there are zero `advance()` calls and the canvas is hidden. The same holds when the tab is hidden.
- [ ] Simulated `WEBGL_lose_context` on both the home page and a department page: the SVG tier appears, and restoring the context brings the 3D back without a reload.
- [ ] First reveal of each agent produces no frame over 50 ms, which confirms `compileAsync` is working. Going home, to a department, and back home compiles no new programs (`renderer.info.programs`).
- [ ] No `backdrop-filter`, animated `filter`, animated `box-shadow` or SVG filter animation anywhere. No visible banding on `--bg-0..4` gradients or on the glow.
- [ ] Accent colours sampled from the GL match the CSS tokens to within ±2 per channel.
- [ ] At most one `<video>` decoding at a time, `preload="none"`, poster below the fold, each clip 2.5 MB or less.
- [ ] Back and forward navigation and deep-linking to `/departments/[slug]` give the correct scroll position, no orphaned ScrollTriggers (`ScrollTrigger.getAll().length` is what the page expects), and working pins.
- [ ] Reduced-motion, save-data and no-WebGL users make zero requests for the 3D chunk and see static step states.

Sources:
- [r3f #3915 React 19.3 useTransition crash](https://github.com/pmndrs/react-three-fiber/issues/3915)
- [r3f PR #3916](https://github.com/pmndrs/react-three-fiber/pull/3916)
- [PortOS #7370 (fiber <19.3 cap)](https://github.com/atomantic/PortOS/issues/7370)
- [drei #2722 Preload no effect r184+](https://github.com/pmndrs/drei/issues/2722)
- [drei #944 View assumes fullscreen canvas](https://github.com/pmndrs/drei/issues/944)
- [drei View docs](http://drei.docs.pmnd.rs/portals/view)
- [Lenis #103 Safari position:fixed jitter](https://github.com/darkroomengineering/lenis/issues/103)
- [GSAP forum: pin jitter on Safari](https://gsap.com/community/forums/topic/35157-scrolltrigger-pinning-causes-jitter-when-using-touch-on-safari/)
- [three.js #5979 scissor + EffectComposer](https://github.com/mrdoob/three.js/issues/5979)

Local files read:
- `/Users/joelhaymour/Projects/one-spot/node_modules/next/dist/docs/01-app/02-guides/{view-transitions,lazy-loading,preserving-ui-state,package-bundling}.md`
- `/Users/joelhaymour/Projects/one-spot/node_modules/@react-three/drei/web/View.js`
- `/Users/joelhaymour/Projects/one-spot/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js`