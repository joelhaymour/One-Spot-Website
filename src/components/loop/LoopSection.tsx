"use client";

import Link from "next/link";
import { LOOP } from "@/content/copy";
import { BEATS, BEAT_MOOD, DEPARTMENTS, DEPARTMENT_BY_ID, departmentHref } from "@/content/departments";
import { AgentSlot } from "@/components/agent/AgentSlot";
import { AgentSvg, Mark } from "@/components/agent/AgentSvg";
import { ScrollStory, useStory } from "@/components/motion/ScrollStory";
import { Arrow } from "@/components/ui/Button";
import { Bars } from "@/components/ui/Charts";
import { Dot, Panel, PanelHeader, ScanLine, StatusChip } from "@/components/ui/Panel";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Section";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";

/**
 * The loop, once, in miniature: one agent, five verbs, one small job from start to finish.
 * After this the visitor can read any department, because every department runs the same loop.
 */

const marketing = DEPARTMENT_BY_ID.marketing;

// Same campaigns and figures as the Marketing console this miniature leads into.
const CAMPAIGNS = [
  { name: "New Customer Offer", cpl: "$35.00", trend: "−6%", warn: false },
  { name: "Spring Promotion", cpl: "$58.10", trend: "+38%", warn: true },
  { name: "Refer a Friend", cpl: "$24.26", trend: "−9%", warn: false },
  { name: "Local Search", cpl: "$36.00", trend: "−3%", warn: false },
];

const ACTIONS = ["New concept drafted", "4 creative briefs ready for approval", "Launch scheduled across 3 channels"];

/** Phones: five small steps and only the active beat's words, so agent + console + beat fit one screen. */
function BeatsCompact() {
  const { step, goTo } = useStory();
  const b = LOOP.beats[step];
  return (
    <div>
      <ol className="flex gap-1.5" aria-label="The loop">
        {LOOP.beats.map((beat, i) => (
          <li key={beat.label} className="flex-1">
            <button type="button" onClick={() => goTo(i)} aria-current={i === step ? "step" : undefined} aria-label={beat.label} className="block h-10 w-full">
              <span className={cn("block h-[2px] w-full rounded-full transition-colors duration-500", i <= step ? "bg-[rgb(var(--accent-rgb))]" : "bg-[var(--line-strong)]")} />
            </button>
          </li>
        ))}
      </ol>
      <p className="text-[1.35rem] font-medium tracking-[-0.03em] text-[var(--text-0)]">{b.label}</p>
      <p className="t-body mt-1">{b.line}</p>
    </div>
  );
}

function Beats() {
  const { step, goTo } = useStory();
  return (
    <ol className="flex flex-col">
      {LOOP.beats.map((b, i) => {
        const active = i === step;
        return (
          <li key={b.label} className="border-t border-[var(--line)] first:border-t-0">
            <button
              type="button"
              onClick={() => goTo(i)}
              aria-current={active ? "step" : undefined}
              className="group flex w-full items-baseline gap-5 py-4 text-left md:py-5"
            >
              <span className={cn("t-label t-num w-6 transition-colors duration-500", active ? "text-[rgb(var(--accent-rgb))]" : "text-[var(--text-2)]")}>0{i + 1}</span>
              <span className="min-w-0">
                <span className={cn("block text-[clamp(1.25rem,2vw,1.75rem)] font-medium tracking-[-0.03em] transition-colors duration-500", active ? "text-[var(--text-0)]" : "text-[var(--text-2)] group-hover:text-[var(--text-1)]")}>
                  {b.label}
                </span>
                <span
                  className="grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out)]"
                  style={{ gridTemplateRows: active ? "1fr" : "0fr", opacity: active ? 1 : 0 }}
                >
                  <span className="overflow-hidden">
                    <span className="t-body block pt-1.5">{b.line}</span>
                  </span>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function MiniConsole({ step }: { step: number }) {
  const thinking = step >= 1;
  const acting = step >= 2;
  const learned = step >= 3;
  const reported = step >= 4;
  return (
    <Panel raised className="w-full max-w-[440px] overflow-hidden text-[12px]" active={step === 0}>
      <PanelHeader
        label="Marketing Agent / live"
        right={<StatusChip tone="accent">{BEATS[step].label}</StatusChip>}
      />
      <div className="relative px-3.5 pb-1">
        <ScanLine active={step === 0} />
        <ul>
          {CAMPAIGNS.map((c) => {
            const flagged = thinking && c.warn;
            return (
              <li key={c.name} className="flex items-center justify-between border-t border-[var(--line-faint)] py-2 first:border-t-0">
                <span className="flex items-center gap-2.5">
                  <Dot tone={flagged ? (learned ? "ok" : "warn") : "neutral"} />
                  <span className={cn("transition-colors duration-500", flagged ? "text-[var(--text-0)]" : "text-[var(--text-1)]")}>{c.name}</span>
                </span>
                <span className="t-num flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-[var(--text-1)]">{flagged && learned ? "$34.36" : c.cpl}</span>
                  <span className="w-10 text-right" style={{ color: flagged ? (learned ? "var(--ok)" : "var(--warn)") : "var(--text-2)" }}>
                    {flagged && learned ? "−41%" : c.trend}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="min-h-[58px] border-t border-[var(--line)] px-3.5 py-3">
        <div className="t-label !text-[9.5px]">Reasoning</div>
        <p className="mt-1.5 text-[12px] leading-snug text-[var(--text-0)]">
          <TypedText text="Spring Promotion costs 38% more per lead. Same audience, same offer. Cause: creative fatigue." active={thinking} speed={60} />
        </p>
      </div>

      <div className="grid grid-cols-[1fr_132px] border-t border-[var(--line)]">
        <ul className="px-3.5 py-3">
          {ACTIONS.map((a, i) => (
            <li
              key={a}
              className="flex items-center gap-2.5 py-1 transition-[opacity,transform] duration-500 ease-[var(--ease-out)]"
              style={{ opacity: acting ? 1 : 0.18, transform: acting ? "none" : "translateX(-6px)", transitionDelay: `${acting ? i * 160 : 0}ms` }}
            >
              <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 shrink-0" aria-hidden>
                <path d="M2 5.2 4.2 7.4 8 3" fill="none" stroke="rgb(var(--accent-rgb))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[var(--text-1)]">{a}</span>
            </li>
          ))}
        </ul>
        <div className="border-l border-[var(--line)] px-3 py-3">
          <div className="t-label !text-[9.5px]">Variations</div>
          <Bars data={[44, 39, 72, 35]} width={104} height={40} grown={learned} highlightIndex={learned ? 2 : null} className="mt-2" />
          <div className="mt-1 flex justify-between font-mono text-[9px] text-[var(--text-2)]">
            <span>A</span>
            <span>B</span>
            <span className={learned ? "text-[rgb(var(--accent-rgb))]" : undefined}>C</span>
            <span>D</span>
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-3 border-t border-[var(--line)] px-3.5 py-3 transition-opacity duration-700"
        style={{ opacity: reported ? 1 : 0.18, ["--accent-rgb" as string]: "var(--spot-rgb)" }}
      >
        <Mark size={16} className="text-[var(--text-0)]" />
        <span className="min-w-0">
          <span className="t-label block !text-[9.5px] text-[var(--text-0)]">Report received / CEO Agent</span>
          <span className="mt-1 block truncate text-[var(--text-1)]">
            {marketing.report.headline}. {marketing.report.detail}
          </span>
        </span>
      </div>
    </Panel>
  );
}

function Stage({ step }: { step: number }) {
  const beat = BEATS[step].id;
  return (
    <div
      className="mx-auto grid h-full w-full max-w-[1320px] items-center gap-8 px-[var(--gutter)] py-[calc(var(--nav-h)+12px)] md:grid-cols-[minmax(0,1fr)_minmax(200px,0.8fr)_minmax(0,1.15fr)] max-md:grid-cols-[minmax(0,1fr)] max-md:grid-rows-[auto_auto_auto] max-md:content-center max-md:gap-3"
      style={{ ["--accent" as string]: marketing.accent, ["--accent-rgb" as string]: marketing.accentRgb }}
    >
      <div className="max-md:order-3">
        <div className="max-md:hidden">
          <Beats />
        </div>
        <div className="md:hidden">
          <BeatsCompact />
        </div>
      </div>
      <div className="h-[min(58svh,520px)] max-md:order-1 max-md:h-[17svh]">
        <AgentSlot agent="marketing" mood={BEAT_MOOD[beat]} load={step === 2 ? 0.7 : 0} learnCount={step >= 3 ? 1 : 0} className="h-full w-full" />
      </div>
      <div className="flex min-w-0 justify-center max-md:order-2 md:justify-end">
        <MiniConsole step={step} />
      </div>
    </div>
  );
}

export function LoopSection({ index = "04" }: { index?: string }) {
  return (
    <section id="agents" className="relative" aria-labelledby="agents-heading">
      <div className="mx-auto max-w-[1320px] px-[var(--gutter)] pb-8 pt-28 md:pt-40">
        <SectionHeading eyebrow={LOOP.eyebrow} index={index} title={<span id="agents-heading">{LOOP.heading}</span>} lead={LOOP.lead} />
      </div>

      <ScrollStory steps={5} stepLength={0.7} tail={0.3} aria-label="One agent, one job, five steps">
        {({ step }) => <Stage step={step} />}
      </ScrollStory>

      <div className="mx-auto max-w-[1320px] px-[var(--gutter)] pb-28 pt-10 md:pb-40">
        <Reveal>
          <p className="t-label">Every department runs the same loop. Step inside one.</p>
        </Reveal>
        <ul className="mt-8 grid gap-px overflow-hidden rounded-[14px] border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
          {DEPARTMENTS.map((d, i) => (
            <li key={d.id} className="bg-[var(--void)]">
              <Reveal delay={i * 0.04} className="h-full">
                <Link
                  href={departmentHref(d.id)}
                  className="group flex h-full min-h-[190px] flex-col justify-between p-5 transition-colors duration-500 hover:bg-[rgba(var(--accent-rgb),0.045)]"
                  style={{ ["--accent-rgb" as string]: d.accentRgb }}
                >
                  <span className="flex items-start justify-between">
                    <span className="h-16 w-12" aria-hidden>
                      <AgentSvg agent={d.id} accent={d.accent} />
                    </span>
                    <Arrow className="mt-1 text-[var(--text-3)] transition-colors duration-300 group-hover:text-[rgb(var(--accent-rgb))]" />
                  </span>
                  <span>
                    <span className="block text-[1.05rem] font-medium tracking-[-0.02em] text-[var(--text-0)]">{d.agentName}</span>
                    <span className="mt-1.5 block text-[0.875rem] leading-snug text-[var(--text-2)]">{d.oneLiner}</span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
          <li className="flex min-h-[190px] flex-col justify-between bg-[var(--void)] p-5">
            <Mark size={26} className="text-[var(--text-2)]" />
            <span>
              <span className="block text-[1.05rem] font-medium tracking-[-0.02em] text-[var(--text-0)]">Your departments</span>
              <span className="mt-1.5 block text-[0.875rem] leading-snug text-[var(--text-2)]">These seven are an example. We design the agents around how your company is actually organised.</span>
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
