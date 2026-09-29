# Everyday — an alternative One Spot direction

Branch: `codex/one-spot-everyday`. This branch is for review; it does not replace production.

A shorter consulting site that explains three concrete offers: website design, connected business tools, and practical assistants. A warm, graphic visual system replaces the earlier long scroll presentation. Original CSS illustrations require no external image services.

The page runs through a short opening, three service cards, one switchable example, three working steps, four questions, and the contact form. Examples are fictional and explicitly labeled; they do not imply measured client results. Motion consists of brief entrance transitions, scroll reveals, and a user-triggered three-step replay. Reduced-motion preferences are respected.

- `src/components/everyday/Everyday.tsx`: new homepage and interactive examples
- `src/content/everyday.ts`: services, example stories, and FAQ
- `src/app/everyday.css`: responsive visual system
- The existing contact form and `/api/contact` delivery code are reused unchanged.
- Existing production credentials are not copied into the preview. Preview delivery requires its own Vercel environment configuration; production-only Resend credentials do not automatically apply to previews.
- Earlier components remain in the repository for reference and recovery, but are not mounted by the new homepage.

Local preview: `npm run dev -- --port 3101`.
