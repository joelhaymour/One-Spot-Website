import type { CSSProperties } from "react";
import { CONTACT } from "@/content/site";
import { Split } from "@/components/motion/Split";
import { ContactForm } from "./ContactForm";

/** 05 · The close. Tell us where it feels manual; we do our homework before we talk. */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="relative overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--paper-2)] sm:rounded-[40px]">

        <div className="wrap relative grid gap-14 py-[clamp(72px,10vw,144px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-20">
          <div>
            <Split id="contact-title" lines={CONTACT.headline} className="t-h2" />
            <p className="t-lead mt-8 max-w-[32rem]" data-reveal style={{ "--reveal-delay": "0.15s" } as CSSProperties}>
              {CONTACT.lead}
            </p>

            <ol className="mt-12 grid gap-5">
              {CONTACT.next.map((step, i) => (
                <li key={step.title} className="flex gap-4" data-reveal style={{ "--reveal-delay": `${0.2 + i * 0.08}s` } as CSSProperties}>
                  <span className="t-num grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--line-strong)] bg-[var(--card)] text-[0.78rem] text-[var(--ink-2)]">{i + 1}</span>
                  <p className="pt-1 text-[1rem] leading-[1.5]">
                    <span className="font-medium text-[var(--ink)]">{step.title}.</span> <span className="text-[var(--ink-2)]">{step.body}</span>
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-[26px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-lift)] sm:p-8" data-reveal style={{ "--reveal-delay": "0.2s" } as CSSProperties}>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
