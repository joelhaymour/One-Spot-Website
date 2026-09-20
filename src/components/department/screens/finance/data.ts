/**
 * The Finance console's week. Numbers agree with content/departments.ts and content/hud.ts:
 * 214 documents, 142 already reconciled when the shift starts, 212 matched and 2 held when it ends.
 * Amounts are pre-formatted strings so server and client markup can never disagree.
 */

export const WEEK = {
  received: 214,
  sources: [
    { label: "Email", count: 96 },
    { label: "Upload", count: 41 },
    { label: "Accounting", count: 77 },
  ],
  matchedAtStart: 142,
  matchedAtEnd: 212,
  held: 2,
} as const;

/** What happens to a document during the shift. */
export type DocFate = "duplicate" | "bank" | "match" | "settled";

export interface DocRow {
  vendor: string;
  doc: string;
  date: string;
  source: "Email" | "Upload" | "Accounting";
  amount: string;
  /** Transaction or purchase order it reconciles to, or the reason it is held. */
  match: string;
  fate: DocFate;
}

export const DOCS: DocRow[] = [
  { vendor: "Northgate Technical", doc: "Invoice 4471", date: "20 Oct", source: "Email", amount: "$8,420.50", match: "Duplicate of 4398", fate: "duplicate" },
  { vendor: "Alder Freight", doc: "Invoice 2093", date: "20 Oct", source: "Email", amount: "$3,150.00", match: "Bank details changed", fate: "bank" },
  { vendor: "City Power and Water", doc: "Statement OCT", date: "20 Oct", source: "Accounting", amount: "$1,284.60", match: "Bank · 20 Oct", fate: "match" },
  { vendor: "Harbour Print", doc: "Invoice 7718", date: "19 Oct", source: "Upload", amount: "$642.00", match: "PO-1179", fate: "match" },
  { vendor: "Corner Cafe", doc: "Receipt R-5521", date: "19 Oct", source: "Upload", amount: "$48.90", match: "Card · 19 Oct", fate: "match" },
  { vendor: "Meadow Office Supplies", doc: "Invoice 3302", date: "19 Oct", source: "Email", amount: "$1,096.35", match: "PO-1182", fate: "match" },
  { vendor: "Business card account", doc: "Statement 10-B", date: "18 Oct", source: "Accounting", amount: "$6,204.77", match: "41 card lines", fate: "match" },
  { vendor: "Ridgeway Couriers", doc: "Receipt R-5519", date: "18 Oct", source: "Upload", amount: "$126.40", match: "Card · 18 Oct", fate: "match" },
  { vendor: "Summit Cover", doc: "Invoice 9120", date: "17 Oct", source: "Email", amount: "$2,310.00", match: "Bank · 17 Oct", fate: "settled" },
  { vendor: "Kestrel Software", doc: "Invoice 1203", date: "17 Oct", source: "Accounting", amount: "$499.00", match: "Card · 17 Oct", fate: "settled" },
];

/** The invoice the agent opens. It matches its purchase order exactly, which is why the duplicate is easy to miss. */
export const INVOICE = {
  vendor: "Northgate Technical",
  address: "14 Foundry Lane",
  number: "4471",
  billTo: "Meridian & Co.",
  date: "20 Oct",
  terms: "Net 30",
  po: "PO-1164",
  lines: [
    { label: "Quarterly service", amount: "4,200.00" },
    { label: "Replacement parts x 6", amount: "2,055.00" },
    { label: "Call-out, labour 8 h", amount: "1,400.00" },
  ],
  subtotal: "7,655.00",
  tax: "765.50",
  total: "$8,420.50",
} as const;

export type FieldId = "vendor" | "number" | "date" | "terms" | "po" | "lines" | "total";

/** Extraction order: the order a careful person reads an invoice in. */
export const FIELDS: { id: FieldId; label: string; value: string }[] = [
  { id: "vendor", label: "Vendor", value: INVOICE.vendor },
  { id: "number", label: "Invoice", value: INVOICE.number },
  { id: "date", label: "Date", value: INVOICE.date },
  { id: "terms", label: "Terms", value: INVOICE.terms },
  { id: "po", label: "Order", value: INVOICE.po },
  { id: "lines", label: "Lines", value: "3 lines, 7,655.00" },
  { id: "total", label: "Total", value: INVOICE.total },
];

/** ms between one field being read and the next. */
export const FIELD_STAGGER = 380;

export const CHECKS = [
  {
    id: "duplicate",
    label: "Duplicates",
    clear: "None in 142 documents read",
    flag: "Duplicates invoice 4398",
    detail: "Invoice 4471",
  },
  {
    id: "bank",
    label: "Vendor details",
    clear: "No changes in 30 days",
    flag: "Vendor bank details changed 1 day ago",
    detail: "Invoice 2093",
  },
] as const;

/** Month-end pack. `source` is what the section is built from; `detail` and `value` exist once it is assembled. */
export const PACK = [
  { id: "pl", label: "Profit and loss", source: "From the ledger and this month's documents", detail: "Revenue $1.14M · costs $0.98M", value: "$162,300" },
  { id: "cash", label: "Cash position", source: "From 3 bank accounts", detail: "3 accounts, agreed to statements", value: "$2.34M" },
  { id: "ar", label: "Overdue receivables", source: "From open customer invoices", detail: "9 customers · oldest 47 days", value: "$86,200" },
] as const;

/** 13 weeks of cash, $M. Naive assumes invoices are paid on the due date. Learned shifts receipts 11 days. */
export const FORECAST = {
  naive: [2.41, 2.46, 2.38, 2.44, 2.52, 2.47, 2.55, 2.61, 2.58, 2.66, 2.72, 2.7, 2.78],
  learned: [2.41, 2.33, 2.19, 2.08, 1.96, 1.88, 1.79, 1.92, 2.05, 2.14, 2.27, 2.36, 2.49],
  naiveLow: { week: 3, value: 2_380_000 },
  learnedLow: { week: 7, value: 1_790_000, label: "$1.79M" },
  reserve: 1.5,
  domain: [1.35, 2.9] as [number, number],
} as const;
