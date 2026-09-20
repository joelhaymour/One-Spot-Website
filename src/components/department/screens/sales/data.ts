/**
 * The Sales console's working data. One morning at a generic services company:
 * nine new leads since 08:00, scored against 214 closed deals, one reply, 27 CRM activities, one proposal.
 * Numbers agree with the story in content/departments.ts and with the Sales tile on The Business.
 */

export type LeadSource = "Website" | "Referral" | "Call" | "Event" | "Paid ad";

export interface Lead {
  id: string;
  name: string;
  company: string;
  kind: string;
  source: LeadSource;
  /** Time since the enquiry, as the queue shows it. */
  ago: string;
  /** Fit, intent and timing against closed deals. */
  score: number;
  /** After the agent learns that referrals close at 2.4x paid. */
  reweighted: number;
}

/** Arrival order, newest first. */
export const LEADS: Lead[] = [
  { id: "dana", name: "Dana Whitfield", company: "Whitfield Property", kind: "Property management", source: "Website", ago: "1 min", score: 91, reweighted: 90 },
  { id: "tom", name: "Tom Arkwright", company: "Arkwright Haulage", kind: "Haulage", source: "Call", ago: "9 min", score: 58, reweighted: 58 },
  { id: "helen", name: "Helen Brandt", company: "Brandt & Lowe", kind: "Accounting firm", source: "Event", ago: "14 min", score: 83, reweighted: 82 },
  { id: "marcus", name: "Marcus Oyelaran", company: "Oyelaran Build", kind: "Building contractor", source: "Referral", ago: "19 min", score: 86, reweighted: 93 },
  { id: "sofia", name: "Sofia Lindqvist", company: "Lindqvist Dental", kind: "Dental practice", source: "Paid ad", ago: "23 min", score: 64, reweighted: 57 },
  { id: "james", name: "James Okafor", company: "Northgate Retail", kind: "Retail, 4 stores", source: "Website", ago: "28 min", score: 71, reweighted: 70 },
  { id: "ruth", name: "Ruth Calloway", company: "Calloway Legal", kind: "Law office", source: "Referral", ago: "33 min", score: 69, reweighted: 78 },
  { id: "ben", name: "Ben Marsh", company: "Marsh Catering", kind: "Hospitality", source: "Paid ad", ago: "38 min", score: 41, reweighted: 35 },
  { id: "nina", name: "Nina Petrov", company: "Petrov Fabrication", kind: "Manufacturing", source: "Website", ago: "44 min", score: 29, reweighted: 29 },
];

export const HOT_SCORE = 80;

const rankBy = (key: "score" | "reweighted"): Record<string, number> =>
  Object.fromEntries([...LEADS].sort((a, b) => b[key] - a[key]).map((lead, i) => [lead.id, i]));

/** Row position of each lead once the queue is sorted by score. */
export const RANK = { scored: rankBy("score"), learned: rankBy("reweighted") };

/** 48 open deals, $4.82M: the same pipeline the owner sees on The Business. */
export const PIPELINE = [
  { stage: "New", deals: 14, amount: 0.62 },
  { stage: "Qualified", deals: 12, amount: 0.94 },
  { stage: "Meeting", deals: 9, amount: 1.08 },
  { stage: "Proposal", deals: 8, amount: 1.26 },
  { stage: "Negotiation", deals: 5, amount: 0.92 },
];

/** Win rate by source across 214 closed deals. 31 / 13 = 2.4. */
export const SOURCE_RATES: { source: LeadSource; rate: number }[] = [
  { source: "Referral", rate: 31 },
  { source: "Event", rate: 22 },
  { source: "Website", rate: 18 },
  { source: "Call", rate: 15 },
  { source: "Paid ad", rate: 13 },
];

export const WEIGHTS = [
  { label: "Referral", from: 1, to: 1.4 },
  { label: "Paid ad", from: 1, to: 0.8 },
];

/* ------------------------------------------------------------------ conversation */

export interface Thread {
  id: string;
  name: string;
  via: string;
  snippet: string;
  time: string;
}

export const THREADS: Thread[] = [
  { id: "dana", name: "Dana Whitfield", via: "Website form", snippet: "We manage three sites and our provider keeps missing visits.", time: "08:44" },
  { id: "tom", name: "Tom Arkwright", via: "Call note", snippet: "Rang 08:36. Quote for five vehicles. Call back after 14:00.", time: "08:36" },
  { id: "helen", name: "Helen Brandt", via: "Event", snippet: "Good to meet you Thursday. Could you send the overview?", time: "08:31" },
  { id: "marcus", name: "Marcus Oyelaran", via: "Referral", snippet: "A colleague at Alder & Finch passed on your name.", time: "08:26" },
  { id: "sofia", name: "Sofia Lindqvist", via: "Paid ad", snippet: "Do you have a price list? We are comparing options.", time: "08:22" },
];

/** Dana's enquiry. `key` marks the words the reply is written from. */
export const ENQUIRY: { text: string; key?: boolean }[] = [
  { text: "Hello. We manage " },
  { text: "three sites", key: true },
  { text: " and our current provider keeps " },
  { text: "missing visits", key: true },
  { text: ". We need someone reliable in place " },
  { text: "before the end of next month", key: true },
  { text: ". Can you send " },
  { text: "pricing for all three", key: true },
  { text: ", and tell me how soon you could start?" },
];

export const REPLY =
  "Hi Dana, thank you for getting in touch. Missed visits across three sites is something we can put right: every visit is confirmed the day before. We can be in place before the end of next month. Pricing for all three is attached. Are you free Thursday at 10:00 for a short call?";

/** Characters per second the agent writes at, and the pause before it starts. Shared so "Sent" can land as typing ends. */
export const REPLY_SPEED = 95;
export const REPLY_DELAY_S = 1.3;
export const REPLY_DONE_MS = Math.round(REPLY_DELAY_S * 1000 + (REPLY.length / REPLY_SPEED) * 1000) + 250;

/* ------------------------------------------------------------------ CRM */

export type ActivityKind = "Call" | "Email" | "Meet";

export interface Activity {
  kind: ActivityKind;
  who: string;
  note: string;
  when: string;
}

/** What people left behind: the fields nobody filled in. */
export const STALE_ACTIVITY: Activity[] = [
  { kind: "Call", who: "Hartwell Partners", note: "No outcome recorded", when: "Mon" },
  { kind: "Meet", who: "Alder & Finch", note: "Notes missing", when: "Mon" },
  { kind: "Email", who: "Kestrel Logistics", note: "Not linked to a deal", when: "Fri" },
  { kind: "Call", who: "Fenwick Dental", note: "Next step blank", when: "Fri" },
  { kind: "Meet", who: "Marlow Builders", note: "Owner not set", when: "Thu" },
];

/** The newest five of the 27 activities the agent logs. */
export const LOGGED_ACTIVITY: Activity[] = [
  { kind: "Call", who: "Marcus Oyelaran", note: "Site visit agreed", when: "08:52" },
  { kind: "Meet", who: "Hartwell Partners", note: "Review booked 13:30", when: "08:50" },
  { kind: "Call", who: "Tom Arkwright", note: "Voicemail, callback 14:00", when: "08:49" },
  { kind: "Email", who: "Helen Brandt", note: "Overview sent", when: "08:48" },
  { kind: "Email", who: "Dana Whitfield", note: "Reply and pricing sent", when: "08:47" },
];

export const CRM = { logged: 27, stale: 14, breakdown: "11 calls · 12 emails · 4 meetings" };

/* ------------------------------------------------------------------ proposal */

export const PROPOSAL_QUEUE = [
  { account: "Hartwell Partners", detail: "Requested Monday · 4 sites", status: "Not started" },
  { account: "Alder & Finch", detail: "Sent 3 days ago · opened twice", status: "Sent" },
  { account: "Kestrel Logistics", detail: "Signed last Tuesday", status: "Won" },
];

export const PROPOSAL = {
  account: "Hartwell Partners",
  ref: "P-2291",
  scope: ["Weekly service, 4 sites", "Named account lead", "Monthly review"],
  pricing: [
    { item: "Core service", amount: "$9,600" },
    { item: "Account lead", amount: "$1,800" },
    { item: "Reporting", amount: "Included" },
  ],
  total: "$11,400",
  terms: "12 months, then rolling. 30 days notice.",
  sources: "Services template v4 · 2026 pricing · Standard terms",
};
