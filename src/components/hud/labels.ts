/**
 * The labels the Hub wears. Visitor-facing, in the copy-deck voice (see content/copy.ts: the visitor sees
 * "the Hub", never "HUD"; the three right-rail panels are the three questions the owner asks).
 * None of these strings exist in copy.ts yet, so they live here until the integrator hoists them.
 * A plain module (no "use client") so the phone repeat, a server component, can share it.
 */
export const HUB_LABELS = {
  /** Bar, left: what the display is. */
  name: "One Spot Hub",
  /** Bar, right: the workforce, counted. */
  workforce: (agents: number) => `Digital workforce · ${agents} agents`,
  /** Left rail: the calls, reviews, approvals and signatures only the owner can make. */
  waiting: "Waiting on you",
  approvals: (n: number) => `${n} open`,
  /** Right rail, the three questions, top to bottom. */
  decision: "Needs a decision",
  attention: "Needs attention",
  happening: "Happening now",
} as const;
