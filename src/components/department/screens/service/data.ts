/**
 * The Service console's working data. One day at a generic services company: 66 requests across four
 * channels, 61 resolved by the agent, 5 handed to a person, one root cause behind 23 of the week's tickets.
 * Numbers agree with the story in content/departments.ts and with the Customer Service tile on The Business.
 */

export type Channel = "Email" | "Chat" | "Form" | "Call";

export interface ServiceRequest {
  id: string;
  channel: Channel;
  customer: string;
  subject: string;
  received: string;
  /** How long the agent took to resolve it. Absent: this one is not the agent's to close. */
  resolvedIn?: string;
  /** Caused by the unclear confirmation email. */
  sameCause?: boolean;
}

/** The ten newest of today's 66, newest first. */
export const REQUESTS: ServiceRequest[] = [
  { id: "eleanor", channel: "Email", customer: "Eleanor Voss", subject: "Can I move Thursday's appointment?", received: "09:12", resolvedIn: "48 s" },
  { id: "daniel", channel: "Chat", customer: "Daniel Reyes", subject: "Did my booking go through? No date", received: "09:10", resolvedIn: "41 s", sameCause: true },
  { id: "amara", channel: "Form", customer: "Amara Nwosu", subject: "Refund for a visit cancelled in time", received: "09:07", resolvedIn: "1m 12s" },
  { id: "hale", channel: "Call", customer: "Robert Hale", subject: "Third missed callback, may cancel", received: "09:03" },
  { id: "linh", channel: "Email", customer: "Linh Tran", subject: "Confirmation does not give a time", received: "08:58", resolvedIn: "37 s", sameCause: true },
  { id: "george", channel: "Chat", customer: "George Pappas", subject: "Where is order 20418?", received: "08:51", resolvedIn: "39 s" },
  { id: "sara", channel: "Email", customer: "Sara Lindgren", subject: "Is my appointment confirmed?", received: "08:47", resolvedIn: "45 s", sameCause: true },
  { id: "owen", channel: "Form", customer: "Owen Blake", subject: "Change of billing address", received: "08:40", resolvedIn: "52 s" },
  { id: "maria", channel: "Chat", customer: "Maria Santos", subject: "Which day is my visit? Email unclear", received: "08:33", resolvedIn: "50 s", sameCause: true },
  { id: "peter", channel: "Call", customer: "Peter Novak", subject: "Copy of the March invoice", received: "08:26", resolvedIn: "44 s" },
];

/** Row position once the agent groups the requests that share a cause: those first, the rest below, order kept. */
export const GROUPED: Record<string, number> = Object.fromEntries(
  [...REQUESTS.filter((r) => r.sameCause), ...REQUESTS.filter((r) => !r.sameCause)].map((r, i) => [r.id, i]),
);

export const TOTALS = { today: 66, resolved: 61, withPerson: 5, sameCause: 23 };

/** Median response in seconds: 3m 36s before, 2m 14s after. That is the tile's −38%. */
export const MEDIAN = { before: 216, after: 134, delta: "−38%" };

export const CHANNELS: { label: string; count: number }[] = [
  { label: "Email", count: 28 },
  { label: "Chat", count: 21 },
  { label: "Form", count: 11 },
  { label: "Call notes", count: 6 },
];

export const ROOT_CAUSE = {
  title: "23 requests, one cause",
  body: "Unclear confirmation email. Proposed fix drafted.",
  now: "Your booking is confirmed",
  fix: "Confirmed: Mon 27 Oct, 09:30. Reply to change it.",
};

/* ------------------------------------------------------------------ customer */

/** Eleanor's email. `key` marks the words the agent classifies the request from. */
export const MESSAGE: { text: string; key?: boolean }[] = [
  { text: "Hello, I have an " },
  { text: "appointment this Thursday at 14:00", key: true },
  { text: " but something has come up at work. Could I " },
  { text: "move it to early next week", key: true },
  { text: "? " },
  { text: "Mornings are best", key: true },
  { text: ". Thank you, Eleanor" },
];

export const CUSTOMER = {
  name: "Eleanor Voss",
  record: [
    { label: "Customer since", value: "2019" },
    { label: "Has with you", value: "Annual service plan, 2 locations" },
    { label: "History", value: "14 visits · 0 complaints" },
    { label: "Last contact", value: "March. Invoice question, resolved" },
  ],
  intent: "Move an appointment",
  urgency: "Low",
  policy: "Within policy",
  confidence: 0.96,
};

/* ------------------------------------------------------------------ record */

/** Today is Tue 21 Oct on The Business. The week ahead, weekend skipped. */
export const DAYS = ["Wed 22", "Thu 23", "Fri 24", "Mon 27", "Tue 28"];

/** Slots other customers already hold: [day, row] with row 0 = morning, 1 = afternoon. */
export const TAKEN: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [2, 1],
  [3, 1],
  [4, 0],
];

export const APPOINTMENT = { from: { day: 1, row: 1, time: "14:00" }, to: { day: 3, row: 0, time: "09:30" } };
export const FOLLOW_UP = { day: 2, row: 0, time: "10:00" };

export const CLOSING = [
  { label: "Record updated", detail: "Moved to Mon 27 Oct, 09:30. Notes saved" },
  { label: "Follow-up booked", detail: "Friday, 10:00. Reminder before the new date" },
  { label: "Customer confirmed", detail: "Eleanor replied: that works, thank you" },
];

/* ------------------------------------------------------------------ escalation */

export const ON_SHIFT = [
  { name: "Priya Raman", role: "Customer care lead", status: "Available", open: 1 },
  { name: "Jon Ellery", role: "Billing", status: "In a call", open: 3 },
  { name: "Mei Tanaka", role: "Field team", status: "Available", open: 0 },
];

export const HANDOFF = {
  to: "Priya Raman",
  customer: "Robert Hale",
  facts: "Customer since 2016 · $18,200 a year",
  context: "3 call notes · 2 emails · full history",
  reply:
    "Robert, I am sorry. Three missed callbacks is our failure, not yours. I will call you myself before noon today and stay with this until it is sorted. Priya",
};

export const HANDOFF_SPEED = 80;
/** The reply starts once the reasons and the context have landed. */
export const HANDOFF_DELAY_S = 1.9;
export const HANDOFF_DONE_MS = Math.round(HANDOFF_DELAY_S * 1000 + (HANDOFF.reply.length / HANDOFF_SPEED) * 1000) + 250;
