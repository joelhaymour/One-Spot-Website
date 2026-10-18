"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { WORTH, type WorthMode, type WorthSlider } from "@/content/site";
import { cn } from "@/lib/cn";

type Values = Record<string, number>;

const initial = (sliders: readonly WorthSlider[]): Values =>
  Object.fromEntries(sliders.map((s) => [s.key, s.value]));
const BARS = 52;

const nf = new Intl.NumberFormat("en-US");
const fmtHours = (n: number) => nf.format(Math.round(n));
const fmtMoney = (n: number) => `$${nf.format(Math.round(n / 100) * 100)}`;
const fmtWeeks = (n: number) =>
  (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, "");

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

/** The next "nice" ceiling (1, 2, 2.5 or 5 × a power of ten) for the year chart's scale. */
function niceCeil(n: number) {
  const p = 10 ** Math.floor(Math.log10(Math.max(1, n)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= n) return m * p;
  return 10 * p;
}

/** A number that glides to its new value instead of jumping. Instant without motion. */
function useGlide(target: number, ms = 650) {
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

function Slider({
  s,
  value,
  onChange,
}: {
  s: WorthSlider;
  value: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const fill = ((value - s.min) / (s.max - s.min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.85rem] text-[var(--ink-2)]">
          {s.label}
        </label>
        <span className="t-num shrink-0 text-[0.95rem] font-semibold tracking-[-0.01em] text-[var(--ink)]">
          {fmtSlider(s, value)}
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
        aria-valuetext={fmtSlider(s, value)}
        className="worth-range mt-1.5 w-full"
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
    </div>
  );
}

/**
 * What a better way of working could be worth. Two views (the team's time, or the owner's own), three
 * sliders each, and one big number: hours back in a year. The dollar figure is the potential value of
 * that time, never promised savings, and the year chart shows a few hours a week piling up into it.
 */
export function WorthCalculator({ className }: { className?: string }) {
  const [mode, setMode] = useState<WorthMode>(WORTH.defaultMode);
  const [values, setValues] = useState<Record<WorthMode, Values>>({
    team: initial(WORTH.team.sliders),
    you: initial(WORTH.you.sliders),
  });
  const [seen, setSeen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // The year chart grows in the first time the card is on screen (CSS keeps it shown without motion).
  useEffect(() => {
    const el = ref.current;
    if (!el || document.documentElement.dataset.motion !== "on") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setTimeout(() => setSeen(true), 500);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cfg = mode === "team" ? WORTH.team : WORTH.you;
  const v = values[mode];
  const perWeek = mode === "team" ? v.people * v.hours : v.hours;
  const weeks = mode === "team" ? WORTH.team.weeks : v.weeks;
  const hours = perWeek * weeks;
  const value = hours * v.rate;
  const workweeks = hours / WORTH.weekHours;

  const shownHours = useGlide(hours);
  const shownValue = useGlide(value);
  const shownWeeks = useGlide(workweeks);
  const ceiling = niceCeil(hours * 1.15);

  const set = (key: string, n: number) =>
    setValues((all) => ({ ...all, [mode]: { ...all[mode], [key]: n } }));

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-[24px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-float)] sm:p-7",
        className,
      )}
    >
      <h2 className="text-[1.3rem] font-semibold leading-[1.15] tracking-[-0.03em] text-[var(--ink)] sm:text-[1.5rem]">
        {WORTH.headline}
      </h2>
      <p className="mt-1.5 text-[0.88rem] leading-snug text-[var(--ink-3)]">
        {WORTH.lead}
      </p>

      {/* whose time */}
      <div
        role="radiogroup"
        aria-label="Whose time"
        className="relative mt-4 grid grid-cols-2 rounded-full bg-[var(--paper-2)] p-1 text-[0.85rem] font-medium"
      >
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-[var(--ink)] shadow-[var(--shadow-card)] transition-transform duration-500 ease-[var(--ease-out)]",
            mode === WORTH.modes[1].key && "translate-x-full",
          )}
        />
        {WORTH.modes.map((m) => (
          <button
            key={m.key}
            type="button"
            role="radio"
            aria-checked={mode === m.key}
            onClick={() => setMode(m.key)}
            className={cn(
              "relative z-10 rounded-full py-2 transition-colors duration-300",
              mode === m.key
                ? "text-[var(--paper)]"
                : "text-[var(--ink-3)] hover:text-[var(--ink)]",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div key={mode} className="story-fade mt-4 grid gap-3">
        {cfg.sliders.map((s) => (
          <Slider
            key={s.key}
            s={s}
            value={v[s.key]}
            onChange={(n) => set(s.key, n)}
          />
        ))}
      </div>

      {/* the result: one big number, two smaller ones, and the year it adds up over */}
      <div className="mt-5 rounded-[20px] bg-[var(--paper-2)] px-5 pb-4 pt-5">
        <div className="grid gap-x-5 gap-y-4 sm:grid-cols-[minmax(0,1fr)_10.5rem]">
          <div className="min-w-0">
            <p className="t-num text-[clamp(3rem,6.4vw,4.1rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-[var(--spot)]">
              {fmtHours(shownHours)}
            </p>
            <p className="mt-2 text-[0.88rem] font-medium leading-snug text-[var(--ink)]">
              {cfg.hoursLabel}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:grid-cols-1 sm:content-start">
            <div className="rounded-xl bg-[var(--card)] px-3.5 py-2.5">
              <p className="t-num text-[1.2rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--ink)]">
                {fmtMoney(shownValue)}
                <span className="text-[var(--ink-4)]">*</span>
              </p>
              <p className="mt-0.5 text-[0.72rem] leading-snug text-[var(--ink-3)]">
                {cfg.valueLabel}
              </p>
            </div>
            <div className="rounded-xl bg-[var(--card)] px-3.5 py-2.5">
              <p className="t-num text-[1.2rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--ink)]">
                {fmtWeeks(shownWeeks)}
              </p>
              <p className="mt-0.5 text-[0.72rem] leading-snug text-[var(--ink-3)]">
                {cfg.weeksLabel}
              </p>
            </div>
          </div>

          {/* a few hours a week, piling up over the year */}
          <div
            aria-hidden
            className="worth-chart min-w-0 self-end sm:col-start-1 sm:row-start-2"
            data-seen={seen ? "" : undefined}
          >
            <div className="flex h-10 items-end gap-[2px]">
              {Array.from({ length: BARS }, (_, i) => {
                const worked = Math.min(i + 1, weeks);
                const h = ((perWeek * worked) / ceiling) * 100;
                const resting = i + 1 > weeks;
                return (
                  <span
                    key={i}
                    className={cn(
                      "worth-bar flex-1 rounded-t-[2px]",
                      resting
                        ? "bg-[rgba(45,74,224,0.25)]"
                        : "bg-[var(--spot)]",
                    )}
                    style={
                      {
                        height: `${Math.max(2, h)}%`,
                        opacity: 0.35 + 0.65 * ((i + 1) / BARS),
                        transitionDelay: `${i * 9}ms`,
                      } as CSSProperties
                    }
                  />
                );
              })}
            </div>
            <div className="mt-1.5 flex justify-between text-[0.7rem] text-[var(--ink-3)]">
              <span className="t-num">
                {WORTH.yearLabel.start} · {fmtHours(perWeek)} hrs
              </span>
              <span className="t-num">
                {WORTH.yearLabel.end} · {fmtHours(hours)} hrs
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[0.7rem] leading-snug text-[var(--ink-4)]">
        * {WORTH.footnote}
      </p>

      <p
        key={`s-${mode}`}
        className="story-fade mt-3.5 text-[1rem] font-medium leading-snug tracking-[-0.015em] text-[var(--ink)]"
      >
        {cfg.statement}
      </p>

      <p className="sr-only" aria-live="polite">
        {`${fmtHours(hours)} ${cfg.hoursLabel}. ${cfg.valueLabel}: ${fmtMoney(value)}. ${cfg.weeksLabel}: ${fmtWeeks(workweeks)}.`}
      </p>

      <p className="mt-4 border-t border-[var(--line)] pt-4 text-[1.05rem] font-semibold leading-snug tracking-[-0.025em] text-[var(--ink)] sm:text-[1.15rem]">
        {WORTH.close[0]}{" "}
        <span className="block text-[var(--spot)]">{WORTH.close[1]}</span>
      </p>
    </div>
  );
}
