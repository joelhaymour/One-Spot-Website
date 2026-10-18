"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { EXAMPLES, type ExampleActor, type ExampleStep, type HeroExample } from "@/content/site";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";

type Mode = "before" | "after";

const { items } = EXAMPLES;
/** Long enough to read both sides (shown side by side on a wide screen). */
const WIDE_MS = 16000;
/** On a phone one side shows at a time: today, then with One Spot. */
const NARROW_MS: Record<Mode, number> = { before: 9000, after: 10000 };

function Actor({ actor }: { actor: ExampleActor }) {
  const base = "grid h-8 w-8 shrink-0 place-items-center rounded-full";
  switch (actor) {
    case "onespot":
      return (
        <span className={cn(base, "bg-[var(--spot)] text-white")}>
          <Mark size={15} spot="#fff" />
        </span>
      );
    case "you":
      return (
        <span className={cn(base, "bg-[var(--ink)] text-[var(--paper)]")}>
          <Icon name="check" size={14} strokeWidth={2.2} />
        </span>
      );
    case "wait":
      return (
        <span className={cn(base, "bg-[var(--wait-soft)] text-[var(--wait)]")}>
          <Icon name="clock" size={15} />
        </span>
      );
    case "outside":
      return (
        <span className={cn(base, "bg-[var(--risk-soft)] text-[var(--risk)]")}>
          <Icon name="inbox" size={15} />
        </span>
      );
    default:
      return (
        <span className={cn(base, "bg-[var(--paper-2)] text-[var(--ink-2)]")}>
          <Icon name="person" size={15} />
        </span>
      );
  }
}

function Row({ step, mode, i }: { step: ExampleStep; mode: Mode; i: number }) {
  return (
    <li className="story-row flex gap-3 py-2.5" style={{ "--i": i } as CSSProperties}>
      <Actor actor={step.actor} />
      <div className="min-w-0 flex-1">
        <p className="text-[0.94rem] font-medium leading-snug text-[var(--ink)]">{step.text}</p>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.8rem] text-[var(--ink-3)]">
          <span>{step.who}</span>
          {step.flag ? <span className={cn("pill h-5 px-2 text-[0.72rem]", mode === "before" ? "pill-risk" : "pill-done")}>{step.flag}</span> : null}
          {step.apps?.map((app) => (
            <span key={app} className="inline-flex h-5 items-center rounded-full border border-[var(--line)] bg-[var(--card)] px-2 text-[0.72rem] font-medium text-[var(--ink-2)]">
              {app}
            </span>
          ))}
        </p>
      </div>
    </li>
  );
}

/** One side of the job: how it runs today, or with One Spot. */
function Side({ ex, mode, className }: { ex: HeroExample; mode: Mode; className?: string }) {
  const before = mode === "before";
  const steps = before ? ex.before : ex.after;
  return (
    <div className={cn("flex-col rounded-[22px] border p-5 sm:p-6", before ? "border-[var(--line)] bg-[var(--card)]" : "border-[rgba(45,74,224,0.22)] bg-[linear-gradient(180deg,#eef1fc,var(--card)_40%)]", className)}>
      <p className={cn("flex items-center gap-2 text-[0.82rem] font-semibold uppercase tracking-[0.08em]", before ? "text-[var(--ink-2)]" : "text-[var(--spot)]")}>
        {before ? <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--risk)]" /> : <Mark size={14} spot="var(--spot)" />}
        {before ? EXAMPLES.before : EXAMPLES.after}
      </p>
      <ol key={`${ex.key}-${mode}`} className="mt-3 grid flex-1 content-start">
        {steps.map((step, i) => (
          <Row key={step.text} step={step} mode={mode} i={i} />
        ))}
      </ol>
      {/* what changes: the same size on both sides, so the comparison reads */}
      <dl className="mt-3 grid grid-cols-2 gap-2">
        {ex.stats.map((s) => (
          <div key={s.label} className={cn("flex flex-col-reverse rounded-2xl px-3.5 py-3", before ? "bg-[var(--paper-2)]" : "bg-[rgba(45,74,224,0.07)]")}>
            <dt className="mt-0.5 text-[0.76rem] leading-snug text-[var(--ink-3)]">{s.label}</dt>
            <dd className={cn("t-num text-[1rem] font-semibold leading-snug tracking-[-0.015em]", before ? "text-[var(--ink)]" : "text-[var(--done)]")}>{before ? s.before : s.after}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * One ordinary job in four kinds of business, today and with One Spot. On a wide screen the two sides sit
 * next to each other and the businesses take turns; on a phone one side shows at a time. It plays only on
 * screen, it can be paused, and the moment a visitor picks a business or a side it stays where they put it.
 */
export function ExampleFlows({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("before");
  const [auto, setAuto] = useState(false);
  const [visible, setVisible] = useState(false);
  const [wide, setWide] = useState(true);

  // Plays only with motion on, starting the first time it comes into view.
  useEffect(() => {
    const el = ref.current;
    if (!el || document.documentElement.dataset.motion !== "on") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    let started = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting && !started) {
          started = true;
          setAuto(true);
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, []);

  const step = wide ? WIDE_MS : NARROW_MS[mode];
  useEffect(() => {
    if (!auto || !visible) return;
    const t = setTimeout(() => {
      if (wide || mode === "after") {
        setMode("before");
        setIndex((n) => (n + 1) % items.length);
      } else setMode("after");
    }, step);
    return () => clearTimeout(t);
  }, [auto, visible, mode, index, wide, step]);

  const ex = items[index];
  const playing = auto && visible;

  const pick = (i: number) => {
    setAuto(false);
    setIndex(i);
    setMode("before");
  };
  const side = (m: Mode) => {
    setAuto(false);
    setMode(m);
  };

  return (
    <div ref={ref} className={cn("min-w-0", className)}>
      {/* the four businesses, and the pause */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Example businesses" className="grid w-full grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:flex-wrap">
          {items.map((it, i) => (
            <button
              key={it.key}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-controls="example-panel"
              onClick={() => pick(i)}
              className={cn(
                "relative flex items-center justify-center gap-2 overflow-hidden rounded-full px-4 py-2.5 text-[0.88rem] font-medium transition-[background-color,color,transform] duration-200 active:scale-[0.97]",
                i === index ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--card)] text-[var(--ink-2)] hover:text-[var(--ink)]",
              )}
            >
              <Icon name={it.icon} size={15} />
              {it.tab}
              {i === index && playing ? (
                <span key={`${index}-${mode}`} aria-hidden className="ex-timer absolute bottom-0 left-0 h-[2px] bg-[var(--spot-light)]" style={{ animationDuration: `${step}ms` }} />
              ) : null}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[0.82rem] text-[var(--ink-3)]">{EXAMPLES.note}</p>
          <button
            type="button"
            onClick={() => setAuto((a) => !a)}
            aria-label={auto ? "Pause the examples" : "Play the examples"}
            className="flex h-10 items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--card)] px-4 text-[0.85rem] font-medium text-[var(--ink)] transition-[border-color,transform] duration-200 hover:border-[var(--ink)] active:scale-[0.97]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden fill="currentColor">
              {auto ? (
                <>
                  <rect x="2" y="1.5" width="2.6" height="9" rx="0.8" />
                  <rect x="7.4" y="1.5" width="2.6" height="9" rx="0.8" />
                </>
              ) : (
                <path d="M3 1.6v8.8a.6.6 0 0 0 .9.5l7-4.4a.6.6 0 0 0 0-1L3.9 1.1a.6.6 0 0 0-.9.5Z" />
              )}
            </svg>
            {auto ? "Pause" : "Play"}
          </button>
        </div>
      </div>

      <div id="example-panel" role="tabpanel" aria-live={playing ? "off" : "polite"} className="mt-7">
        <p key={ex.key} className="story-fade max-w-[44rem] text-[1.3rem] font-semibold leading-snug tracking-[-0.025em] text-[var(--ink)] sm:text-[1.5rem]">
          {ex.moment}
        </p>

        {/* a phone shows one side at a time */}
        <div role="group" aria-label="Which side" className="relative mt-5 grid grid-cols-2 rounded-full bg-[var(--card)] p-1 text-[0.86rem] font-medium lg:hidden">
          <span
            aria-hidden
            className={cn(
              "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full transition-[transform,background-color] duration-[220ms] ease-[var(--ease-out)]",
              mode === "after" ? "translate-x-full bg-[var(--spot)]" : "bg-[var(--ink)]",
            )}
          />
          {(["before", "after"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => side(m)} className={cn("relative z-10 rounded-full py-2 transition-colors duration-200", mode === m ? "text-white" : "text-[var(--ink-3)]")}>
              {m === "before" ? EXAMPLES.before : EXAMPLES.after}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2 lg:gap-5">
          <Side ex={ex} mode="before" className={mode === "before" ? "flex" : "flex max-lg:hidden"} />
          <Side ex={ex} mode="after" className={mode === "after" ? "flex" : "flex max-lg:hidden"} />
        </div>
      </div>
    </div>
  );
}
