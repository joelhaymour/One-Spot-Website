"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type HTMLAttributes } from "react";
import { CONTACT } from "@/content/site";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icons";
import {
  CONTACT_FIELDS,
  CONTACT_LIMITS,
  EMPTY_CONTACT,
  HONEYPOT_FIELD,
  validateContact,
  validateField,
  type ContactErrors,
  type ContactField,
  type ContactResponse,
  type ContactValues,
} from "./validate";

type Status = "idle" | "pending" | "success" | "error";

// Build-time constant, identical on server and client. Optional.
const DIRECT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

interface FieldSpec {
  field: ContactField;
  multiline?: boolean;
  type?: "text" | "email";
  autoComplete: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
}

const FIELD_SPECS: FieldSpec[] = [
  { field: "name", autoComplete: "name" },
  { field: "email", type: "email", autoComplete: "email", inputMode: "email" },
  { field: "company", autoComplete: "organization", className: "sm:col-span-2" },
  { field: "stuck", multiline: true, autoComplete: "off", className: "sm:col-span-2" },
];

// 16px on phones so iOS does not zoom the page when a field takes focus.
const controlClass =
  "block w-full rounded-2xl border bg-[var(--paper)] px-4 text-[1rem] tracking-[-0.006em] text-[var(--ink)] caret-[var(--spot)] placeholder:text-[var(--ink-4)] transition-[border-color,background-color,box-shadow] duration-300 hover:border-[var(--ink-4)] focus:border-[var(--spot)] focus:bg-[var(--card)] focus:shadow-[0_0_0_4px_rgba(45,74,224,0.12)] focus:outline-none read-only:opacity-60 autofill:shadow-[inset_0_0_0_100px_var(--card)] autofill:[-webkit-text-fill-color:var(--ink)]";

interface FieldProps extends FieldSpec {
  id: string;
  value: string;
  error?: string;
  locked: boolean;
  onChange: (field: ContactField, value: string) => void;
  onBlur: (field: ContactField) => void;
}

function Field({ id, field, multiline, type = "text", autoComplete, inputMode, className, value, error, locked, onChange, onBlur }: FieldProps) {
  const errorId = `${id}-error`;
  const shared = {
    id,
    name: field,
    value,
    required: true,
    readOnly: locked,
    maxLength: CONTACT_LIMITS[field],
    autoComplete,
    placeholder: CONTACT.placeholders[field],
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    onBlur: () => onBlur(field),
  };
  const tone = error ? "border-[var(--wait)]" : "border-[var(--line-strong)]";

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[0.85rem] font-medium text-[var(--ink-2)]">
        {CONTACT.fields[field]}
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
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [busy, setBusy] = useState(false);
  const pending = status === "pending";

  useEffect(() => () => requestRef.current?.abort(), []);

  // The form is gone once it has sent; put keyboard and screen-reader focus on what replaced it.
  useEffect(() => {
    if (status === "success") receivedRef.current?.focus();
  }, [status]);

  const focusField = (field: ContactField) => formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();

  const onChange = (field: ContactField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: validateField(field, value) ?? undefined }));
  };

  const onBlur = (field: ContactField) => {
    if (!values[field].trim()) return;
    setErrors((current) => ({ ...current, [field]: validateField(field, values[field]) ?? undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const found = validateContact(values);
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
        body: JSON.stringify({ ...values, [HONEYPOT_FIELD]: typeof trap === "string" ? trap : "" }),
        signal: controller.signal,
      });
      const result = (await response.json().catch(() => null)) as ContactResponse | null;

      if (response.ok && result?.ok) {
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
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--done)] text-white">
          <Icon name="check" size={22} strokeWidth={2.4} />
        </span>
        <h3 ref={receivedRef} tabIndex={-1} aria-describedby={`${uid}-received`} className="t-h3 outline-none">
          {CONTACT.success.title}
        </h3>
        <p id={`${uid}-received`} className="t-lead max-w-[26rem]">
          {CONTACT.success.body}
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={pending} className="relative grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {FIELD_SPECS.map((spec) => (
        <Field
          key={spec.field}
          {...spec}
          id={`${uid}-${spec.field}`}
          value={values[spec.field]}
          error={errors[spec.field]}
          locked={pending}
          onChange={onChange}
          onBlur={onBlur}
        />
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
