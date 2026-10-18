import type { CSSProperties } from "react";
import { CONTACT } from "@/content/site";
import { Split } from "@/components/motion/Split";
import { ContactForm } from "./ContactForm";

/** 05 · The close: a ticket of their own to fill in. We do our homework before we talk. */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="section border-t-2 border-[var(--ink)] bg-[var(--paper-2)]">
      <div className="wrap relative grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-20">
        <div>
          <Split id="contact-title" lines={CONTACT.headline} className="t-h2" />
          <p className="t-lead mt-8 max-w-[32rem] text-[var(--ink)]" data-reveal style={{ "--reveal-delay": "0.1s" } as CSSProperties}>
            {CONTACT.lead}
          </p>

          <ol className="mt-12 grid max-w-[34rem] border-t-2 border-[var(--ink)]">
            {CONTACT.next.map((step, i) => (
              <li key={step.title} className="ruled flex gap-4 py-4" data-reveal style={{ "--reveal-delay": `${0.15 + i * 0.06}s` } as CSSProperties}>
                <span className="t-num grid h-8 w-8 shrink-0 place-items-center rounded-[4px] border-2 border-[var(--ink)] font-[family-name:var(--font-display)] text-[1rem] font-black">{i + 1}</span>
                <p className="pt-0.5 text-[1rem] leading-[1.5]">
                  <span className="font-semibold text-[var(--ink)]">{step.title}.</span> <span className="text-[var(--ink-2)]">{step.body}</span>
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="ticket px-5 pb-6 pt-6 sm:px-8 sm:pb-8" data-reveal style={{ "--reveal-delay": "0.15s" } as CSSProperties}>
          <div className="mb-6 flex items-baseline justify-between border-b-2 border-[var(--ink)] pb-2">
            <span className="t-label">{CONTACT.ticket}</span>
            <span className="t-label text-[var(--ink-3)]">{CONTACT.ticketNote}</span>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
