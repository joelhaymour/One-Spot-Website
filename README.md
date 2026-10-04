# One Spot

One Spot is the website and interactive product story for an AI/automation consulting company built for small and mid-sized businesses.

The goal was to explain a technically complex service to non-technical business owners without leading with AI jargon. Instead of presenting a traditional SaaS dashboard, the site uses motion, storytelling, and real business scenarios to show how disconnected work can be organized into one operating system.

## Highlights

- High-end, scroll-driven landing experience
- Interactive business workflow demonstrations
- GSAP + ScrollTrigger motion system
- Smooth scrolling with Lenis
- Responsive layouts and mobile-specific interaction behavior
- Content architecture designed for non-technical buyers
- Static Next.js architecture for fast deployment

## Product thinking

The site is built around a simple idea:

> Show what the system does for a business before explaining the technology behind it.

Visitors see operational problems, handoffs, automated work, approvals, and owner-level decisions through a fictional service business rather than abstract AI diagrams.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- GSAP
- ScrollTrigger
- Lenis
- Next.js font optimization

## Main experience

The page is short and leans on animation:

1. **Hero**: "Modern workflows. Made simple." and one ordinary job in four businesses (body shop, dental and medical, financing, HVAC), shown today and with One Spot
2. **How we work**: business first, technology second (listen, map, plan, build, stay)
3. **Your tools**: one job takes too many clicks across seven apps, until One Spot connects them (scroll-scrubbed)
4. **FAQ**
5. **Contact**: "Tell us where it feels manual"

## Project structure

```
src/
├── app/
├── components/
│   ├── hero/
│   ├── motion/
│   └── sections/
└── content/
    └── site.ts
```

Most copy and scenario data is separated from presentation code so the site can be iterated quickly without rewriting components.

## Run locally

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```

---

Built by [Joel Haymour](https://github.com/joelhaymour).
