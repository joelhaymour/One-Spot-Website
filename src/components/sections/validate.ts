/**
 * One set of rules for the enquiry form, shared by the browser (inline messages) and the route
 * handler (the check that counts). Pure: no DOM, no Node APIs.
 */

import { CONTACT } from "@/content/site";

export const CONTACT_FIELDS = ["name", "email", "company", "site", "stuck"] as const;

export type ContactField = (typeof CONTACT_FIELDS)[number];
export type ContactValues = Record<ContactField, string>;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const EMPTY_CONTACT: ContactValues = { name: "", email: "", company: "", site: "", stuck: "" };

/**
 * What the enquiry is about. "website" is someone who only wants their website redesigned: the form then
 * needs the site's address, and offers boxes to tick for the usual changes.
 */
export type ContactKind = "general" | "website";

/** The boxes on the website form. Only these are accepted from a request. */
export const WEBSITE_CHANGES: readonly string[] = CONTACT.website.changes.options;

/** The parts of an enquiry that aren't typed text. */
export interface ContactExtras {
  kind: ContactKind;
  changes: string[];
}
export const EMPTY_EXTRAS: ContactExtras = { kind: "general", changes: [] };

/**
 * Fields people may leave empty. A general enquiry can skip the website; a website redesign can skip the
 * text box as long as a box is ticked.
 */
export function isOptional(field: ContactField, extras: ContactExtras = EMPTY_EXTRAS): boolean {
  if (extras.kind === "website") return field === "stuck" && extras.changes.length > 0;
  return field === "site";
}

/** Characters, after trimming. */
export const CONTACT_LIMITS: Record<ContactField, number> = { name: 120, email: 254, company: 160, site: 200, stuck: 2000 };

/** A field people never see. Anything in it means a script filled the form. */
export const HONEYPOT_FIELD = "website";

export const MAX_BODY_BYTES = 10 * 1024;

export interface ContactResponse {
  ok: boolean;
  error?: string;
  fields?: ContactErrors;
  /** After a general enquiry: a signed pass for "a demo by tomorrow" (see /api/contact/proposal). */
  proposal?: string;
}

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const REQUIRED: Record<ContactField, string> = {
  name: "Add your name.",
  email: "Add an email address we can reply to.",
  company: "Add your company's name.",
  site: "Add your website's address, so we can take a look.",
  stuck: "Tell us what you'd like help with. One sentence is enough.",
};
const REQUIRED_WEBSITE_STUCK = "Tick a box above, or tell us what you'd like to change.";

/** A website address, roughly: a dot, no spaces. */
const SITE_SHAPE = /^(https?:\/\/)?[^\s.]+(\.[^\s.]+)+(\/\S*)?$/i;

export function validateField(field: ContactField, raw: string, extras: ContactExtras = EMPTY_EXTRAS): string | null {
  const value = raw.trim();
  if (!value) {
    if (isOptional(field, extras)) return null;
    return field === "stuck" && extras.kind === "website" ? REQUIRED_WEBSITE_STUCK : REQUIRED[field];
  }
  if (value.length > CONTACT_LIMITS[field]) return `Keep this under ${CONTACT_LIMITS[field]} characters.`;
  if (field === "email" && !EMAIL_SHAPE.test(value)) return "That email address doesn't look complete.";
  if (field === "site" && !SITE_SHAPE.test(value)) return "That doesn't look like a website address, e.g. yourcompany.com.";
  return null;
}

export function validateContact(values: ContactValues, extras: ContactExtras = EMPTY_EXTRAS): ContactErrors {
  const errors: ContactErrors = {};
  for (const field of CONTACT_FIELDS) {
    const message = validateField(field, values[field], extras);
    if (message) errors[field] = message;
  }
  return errors;
}

/** Narrow an unknown JSON body to trimmed string fields. Returns null when the shape is wrong. */
export function readContact(input: unknown): { values: ContactValues; extras: ContactExtras; honeypot: string } | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return null;
  const record = input as Record<string, unknown>;
  const values = { ...EMPTY_CONTACT };
  for (const field of CONTACT_FIELDS) {
    const value = record[field];
    if (value !== undefined && typeof value !== "string") return null;
    values[field] = (value ?? "").trim();
  }
  // Anything but "website" is a general enquiry; only the boxes we offer are kept, each once.
  const kind: ContactKind = record.kind === "website" ? "website" : "general";
  const ticked = Array.isArray(record.changes) ? record.changes : [];
  const changes = kind === "website" ? WEBSITE_CHANGES.filter((option) => ticked.includes(option)) : [];
  const trap = record[HONEYPOT_FIELD];
  return { values, extras: { kind, changes }, honeypot: typeof trap === "string" ? trap.trim() : trap == null ? "" : "filled" };
}
