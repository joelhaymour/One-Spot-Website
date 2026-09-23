/*
 * What the Administration console shows. One company, consistent with the story in
 * content/departments.ts and the owner's display in content/hud.ts: Tuesday the 21st,
 * 146 emails, 23 meetings, 3 deadlines, 9 that need the owner, 3 documents, a licence due in 21 days.
 */

import { TODOS } from "@/content/hud";

export const DAYS = ["Mon 20", "Tue 21", "Wed 22", "Thu 23", "Fri 24"];
export const TODAY = 1;
export const THURSDAY = 3;

/** The calendar shows 09:00 to 17:00. */
export const DAY_START = 9;
export const DAY_HOURS = 8;
export const HOUR_PX = 35;

export interface Meeting {
  day: number;
  /** Decimal hours: 13.5 is 13:30. */
  start: number;
  hours: number;
  title: string;
}

/** The 23 meetings of the week. Tuesday carries the three the owner sees under "Today" on the display. */
export const MEETINGS: Meeting[] = [
  { day: 0, start: 9, hours: 0.5, title: "Team stand-up" },
  { day: 0, start: 10, hours: 1, title: "Payroll review" },
  { day: 0, start: 11.5, hours: 0.5, title: "Supplier call" },
  { day: 0, start: 13, hours: 1, title: "Interview: coordinator" },
  { day: 0, start: 15, hours: 1, title: "Client check-in" },

  { day: 1, start: 9, hours: 0.5, title: "Team stand-up" },
  { day: 1, start: 10, hours: 1, title: "Leadership sync" },
  { day: 1, start: 11.5, hours: 0.5, title: "Insurance broker" },
  { day: 1, start: 13.5, hours: 1, title: "Hartwell Partners review" },
  { day: 1, start: 16, hours: 0.5, title: "Vendor call" },

  { day: 2, start: 9, hours: 0.5, title: "Team stand-up" },
  { day: 2, start: 9.5, hours: 1, title: "Budget check" },
  { day: 2, start: 11, hours: 1, title: "Welcome call: J. Moreno" },
  { day: 2, start: 13, hours: 0.5, title: "Accountant call" },
  { day: 2, start: 15, hours: 1.5, title: "Staff training" },

  { day: 3, start: 9, hours: 0.5, title: "Team stand-up" },
  { day: 3, start: 10, hours: 1.5, title: "Client presentation" },
  { day: 3, start: 12.5, hours: 1, title: "Contract review" },

  { day: 4, start: 9, hours: 0.5, title: "Team stand-up" },
  { day: 4, start: 10, hours: 0.5, title: "Week review" },
  { day: 4, start: 11, hours: 1, title: "Supplier pricing" },
  { day: 4, start: 14, hours: 1, title: "Plan next week" },
];

/** The 23rd meeting: it sits in the only slot all six people have free, so it is the one that moves. */
export const CONFLICT = { day: THURSDAY, start: 14, movedTo: 16, hours: 0.5, title: "1:1 Sam Okafor" };

export const REVIEW = {
  day: THURSDAY,
  start: 14,
  hours: 1.5,
  title: "Quarterly review",
  detail: "Room 2 · 6 of 6 free",
  sent: "Agenda sent",
};

export const MEETINGS_THIS_WEEK = MEETINGS.length + 1;
export const EMAILS = 146;

/** The three deadlines of the week. Each one shows up again elsewhere on the console. */
export const DEADLINES = [
  { date: "Wed 22", title: "Quarterly filing figures", left: "In 1 day" },
  { date: "Thu 23", title: "Payroll cut-off", left: "In 2 days" },
  { date: "Fri 24", title: "Compliance declaration", left: "In 3 days" },
];

export type Bucket = "Needs you" | "Handled" | "Filed";

export const BUCKETS: { id: Bucket; count: number }[] = [
  { id: "Needs you", count: 9 },
  { id: "Handled", count: 61 },
  { id: "Filed", count: 76 },
];

/** The top of the inbox before it is sorted. */
export const INBOX: { from: string; subject: string; bucket: Bucket }[] = [
  { from: "Office supplies", subject: "Your order has shipped", bucket: "Filed" },
  { from: "Hartwell Partners", subject: "Contract renewal: two questions", bucket: "Needs you" },
  { from: "Industry newsletter", subject: "Five trends for the quarter", bucket: "Filed" },
  { from: "Sam Okafor", subject: "Can we move Thursday's 1:1?", bucket: "Handled" },
  { from: "Supplier accounts", subject: "Invoice 2291 attached", bucket: "Handled" },
  { from: "Accountant", subject: "Quarterly filing: figures to confirm", bucket: "Needs you" },
  { from: "Parking office", subject: "Permit receipt", bucket: "Filed" },
  { from: "Meeting rooms", subject: "Room 2 is free Thursday afternoon", bucket: "Handled" },
];

/** The nine. Each says what the owner has to do, not just that something arrived. */
export const NEEDS_YOU: { from: string; subject: string; todo: string }[] = [
  { from: "Hartwell Partners", subject: "Contract renewal: two questions", todo: "Reply" },
  { from: "Insurance broker", subject: "Certificate lapses in 6 days", todo: "Sign" },
  { from: "Accountant", subject: "Quarterly filing: figures to confirm", todo: "Confirm" },
  { from: "J. Moreno", subject: "Start date and first-day details", todo: "Reply" },
  { from: "Licensing office", subject: "License renewal notice", todo: "Decide" },
  { from: "Alder & Finch", subject: "Revised quote needs approval", todo: "Approve" },
  { from: "Bank", subject: "New signatory form", todo: "Sign" },
  { from: "Landlord", subject: "Lease review: proposed dates", todo: "Decide" },
  { from: "Priya Nair", subject: "Leave request, 3 days in November", todo: "Approve" },
];

/** Renewals on a 60-day horizon. */
export const HORIZON_DAYS = 60;

export interface Renewal {
  name: string;
  days: number;
  tone: "warn" | "neutral";
  /** What the row says before the agent acts on it. */
  status: string;
  /** The agent puts this one on the owner's to-do list: in this order, with these words. */
  remind?: { order: number; todo: string };
}

export const RENEWALS: Renewal[] = [
  {
    name: "Insurance certificate",
    days: 6,
    tone: "warn",
    status: "Lapsing",
    // the same line the owner reads on the display
    remind: { order: 1, todo: TODOS.find((t) => t.id === "contract")?.label ?? "Sign renewed insurance certificate" },
  },
  {
    name: "Operating license",
    days: 21,
    tone: "warn",
    status: "Due soon",
    remind: { order: 0, todo: "Renew the operating license by 11 Nov." },
  },
  { name: "Software subscriptions", days: 34, tone: "neutral", status: "Tracked" },
  { name: "Service contract", days: 58, tone: "neutral", status: "Tracked" },
];

export const ADDED = "Added to owner to-do";
export const TODO_BEFORE = 3;

export interface Paper {
  title: string;
  /** Known before the agent starts: who or what the document is for. */
  about: { label: string; value: string };
  /** Left blank by people. The agent fills these from what the company already knows. */
  fields: { label: string; value: string }[];
}

export const PAPERS: Paper[] = [
  {
    title: "Onboarding packet",
    about: { label: "For", value: "J. Moreno" },
    fields: [
      { label: "Start date", value: "Mon 3 Nov" },
      { label: "Role", value: "Coordinator" },
      { label: "Payroll", value: "Complete" },
    ],
  },
  {
    title: "Contract renewal",
    about: { label: "With", value: "Hartwell Partners" },
    fields: [
      { label: "Term", value: "12 months" },
      { label: "Per year", value: "$48,000" },
      { label: "Notice", value: "60 days" },
    ],
  },
  {
    title: "Compliance form",
    about: { label: "Filing", value: "Annual declaration" },
    fields: [
      { label: "Period", value: "Jan to Dec" },
      { label: "Filed by", value: "Priya Nair" },
      { label: "Checks", value: "14 of 14" },
    ],
  },
];

export const CHECKED = "Checked";
export const ROUTED = "Routed for signature";

/** Milliseconds between one document starting and the next: they are prepared one at a time. */
export const PAPER_PACE = 1250;
