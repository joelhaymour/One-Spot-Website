"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import { WORTH, type WorthMode, type WorthSlider } from "@/content/site";
import { cn } from "@/lib/cn";
import { AnchorButton } from "@/components/ui/Button";
import { setPrefill } from "@/lib/prefill";

type Values = Record<string, number>;

const initial = (sliders: readonly WorthSlider[]): Values => Object.fromEntries(sliders.map((s) => [s.key, s.value]));

const nf = new Intl.NumberFormat("en-US");
const fmtHours = (n: number) => nf.format(Math.round(n));
const fmtMoney = (n: number) => `$${nf.format(Math.round(n / 100) * 100)}`;
const fmtWeeks = (n: number) => (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, "");

/** The value in its field, and the unit beside it (every number sits with its unit). */
function fieldValue(s: WorthSlider, v: number): [string, string] {
  switch (s.unit) {
    case "money":
      return [`$${nf.format(v)}`, "/ hr"];
    case "hours":
      return [String(v), v === 1 ? "hr / wk" : "hrs / wk"];
    case "weeks":
      return [String(v), "weeks"];
    default:
      return [nf.format(v), v === 1 ? "person" : "people"];
  }
}

/** How long a number must sit still before the stamp comes down on it. */
const SETTLE_MS = 280;

/** The value once it has stopped moving: the stamp only ever lands on a settled number. */
function useSettled(value: number) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setSettled(value), SETTLE_MS);
    return () => clearTimeout(t);
  }, [value]);
  return settled;
}

function Field({ s, value, onChange }: { s: WorthSlider; value: number; onChange: (v: number) => void }) {
  const id = useId();
  const fill = ((value - s.min) / (s.max - s.min)) * 100;
  const [num, unit] = fieldValue(s, value);
  return (
    <div className="ruled pb-1.5 pt-2.5">
      <div className="flex items-end justify-between gap-4">
        <label htmlFor={id} className="pb-1 text-[0.88rem] leading-snug text-[var(--ink-2)]">
          {s.label}
        </label>
        <span className="flex shrink-0 items-baseline gap-1.5">
          <span className="t-num font-[family-name:var(--font-display)] text-[1.7rem] font-extrabold leading-none text-[var(--ink)]">{num}</span>
          <span className="text-[0.78rem] text-[var(--ink-3)]">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={s.min}
        max={s.max}
        step={s.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${num} ${unit}`}
        className="worth-range mt-1 w-full"
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
    </div>
  );
}

/**
 * The job ticket the page hangs on: what a better way of working could be worth. Whose time (the team's,
 * or the owner's own), three ruled fields, and the hours back in a year landing as a stamp once the
 * numbers settle. The dollar figure is the potential value of that time, never promised savings. The
 * stub carries the close and the action, which takes their numbers into the contact form.
 */
export function WorthCalculator({ className }: { className?: string }) {
  const [mode, setMode] = useState<WorthMode>(WORTH.defaultMode);
  const [values, setValues] = useState<Record<WorthMode, Values>>({ team: initial(WORTH.team.sliders), you: initial(WORTH.you.sliders) });
  const uid = useId();

  const team = mode === "team";
  const cfg = team ? WORTH.team : WORTH.you;
  const v = values[mode];
  const perWeek = team ? v.people * v.hours : v.hours;
  const weeks = team ? WORTH.team.weeks : v.weeks;
  const hours = perWeek * weeks;
  const value = hours * v.rate;
  const workweeks = hours / WORTH.weekHours;

  // The stamp lands once on a settled number, then holds still; while the numbers move it lifts.
  const settled = useSettled(hours);
  const lifted = settled !== hours;

  const set = (key: string, n: number) => setValues((all) => ({ ...all, [mode]: { ...all[mode], [key]: n } }));
  const prefill = () =>
    setPrefill(team ? WORTH.team.prefill(v.people, v.hours, fmtHours(hours)) : WORTH.you.prefill(v.hours, fmtHours(hours)));

  return (
    <div className={cn("relative", className)}>
      {/* the string it hangs from */}
      <svg aria-hidden className="pointer-events-none absolute -top-[88px] left-1/2 hidden h-[110px] w-[60px] -translate-x-1/2 lg:block" viewBox="0 0 60 110">
        <path d="M30 0 C 26 40, 40 70, 30 108" fill="none" stroke="#8a6a2a" strokeWidth="2.2" strokeLinecap="round" />
      </svg>

      {/* the carbon copy beneath the top sheet: tilted, so the text on top can stay upright and sharp */}
      <div aria-hidden className="absolute inset-x-2 bottom-1 top-3 hidden rotate-[2.6deg] rounded-[6px] bg-[var(--carbon-canary)] shadow-[var(--shadow-card)] lg:block" />

      <div className="ticket px-5 pb-0 pt-12 sm:px-7">
        <span aria-hidden className="eyelet" />

        <div className="flex items-baseline justify-between border-b-2 border-[var(--ink)] pb-2">
          <span className="t-label">{WORTH.ticket.label}</span>
          <span className="t-label t-num text-[var(--ink-3)]">{WORTH.ticket.number}</span>
        </div>

        <h2 className="mt-3 text-[1.2rem] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--ink)] sm:text-[1.3rem]">{WORTH.headline}</h2>

        {/* whose time: tabs on the ticket */}
        <div role="radiogroup" aria-label="Whose time" className="mt-3 grid grid-cols-2 border-[1.5px] border-[var(--ink)] text-[0.9rem] font-semibold">
          {WORTH.modes.map((m) => (
            <button
              key={m.key}
              type="button"
              role="radio"
              aria-checked={mode === m.key}
              onClick={() => setMode(m.key)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  setMode((cur) => (cur === "team" ? "you" : "team"));
                }
              }}
              tabIndex={mode === m.key ? 0 : -1}
              className={cn(
                "py-2 transition-colors duration-[var(--t-ui)] ease-[var(--ease-out)]",
                mode === m.key ? "bg-[var(--ink)] text-[var(--card)]" : "text-[var(--ink-2)] hover:bg-[var(--paper-2)]",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div key={mode} className="story-fade mt-1">
          {cfg.sliders.map((s) => (
            <Field key={s.key} s={s} value={v[s.key]} onChange={(n) => set(s.key, n)} />
          ))}
        </div>

        {/* the result: the hours stamped, then the value and workweeks on ruled lines */}
        <div className="mt-4 grid items-center gap-x-5 gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)]">
          <p aria-hidden className="flex justify-center sm:justify-start">
            <span
              key={`${mode}-${settled}`}
              className={cn("stamp stamp-press text-[var(--risk)] transition-opacity duration-[var(--t-ui)]", lifted ? "opacity-30" : "opacity-100")}
              style={{ "--stamp-rot": "rotate(-4deg)", transform: "rotate(-4deg)" } as CSSProperties}
            >
              <span className="t-num text-[clamp(2.8rem,5vw,3.5rem)] leading-[0.85]">{fmtHours(settled)}</span>
              <span className="mt-1 text-[0.82rem] tracking-[0.06em]">{cfg.hoursLabel}</span>
            </span>
          </p>
          <dl className="min-w-0 text-[0.92rem]">
            <div className="ruled flex items-baseline justify-between gap-3 py-2">
              <dt className="text-[var(--ink-2)]">
                {cfg.valueLabel}
                <span aria-hidden>*</span>
              </dt>
              <dd className="t-num font-[family-name:var(--font-display)] text-[1.45rem] font-extrabold leading-none">{fmtMoney(value)}</dd>
            </div>
            <div className="ruled flex items-baseline justify-between gap-3 py-2">
              <dt className="text-[var(--ink-2)]">{cfg.weeksLabel}</dt>
              <dd className="t-num font-[family-name:var(--font-display)] text-[1.45rem] font-extrabold leading-none">{fmtWeeks(workweeks)}</dd>
            </div>
          </dl>
        </div>

        <p key={`s-${mode}`} className="story-fade mt-3 text-[0.95rem] font-medium leading-snug text-[var(--ink)]">
          {cfg.statement}
        </p>
        <p id={`${uid}-note`} className="mt-2 text-[0.75rem] leading-snug text-[var(--ink-3)]">
          * {WORTH.footnote}
        </p>
        <p className="sr-only" aria-live="polite">
          {`${fmtHours(settled)} ${cfg.hoursLabel}. ${cfg.valueLabel}: ${fmtMoney(value)}. ${cfg.weeksLabel}: ${fmtWeeks(workweeks)}.`}
        </p>

        {/* the tear-off stub: the close, and the action */}
        <div className="perf -mx-5 mt-4 flex flex-col gap-3 bg-[var(--paper-2)] px-5 py-4 sm:-mx-7 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="font-[family-name:var(--font-display)] text-[1.2rem] font-extrabold uppercase leading-[0.95] tracking-[0.01em]">
            {WORTH.close[0]}
            <span className="block text-[var(--ink-2)]">{WORTH.close[1]}</span>
          </p>
          <AnchorButton href="#contact" size="sm" onNavigate={prefill} className="shrink-0">
            {WORTH.action}
          </AnchorButton>
        </div>
      </div>
    </div>
  );
}
