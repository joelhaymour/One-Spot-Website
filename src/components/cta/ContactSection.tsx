import { CTA } from "@/content/copy";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Section";
import { AgentMark } from "./AgentMark";
import { ContactForm } from "./ContactForm";

/**
 * The closing scene. The CEO Agent settles into the logo above the one sentence the whole film has
 * been leading to; the form sits beside it. tabIndex -1 so "/#contact" links can hand it focus.
 */
export function ContactSection() {
  return (
    <section
      id="contact"
      tabIndex={-1}
      aria-labelledby="contact-heading"
      className="relative border-t border-[var(--line-faint)] px-[var(--gutter)] pb-[clamp(88px,14svh,180px)] pt-[clamp(112px,18svh,220px)] outline-none"
    >
      <div className="mx-auto grid w-full max-w-[1320px] gap-x-[clamp(40px,7vw,128px)] gap-y-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,33rem)] lg:items-end">
        <div className="flex flex-col gap-7">
          <AgentMark className="mb-1" />
          <Reveal>
            <Eyebrow>{CTA.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 id="contact-heading" className="t-display max-w-[13ch]">
              {CTA.heading}
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="t-lead max-w-[34rem]">{CTA.lead}</p>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="t-body max-w-[30rem] border-l border-[var(--line-strong)] pl-4">{CTA.reassurance}</p>
          </Reveal>
        </div>

        <Reveal delay={0.2} y={24}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
