import { FOOTER, HERO, NAV, NAV_CTA, SITE } from "@/content/site";
import { Mark } from "@/components/ui/Mark";
import { AnchorLink } from "@/components/ui/Button";

// Build-time constant, identical on server and client. Optional.
const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--line)] bg-[var(--paper)]">
      <div className="wrap grid gap-12 pb-10 pt-20 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8">
        <div className="max-w-[26rem]">
          <p className="t-h3">
            {HERO.headline[0]} <em>{HERO.headline[1]}</em>
          </p>
          <p className="t-body mt-5">{FOOTER.line}</p>
        </div>
        <nav aria-label="Footer">
          <p className="t-small mb-4 font-medium text-[var(--ink)]">On this page</p>
          <ul className="grid gap-2.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <AnchorLink href={item.href} className="text-[0.95rem] text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]">
                  {item.label}
                </AnchorLink>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="t-small mb-4 font-medium text-[var(--ink)]">Get in touch</p>
          <ul className="grid gap-2.5">
            <li>
              <AnchorLink href={NAV_CTA.href} className="text-[0.95rem] text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]">
                Start with a conversation
              </AnchorLink>
            </li>
            {EMAIL && (
              <li>
                <a href={`mailto:${EMAIL}`} className="text-[0.95rem] text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]">
                  {EMAIL}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* The oversized wordmark: the page signs off with the name. */}
      <div aria-hidden className="wrap select-none">
        <div className="flex items-end gap-[2.5vw] border-t border-[var(--line)] pb-[4.2vw] pt-8 text-[var(--ink)] xl:pb-[60px]">
          <Mark size={120} className="h-[12vw] max-h-[168px] w-[12vw] max-w-[168px] shrink-0 translate-y-[-1.2vw]" />
          <span className="text-[clamp(4rem,17vw,15.5rem)] font-[650] leading-[0.8] tracking-[-0.06em]">One Spot</span>
        </div>
      </div>
      <div className="wrap flex flex-wrap items-center justify-between gap-4 py-8 text-[0.85rem] text-[var(--ink-3)]">
        <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
        <p>Made for businesses with more tools than time.</p>
      </div>
    </footer>
  );
}
