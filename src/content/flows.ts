import type { ToolName } from "./flows-tools";

/**
 * Three things that happen in every business, routed the way One Spot routes them. Each scenario follows
 * the same pattern: something happens -> One Spot finds the relevant information -> work moves between the
 * right systems -> One Spot connects the dots -> you receive one clear decision. Only the systems a
 * scenario names take part; the rest stay dimmed.
 *
 * The tool names are the eight tiles of the hero drawing (BEFORE_AFTER.tools in copy.ts).
 */

export interface FlowHop {
  /** Which tile lights up and is zoomed into. */
  tool: ToolName;
  /** What appears at the tile, line by line. Short, mono, the display's voice. */
  lines: readonly string[];
  /** The one-line result, in the log beside the drawing. */
  result: string;
  /** What the white dot carries when it leaves this tile (a small label riding with it). */
  carry?: string;
}

export interface FlowCheck {
  label: string;
  ok: boolean;
}

export interface FlowScenario {
  id: string;
  /** Short name on the rail. */
  title: string;
  /** What the visitor reads while the scenario plays. */
  summary: string;
  /** The tile where it starts, and the trigger that happens there (the first hop). */
  hops: readonly FlowHop[];
  /** One Spot connects the dots: what it holds up, in order, then what it recommends. */
  hub: { checks: readonly FlowCheck[]; recommendation: readonly string[] };
  /** The decision that reaches you. The first action is the primary one. */
  you: { actions: readonly string[] };
  /** After you approve: what One Spot coordinates without you (optional). */
  epilogue?: readonly FlowHop[];
}

export const FLOW_SCENARIOS: readonly FlowScenario[] = [
  {
    id: "new-job",
    title: "A new job comes in",
    summary:
      "A new job request arrives by email. One Spot captures the customer in CRM, checks that the required documents are there, confirms payment terms, checks the schedule and available resources, then gives you one simple decision.",
    hops: [
      { tool: "Email", lines: ["New email", "\u201cHi, we'd like to move ahead with the job\u2026\u201d"], result: "New job recognized", carry: "New job" },
      { tool: "CRM", lines: ["Customer found", "Job created", "Contact, value and owner captured"], result: "Customer found. Job created", carry: "Job details" },
      { tool: "Documents", lines: ["Quote received", "Signed agreement received", "Specifications received"], result: "All required documents received", carry: "Documents" },
      { tool: "Accounting", lines: ["Account clear", "Deposit received"], result: "Account clear. Deposit received", carry: "Payment" },
      { tool: "Calendar", lines: ["Schedule checked", "Team available", "Earliest opening: Tuesday"], result: "Earliest opening: Tuesday", carry: "Schedule" },
      { tool: "Spreadsheets", lines: ["Inventory checked", "Equipment checked", "Required resources available"], result: "Required resources available", carry: "Resources" },
    ],
    hub: {
      checks: [
        { label: "Customer", ok: true },
        { label: "Documents", ok: true },
        { label: "Payment", ok: true },
        { label: "Schedule", ok: true },
        { label: "Resources", ok: true },
      ],
      recommendation: ["Everything is ready to move forward.", "Earliest start: Tuesday."],
    },
    you: { actions: ["Approve & assign", "Review"] },
  },
  {
    id: "overdue-invoice",
    title: "A customer hasn't paid",
    summary:
      "Accounting notices an invoice is overdue. One Spot checks whether the customer has an unresolved issue, reviews the account relationship and recent communication, then tells you exactly what is happening and what should happen next.",
    hops: [
      { tool: "Accounting", lines: ["Invoice #1842", "$12,450", "18 days overdue"], result: "Invoice #1842 is 18 days overdue", carry: "Overdue payment" },
      { tool: "Support", lines: ["Open tickets searched", "No unresolved customer issues"], result: "No unresolved customer issues", carry: "No issues" },
      { tool: "CRM", lines: ["Account owner: Michael", "Customer since 2023", "4 previous jobs", "Good payment history"], result: "Good relationship. Account owner: Michael", carry: "Relationship" },
      { tool: "Email", lines: ["Recent communication checked", "No payment commitment", "No dispute found"], result: "No dispute found", carry: "No dispute" },
    ],
    hub: {
      checks: [
        { label: "18 days overdue", ok: false },
        { label: "No service issue", ok: true },
        { label: "No dispute", ok: true },
        { label: "Good customer relationship", ok: true },
        { label: "Account owner identified", ok: true },
      ],
      recommendation: ["Invoice #1842 is 18 days overdue.", "No issue is holding up payment.", "Have Michael follow up today."],
    },
    you: { actions: ["Notify Michael + send reminder", "Review"] },
    epilogue: [
      { tool: "Chat", lines: ["To Michael", "\u201cInvoice #1842 for ABC Company is 18 days overdue.", "No open service issues. Please follow up today.\u201d"], result: "Michael notified" },
      { tool: "Email", lines: ["Customer reminder prepared", "Ready to send"], result: "Reminder prepared" },
    ],
  },
  {
    id: "contract-renewal",
    title: "A contract renews Friday",
    summary:
      "Calendar sees that an important contract renews Friday. One Spot pulls the contract, checks the customer record and current pricing, notices that the updated pricing still hasn't been approved, and brings it to you before the deadline becomes a problem.",
    hops: [
      { tool: "Calendar", lines: ["ABC Company renewal", "Friday \u00b7 4 days"], result: "Contract renews Friday", carry: "Upcoming deadline" },
      { tool: "Documents", lines: ["Current contract found", "Renewal terms found"], result: "Contract and renewal terms found", carry: "Contract" },
      { tool: "CRM", lines: ["Active customer", "Account owner: Sarah", "3-year relationship"], result: "Active customer. Account owner: Sarah", carry: "Customer" },
      { tool: "Spreadsheets", lines: ["New pricing prepared", "Approval status: pending"], result: "New pricing prepared. Approval pending", carry: "Pricing" },
      { tool: "Accounting", lines: ["Margin checked", "Within target"], result: "Margin within target", carry: "Financial check" },
    ],
    hub: {
      checks: [
        { label: "Deadline: Friday", ok: true },
        { label: "Contract located", ok: true },
        { label: "Pricing prepared", ok: true },
        { label: "Financial check", ok: true },
        { label: "Approval", ok: false },
      ],
      recommendation: ["ABC Company's contract renews Friday.", "Updated pricing is ready but still needs your approval."],
    },
    you: { actions: ["Review pricing", "Approve", "Remind me tomorrow"] },
  },
];
