/**
 * The labels the Hub wears. Visitor-facing, in the copy-deck voice (see content/copy.ts: the visitor sees
 * "the Hub", never "HUD"). The two tab names and the two words the display says live in copy.ts (BUSINESS);
 * the panel labels live here until the integrator hoists them.
 * A plain module (no "use client") so the phone repeat, a server component, can share it.
 */
export const HUB_LABELS = {
  /** Bar, left: what the display is. */
  name: "One Spot Hub",
  /** Bar, right: who is watching. */
  observing: (agent: string) => `${agent} observing`,
  /** Dashboard: the workforce, counted, and the doors. */
  workforce: (agents: number) => `Digital workforce · ${agents} agents`,
  departments: "Departments",
  select: "Select one to step inside",
  dock: "Open dock",
  /** To Do: the calls, reviews, approvals and signatures only the owner can make. */
  waiting: "Waiting on you",
  approvals: (n: number) => `${n} open`,
  doneBy: "Done. Filed by the agent",
  /** To Do: the calendar column and its two lists. */
  calendar: "Calendar and deadlines",
  today: "Today",
  deadlines: "Deadlines",
  /** To Do: what needs attention, under the waiting list (the phone repeat shares it). */
  attention: "Needs attention",
  /** To Do: what the CEO Agent recommends, and the three answers a recommendation takes. */
  recommendations: "Recommendations",
  decisions: ["Approve", "Review", "Not now"],
} as const;
