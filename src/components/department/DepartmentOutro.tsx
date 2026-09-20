"use client";

import { BEATS, CEO, departmentHref, nextDepartment, type Department } from "@/content/departments";
import { COMPANY } from "@/content/hud";
import { Mark } from "@/components/agent/AgentSvg";
import { LinkButton } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Section";
import { pad2, stepTime } from "./story";
import { useLeave } from "./useLeave";

/**
 * Where the shift ends up: one notification on the owner's display.
 * The fifth beat lands outside the workstation on purpose. The visitor has left the department's
 * console and is reading what the CEO Agent was told, which is all the owner ever has to read.
 */
export function DepartmentOutro({ department }: { department: Department }) {
  const onLeave = useLeave();
  const next = nextDepartment(department.id);
  const report = BEATS[BEATS.length - 1];

  return (
    <section
      id="report"
      aria-labelledby="report-title"
      className="relative border-t border-[var(--line-faint)] px-[var(--gutter)] pb-[clamp(72px,12svh,160px)] pt-[clamp(88px,16svh,200px)]"
    >
      <div className="mx-auto grid w-full max-w-[1888px] gap-x-[clamp(32px,6vw,120px)] gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)]">
        <div className="flex flex-col gap-6 lg:col-start-1 lg:row-start-1">
          <Reveal>
            <Eyebrow index={pad2(BEATS.length)}>{report.label}</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 id="report-title" tabIndex={-1} className="t-title max-w-[22ch] outline-none">
              {report.line}
            </h2>
          </Reveal>
        </div>

        {/* The owner's display, reduced to the one thing on it that changed. */}
        <Reveal delay={0.2} y={24} className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <Panel raised className="w-full overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-4 py-3 sm:px-5">
              <p className="flex min-w-0 items-center gap-2.5" style={{ color: CEO.accent }}>
                <Mark size={16} className="shrink-0" />
                <span className="t-label truncate text-[var(--text-0)]!">Report received · {CEO.name}</span>
              </p>
              <p className="t-label t-num shrink-0">
                {COMPANY.dayLabel} · {stepTime(department.story, department.story.length)}
              </p>
            </div>
            <div className="px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5">
              <p className="text-[1.0625rem] font-medium leading-[1.35] tracking-[-0.015em] text-[var(--text-0)] sm:text-[1.1875rem]">
                {department.report.headline}
              </p>
              <p className="t-body mt-2.5" style={{ textWrap: "pretty" }}>
                {department.report.detail}
              </p>
              <p className="t-label mt-5 flex items-center gap-2.5 border-t border-[var(--line-faint)] pt-4">
                <span aria-hidden className="spot" />
                From the {department.agentName}
              </p>
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.16} className="flex flex-wrap items-center gap-3 lg:col-start-1 lg:row-start-2 lg:self-start">
          <LinkButton href="/#business" onClick={onLeave}>
            Back to The Business
          </LinkButton>
          <LinkButton href={departmentHref(next.id)} variant="ghost" arrow>
            Next: {next.agentName}
          </LinkButton>
        </Reveal>
      </div>

      {/* The loop once more, quietly: it is the same five beats in every department. */}
      <Reveal className="mx-auto mt-[clamp(64px,11svh,140px)] w-full max-w-[1888px]">
        <ol aria-label="The loop every agent runs" className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-5">
          {BEATS.map((beat, i) => (
            <li key={beat.id} className="flex flex-col gap-1.5 border-t border-[var(--line)] py-4">
              <span className="t-label">
                <span aria-hidden className="t-num mr-2.5 text-[var(--text-3)]">
                  {pad2(i + 1)}
                </span>
                <span className="text-[var(--text-1)]">{beat.label}</span>
              </span>
              <span className="text-[0.8125rem] leading-[1.5] text-[var(--text-2)]">{beat.line}</span>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
