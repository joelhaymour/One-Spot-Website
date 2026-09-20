/*
 * What the Knowledge console shows. One company, consistent with the story in content/departments.ts:
 * 4,180 documents from 7 sources, four versions of the warranty terms, 312 answers, 14 gaps, 2 drafts.
 */

export interface Source {
  name: string;
  where: string;
  /** Documents indexed once the agent has read everything. */
  docs: number;
  /** Indexed before this shift. The two unorganised sources had never been read. */
  before: number;
}

export const SOURCES: Source[] = [
  { name: "Policies", where: "Company documents", docs: 86, before: 84 },
  { name: "Procedures", where: "Operations manual", docs: 214, before: 209 },
  { name: "Contracts", where: "Signed agreements", docs: 342, before: 338 },
  { name: "Past projects", where: "Project folders", docs: 618, before: 611 },
  { name: "Shared drive", where: "Unsorted since 2019", docs: 1874, before: 0 },
  { name: "Email archive", where: "4 shared mailboxes", docs: 1022, before: 0 },
  { name: "Handbook", where: "Staff handbook", docs: 24, before: 24 },
];

export const TOTAL_DOCS = SOURCES.reduce((n, s) => n + s.docs, 0);
export const TOTAL_BEFORE = SOURCES.reduce((n, s) => n + s.before, 0);
/** What the two unread sources hold. */
export const UNREAD_DOCS = SOURCES.reduce((n, s) => n + (s.before === 0 ? s.docs : 0), 0);

/** Files nobody organised, and what each one turns out to be. */
export const UNSORTED_FILES = [
  { file: "scan_0042.pdf", path: "Shared drive / Misc / Scans", is: "Signed contract, Alder & Finch, 2024" },
  { file: "Warranty terms FINAL v2.docx", path: "Shared drive / Old", is: "Warranty wording from 2023" },
  { file: "Copy of price list (old).xlsx", path: "Shared drive / Sales", is: "Price list, replaced in 2025" },
  { file: "Re: warranty question", path: "Email archive / Support", is: "Warranty answer given by email, 2022" },
  { file: "handover notes - final.docx", path: "Shared drive / Projects", is: "Project handover procedure" },
  { file: "Untitled document (3)", path: "Shared drive / Misc", is: "Returns policy draft, never published" },
];

export interface WarrantyVersion {
  source: string;
  year: string;
  title: string;
  /** Warranty on refurbished units, as this version states it. */
  value: string;
  agrees: boolean;
  current?: boolean;
}

export const WARRANTY_VERSIONS: WarrantyVersion[] = [
  { source: "Policies", year: "2026", title: "Warranty policy 2026.pdf", value: "12 months", agrees: true, current: true },
  { source: "Handbook", year: "2024", title: "Staff handbook, section 6.2", value: "12 months", agrees: true },
  { source: "Shared drive", year: "2023", title: "Warranty terms FINAL v2.docx", value: "6 months", agrees: false },
  { source: "Email archive", year: "2022", title: "Re: warranty question", value: "90 days", agrees: false },
];

/** Answers already given today. Each one fits on a line. */
export const EARLIER_ANSWERS = [
  {
    who: "Lena",
    q: "Who signs off a discount above 10%?",
    a: "The sales manager. Above 20%, the owner.",
    source: "Pricing rules 2026, section 2",
    took: "2 s",
  },
  {
    who: "Marcus",
    q: "How much notice for annual leave?",
    a: "Ten working days, agreed with your manager.",
    source: "Staff handbook, section 4.1",
    took: "2 s",
  },
  {
    who: "Priya",
    q: "Where is the signed Alder & Finch contract?",
    a: "Contracts / 2024 / Alder & Finch, signed 14 March.",
    source: "Contracts",
    took: "4 s",
  },
  {
    who: "Tom",
    q: "A customer wants a refund after 30 days. What do we say?",
    a: "Offer store credit. A refund needs a manager.",
    source: "Returns policy 2026, section 1",
    took: "3 s",
  },
];

export const QUESTION = {
  initials: "TR",
  from: "Tom Reyes · Customer support · 10:42",
  text: "What is our warranty on refurbished units?",
  answer:
    "Refurbished units carry a 12-month warranty on parts and labour. New units carry 24 months. Claims need the original invoice.",
  source: "Warranty policy 2026 · section 3.2",
  took: "Answered in 3 s",
};

/** Questions answered this month before this shift's three. Ends on the 312 the owner sees on the HUD. */
export const ANSWERED_BEFORE = 309;

export interface AgentRequest {
  time: string;
  agent: string;
  asked: string;
  source: string;
  latency: string;
}

export const SERVED_EARLIER: AgentRequest[] = [
  { time: "08:52", agent: "Finance Agent", asked: "payment terms, Alder & Finch", source: "Contracts / 2024", latency: "41 ms" },
  { time: "09:08", agent: "Operations Agent", asked: "supplier lead times", source: "Procedures / Purchasing", latency: "38 ms" },
];

export const SERVED_NOW: AgentRequest[] = [
  { time: "09:26", agent: "Sales Agent", asked: "current pricing rule", source: "Pricing rules 2026, s. 2", latency: "36 ms" },
  { time: "09:26", agent: "Customer Service Agent", asked: "returns policy", source: "Returns policy 2026, s. 1", latency: "29 ms" },
];

export interface Gap {
  question: string;
  asked: number;
  /** Known before this shift. */
  known: boolean;
  /** The agent drafts an answer for an owner to approve. */
  drafted?: boolean;
}

export const GAPS: Gap[] = [
  { question: "Who covers reception on leave?", asked: 19, known: true, drafted: true },
  { question: "What if a supplier is late?", asked: 16, known: true, drafted: true },
  { question: "Can a customer pay monthly?", asked: 12, known: true },
  { question: "Who can approve overtime?", asked: 9, known: false },
  { question: "Where are signed forms filed?", asked: 7, known: false },
];

export const GAPS_BEFORE = 9;
export const GAPS_FOUND = 14;
export const DRAFTS_READY = 2;
export const DRAFT_NOTE = "2 drafts written from answers given in old email threads.";
