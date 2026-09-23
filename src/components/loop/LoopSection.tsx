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
 * The job is universal and operational (a new work order) so any owner recognises it; the Hub shows
 * the business, the digital workforce does the work inside it. After this the visitor can read any
 * department, because every department runs the same loop.
 */

const operations = DEPARTMENT_BY_ID.operations;

/*
 * Demonstration strings, written locally in the deck's voice. Candidates for copy.ts (LOOP.demo);
 * the integrator decides whether to hoist them.
 */

/** The work-order table. The top row is the one that just arrived. */
const ORDERS = [
  { id: "WO-341", site: "Hartwell site · requested this week", status: "new", fresh: true },
  { id: "WO-340", site: "Marsh Lane", status: "scheduled Thu", fresh: false },
  { id: "WO-339", site: "Northgate depot", status: "in progress", fresh: false },
  { id: "WO-338", site: "Alder Farm", status: "done · to invoice", fresh: false },
];

/** What the new row says as the job moves: new (observes), checking (thinks), scheduled (acts onward). */
const FRESH_STATUS = ["new", "checking", "scheduled Wed"];

/** What the agent checked before deciding: stock, crew, date. */
const CHECKS = [
  { what: "Stock 2210", value: "18" },
  { what: "Team B", value: "free Wed" },
  { what: "Requested", value: "this week" },
];

const REASONING = "Part 2210 in stock: 18. Team B free Wednesday. Customer asked for this week.";
const LEARNED = "Part 2210 runs low every 6 weeks. Reorder point raised, order drafted.";

const ACTIONS = ["Team B scheduled Wednesday", "Part 2210 reserved", "Customer confirmed. Job status updated"];

/** Stock of part 2210, week by week: it runs out every six weeks. */
const STOCK_LABEL = "Part 2210 · stock";
const STOCK = [14, 11, 9, 6, 4, 0];
const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6"];
const REORDER = { was: 2, raised: 6, label: "Reorder" };
const CHART = { width: 104, height: 40 };
const STOCK_MAX = Math.max(...STOCK);
/** y (px from the chart's top) of a stock level, on the same scale Bars draws. */
const levelTop = (v: number) => CHART.height - (v / STOCK_MAX) * CHART.height;

const REPORT = { label: "Report received / Hub", line: "WO-341 scheduled Wednesday. Nothing needs you." };

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

/**
 * The Operations Agent's console, in miniature. One work order arrives, is checked, scheduled,
 * turned into a lesson, and reported to the Hub. Every state derives from `step`, so it reverses.
 */
function MiniConsole({ step }: { step: number }) {
  const thinking = step >= 1;
  const acting = step >= 2;
  const learned = step >= 3;
  const reported = step >= 4;
  const freshStatus = FRESH_STATUS[Math.min(step, FRESH_STATUS.length - 1)];
  const freshTone = acting ? "ok" : thinking ? "accent" : "neutral";
  const freshColor = acting ? "var(--ok)" : thinking ? "rgb(var(--accent-rgb))" : "var(--text-1)";
  const reorderShift = levelTop(REORDER.was) - levelTop(REORDER.raised);
  return (
    <Panel raised className="w-full max-w-[440px] overflow-hidden text-[12px]" active={step === 0}>
      <PanelHeader
        label={`${operations.agentName} / live`}
        right={<StatusChip tone="accent">{BEATS[step].label}</StatusChip>}
      />
      <div className="relative px-3.5 pb-1">
        <ScanLine active={step === 0} />
        <ul aria-label="Work orders">
          {ORDERS.map((o) => {
            const lit = o.fresh && thinking;
            return (
              <li key={o.id} className="border-t border-[var(--line-faint)] py-2 first:border-t-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Dot tone={o.fresh ? freshTone : "neutral"} />
                    <span className="t-num shrink-0 font-mono text-[11px] text-[var(--text-1)]">{o.id}</span>
                    <span className={cn("truncate transition-colors duration-500", lit ? "text-[var(--text-0)]" : "text-[var(--text-1)]")}>{o.site}</span>
                  </span>
                  <span
                    className="shrink-0 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] transition-colors duration-500"
                    style={{ color: o.fresh ? freshColor : "var(--text-2)" }}
                  >
                    {o.fresh ? freshStatus : o.status}
                  </span>
                </div>
                {o.fresh && (
                  <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 pl-[15px]" aria-label="Checked">
                    {CHECKS.map((c, i) => (
                      <li
                        key={c.what}
                        className="flex items-baseline gap-1.5 transition-opacity duration-500 ease-[var(--ease-out)]"
                        style={{ opacity: thinking ? 1 : 0.18, transitionDelay: `${thinking ? i * 160 : 0}ms` }}
                      >
                        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--text-2)]">{c.what}</span>
                        <span className="t-num font-mono text-[10.5px] text-[var(--text-0)]">{c.value}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Reasoning while it thinks; what it kept once it has learned. Same slot, so nothing reflows. */}
      <div className="min-h-[74px] border-t border-[var(--line)] px-3.5 py-3">
        <div className="t-label !text-[9.5px]">{learned ? "Learned" : "Reasoning"}</div>
        {/* both lines are typed once; stepping back never re-types what was already read */}
        <div className="mt-1.5 grid text-[12px] leading-snug text-[var(--text-0)]">
          <p className="[grid-area:1/1] transition-opacity duration-500" style={{ opacity: learned ? 0 : 1 }} aria-hidden={learned}>
            <TypedText text={REASONING} active={thinking} speed={60} />
          </p>
          <p className="[grid-area:1/1] transition-opacity duration-500" style={{ opacity: learned ? 1 : 0 }} aria-hidden={!learned}>
            <TypedText text={LEARNED} active={learned} speed={60} />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_132px] border-t border-[var(--line)]">
        <ul className="px-3.5 py-3" aria-label="Actions">
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
          <div className="t-label !text-[9.5px]">{STOCK_LABEL}</div>
          <div className="relative mt-2" style={{ width: CHART.width, height: CHART.height }}>
            <Bars data={STOCK} width={CHART.width} height={CHART.height} grown={learned} className="block" />
            {/* The reorder point: sits where it was, then is raised once the agent has learned. */}
            <div
              aria-hidden
              className="absolute inset-x-0 border-t border-dashed transition-[transform,border-color,color] duration-700 ease-[var(--ease-out)]"
              style={{
                top: levelTop(REORDER.raised),
                transform: learned ? "none" : `translateY(${reorderShift.toFixed(2)}px)`,
                transitionDelay: learned ? "900ms" : "0ms",
                borderColor: learned ? "rgb(var(--accent-rgb))" : "rgba(255,255,255,0.28)",
                color: learned ? "rgb(var(--accent-rgb))" : "var(--text-3)",
              }}
            >
              <span className="absolute bottom-full right-0 pb-0.5 font-mono text-[8px] uppercase leading-none tracking-[0.08em]">{REORDER.label}</span>
            </div>
          </div>
          <div className="mt-1 flex justify-between font-mono text-[9px] text-[var(--text-2)]">
            {WEEKS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-3 border-t border-[var(--line)] px-3.5 py-3 transition-opacity duration-700"
        style={{ opacity: reported ? 1 : 0.18, ["--accent-rgb" as string]: "var(--spot-rgb)" }}
      >
        <Mark size={16} className="shrink-0 text-[var(--text-0)]" />
        <span className="min-w-0">
          <span className="t-label block !text-[9.5px] text-[var(--text-0)]">{REPORT.label}</span>
          <span className="mt-1 block text-[var(--text-1)]">{REPORT.line}</span>
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
      style={{ ["--accent" as string]: operations.accent, ["--accent-rgb" as string]: operations.accentRgb }}
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
        <AgentSlot agent="operations" mood={BEAT_MOOD[beat]} load={step === 2 ? 0.7 : 0} learnCount={step >= 3 ? 1 : 0} className="h-full w-full" />
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
          <p className="t-label">{LOOP.doors}</p>
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
              <span className="mt-1.5 block text-[0.875rem] leading-snug text-[var(--text-2)]">{LOOP.doorsNote}</span>
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
