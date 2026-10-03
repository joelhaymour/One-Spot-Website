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

The page follows the same journey every client takes in the One Spot HUD, told with animation rather than explanation:

1. **Hero**: the promise, and one company file filling in step by step
2. **How we work**: six steps, each with its own animation (look, listen, map, find, show, build)
3. **Examples**: one moment in six businesses, before and after
4. **Websites**: an online store before and after, and a cart that sells
5. **Working with us**: what stays in the owner's hands
6. **FAQ**
7. **Contact**: "Tell us where it feels manual"

## Project structure

```
src/
├── app/
├── components/
│   ├── hero/
│   ├── motion/
│   ├── scenes/
│   ├── sections/
│   └── websites/
└── content/
    ├── site.ts
    └── stories.ts
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
