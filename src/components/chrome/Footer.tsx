import Link from "next/link";
import { HERO, NAV, SITE } from "@/content/copy";
import { DEPARTMENTS, departmentHref } from "@/content/departments";
import { Mark } from "@/components/agent/AgentSvg";
import { AnchorLink } from "./anchor";

const linkClass = "text-[0.875rem] tracking-[-0.006em] text-[var(--text-1)] transition-colors duration-200 hover:text-[var(--text-0)]";

/** Quiet close. Extra bottom padding keeps the fixed motion control off the last line. */
export function Footer() {
  return (
    <footer className="relative border-t border-[var(--line)] bg-[var(--bg-0)] px-[var(--gutter)] pb-24 pt-16 md:pt-20">
      <div className="mx-auto grid w-full max-w-[1320px] gap-x-12 gap-y-12 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex max-w-[24rem] flex-col gap-5">
          <Link href="/" aria-label={`${SITE.name}, home`} className="flex items-center gap-2.5 self-start text-[var(--text-0)]">
            <Mark size={22} />
            <span className="text-[0.9375rem] font-medium tracking-[-0.02em]">{SITE.name}</span>
          </Link>
          <p className="t-body">{SITE.footerTagline}</p>
          <p className="t-label text-[var(--text-2)]">{SITE.footerLine}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="t-label mb-5">Site</h2>
          <ul className="flex flex-col gap-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <AnchorLink href={item.href} className={linkClass}>
                  {item.label}
                </AnchorLink>
              </li>
            ))}
            <li>
              <AnchorLink href="/#contact" className={linkClass}>
                {SITE.action}
              </AnchorLink>
            </li>
          </ul>
        </nav>

        <nav aria-label="Departments">
          <h2 className="t-label mb-5">Departments</h2>
          <ul className="flex flex-col gap-3">
            {DEPARTMENTS.map((department) => (
              <li key={department.id}>
                <Link href={departmentHref(department.id)} className={linkClass}>
                  {department.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto mt-16 flex w-full max-w-[1320px] items-center justify-between gap-6 border-t border-[var(--line-faint)] pt-6">
        {/* No year: a date computed at render would differ between the static HTML and a later hydrate. */}
        <p className="t-label">&copy; {SITE.name}</p>
        <p className="t-label hidden sm:block">{HERO.eyebrow}</p>
      </div>
    </footer>
  );
}
