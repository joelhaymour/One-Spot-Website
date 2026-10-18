"use client";

import { Fragment, useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type HTMLAttributes } from "react";
import { CONTACT } from "@/content/site";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icons";
import { clearPrefill, onPrefill } from "@/lib/prefill";
import {
  CONTACT_FIELDS,
  CONTACT_LIMITS,
  EMPTY_CONTACT,
  HONEYPOT_FIELD,
  isOptional,
  validateContact,
  validateField,
  type ContactErrors,
  type ContactExtras,
  type ContactField,
  type ContactKind,
  type ContactResponse,
  type ContactValues,
} from "./validate";

type Status = "idle" | "pending" | "success" | "error";

// Build-time constant, identical on server and client. Optional.
const DIRECT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

interface FieldSpec {
  field: ContactField;
  multiline?: boolean;
  type?: "text" | "email" | "url";
  autoComplete: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
}

const FIELD_SPECS: FieldSpec[] = [
  { field: "name", autoComplete: "name" },
  { field: "email", type: "email", autoComplete: "email", inputMode: "email" },
  { field: "company", autoComplete: "organization" },
  { field: "site", type: "url", autoComplete: "url", inputMode: "url" },
  { field: "stuck", multiline: true, autoComplete: "off", className: "sm:col-span-2" },
];

// 16px on phones so iOS does not zoom the page when a field takes focus.
const controlClass =
  "block w-full rounded-[4px] border-[1.5px] bg-[#fffdf7] px-4 text-[1rem] tracking-[-0.006em] text-[var(--ink)] caret-[var(--spot)] placeholder:text-[var(--ink-3)] transition-[border-color,background-color,box-shadow] duration-[var(--t-ui)] hover:border-[var(--ink-2)] focus:border-[var(--spot)] focus:shadow-[0_0_0_3px_rgba(45,74,224,0.18)] focus:outline-none read-only:opacity-60 autofill:shadow-[inset_0_0_0_100px_#fffdf7] autofill:[-webkit-text-fill-color:var(--ink)]";

interface FieldProps extends FieldSpec {
  id: string;
  extras: ContactExtras;
  value: string;
  error?: string;
  locked: boolean;
  onChange: (field: ContactField, value: string) => void;
  onBlur: (field: ContactField) => void;
}

function Field({ id, field, multiline, type = "text", autoComplete, inputMode, className, extras, value, error, locked, onChange, onBlur }: FieldProps) {
  const errorId = `${id}-error`;
  // A website redesign words two of the fields its own way.
  const website = extras.kind === "website" ? CONTACT.website : null;
  const label = (website?.fields as Partial<Record<ContactField, string>> | undefined)?.[field] ?? CONTACT.fields[field];
  const placeholder = (website?.placeholders as Partial<Record<ContactField, string>> | undefined)?.[field] ?? CONTACT.placeholders[field];
  const shared = {
    id,
    name: field,
    value,
    required: !isOptional(field, extras),
    readOnly: locked,
    maxLength: CONTACT_LIMITS[field],
    autoComplete,
    placeholder,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    onBlur: () => onBlur(field),
  };
  const tone = error ? "border-[var(--wait)]" : "border-[var(--line-strong)]";

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[0.85rem] font-medium text-[var(--ink-2)]">
        {label}
      </label>
      {multiline ? (
        <textarea {...shared} rows={4} onChange={(event) => onChange(field, event.target.value)} className={cn(controlClass, tone, "min-h-[7.5rem] resize-y py-3.5 leading-[1.5]")} />
      ) : (
        <input {...shared} type={type} inputMode={inputMode} onChange={(event) => onChange(field, event.target.value)} className={cn(controlClass, tone, "h-[3.25rem]")} />
      )}
      {error && (
        <p id={errorId} className="mt-2 text-[0.82rem] leading-[1.4] text-[var(--wait)]">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm() {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const receivedRef = useRef<HTMLHeadingElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  const [values, setValues] = useState<ContactValues>(EMPTY_CONTACT);
  const [kind, setKind] = useState<ContactKind>("general");
  const [changes, setChanges] = useState<string[]>([]);
  const extras: ContactExtras = { kind, changes: kind === "website" ? changes : [] };
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [busy, setBusy] = useState(false);
  const [proposal, setProposal] = useState<string | null>(null);
  const pending = status === "pending";

  useEffect(() => () => requestRef.current?.abort(), []);

  // "Talk these numbers through" on the calculator: their figures land in the help box, but only while
  // it's empty, and the form switches back to general help if it was on a website redesign.
  useEffect(
    () =>
      onPrefill((text) => {
        setValues((current) => (current.stuck.trim() ? current : { ...current, stuck: text }));
        setKind("general");
      }),
    [],
  );

  // The form is gone once it has sent; put keyboard and screen-reader focus on what replaced it.
  useEffect(() => {
    if (status === "success") receivedRef.current?.focus();
  }, [status]);

  const focusField = (field: ContactField) => formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();

  const onChange = (field: ContactField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: validateField(field, value, extras) ?? undefined }));
  };

  // Switching what it's about keeps what they've typed; only the messages tied to the other form go.
  const pickKind = (next: ContactKind) => {
    if (pending || next === kind) return;
    setKind(next);
    setErrors((current) => ({ ...current, site: undefined, stuck: undefined }));
  };

  const toggleChange = (option: string) => {
    if (pending) return;
    setChanges((current) => (current.includes(option) ? current.filter((c) => c !== option) : [...current, option]));
    // A ticked box is enough: the "tell us what to change" message no longer applies.
    setErrors((current) => (current.stuck ? { ...current, stuck: undefined } : current));
  };

  const onBlur = (field: ContactField) => {
    if (!values[field].trim()) return;
    setErrors((current) => ({ ...current, [field]: validateField(field, values[field], extras) ?? undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const found = validateContact(values, extras);
    setErrors(found);
    const firstInvalid = CONTACT_FIELDS.find((field) => found[field]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    const trap = new FormData(event.currentTarget).get(HONEYPOT_FIELD);
    const controller = new AbortController();
    requestRef.current = controller;
    setStatus("pending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ...extras, [HONEYPOT_FIELD]: typeof trap === "string" ? trap : "" }),
        signal: controller.signal,
      });
      const result = (await response.json().catch(() => null)) as ContactResponse | null;

      if (response.ok && result?.ok) {
        setProposal(typeof result.proposal === "string" ? result.proposal : null);
        clearPrefill();
        setStatus("success");
      } else if (response.status === 422 && result?.fields) {
        const fields = result.fields;
        setErrors(fields);
        setStatus("idle");
        const flagged = CONTACT_FIELDS.find((field) => fields[field]);
        if (flagged) focusField(flagged);
      } else {
        setBusy(response.status === 429);
        setStatus("error");
      }
    } catch {
      if (!controller.signal.aborted) setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="story-fade flex min-h-[26rem] flex-col justify-center gap-5">
        <span className="stamp stamp-press self-start px-3 py-1.5 text-[1.6rem] text-[var(--spot)]" style={{ "--stamp-rot": "rotate(-3deg)", transform: "rotate(-3deg)" } as CSSProperties}>
          {CONTACT.success.stamp}
        </span>
        <h3 ref={receivedRef} tabIndex={-1} aria-describedby={`${uid}-received`} className="t-h3 outline-none">
          {CONTACT.success.title}
        </h3>
        <p id={`${uid}-received`} className="t-lead max-w-[26rem]">
          {kind === "website" ? CONTACT.success.websiteBody : CONTACT.success.body}
        </p>
        {proposal ? <DemoOffer pass={proposal} /> : null}
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={pending} className="relative grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {/* what it's about: the business in general, or only a website redesign */}
      <div className="sm:col-span-2">
        <p id={`${uid}-kind`} className="mb-2 block text-[0.85rem] font-medium text-[var(--ink-2)]">
          {CONTACT.kinds.label}
        </p>
        <div role="radiogroup" aria-labelledby={`${uid}-kind`} className="grid grid-cols-2 border-[1.5px] border-[var(--ink)] text-[0.92rem] font-semibold">
          {CONTACT.kinds.options.map((option) => (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={kind === option.key}
              onClick={() => pickKind(option.key)}
              onKeyDown={(e) => {
                if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
                  e.preventDefault();
                  pickKind(kind === "general" ? "website" : "general");
                }
              }}
              tabIndex={kind === option.key ? 0 : -1}
              className={cn("py-2.5 transition-colors duration-[var(--t-ui)]", kind === option.key ? "bg-[var(--ink)] text-[var(--card)]" : "text-[var(--ink-2)] hover:bg-[var(--paper-2)]")}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {FIELD_SPECS.map((spec) => (
        <Fragment key={spec.field}>
          {/* a website redesign: the usual changes as boxes to tick, above the box for anything else */}
          {spec.field === "stuck" && kind === "website" ? (
            <fieldset className="story-fade sm:col-span-2">
              <legend className="mb-1 block text-[0.85rem] font-medium text-[var(--ink-2)]">{CONTACT.website.changes.label}</legend>
              <p className="mb-3 text-[0.82rem] text-[var(--ink-2)]">{CONTACT.website.changes.help}</p>
              <div className="grid border-t border-[var(--line-strong)] sm:grid-cols-2 sm:gap-x-5">
                {CONTACT.website.changes.options.map((option) => {
                  const on = changes.includes(option);
                  return (
                    <label
                      key={option}
                      className={cn(
                        "ruled flex cursor-pointer select-none items-center gap-2.5 px-1.5 py-2.5 text-[0.92rem] transition-[background-color,color,box-shadow] duration-[var(--t-ui)] has-[:focus-visible]:shadow-[inset_0_0_0_2px_rgba(45,74,224,0.5)]",
                        on ? "bg-[var(--carbon-canary)] text-[var(--ink)]" : "text-[var(--ink-2)] hover:bg-[var(--paper-2)]",
                      )}
                    >
                      <input type="checkbox" name="changes" value={option} checked={on} disabled={pending} onChange={() => toggleChange(option)} className="sr-only" />
                      <span aria-hidden className={cn("grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[3px] border-[1.5px] transition-colors duration-[var(--t-ui)]", on ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--card)]" : "border-[var(--ink-2)] bg-[#fffdf7] text-transparent")}>
                        <Icon name="check" size={12} strokeWidth={3} />
                      </span>
                      {option}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : null}
          <Field
            {...spec}
            id={`${uid}-${spec.field}`}
            extras={extras}
            value={values[spec.field]}
            error={errors[spec.field]}
            locked={pending}
            onChange={onChange}
            onBlur={onBlur}
          />
        </Fragment>
      ))}

      {/* Honeypot: off-screen rather than display:none, out of the tab order, hidden from assistive tech. */}
      <div aria-hidden className="pointer-events-none absolute -left-[200vw] top-0 h-px w-px overflow-hidden opacity-0">
        <label htmlFor={`${uid}-trap`}>Leave this field empty</label>
        <input id={`${uid}-trap`} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="flex flex-col gap-4 pt-2 sm:col-span-2 sm:flex-row sm:items-center sm:gap-6">
        <button type="submit" aria-disabled={pending} className="btn btn-primary min-w-[11rem] shrink-0 aria-disabled:pointer-events-none aria-disabled:opacity-60">
          {pending ? CONTACT.sending : CONTACT.submit}
          {!pending && <Icon name="arrow" size={17} strokeWidth={1.8} className="btn-arrow" />}
        </button>
        <div aria-live="polite" className="min-w-0 text-[0.85rem] leading-[1.45] text-[var(--wait)]">
          {status === "error" && (
            <p>
              {busy ? "Too many messages from this connection. Please try again in a few minutes." : CONTACT.error}
              {DIRECT_EMAIL && (
                <>
                  {" "}
                  Or email us at{" "}
                  <a href={`mailto:${DIRECT_EMAIL}`} className="text-[var(--ink)] underline underline-offset-4">
                    {DIRECT_EMAIL}
                  </a>
                  .
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

type OfferStatus = "idle" | "pending" | "error";

/**
 * After a general enquiry: "want a demo by tomorrow?" One click makes their quick questions (and emails
 * them the link), then opens them here. Their answers are what the demo is built from.
 */
function DemoOffer({ pass }: { pass: string }) {
  const [status, setStatus] = useState<OfferStatus>("idle");
  const pending = status === "pending";

  const open = async () => {
    if (pending) return;
    setStatus("pending");
    try {
      const response = await fetch("/api/contact/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass }),
      });
      const result = (await response.json().catch(() => null)) as { ok?: boolean; url?: string } | null;
      if (response.ok && result?.ok && result.url) {
        window.location.assign(result.url);
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mt-2 max-w-[30rem] rounded-[6px] border-2 border-[var(--ink)] bg-[var(--carbon-canary)] p-5">
      <p className="text-[1.05rem] font-medium text-[var(--ink)]">{CONTACT.demo.title}</p>
      <p className="mt-1.5 text-[0.95rem] leading-[1.5] text-[var(--ink-2)]">{CONTACT.demo.body}</p>
      <button type="button" onClick={open} aria-disabled={pending} className="btn btn-primary mt-4 aria-disabled:pointer-events-none aria-disabled:opacity-60">
        {pending ? CONTACT.demo.opening : CONTACT.demo.button}
        {!pending && <Icon name="arrow" size={17} strokeWidth={1.8} className="btn-arrow" />}
      </button>
      <p aria-live="polite" className="mt-3 text-[0.82rem] leading-[1.45] text-[var(--ink-3)]">
        {status === "error" ? <span className="text-[var(--wait)]">{CONTACT.demo.error}</span> : CONTACT.demo.emailed}
      </p>
    </div>
  );
}
