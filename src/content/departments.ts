/**
 * The organisation. One CEO Agent, seven department Agents.
 * Everything a scene needs to know about a department lives here so copy and
 * narrative stay in one voice and scenes stay purely visual.
 */

export type DepartmentId =
  | "marketing"
  | "sales"
  | "service"
  | "finance"
  | "operations"
  | "knowledge"
  | "administration";

export type AgentId = "ceo" | DepartmentId;

/** The loop every agent runs. It is the spine of every department story. */
export type Beat = "observe" | "think" | "act" | "learn" | "report";

export const BEATS: { id: Beat; label: string; line: string }[] = [
  { id: "observe", label: "Observes", line: "It watches the work, all the time." },
  { id: "think", label: "Thinks", line: "It works out what is going on, and why." },
  { id: "act", label: "Acts", line: "It does the work, inside your tools." },
  { id: "learn", label: "Learns", line: "It keeps what worked." },
  { id: "report", label: "Reports", line: "It tells the CEO Agent. Only what needs you reaches you." },
];

/** How an agent carries itself. Drives the spot, the rings and the light it throws. */
export type AgentMood = "idle" | "observe" | "think" | "act" | "transmit" | "alert" | "arrive";

export const BEAT_MOOD: Record<Beat, AgentMood> = {
  observe: "observe",
  think: "think",
  act: "act",
  learn: "think",
  report: "transmit",
};

/**
 * Workstation canvas regions (virtual px on a 1280 x 760 display).
 * Every department composes its console on this grid, so the consoles read as
 * one family and the camera always knows where to look.
 *
 *   ┌──────────────── bar (48) ────────────────┐
 *   │  A  main                  │  B  side      │
 *   │                           │               │
 *   ├────────────┬──────────────┼───────────────┤
 *   │  C         │  D           │  E  agent log │
 *   └────────────┴──────────────┴───────────────┘
 */
export const WORKSTATION = { width: 1280, height: 760 } as const;

export const REGION = {
  full: { x: 0, y: 0, w: 1280, h: 760 },
  A: { x: 20, y: 62, w: 772, h: 408 },
  B: { x: 806, y: 62, w: 454, h: 408 },
  C: { x: 20, y: 484, w: 379, h: 256 },
  D: { x: 413, y: 484, w: 379, h: 256 },
  E: { x: 806, y: 484, w: 454, h: 256 },
  AB: { x: 20, y: 62, w: 1240, h: 408 },
  CD: { x: 20, y: 484, w: 772, h: 256 },
  BE: { x: 806, y: 62, w: 454, h: 678 },
  AC: { x: 20, y: 62, w: 772, h: 678 },
} as const;

export type RegionId = keyof typeof REGION;

export interface StoryStep {
  id: string;
  beat: Beat;
  /** What the agent does, as a short sentence. */
  title: string;
  /** One plain line of consequence. */
  body: string;
  /** Where the camera looks while this step plays. */
  focus: RegionId;
  /** What the agent writes in its log during this step. */
  log: string;
  /** Console clock for this step, when the console's own content pins the time. Defaults to a running clock. */
  time?: string;
}

export interface DepartmentTile {
  metricLabel: string;
  metricValue: string;
  delta: string;
  deltaTone: "ok" | "warn" | "crit" | "neutral";
  spark: number[];
  status: "ok" | "warn";
  /** Latest thing the agent did. Shown on the door in The Business. */
  activity: string[];
  /** Contextual line shown when the visitor points at the tile. */
  hover: string;
}

export interface Department {
  id: DepartmentId;
  slug: string;
  name: string;
  agentName: string;
  /** hex + "r, g, b" for rgba() composition */
  accent: string;
  accentRgb: string;
  oneLiner: string;
  /** What the console is called on its display. */
  console: string;
  handles: string[];
  tile: DepartmentTile;
  story: StoryStep[];
  /** The line that lands on the owner's display when the story ends. */
  report: { headline: string; detail: string };
}

export const CEO = {
  id: "ceo" as const,
  name: "CEO Agent",
  accent: "#f4f7ff",
  accentRgb: "244, 247, 255",
  oneLiner: "Sees the whole company at once. Tells you what matters.",
};

export const DEPARTMENTS: Department[] = [
  {
    id: "marketing",
    slug: "marketing",
    name: "Marketing",
    agentName: "Marketing Agent",
    accent: "#e887d5",
    accentRgb: "232, 135, 213",
    oneLiner: "Watches every campaign. Finds what works. Does more of it.",
    console: "Marketing Console",
    handles: ["Campaign performance", "Audience research", "Competitor monitoring", "Creative briefs", "Content scheduling"],
    tile: {
      metricLabel: "Cost per lead",
      metricValue: "$38.20",
      delta: "−12%",
      deltaTone: "ok",
      spark: [52, 50, 51, 47, 48, 44, 45, 41, 42, 39, 40, 38],
      status: "warn",
      activity: ["Scheduled 14 posts for next week", "Retired a tired campaign", "Drafted next month's calendar"],
      hover: "3 campaigns live · 1 needs attention",
    },
    story: [
      {
        id: "data-arrives",
        beat: "observe",
        title: "Performance data arrives.",
        body: "Every channel, every campaign, every hour. Nobody has to pull a report.",
        focus: "A",
        log: "Ingesting performance data from 6 channels.",
      },
      {
        id: "slipping",
        beat: "observe",
        title: "It notices one campaign slipping.",
        body: "Spring Promotion now costs 38% more per lead than it did two weeks ago.",
        focus: "A",
        log: "Spring Promotion: cost per lead +38% over 14 days. Flagging.",
      },
      {
        id: "why",
        beat: "think",
        title: "It works out why.",
        body: "Same audience, same offer. The creative has simply been seen too many times.",
        focus: "B",
        log: "Frequency 6.4. Click-through falling while reach is flat. Cause: creative fatigue.",
      },
      {
        id: "competitors",
        beat: "think",
        title: "It checks the competition.",
        body: "Three competitors changed their offer this month. One is bidding on your name.",
        focus: "C",
        log: "3 competitor offers changed. 1 bidding on brand terms.",
      },
      {
        id: "concept",
        beat: "act",
        title: "It drafts a new angle.",
        body: "A campaign concept written against what is actually working in your market.",
        focus: "D",
        log: "Drafting concept: lead with the guarantee, not the discount.",
      },
      {
        id: "briefs",
        beat: "act",
        title: "It briefs the creative.",
        body: "Headlines, formats, audiences. Ready for a person to approve, or to ship.",
        focus: "D",
        log: "4 creative briefs generated. Awaiting approval.",
      },
      {
        id: "schedule",
        beat: "act",
        title: "It schedules the launch.",
        body: "Content is queued across channels at the hours your customers respond.",
        focus: "B",
        log: "Scheduled 4 variations across 3 channels.",
      },
      {
        id: "monitor",
        beat: "learn",
        title: "It watches what happens.",
        body: "Four variations run side by side. Budget follows the evidence.",
        focus: "A",
        log: "Day 3: variation C leading. Shifting budget.",
      },
      {
        id: "winner",
        beat: "learn",
        title: "It keeps the winner.",
        body: "Variation C wins at 41% lower cost per lead. The rest are retired.",
        focus: "A",
        log: "Variation C: cost per lead −41%. Retiring A, B, D.",
      },
      {
        id: "report",
        beat: "report",
        title: "It reports to the CEO Agent.",
        body: "What changed, what it cost, what it earned. One line on the Hub.",
        focus: "E",
        log: "Report sent to CEO Agent.",
      },
    ],
    report: { headline: "Cost per lead down 41%", detail: "Marketing Agent replaced a fatigued campaign. No action needed." },
  },
  {
    id: "sales",
    slug: "sales",
    name: "Sales",
    agentName: "Sales Agent",
    accent: "#cddc6a",
    accentRgb: "205, 220, 106",
    oneLiner: "Answers every lead in minutes. Knows which ones will close.",
    console: "Sales Console",
    handles: ["Lead scoring", "Follow-ups", "CRM upkeep", "Proposals", "Forecasting"],
    tile: {
      metricLabel: "Pipeline",
      metricValue: "$4.82M",
      delta: "+12%",
      deltaTone: "ok",
      spark: [31, 33, 32, 36, 38, 37, 41, 40, 44, 45, 47, 48],
      status: "ok",
      activity: ["Followed up with 9 new leads in 3 min", "Drafted a proposal for Hartwell Partners", "Logged 27 calls to the CRM"],
      hover: "48 open deals · 2 at risk",
    },
    story: [
      {
        id: "leads",
        beat: "observe",
        time: "08:45",
        title: "New leads arrive.",
        body: "Website, referrals, calls, events. One queue, nothing lost in an inbox.",
        focus: "A",
        log: "9 new leads since 08:00.",
      },
      {
        id: "score",
        beat: "think",
        time: "08:46",
        title: "It scores each one.",
        body: "Fit, intent, timing. Judged against the deals you have actually won.",
        focus: "A",
        log: "Scoring against 214 closed deals. 3 leads above 80.",
      },
      {
        id: "follow-up",
        beat: "act",
        time: "08:47",
        title: "It follows up in minutes.",
        body: "A personal reply, written from the lead's own words, sent while they still care.",
        focus: "B",
        log: "Reply sent to Dana Whitfield. 2 min 40 s after inquiry.",
      },
      {
        id: "crm",
        beat: "act",
        time: "08:52",
        title: "It keeps the CRM honest.",
        body: "Every call, email and meeting is logged. Nobody updates fields on Friday afternoon.",
        focus: "C",
        log: "27 activities logged. 0 fields stale.",
      },
      {
        id: "proposal",
        beat: "act",
        time: "08:58",
        title: "It writes the proposal.",
        body: "Scope, pricing, terms. Assembled from your templates, ready to review.",
        focus: "D",
        log: "Proposal drafted for Hartwell Partners. Awaiting review.",
      },
      {
        id: "learns",
        beat: "learn",
        time: "09:06",
        title: "It learns what closes.",
        body: "Referrals convert 2.4x better than paid leads. Fast replies double the response rate.",
        focus: "A",
        log: "Pattern: referral leads close at 2.4x. Reweighting scores.",
      },
      {
        id: "report",
        beat: "report",
        time: "09:08",
        title: "It reports to the CEO Agent.",
        body: "Pipeline, forecast, deals at risk. Already on the Hub.",
        focus: "E",
        log: "Report sent to CEO Agent.",
      },
    ],
    report: { headline: "Pipeline up 12%", detail: "Sales Agent replied to every lead within 5 minutes. 2 deals need you." },
  },
  {
    id: "service",
    slug: "customer-service",
    name: "Customer Service",
    agentName: "Customer Service Agent",
    accent: "#61d8e5",
    accentRgb: "97, 216, 229",
    oneLiner: "Resolves what it can. Hands a person everything else, with the full story.",
    console: "Service Console",
    handles: ["Email and chat", "Customer records", "Resolutions", "Escalations", "Root causes"],
    tile: {
      metricLabel: "Median response",
      metricValue: "2m 14s",
      delta: "−38%",
      deltaTone: "ok",
      spark: [9, 8.4, 8.8, 7, 6.1, 5.2, 4.4, 3.9, 3.1, 2.8, 2.4, 2.2],
      status: "ok",
      activity: ["Resolved 61 of 66 requests", "Escalated 5 with full history", "Flagged a repeat question to fix at the source"],
      hover: "66 requests today · 5 with a person",
    },
    story: [
      {
        id: "arrive",
        beat: "observe",
        title: "Messages arrive from everywhere.",
        body: "Email, chat, forms, call notes. One queue.",
        focus: "A",
        log: "66 requests today across 4 channels.",
      },
      {
        id: "understand",
        beat: "think",
        title: "It understands the request.",
        body: "Who the customer is, what they have with you, what they need, how urgent it is.",
        focus: "B",
        log: "Customer since 2019. Asking to move an appointment. Low urgency.",
      },
      {
        id: "resolve",
        beat: "act",
        title: "It resolves what it can.",
        body: "Rescheduling, status, refunds within policy. Answered in under a minute, in your voice.",
        focus: "A",
        log: "Rescheduled. Confirmation sent. 48 s.",
      },
      {
        id: "escalate",
        beat: "act",
        title: "It escalates what it should not.",
        body: "An upset long-time customer goes to a person, with the history and a suggested reply.",
        focus: "D",
        log: "Escalating to Priya: upset, high value. Context attached.",
      },
      {
        id: "close",
        beat: "act",
        title: "It closes the loop.",
        body: "Records updated. Follow-up booked. Customer confirmed.",
        focus: "C",
        log: "Record updated. Follow-up set for Friday.",
      },
      {
        id: "pattern",
        beat: "learn",
        title: "It finds the pattern.",
        body: "23 people asked the same question this week. It fixes the confirmation email instead.",
        focus: "A",
        log: "23 tickets share one cause: unclear confirmation email. Proposing fix.",
      },
      {
        id: "report",
        beat: "report",
        title: "It reports to the CEO Agent.",
        body: "Response time, satisfaction, and the one root cause worth your attention.",
        focus: "E",
        log: "Report sent to CEO Agent.",
      },
    ],
    report: { headline: "Median response: 2m 14s", detail: "Customer Service Agent found one root cause behind 23 tickets." },
  },
  {
    id: "finance",
    slug: "finance",
    name: "Finance",
    agentName: "Finance Agent",
    accent: "#7eddad",
    accentRgb: "126, 221, 173",
    oneLiner: "Reads every document. Matches every number. Flags what does not add up.",
    console: "Finance Console",
    handles: ["Invoices", "Reconciliation", "Document checks", "Reporting", "Cash forecasting"],
    tile: {
      metricLabel: "Cash position",
      metricValue: "$2.41M",
      delta: "+3.2%",
      deltaTone: "ok",
      spark: [2.1, 2.14, 2.12, 2.2, 2.18, 2.25, 2.3, 2.28, 2.34, 2.36, 2.39, 2.41],
      status: "warn",
      activity: ["Reconciled 142 invoices", "Held 2 invoices for review", "Updated the 13-week cash forecast"],
      hover: "214 documents this week · 2 held for you",
    },
    story: [
      {
        id: "documents",
        beat: "observe",
        title: "Documents come in.",
        body: "Invoices, receipts, statements. From email, uploads and your accounting system.",
        focus: "A",
        log: "214 documents received this week.",
      },
      {
        id: "reads",
        beat: "observe",
        title: "It reads every one.",
        body: "Vendor, amount, date, terms. Extracted and checked against the purchase record.",
        focus: "B",
        log: "Extracting fields. Checking against purchase orders.",
      },
      {
        id: "mismatch",
        beat: "think",
        title: "It spots what does not match.",
        body: "One invoice is billed twice. One vendor changed bank details yesterday.",
        focus: "B",
        log: "Invoice 4471 duplicates 4398. Vendor bank details changed 1 day ago. Holding both.",
      },
      {
        id: "reconcile",
        beat: "act",
        title: "It reconciles the rest.",
        body: "212 of 214 matched to transactions. Two held for a person.",
        focus: "A",
        log: "212 matched. 2 held for review.",
      },
      {
        id: "close",
        beat: "act",
        title: "It closes the month.",
        body: "Profit and loss, cash position, overdue receivables. Assembled, not chased.",
        focus: "C",
        log: "Month-end pack assembled in 4 minutes.",
      },
      {
        id: "forecast",
        beat: "learn",
        title: "It forecasts cash.",
        body: "Based on how your customers actually pay, not when the invoice says they should.",
        focus: "D",
        log: "Customers pay 11 days late on average. Forecast adjusted.",
      },
      {
        id: "report",
        beat: "report",
        title: "It reports to the CEO Agent.",
        body: "Eighteen hours of weekly reconciliation, gone. Two exceptions need you.",
        focus: "E",
        log: "Report sent to CEO Agent.",
      },
    ],
    report: { headline: "212 of 214 documents reconciled", detail: "Finance Agent is holding 2 invoices for your review." },
  },
  {
    id: "operations",
    slug: "operations",
    name: "Operations",
    agentName: "Operations Agent",
    accent: "#61a0ff",
    accentRgb: "97, 160, 255",
    oneLiner: "Watches the work move. Clears the jam before it forms.",
    console: "Operations Console",
    handles: ["Workflows", "Scheduling", "Inventory", "Vendors", "Capacity"],
    tile: {
      metricLabel: "Hours used this week",
      metricValue: "94%",
      delta: "+6 pts",
      deltaTone: "warn",
      spark: [71, 73, 72, 76, 78, 80, 79, 84, 86, 89, 92, 94],
      status: "warn",
      activity: ["Rescheduled Thursday to clear a conflict", "Drafted a reorder at the best vendor price", "Flagged a slow handoff in intake"],
      hover: "This week at 94% · 1 bottleneck forming",
    },
    story: [
      {
        id: "watch",
        beat: "observe",
        title: "It watches the work move.",
        body: "Jobs, orders, schedules, stock, vendors. Live.",
        focus: "A",
        log: "Tracking 128 active jobs across 5 stages.",
      },
      {
        id: "bottleneck",
        beat: "observe",
        title: "It sees a bottleneck forming.",
        body: "One stage is backing up, and Thursday is overbooked.",
        focus: "A",
        log: "Stage 3 queue: 19 and rising. Thursday at 117% capacity.",
      },
      {
        id: "capacity",
        beat: "think",
        title: "It checks capacity.",
        body: "People, hours, materials, vendor lead times.",
        focus: "B",
        log: "Team B has 11 free hours Wednesday. Materials in stock.",
      },
      {
        id: "reschedule",
        beat: "act",
        title: "It reschedules.",
        body: "Two jobs moved, one team reassigned, everyone affected told.",
        focus: "B",
        log: "Moved 2 jobs to Wednesday. 3 people notified.",
      },
      {
        id: "reorder",
        beat: "act",
        title: "It reorders before you run out.",
        body: "A purchase order, drafted at the best vendor price, waiting for approval.",
        focus: "C",
        log: "Stock for item 2210 runs out in 6 days. PO drafted.",
      },
      {
        id: "tune",
        beat: "learn",
        title: "It tunes the process.",
        body: "The handoff between intake and scheduling loses a day and a half. It proposes a fix.",
        focus: "D",
        log: "Intake to scheduling: 1.5 days idle. Proposal drafted.",
      },
      {
        id: "report",
        beat: "report",
        title: "It reports to the CEO Agent.",
        body: "Next week's capacity, one risk, one recommendation.",
        focus: "E",
        log: "Report sent to CEO Agent.",
      },
    ],
    report: { headline: "Thursday conflict cleared", detail: "Operations Agent moved 2 jobs. Capacity next week: 94%." },
  },
  {
    id: "knowledge",
    slug: "internal-knowledge",
    name: "Internal Knowledge",
    agentName: "Knowledge Agent",
    accent: "#a585ff",
    accentRgb: "165, 133, 255",
    oneLiner: "Knows what your company knows. Answers in seconds, with the source.",
    console: "Knowledge Console",
    handles: ["Policies", "Procedures", "Contracts", "Past work", "Answers for people and agents"],
    tile: {
      metricLabel: "Questions answered",
      metricValue: "312",
      delta: "+64",
      deltaTone: "ok",
      spark: [120, 138, 150, 171, 188, 203, 221, 240, 262, 281, 298, 312],
      status: "ok",
      activity: ["Answered 38 internal questions", "Gave the Sales Agent the current pricing rule", "Drafted 2 missing procedures"],
      hover: "312 answers this month · 14 gaps found",
    },
    story: [
      {
        id: "reads",
        beat: "observe",
        title: "It reads what your company knows.",
        body: "Policies, procedures, contracts, past projects. Including the shared drive nobody organized.",
        focus: "A",
        log: "Indexed 4,180 documents from 7 sources.",
      },
      {
        id: "connects",
        beat: "think",
        title: "It connects it.",
        body: "The same answer lives in four places and two disagree. It marks the current one.",
        focus: "A",
        log: "Warranty terms: 4 versions found. Marking the 2026 policy as current.",
      },
      {
        id: "answers-team",
        beat: "act",
        title: "It answers your team.",
        body: "A question in plain words. An answer in seconds, with the source attached.",
        focus: "B",
        log: "Answered: warranty on refurbished units. Source attached.",
      },
      {
        id: "answers-agents",
        beat: "act",
        title: "It answers the other agents.",
        body: "Sales needs the pricing rule. Service needs the returns policy. Same source of truth.",
        focus: "D",
        log: "Served pricing rule to Sales Agent. Returns policy to Customer Service Agent.",
      },
      {
        id: "gaps",
        beat: "learn",
        title: "It notices what is missing.",
        body: "Fourteen questions had no written answer. It drafts them for an owner to approve.",
        focus: "C",
        log: "14 undocumented answers. 2 drafts ready for approval.",
      },
      {
        id: "report",
        beat: "report",
        title: "It reports to the CEO Agent.",
        body: "Three departments stopped asking each other the same thing.",
        focus: "E",
        log: "Report sent to CEO Agent.",
      },
    ],
    report: { headline: "Internal requests down 64%", detail: "Knowledge Agent answered 312 questions and found 14 gaps." },
  },
  {
    id: "administration",
    slug: "administration",
    name: "Administration",
    agentName: "Administration Agent",
    accent: "#d6c9b3",
    accentRgb: "214, 201, 179",
    oneLiner: "Runs the calendar, the inbox and the paperwork. You get the nine things that need you.",
    console: "Administration Console",
    handles: ["Calendars", "Inbox triage", "Paperwork", "Renewals", "Reminders"],
    tile: {
      metricLabel: "Needs you",
      metricValue: "9 of 146",
      delta: "−137",
      deltaTone: "ok",
      spark: [40, 36, 31, 30, 24, 22, 18, 17, 14, 12, 10, 9],
      status: "ok",
      activity: ["Prepared 3 contracts for signature", "Sorted 146 emails. 9 need you", "Booked the quarterly review"],
      hover: "146 emails sorted · 3 deadlines this week",
    },
    story: [
      {
        id: "week",
        beat: "observe",
        title: "It sees the whole week.",
        body: "Calendars, inboxes, deadlines, renewals, paperwork.",
        focus: "A",
        log: "146 emails. 23 meetings. 3 deadlines.",
      },
      {
        id: "sort",
        beat: "think",
        title: "It sorts what matters.",
        body: "146 emails become the nine that need you.",
        focus: "B",
        log: "9 need the owner. 61 handled. 76 filed.",
      },
      {
        id: "schedule",
        beat: "act",
        title: "It schedules.",
        body: "Finds the time, books the room, sends the agenda, moves the conflict.",
        focus: "A",
        log: "Quarterly review booked. 1 conflict moved.",
      },
      {
        id: "paperwork",
        beat: "act",
        title: "It prepares the paperwork.",
        body: "Onboarding, renewals, compliance forms. Filled, checked, routed for signature.",
        focus: "D",
        log: "3 documents prepared and routed for signature.",
      },
      {
        id: "reminds",
        beat: "learn",
        title: "It remembers so you do not have to.",
        body: "A license renews in 21 days. An insurance certificate is about to lapse.",
        focus: "C",
        log: "License renewal in 21 days. Added to owner to-do.",
      },
      {
        id: "report",
        beat: "report",
        title: "It reports to the CEO Agent.",
        body: "Your to-do list on the Hub is already sorted.",
        focus: "E",
        log: "Report sent to CEO Agent.",
      },
    ],
    report: { headline: "9 items need you today", detail: "Administration Agent handled the other 137." },
  },
];

export const DEPARTMENT_BY_ID = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, d])) as Record<DepartmentId, Department>;
export const DEPARTMENT_BY_SLUG = Object.fromEntries(DEPARTMENTS.map((d) => [d.slug, d])) as Record<string, Department>;

export const departmentHref = (id: DepartmentId) => `/departments/${DEPARTMENT_BY_ID[id].slug}`;

export function nextDepartment(id: DepartmentId): Department {
  const i = DEPARTMENTS.findIndex((d) => d.id === id);
  return DEPARTMENTS[(i + 1) % DEPARTMENTS.length];
}
