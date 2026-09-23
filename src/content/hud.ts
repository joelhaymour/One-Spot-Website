import type { DepartmentId } from "./departments";

/**
 * The Business: one fictional mid-market company with internally consistent numbers.
 * Everything is deterministic (no Date.now, no locale formatting at render) so the server HTML
 * and the first client render are identical. Liveness comes from the scripted event loop below.
 */

export const COMPANY = {
  name: "Meridian & Co.",
  period: "October",
  dayLabel: "Tue 21",
  workingDaysLeft: 8,
};

export const REVENUE = {
  booked: 696_000,
  target: 1_200_000,
  /** deals each waiting on one signature */
  pending: 410_000,
  spark: [18, 41, 77, 96, 131, 168, 204, 233, 262, 301, 347, 372, 418, 455, 489, 534, 561, 603, 641, 668, 696],
};

export interface KeyMetric {
  id: string;
  label: string;
  value: number;
  format: "compact-currency" | "percent" | "int";
  suffix?: string;
  delta: string;
  tone: "ok" | "warn" | "crit";
}

export const KEY_METRICS: KeyMetric[] = [
  { id: "cash", label: "Cash position", value: 2_410_000, format: "compact-currency", delta: "+3.2%", tone: "ok" },
  { id: "pipeline", label: "Pipeline", value: 4_820_000, format: "compact-currency", delta: "+12%", tone: "ok" },
  { id: "leads", label: "New inquiries", value: 312, format: "int", delta: "+46%", tone: "ok" },
  { id: "capacity", label: "Capacity booked", value: 88, format: "int", suffix: "%", delta: "+9 pts", tone: "warn" },
];

export interface TodoItem {
  id: string;
  label: string;
  by: string;
  done?: boolean;
}

export const TODOS: TodoItem[] = [
  { id: "deals", label: "Call three customers waiting on a signature", by: "Sales Agent prepared notes" },
  { id: "invoices", label: "Review 2 invoices on hold", by: "Finance Agent flagged" },
  { id: "slots", label: "Decide: open 12 more slots", by: "CEO Agent recommends yes" },
  { id: "brief", label: "Approve PO-0878 for part 2210", by: "Operations Agent drafted" },
  { id: "contract", label: "Sign renewed insurance certificate", by: "Administration Agent prepared" },
];

export const TODAY = [
  { time: "10:00", label: "Leadership sync" },
  { time: "13:30", label: "Hartwell Partners review" },
  { time: "16:00", label: "Vendor call" },
];

export const DEADLINES = [
  { label: "Payroll", due: "2 days", tone: "ok" as const },
  { label: "Quarterly tax filing", due: "9 days", tone: "ok" as const },
  { label: "License renewal", due: "21 days", tone: "warn" as const },
];

export interface Recommendation {
  id: string;
  tag: string;
  dept: DepartmentId | null;
  /** What the CEO Agent observed. Always has a number. */
  observation: string;
  /** What it recommends. */
  action: string;
}

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "capacity",
    tag: "Sales / Operations",
    dept: "operations",
    observation: "New inquiries are up 46% in six days. The schedule is 88% booked for three weeks. Operations can open 12 more slots.",
    action: "I recommend opening them before taking on more work.",
  },
  {
    id: "revenue",
    tag: "Revenue",
    dept: "sales",
    observation: "Revenue is at 58% of target with 8 working days left. Three deals worth $410,000 are each waiting on one signature. Closing them brings the month to 92%.",
    action: "I recommend you call these three today.",
  },
  {
    id: "service",
    tag: "Customer Service",
    dept: "service",
    observation: "After-hours reply time is up 31% this month. 64% of those messages are repeat questions.",
    action: "I recommend deploying a second Customer Service Agent for nights and weekends.",
  },
  {
    id: "finance",
    tag: "Finance",
    dept: "finance",
    observation: "Your finance team still spends about 18 hours a week reconciling documents by hand.",
    action: "This workflow can be automated. I recommend a Reconciliation Agent under Finance.",
  },
  {
    id: "scaling",
    tag: "Capacity",
    dept: "operations",
    observation: "The Operations Agent has been at 140% of capacity for three weeks. It reports it is becoming the bottleneck.",
    action: "I recommend adding Research and Execution specialists. Nothing changes until you approve.",
  },
  {
    id: "knowledge",
    tag: "Internal Knowledge",
    dept: "knowledge",
    observation: "Three departments asked the same 23 questions 212 times this month. Nine have no written answer.",
    action: "I recommend 40 minutes of your time to answer the nine. The Knowledge Agent will handle the rest.",
  },
  {
    id: "quotes",
    tag: "Sales",
    dept: "sales",
    observation: "14 quotes worth $864,000 have had no follow-up in 7 days. Your win rate halves after day five.",
    action: "I recommend the Sales Agent follow up all 14 today. Drafts are ready.",
  },
  {
    id: "approvals",
    tag: "Administration",
    dept: "administration",
    observation: "38 purchases are waiting on your approval. Typical wait is 2.3 days, and 31 of them are under $2,000.",
    action: "I recommend raising the auto-approve limit to $2,000, with a daily summary.",
  },
];

export const ALERTS = [
  { id: "cap", tone: "warn" as const, label: "Capacity at 88% and rising", detail: "New inquiries +46%, fulfillment unchanged" },
  { id: "inv", tone: "warn" as const, label: "2 invoices on hold", detail: "One duplicate. One vendor changed bank details" },
  { id: "ok", tone: "ok" as const, label: "Payroll funded", detail: "Runs Thursday" },
];

/**
 * The liveness script. One event about every 2.6 s, never two at once.
 * The HUD plays it on a loop; a Pause control stops it.
 */
export type HudEvent =
  | { type: "revenue"; add: number; note: string }
  | { type: "metric"; id: string; add: number }
  | { type: "activity"; dept: DepartmentId; line: string }
  | { type: "todo"; id: string }
  | { type: "recommend" };

export const HUD_SCRIPT: HudEvent[] = [
  { type: "activity", dept: "finance", line: "Reconciled 142 invoices. 2 on hold for you." },
  { type: "revenue", add: 1_240, note: "Payment received" },
  { type: "activity", dept: "sales", line: "Replied to 9 new inquiries. Median 3 min." },
  { type: "metric", id: "leads", add: 3 },
  { type: "todo", id: "contract" },
  { type: "activity", dept: "service", line: "Resolved 61 of 66 requests. 5 with a person." },
  { type: "recommend" },
  { type: "revenue", add: 1_460, note: "Invoice 4502 paid" },
  { type: "activity", dept: "operations", line: "Moved 2 jobs to Wednesday. Conflict cleared." },
  { type: "metric", id: "pipeline", add: 36_000 },
  { type: "activity", dept: "operations", line: "Reserved part 2210 for WO-341. Reorder drafted." },
  { type: "todo", id: "brief" },
  { type: "activity", dept: "knowledge", line: "Answered 38 internal questions." },
  { type: "recommend" },
  { type: "revenue", add: 980, note: "Payment received" },
  { type: "activity", dept: "administration", line: "Prepared 3 contracts for signature." },
  { type: "metric", id: "leads", add: 2 },
];

/** The three recommendations the To Do tab shows as cards, in order. The rest cycle on the agent. */
export const TODO_RECOMMENDATIONS = ["capacity", "revenue", "approvals"] as const;
