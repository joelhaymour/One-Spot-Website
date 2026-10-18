"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
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

function fmtSlider(s: WorthSlider, v: number) {
  switch (s.unit) {
    case "money":
      return `$${nf.format(v)}`;
    case "hours":
      return `${v} ${v === 1 ? "hr" : "hrs"}`;
    case "weeks":
      return `${v} weeks`;
    default:
      return nf.format(v);
  }
}

/** A number that glides to its new value instead of jumping. Instant without motion. */
function useGlide(target: number, ms = 450) {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  const raf = useRef(0);

  useEffect(() => {
    const dur = document.documentElement.dataset.motion === "on" ? ms : 0;
    const start = performance.now();
    const a = from.current;
    cancelAnimationFrame(raf.current);
    const step = (now: number) => {
      const t = dur ? Math.min(1, (now - start) / dur) : 1;
      const e = 1 - Math.pow(1 - t, 4);
      const v = a + (target - a) * e;
      from.current = v;
      setShown(v);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, ms]);

  return shown;
}

function Slider({ s, value, onChange }: { s: WorthSlider; value: number; onChange: (v: number) => void }) {
  const id = useId();
  const fill = ((value - s.min) / (s.max - s.min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.88rem] text-[var(--ink-2)]">
          {s.label}
        </label>
        <span className="t-num shrink-0 text-[0.98rem] font-semibold tracking-[-0.01em] text-[var(--ink)]">{fmtSlider(s, value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={s.min}
        max={s.max}
        step={s.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={fmtSlider(s, value)}
        className="worth-range mt-1.5 w-full"
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
    </div>
  );
}

/**
 * What a better way of working could be worth. Two views (the team's time, or the owner's own), three
 * sliders each, and one number that carries the card: hours back in a year. The dollar figure is the
 * potential value of that time, never promised savings. The close carries the action, which takes
 * their numbers into the contact form.
 */
export function WorthCalculator({ className }: { className?: string }) {
  const [mode, setMode] = useState<WorthMode>(WORTH.defaultMode);
  const [values, setValues] = useState<Record<WorthMode, Values>>({ team: initial(WORTH.team.sliders), you: initial(WORTH.you.sliders) });

  const team = mode === "team";
  const cfg = team ? WORTH.team : WORTH.you;
  const v = values[mode];
  const perWeek = team ? v.people * v.hours : v.hours;
  const weeks = team ? WORTH.team.weeks : v.weeks;
  const hours = perWeek * weeks;
  const value = hours * v.rate;
  const workweeks = hours / WORTH.weekHours;

  const shownHours = useGlide(hours);
  const shownValue = useGlide(value);
  const shownWeeks = useGlide(workweeks);

  const set = (key: string, n: number) => setValues((all) => ({ ...all, [mode]: { ...all[mode], [key]: n } }));
  const prefill = () =>
    setPrefill(team ? WORTH.team.prefill(v.people, v.hours, fmtHours(hours)) : WORTH.you.prefill(v.hours, fmtHours(hours)));

  return (
    <div className={cn("overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-float)]", className)}>
      <div className="p-5 sm:p-7">
        <h2 className="text-[1.3rem] font-semibold leading-[1.15] tracking-[-0.03em] text-[var(--ink)] sm:text-[1.5rem]">{WORTH.headline}</h2>

        {/* whose time */}
        <div role="radiogroup" aria-label="Whose time" className="relative mt-5 grid grid-cols-2 rounded-full bg-[var(--paper-2)] p-1 text-[0.88rem] font-medium">
          <span
            aria-hidden
            className={cn(
              "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-[var(--ink)] shadow-[var(--shadow-card)] transition-transform duration-[220ms] ease-[var(--ease-out)]",
              mode === WORTH.modes[1].key && "translate-x-full",
            )}
          />
          {WORTH.modes.map((m) => (
            <button
              key={m.key}
              type="button"
              role="radio"
              aria-checked={mode === m.key}
              tabIndex={mode === m.key ? 0 : -1}
              onClick={() => setMode(m.key)}
              onKeyDown={(e) => {
                if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
                  e.preventDefault();
                  setMode((cur) => (cur === "team" ? "you" : "team"));
                }
              }}
              className={cn("relative z-10 rounded-full py-2 transition-colors duration-200", mode === m.key ? "text-[var(--paper)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]")}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div key={mode} className="story-fade mt-5 grid gap-4">
          {cfg.sliders.map((s) => (
            <Slider key={s.key} s={s} value={v[s.key]} onChange={(n) => set(s.key, n)} />
          ))}
        </div>

        {/* the result: one number that matters, and two that support it */}
        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <p className="t-num text-[clamp(3rem,6.2vw,4.1rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-[var(--spot)]">{fmtHours(shownHours)}</p>
          <p className="mt-2 text-[0.95rem] font-medium text-[var(--ink)]">{cfg.hoursLabel}</p>
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
            <div className="flex flex-col-reverse">
              <dt className="text-[0.8rem] text-[var(--ink-3)]">{cfg.valueLabel}</dt>
              <dd className="t-num text-[1.3rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--ink)]">
                {fmtMoney(shownValue)}
                <span aria-hidden className="text-[var(--ink-3)]">
                  *
                </span>
              </dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-[0.8rem] text-[var(--ink-3)]">{cfg.weeksLabel}</dt>
              <dd className="t-num text-[1.3rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--ink)]">{fmtWeeks(shownWeeks)}</dd>
            </div>
          </dl>
          <p key={`s-${mode}`} className="story-fade mt-4 text-[0.98rem] font-medium leading-snug tracking-[-0.01em] text-[var(--ink)]">
            {cfg.statement}
          </p>
          <p className="mt-2 text-[0.75rem] leading-snug text-[var(--ink-3)]">* {WORTH.footnote}</p>
        </div>

        <p className="sr-only" aria-live="polite">
          {`${fmtHours(hours)} ${cfg.hoursLabel}. ${cfg.valueLabel}: ${fmtMoney(value)}. ${cfg.weeksLabel}: ${fmtWeeks(workweeks)}.`}
        </p>
      </div>

      {/* the close, and the action that carries their numbers to the form */}
      <div className="flex flex-col gap-4 border-t border-[var(--line)] bg-[var(--paper)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p className="text-[0.98rem] font-semibold leading-snug tracking-[-0.02em] text-[var(--ink)]">
          {WORTH.close[0]} <span className="block font-medium text-[var(--ink-2)]">{WORTH.close[1]}</span>
        </p>
        <AnchorButton href="#contact" size="sm" onNavigate={prefill} className="shrink-0">
          {WORTH.action}
        </AnchorButton>
      </div>
    </div>
  );
}
