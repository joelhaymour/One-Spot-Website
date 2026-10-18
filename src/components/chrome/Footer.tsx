import { FOOTER, NAV, NAV_CTA, SITE } from "@/content/site";
import { Mark } from "@/components/ui/Mark";
import { AnchorLink } from "@/components/ui/Button";

// Build-time constant, identical on server and client. Optional.
const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

const link = "text-[0.95rem] text-[var(--counter-text-2)] underline-offset-4 transition-colors duration-200 hover:text-[var(--counter-text)] hover:underline";

/** The shop counter the page ends on: the line we're for, the links, and the name, stamped large. */
export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[var(--counter)] text-[var(--counter-text)]">
      <div className="wrap grid gap-12 pb-12 pt-24 md:grid-cols-[1.5fr_1fr_1fr] md:gap-8">
        <div className="max-w-[30rem]">
          <p className="t-h2 text-[clamp(2.4rem,4.4vw,4rem)]">{FOOTER.statement}</p>
          <p className="mt-6 text-[1rem] leading-[1.6] text-[var(--counter-text-2)]">{FOOTER.line}</p>
        </div>
        <nav aria-label="Footer">
          <p className="t-label mb-5 text-[var(--counter-text)]">On this page</p>
          <ul className="grid gap-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <AnchorLink href={item.href} className={link}>
                  {item.label}
                </AnchorLink>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="t-label mb-5 text-[var(--counter-text)]">Get in touch</p>
          <ul className="grid gap-3">
            <li>
              <AnchorLink href={NAV_CTA.href} className={link}>
                Start with a conversation
              </AnchorLink>
            </li>
            {EMAIL && (
              <li>
                <a href={`mailto:${EMAIL}`} className={link}>
                  {EMAIL}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* The name, stamped across the counter. */}
      <div aria-hidden className="wrap select-none">
        <div className="flex items-end gap-[2.5vw] border-t border-[rgba(251,247,236,0.18)] pb-[3.4vw] pt-10 text-[var(--counter-text)] xl:pb-[48px]">
          <Mark size={120} spot="var(--spot-light)" className="h-[11vw] max-h-[150px] w-[11vw] max-w-[150px] shrink-0 translate-y-[-0.6vw]" />
          <span className="font-[family-name:var(--font-display)] text-[clamp(4.4rem,19vw,17rem)] font-black uppercase leading-[0.78] tracking-[0.005em]">One Spot</span>
        </div>
      </div>
      <div className="wrap flex flex-wrap items-center justify-between gap-4 pb-8 pt-2 text-[0.85rem] text-[var(--counter-text-2)]">
        <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
        <p>Consulting for small and mid-sized businesses.</p>
      </div>
    </footer>
  );
}
