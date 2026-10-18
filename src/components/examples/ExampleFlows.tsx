"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { EXAMPLES, type ExampleActor, type ExampleStep, type HeroExample } from "@/content/site";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";

type Mode = "before" | "after";

const { items } = EXAMPLES;
/** Long enough to read both tickets (side by side on a wide screen). */
const WIDE_MS = 16000;
/** On a phone one side shows at a time: today, then with One Spot. */
const NARROW_MS: Record<Mode, number> = { before: 9000, after: 10000 };

/** Each kind of business keeps its own carbon-copy tint. */
const CARBON: Record<string, string> = {
  body: "var(--carbon-canary)",
  dental: "var(--carbon-pink)",
  finance: "var(--carbon-green)",
  hvac: "var(--carbon-blue)",
};

function Actor({ actor }: { actor: ExampleActor }) {
  const base = "grid h-8 w-8 shrink-0 place-items-center rounded-[4px]";
  switch (actor) {
    case "onespot":
      return (
        <span className={cn(base, "bg-[var(--spot)] text-white")}>
          <Mark size={15} spot="#fff" />
        </span>
      );
    case "you":
      return (
        <span className={cn(base, "bg-[var(--ink)] text-[var(--card)]")}>
          <Icon name="check" size={14} strokeWidth={2.2} />
        </span>
      );
    case "wait":
      return (
        <span className={cn(base, "border-[1.5px] border-[var(--wait)] text-[var(--wait)]")}>
          <Icon name="clock" size={15} />
        </span>
      );
    case "outside":
      return (
        <span className={cn(base, "border-[1.5px] border-[var(--risk)] text-[var(--risk)]")}>
          <Icon name="inbox" size={15} />
        </span>
      );
    default:
      return (
        <span className={cn(base, "border-[1.5px] border-[var(--line-strong)] text-[var(--ink-2)]")}>
          <Icon name="person" size={15} />
        </span>
      );
  }
}

function Row({ step, mode, i }: { step: ExampleStep; mode: Mode; i: number }) {
  return (
    <li className="story-row ruled flex gap-3 py-3 last:border-b-0" style={{ "--i": i } as CSSProperties}>
      <Actor actor={step.actor} />
      <div className="min-w-0 flex-1">
        <p className="text-[0.92rem] font-medium leading-snug text-[var(--ink)]">{step.text}</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[0.78rem] text-[var(--ink-2)]">
          <span>{step.who}</span>
          {step.flag ? (
            <span className={cn("rounded-[3px] border-[1.5px] bg-[var(--card)] px-1.5 py-[1px] font-[family-name:var(--font-display)] text-[0.78rem] font-extrabold uppercase tracking-[0.04em]", mode === "before" ? "border-[var(--risk)] text-[var(--risk)]" : "border-[var(--spot)] text-[var(--spot)]")}>
              {step.flag}
            </span>
          ) : null}
          {step.apps?.map((app) => (
            <span key={app} className="inline-flex items-center gap-1 rounded-[3px] border border-[var(--line-strong)] px-1.5 py-[1px] text-[0.7rem] font-medium text-[var(--ink-2)]">
              <span className="h-1.5 w-1.5 rounded-[1px] bg-[var(--ink-2)]" />
              {app}
            </span>
          ))}
        </p>
      </div>
    </li>
  );
}

/** One side of the job as a ticket: today on that business's carbon copy, with One Spot on the top sheet. */
function Ticket({ ex, mode, className }: { ex: HeroExample; mode: Mode; className?: string }) {
  const before = mode === "before";
  const steps = before ? ex.before : ex.after;
  return (
    <div className={cn("ticket flex flex-col px-5 pb-5 pt-4 sm:px-6", className)} style={before ? { background: CARBON[ex.key] } : undefined}>
      <div className="flex items-center justify-between gap-3 border-b-2 border-[var(--ink)] pb-2">
        <span className="t-label flex items-center gap-2">
          {before ? <span aria-hidden className="h-2.5 w-2.5 rounded-[2px] bg-[var(--risk)]" /> : <Mark size={15} className="text-[var(--ink)]" />}
          {before ? EXAMPLES.before : EXAMPLES.after}
        </span>
        <span className="t-label text-[0.8rem] text-[var(--ink-2)]">{before ? "Carbon copy" : "Top sheet"}</span>
      </div>
      <ol key={`${ex.key}-${mode}`} className="grid flex-1 content-start">
        {steps.map((step, i) => (
          <Row key={step.text} step={step} mode={mode} i={i} />
        ))}
      </ol>
      {/* what changes, on ruled fields: the same size on both tickets */}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 border-t-2 border-[var(--ink)] pt-3">
        {ex.stats.map((s) => (
          <div key={s.label} className="min-w-0">
            <dt className="text-[0.76rem] leading-snug text-[var(--ink-2)]">{s.label}</dt>
            <dd className={cn("t-num mt-1 font-[family-name:var(--font-display)] text-[1.35rem] font-extrabold uppercase leading-[0.95]", before ? "text-[var(--risk)]" : "text-[var(--spot)]")}>
              {before ? s.before : s.after}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * One ordinary job in four kinds of business, as two tickets: today on that business's carbon copy, and
 * with One Spot on the top sheet. On a wide screen they sit side by side and the businesses take turns;
 * on a phone one side shows at a time. It only plays while on screen, it can be paused, and the moment a
 * visitor picks a business or a side it stops and stays where they put it.
 */
export function ExampleFlows({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("before");
  const [auto, setAuto] = useState(false);
  const [visible, setVisible] = useState(false);
  const [wide, setWide] = useState(true);

  // Plays only with motion on, and only once it has come into view.
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
      <div className="flex flex-wrap items-end justify-between gap-4">
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
                "relative flex items-center justify-center gap-2 overflow-hidden rounded-t-[6px] rounded-b-[2px] px-4 py-2.5 text-[0.9rem] font-semibold transition-[background-color,color,transform] duration-[var(--t-ui)] ease-[var(--ease-out)] active:translate-y-px",
                i === index ? "text-[var(--ink)]" : "bg-[rgba(251,247,236,0.08)] text-[var(--counter-text-2)] hover:bg-[rgba(251,247,236,0.16)] hover:text-[var(--counter-text)]",
              )}
              style={i === index ? { background: CARBON[it.key] } : undefined}
            >
              <Icon name={it.icon} size={16} />
              {it.tab}
              {i === index && playing ? (
                <span key={`${index}-${mode}`} aria-hidden className="ex-timer absolute bottom-0 left-0 h-[3px] bg-[var(--ink)]" style={{ animationDuration: `${step}ms` }} />
              ) : null}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[0.82rem] text-[var(--counter-text-2)]">{EXAMPLES.note}</p>
          <button
            type="button"
            onClick={() => setAuto((a) => !a)}
            aria-label={auto ? "Pause the examples" : "Play the examples"}
            className="flex h-10 items-center gap-2 rounded-[4px] border-[1.5px] border-[var(--counter-text-2)] px-3 text-[0.85rem] font-semibold text-[var(--counter-text)] transition-colors duration-[var(--t-ui)] hover:border-[var(--counter-text)] active:translate-y-px"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden fill="currentColor">
              {auto ? (
                <>
                  <rect x="2" y="1.5" width="2.6" height="9" rx="0.6" />
                  <rect x="7.4" y="1.5" width="2.6" height="9" rx="0.6" />
                </>
              ) : (
                <path d="M3 1.6v8.8a.6.6 0 0 0 .9.5l7-4.4a.6.6 0 0 0 0-1L3.9 1.1a.6.6 0 0 0-.9.5Z" />
              )}
            </svg>
            {auto ? "Pause" : "Play"}
          </button>
        </div>
      </div>

      <div id="example-panel" role="tabpanel" aria-live={playing ? "off" : "polite"} className="mt-6">
        <p key={ex.key} className="story-fade t-h3 max-w-[40rem] text-[var(--counter-text)]">
          {ex.moment}
        </p>

        {/* a phone shows one ticket at a time */}
        <div role="group" aria-label="Which side" className="mt-5 grid grid-cols-2 border-[1.5px] border-[var(--counter-text-2)] text-[0.9rem] font-semibold lg:hidden">
          {(["before", "after"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => side(m)}
              className={cn(
                "py-2.5 transition-colors duration-[var(--t-ui)]",
                mode === m ? (m === "after" ? "bg-[var(--spot)] text-white" : "bg-[var(--counter-text)] text-[var(--ink)]") : "text-[var(--counter-text-2)]",
              )}
            >
              {m === "before" ? EXAMPLES.before : EXAMPLES.after}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:mt-6 lg:grid-cols-2 lg:gap-6">
          <Ticket ex={ex} mode="before" className={cn(mode === "before" ? "flex" : "max-lg:hidden")} />
          <Ticket ex={ex} mode="after" className={cn(mode === "after" ? "flex" : "max-lg:hidden")} />
        </div>
      </div>
    </div>
  );
}
