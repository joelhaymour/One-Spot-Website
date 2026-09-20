import Link from "next/link";
import { BUSINESS } from "@/content/copy";
import { DEPARTMENTS, departmentHref } from "@/content/departments";
import { RECOMMENDATIONS } from "@/content/hud";
import { AgentSvg } from "@/components/agent/AgentSvg";
import { Arrow } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { StatusChip } from "@/components/ui/Panel";

/**
 * Phones: the display above is atmosphere (its type is too small to read at 360 px), so the two things
 * that matter are repeated here at native size: what the CEO Agent recommends, and the seven doors.
 * Hidden from md up, where the display itself is interactive.
 */
export function MobileBusiness() {
  const rec = RECOMMENDATIONS[0];
  return (
    <section className="px-[var(--gutter)] pb-24 pt-6 md:hidden" aria-labelledby="business-mobile">
      <Eyebrow>{BUSINESS.eyebrow}</Eyebrow>
      <h2 id="business-mobile" className="t-title mt-5">
        {BUSINESS.heading}
      </h2>
      <p className="t-lead mt-4">{BUSINESS.lead}</p>

      <div className="panel-raised mt-8 p-4">
        <div className="flex items-center justify-between">
          <span className="t-label text-[var(--text-0)]">CEO Agent / Recommendation</span>
          <span className="spot spot-breathe" />
        </div>
        <StatusChip tone="accent" className="mt-4">
          {rec.tag}
        </StatusChip>
        <p className="t-body mt-3">{rec.observation}</p>
        <p className="mt-2 text-[0.95rem] font-medium leading-snug text-[var(--text-0)]">{rec.action}</p>
      </div>

      <nav aria-label="Departments" className="mt-8">
        <ul className="flex flex-col">
          {DEPARTMENTS.map((d) => (
            <li key={d.id} className="border-t border-[var(--line)] last:border-b">
              <Link href={departmentHref(d.id)} className="group flex items-center gap-4 py-4" style={{ ["--accent-rgb" as string]: d.accentRgb }}>
                <span className="h-12 w-9 shrink-0" aria-hidden>
                  <AgentSvg agent={d.id} accent={d.accent} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[1rem] font-medium tracking-[-0.015em] text-[var(--text-0)]">{d.name}</span>
                  <span className="mt-0.5 block text-[0.85rem] leading-snug text-[var(--text-2)]">{d.tile.hover}</span>
                </span>
                <span className="text-right">
                  <span className="t-num block text-[0.95rem] text-[var(--text-0)]">{d.tile.metricValue}</span>
                  <span className="t-label mt-1 block !text-[9px]">{d.tile.metricLabel}</span>
                </span>
                <Arrow className="shrink-0 text-[var(--text-2)]" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
