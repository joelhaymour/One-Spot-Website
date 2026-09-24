# One Spot

The website for One Spot, an agentic consulting company for small and mid-sized businesses. We get to know
how a company really works, then connect the tools it already uses, organize how information moves between
departments, take repetitive work off the team, and give the owner one clear view of the business.

The site is written for owners who are not technical. It shows a real business working with One Spot
(Harbor Home Services, a fictional plumbing and heating company owned by Dana) rather than explaining
technology. It should read like a trusted consultancy, not a software product.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
npm run build
```

## Stack

Next.js 16 (App Router, static) · React 19.2 · TypeScript · Tailwind 4 · GSAP + ScrollTrigger · Lenis (fine
pointers only). Type is Instrument Serif (display) and Geist (text), both through `next/font`.

## The page, in order

| Section | Component | What it does |
|---|---|---|
| Hero | `sections/Hero.tsx` | A busy owner's desk. Ten loose pieces of work float around the pitch; scrolling sorts them into three lanes (handled, sent to the right person, waiting on your OK) |
| 01 Sound familiar? | `sections/Problem.tsx` | The handoff problem, lit word by word as you scroll, and four things owners say |
| 02 What we do | `sections/WhatWeDo.tsx`, `scenes/*` | Connect, organize, automate, see clearly. A sticky stage plays one small illustration per step |
| 03 How we work | `sections/Process.tsx` | Listen, map, plan, build, stay. A rail draws down the steps as you scroll |
| 04 Examples | `sections/Examples.tsx` | One ordinary moment in four kinds of business, before and after |
| 05 Agents | `sections/Agents.tsx`, `AgentDemo.tsx` | "A team member who's great at one job", with a decision the visitor makes as the owner |
| 06 Working with us | `sections/Principles.tsx`, `Industries.tsx` | Five promises, and who we work with (a scroll-linked band) |
| 07 FAQ | `sections/Faq.tsx` | The questions owners actually ask |
| 08 Contact | `sections/Contact.tsx`, `ContactForm.tsx` | "Let's talk about your business. Not about AI." |

## Where things live

| Path | What lives there |
|---|---|
| `src/content/site.ts` | Every word on the page, plus the numbers inside the illustrations |
| `src/content/stories.ts` | The four before and after stories in Examples |
| `src/app/globals.css` | Design tokens (paper, ink, the blue spot, done / routed / needs-you colors), type classes, the hero track and the reveal system |
| `src/components/motion/` | `SmoothScroll` (Lenis on the GSAP ticker), `Reveals` (one observer for every scroll reveal), `Split` (word-by-word headlines), `ScrollFill` |
| `src/components/chrome/` | The opening logo sequence, nav, footer |
| `src/app/api/contact/route.ts` | The enquiry endpoint (same-origin only, rate limited, honeypot) |

## Rules that keep it calm and correct

- **Progressive motion.** Copy is real text in the server HTML. A boot script in `layout.tsx` sets
  `html[data-motion="on"]` only when JS runs and the visitor allows motion; only then do reveals start hidden.
  Without it (reduced motion, no JS) every section renders in its final state, including the sorted board.
- **No GSAP pins.** Scroll scenes are CSS-sticky tracks. The hero chips are FLIP-style: the sorted board is
  the natural layout, and scroll transforms each chip from a loose spot back to its own slot.
- **Scroll picks, time plays.** In What we do, scroll selects the step; each illustration then runs on its
  own timeline, and replays when it becomes active again.
- **Nothing auto-plays forever.** The industries band moves only with the scroll; the hero chips drift for a
  few cycles and stop.
- **Illustrations are decoration.** They are `aria-hidden`; the step text beside them carries the meaning.

## Environment

See `.env.example`. The contact form needs either `RESEND_API_KEY` + `CONTACT_TO_EMAIL`, or
`CONTACT_WEBHOOK_URL`. Without either it logs in development and returns 503 in production, so an enquiry is
never silently dropped. Set `NEXT_PUBLIC_SITE_URL` for sitemap, robots and Open Graph URLs, and optionally
`NEXT_PUBLIC_CONTACT_EMAIL` to show an address in the footer.

## History

`docs/` holds the decision record for v1 to v5, when the site was an interactive product film for a "custom
business operating system" (three.js agents, the Hub, department consoles). v6 replaced that direction with
the consulting positioning above; the earlier code is on `main` before v6 and in git history.
