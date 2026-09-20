"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type HTMLAttributes } from "react";
import { CTA } from "@/content/copy";
import { Mark } from "@/components/agent/AgentSvg";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
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

const STATUS_LABEL: Record<Status, string> = {
  idle: "Four fields",
  pending: "Sending",
  success: "Received",
  error: "Not sent",
};

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
  "block w-full rounded-[10px] border bg-white/[0.025] px-4 text-[1rem] tracking-[-0.006em] text-[var(--text-0)] caret-[var(--spot)] transition-[border-color,background-color] duration-200 ease-[var(--ease-out)] hover:border-[var(--line-strong)] focus:border-white/40 focus:bg-white/[0.045] read-only:opacity-60 autofill:shadow-[inset_0_0_0_100px_var(--bg-2)] autofill:[-webkit-text-fill-color:var(--text-0)] md:text-[0.9375rem]";

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
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    onBlur: () => onBlur(field),
  };
  const tone = error ? "border-[var(--warn)]" : "border-[var(--line)]";

  return (
    <div className={className}>
      <label htmlFor={id} className="t-label mb-2.5 block leading-[1.4] text-[var(--text-1)]">
        {CTA.fields[field]}
      </label>
      {multiline ? (
        <textarea {...shared} rows={5} onChange={(event) => onChange(field, event.target.value)} className={cn(controlClass, tone, "min-h-[8.5rem] resize-y py-3 leading-[1.5]")} />
      ) : (
        <input {...shared} type={type} inputMode={inputMode} onChange={(event) => onChange(field, event.target.value)} className={cn(controlClass, tone, "h-12")} />
      )}
      {error && (
        <p id={errorId} className="mt-2 text-[0.8125rem] leading-[1.4] text-[var(--warn)]">
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
    // A flagged field clears as soon as it is right; untouched fields stay quiet until blur or submit.
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
        // 429: retrying now fails again, so say so plainly.
        setBusy(response.status === 429);
        setStatus("error");
      }
    } catch {
      if (!controller.signal.aborted) setStatus("error");
    }
  };

  return (
    <div className="panel-raised overflow-hidden">
      <div className="flex h-11 items-center justify-between gap-4 border-b border-[var(--line)] px-5 sm:px-7">
        <p className="flex items-center gap-2.5">
          <span className="spot" />
          <span className="t-label text-[var(--text-1)]">{CTA.button}</span>
        </p>
        <p className="t-label" style={status === "success" ? { color: "var(--ok)" } : status === "error" ? { color: "var(--warn)" } : undefined}>
          {STATUS_LABEL[status]}
        </p>
      </div>

      {status === "success" ? (
        <div className="rise-in flex min-h-[24rem] flex-col justify-center gap-5 p-6 sm:p-9">
          <Mark size={28} className="text-[var(--text-0)]" />
          <h3 ref={receivedRef} tabIndex={-1} aria-describedby={`${uid}-received`} className="t-title outline-none">
            {CTA.success.title}
          </h3>
          <p id={`${uid}-received`} className="t-lead max-w-[26rem]">
            {CTA.success.body}
          </p>
        </div>
      ) : (
        <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={pending} className="relative grid gap-x-4 gap-y-6 p-5 sm:grid-cols-2 sm:p-7">
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

          <div className="flex flex-col gap-4 pt-1 sm:col-span-2 sm:flex-row sm:items-center sm:gap-6">
            <Button type="submit" arrow={!pending} aria-disabled={pending} className="min-w-[12rem] shrink-0 aria-disabled:pointer-events-none aria-disabled:opacity-60">
              {pending ? STATUS_LABEL.pending : CTA.button}
            </Button>
            <div aria-live="polite" className="min-w-0 text-[0.8125rem] leading-[1.45] text-[var(--warn)]">
              {status === "error" && (
                <p>
                  {busy ? CTA.errorBusy : CTA.error}
                  {DIRECT_EMAIL && (
                    <>
                      {" "}
                      {CTA.errorDirect}{" "}
                      <a href={`mailto:${DIRECT_EMAIL}`} className="text-[var(--text-0)] underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-current">
                        {DIRECT_EMAIL}
                      </a>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
