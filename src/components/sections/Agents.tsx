import type { CSSProperties } from "react";
import { AGENTS } from "@/content/site";
import { Split } from "@/components/motion/Split";
import { Icon, type IconName } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";
import { AgentDemo } from "./AgentDemo";

/** 05 · Agents, in plain English: a team member with one job, clear rules, and someone it answers to. */
export function Agents() {
  return (
    <section id="agents" aria-labelledby="agents-title" className="section on-night overflow-hidden">
      {/* a faint spot of light behind the demo */}
      <div aria-hidden className="pointer-events-none absolute -right-[20%] top-[8%] h-[900px] w-[900px] rounded-full [background:radial-gradient(circle,rgba(45,74,224,0.22),rgba(45,74,224,0)_60%)]" />

      <div className="wrap relative">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:gap-20">
          <div>
            <p className="t-eyebrow" data-reveal>
              {AGENTS.eyebrow}
            </p>
            <Split id="agents-title" lines={AGENTS.headline} className="t-h2 mt-6" />
            <p className="t-lead mt-8 max-w-[34rem]" data-reveal style={{ "--reveal-delay": "0.15s" } as CSSProperties}>
              {AGENTS.lead}
            </p>

            <ul className="mt-14 grid gap-x-10 gap-y-9 sm:grid-cols-2">
              {AGENTS.traits.map((t, i) => (
                <li key={t.title} data-reveal style={{ "--reveal-delay": `${0.1 + i * 0.08}s` } as CSSProperties}>
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--night-line)] bg-[var(--night-2)] text-[var(--spot-light)]">
                    <Icon name={t.icon as IconName} size={19} />
                  </span>
                  <p className="mt-4 text-[1.05rem] font-medium tracking-[-0.015em]">{t.title}</p>
                  <p className="t-body mt-1.5">{t.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:pt-10" data-reveal style={{ "--reveal-delay": "0.2s" } as CSSProperties}>
            <AgentDemo />
          </div>
        </div>

        <div className="mt-28 border-t border-[var(--night-line)] pt-14 lg:mt-36">
          <h3 className="t-h3" data-reveal>
            {AGENTS.rosterTitle}
          </h3>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AGENTS.roster.map((a, i) => (
              <li
                key={a.name}
                data-reveal
                style={{ "--reveal-delay": `${(i % 3) * 0.08}s`, "--hue": a.hue } as CSSProperties}
                className="group relative overflow-hidden rounded-[22px] border border-[var(--night-line)] bg-[var(--night-2)] p-6 transition-[border-color,transform] duration-500 ease-[var(--ease-out)] hover:-translate-y-1 hover:border-[rgba(255,255,255,0.18)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-0 transition-opacity duration-700 group-hover:opacity-100 [background:radial-gradient(circle,color-mix(in_srgb,var(--hue)_28%,transparent),transparent_65%)]"
                />
                <div className="relative flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--night-3)] text-[var(--night-text)]">
                    <Mark size={20} spot={a.hue} />
                  </span>
                  <p className="font-[family-name:var(--font-serif)] text-[1.75rem] leading-none tracking-[-0.015em]">{a.name}</p>
                </div>
                <dl className="relative mt-6 grid gap-4 text-[0.92rem] leading-[1.5]">
                  <div>
                    <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--night-text-3)]">Handles</dt>
                    <dd className="mt-1 text-[var(--night-text)]">{a.does}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--night-text-3)]">Checks with you</dt>
                    <dd className="mt-1 text-[var(--night-text-2)]">{a.asks}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
