---
target: One Spot homepage
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
target_identity: "file:/Users/joelhaymour/Projects/one-spot/src/app/page.tsx"
target_fingerprint: "sha256:6c44ee8faf0f8af9ffe41654ec75f7ab5c7064ef00830823382c1b366d656f99"
target_path: /Users/joelhaymour/Projects/one-spot/src/app/page.tsx
timestamp: 2026-10-18T04-29-28Z
slug: src-app-page-tsx
---
Method: dual-agent (A: design review · B: detector + browser)

Score 22/32 (heuristics 7 and 10 n/a, Persuade landing page). Acceptable.
H1 3 status ok, 2px autoplay timer easy to miss. H2 3 jargon leaks (workflows, train your agents, CRM). H3 2 intro replays unskippable, 3-screen Tools scrub, no autoplay pause. H4 3 three toggles three semantics, "One job" twice. H5 3 calculator no credibility cap. H6 3 HVAC tab clipped on phone. H8 2 calculator ~12 parts, blue ~8x in hero, identical section openers. H9 3 amber error text slightly under AA.

Specificity: partly authored (Tools ring scene, Examples narratives, palette + mark); template skeleton (eyebrow + blue-dot + two-line couplet with blue second line + grey lead + fade-up, text-left/card-right x3), generic H1.
Detector: source scan 0; URL scan desktop 11 / mobile 9: low-contrast x4 (ink-3 #7f848c ~3.1-3.7:1, ink-4 #b2b4b8 ~2:1; calculator footnote, hero reassurance, toggle, stat labels, Tools counter, footer), tiny-text (calc labels 11.5px, hero eyebrow 10.2px on phone), hero-eyebrow-chip; false/deliberate: overused-font Inter, cream-palette, nested-cards (Tools illustration).

Priority issues:
[P1] Hero calculator overloaded and circular (visitor guesses hours saved; chart always same ramp; 3 closing lines). Fix: distill to inputs + one number + one line; ask known quantities with stated conservative share; CTA prefilling contact. /impeccable distill
[P1] Blue spot spent everywhere (Split accent line, eyebrow dots, sliders, chart, glows). Fix: reserve spot for mark, One Spot/after states, one hero focal; ink accent lines; drop eyebrow dots/labels and glows. /impeccable quieter
[P1] No human/real proof at contact. Fix: "Who you'll talk to" block (photo, name, city, email). /impeccable shape
[P2] Contrast + Examples autoplay too fast (4.8s/5.6s vs ~15s read), aria-live re-announcing, before stats shrink. Fix: ink-3 -> ~#686d75, no ink-4 text, slower/first-view autoplay + pause, equal-size before/after. /impeccable harden
[P2] Structural monotony; Examples as full-width side-by-side; vary headlines; remove duplicate "One job". /impeccable layout

Personas: Jordan (jargon, unknowable slider, software vs people), Casey (no phone CTA, form at ~80% depth after 3,052px scrub, clipped HVAC tab, 8 chip rows), Riley (calculator $11.7M, intro replays, tab click kills autoplay silently).
Minor: 500ms toggles, 1000-1100ms reveals, 700ms/90ms story rows, no :active on tabs; Tools skeleton bars; muddy faded Mark arcs behind form; double focus ring; contact headline break; mobile menu 01-04 numbering; generic "You get:" chips.
