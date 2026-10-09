/**
 * One set of rules for the enquiry form, shared by the browser (inline messages) and the route
 * handler (the check that counts). Pure: no DOM, no Node APIs.
 */

export const CONTACT_FIELDS = ["name", "email", "company", "site", "stuck"] as const;

export type ContactField = (typeof CONTACT_FIELDS)[number];
export type ContactValues = Record<ContactField, string>;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const EMPTY_CONTACT: ContactValues = { name: "", email: "", company: "", site: "", stuck: "" };

/** Fields people may leave empty. */
export const OPTIONAL_FIELDS: ReadonlySet<ContactField> = new Set(["site"]);

/** Characters, after trimming. */
export const CONTACT_LIMITS: Record<ContactField, number> = { name: 120, email: 254, company: 160, site: 200, stuck: 2000 };

/** A field people never see. Anything in it means a script filled the form. */
export const HONEYPOT_FIELD = "website";

export const MAX_BODY_BYTES = 10 * 1024;

export interface ContactResponse {
  ok: boolean;
  error?: string;
  fields?: ContactErrors;
  /** After sending: a signed pass for "proposal by tomorrow" (see /api/contact/proposal). */
  proposal?: string;
}

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const REQUIRED: Record<ContactField, string> = {
  name: "Add your name.",
  email: "Add an email address we can reply to.",
  company: "Add your company's name.",
  site: "",
  stuck: "Tell us what you'd like help with. One sentence is enough.",
};

/** A website address, roughly: a dot, no spaces. */
const SITE_SHAPE = /^(https?:\/\/)?[^\s.]+(\.[^\s.]+)+(\/\S*)?$/i;

export function validateField(field: ContactField, raw: string): string | null {
  const value = raw.trim();
  if (!value) return OPTIONAL_FIELDS.has(field) ? null : REQUIRED[field];
  if (value.length > CONTACT_LIMITS[field]) return `Keep this under ${CONTACT_LIMITS[field]} characters.`;
  if (field === "email" && !EMAIL_SHAPE.test(value)) return "That email address doesn't look complete.";
  if (field === "site" && !SITE_SHAPE.test(value)) return "That doesn't look like a website address, e.g. yourcompany.com.";
  return null;
}

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  for (const field of CONTACT_FIELDS) {
    const message = validateField(field, values[field]);
    if (message) errors[field] = message;
  }
  return errors;
}

/** Narrow an unknown JSON body to trimmed string fields. Returns null when the shape is wrong. */
export function readContact(input: unknown): { values: ContactValues; honeypot: string } | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return null;
  const record = input as Record<string, unknown>;
  const values = { ...EMPTY_CONTACT };
  for (const field of CONTACT_FIELDS) {
    const value = record[field];
    if (value !== undefined && typeof value !== "string") return null;
    values[field] = (value ?? "").trim();
  }
  const trap = record[HONEYPOT_FIELD];
  return { values, honeypot: typeof trap === "string" ? trap.trim() : trap == null ? "" : "filled" };
}
