"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { HERO_EXAMPLES, TOOLS, type ExampleActor, type ExampleStep } from "@/content/site";
import { onIntroDone } from "@/lib/intro";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";

type Mode = "before" | "after";

const { items } = HERO_EXAMPLES;
const BEFORE_MS = 4800;
const AFTER_MS = 5600;

const APP_COLOR: Record<string, string> = Object.fromEntries(TOOLS.apps.map((a) => [a.name, a.color]));

function Actor({ actor }: { actor: ExampleActor }) {
  const base = "grid h-8 w-8 shrink-0 place-items-center rounded-full";
  switch (actor) {
    case "onespot":
      return (
        <span className={cn(base, "bg-[var(--spot)] text-white shadow-[0_0_0_4px_rgba(45,74,224,0.12)]")}>
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
    <li className="story-row flex gap-3 rounded-2xl px-2 py-2" style={{ "--i": i } as CSSProperties}>
      <Actor actor={step.actor} />
      <div className="min-w-0 flex-1">
        <p className="text-[0.9rem] font-medium leading-snug text-[var(--ink)]">{step.text}</p>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.75rem] text-[var(--ink-3)]">
          <span>{step.who}</span>
          {step.flag ? <span className={cn("pill h-5 px-2 text-[0.7rem]", mode === "before" ? "pill-risk" : "pill-done")}>{step.flag}</span> : null}
          {step.apps?.map((app) => (
            <span key={app} className="inline-flex h-5 items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--card)] px-1.5 text-[0.68rem] font-medium text-[var(--ink-2)]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: APP_COLOR[app] ?? "var(--ink-3)" }} />
              {app}
            </span>
          ))}
        </p>
      </div>
    </li>
  );
}

/**
 * The hero's right side: one ordinary job in four kinds of business, first as it runs today, then with
 * One Spot. It plays through on its own (today, then with One Spot, then the next business) while it's
 * on screen; the moment a visitor picks a tab or a side, it stops and stays where they put it.
 */
export function HeroExamples({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("before");
  const [auto, setAuto] = useState(false);
  const [visible, setVisible] = useState(true);

  // Autoplay once the logo intro has lifted, and only while the card is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || document.documentElement.dataset.motion !== "on") return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    const stop = onIntroDone(() => setAuto(true));
    return () => {
      stop();
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!auto || !visible) return;
    const t = setTimeout(
      () => {
        if (mode === "before") setMode("after");
        else {
          setMode("before");
          setIndex((n) => (n + 1) % items.length);
        }
      },
      mode === "before" ? BEFORE_MS : AFTER_MS,
    );
    return () => clearTimeout(t);
  }, [auto, visible, mode, index]);

  // On narrow screens the tabs don't all fit: slide the row so the business playing is in view.
  // Scrolls only the row, never the page.
  useEffect(() => {
    const list = tabsRef.current;
    const tab = list?.children[index] as HTMLElement | undefined;
    if (!list || !tab || list.scrollWidth <= list.clientWidth) return;
    const left = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
    const smooth = document.documentElement.dataset.motion === "on";
    list.scrollTo({ left: Math.max(0, left), behavior: smooth ? "smooth" : "auto" });
  }, [index]);

  const ex = items[index];
  const steps = mode === "before" ? ex.before : ex.after;
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
    <div ref={ref} className={cn("rounded-[24px] border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-float)]", className)}>
      {/* the four businesses */}
      <div ref={tabsRef} role="tablist" aria-label="Example businesses" className="no-scrollbar relative flex gap-1 overflow-x-auto border-b border-[var(--line-soft)] p-2">
        {items.map((it, i) => (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => pick(i)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full px-3 py-2 text-[0.8rem] font-medium transition-colors duration-300",
              i === index ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--ink-3)] hover:bg-[var(--paper-2)] hover:text-[var(--ink)]",
            )}
          >
            <Icon name={it.icon} size={15} />
            {it.tab}
            {i === index && playing ? (
              <span
                key={`${index}-${mode}`}
                aria-hidden
                className="ex-timer absolute bottom-0 left-0 h-[2px] bg-[var(--spot-light)]"
                style={{ animationDuration: `${mode === "before" ? BEFORE_MS : AFTER_MS}ms` }}
              />
            ) : null}
          </button>
        ))}
      </div>

      <div className="px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5" role="tabpanel" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">{HERO_EXAMPLES.label}</p>
          <p className="text-[0.7rem] text-[var(--ink-4)]">{HERO_EXAMPLES.note}</p>
        </div>
        <p key={ex.key} className="story-fade mt-2 text-[1.1rem] font-semibold leading-snug tracking-[-0.025em] text-[var(--ink)] sm:text-[1.2rem]">
          {ex.moment}
        </p>

        {/* today / with One Spot */}
        <div className="relative mt-4 grid grid-cols-2 rounded-full bg-[var(--paper-2)] p-1 text-[0.82rem] font-medium">
          <span
            aria-hidden
            className={cn(
              "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full shadow-[var(--shadow-card)] transition-[transform,background-color] duration-500 ease-[var(--ease-out)]",
              mode === "after" ? "translate-x-full bg-[var(--spot)]" : "bg-[var(--card)]",
            )}
          />
          <button type="button" aria-pressed={mode === "before"} onClick={() => side("before")} className={cn("relative z-10 flex items-center justify-center gap-1.5 rounded-full py-2 transition-colors duration-300", mode === "before" ? "text-[var(--ink)]" : "text-[var(--ink-3)]")}>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--risk)]" />
            {HERO_EXAMPLES.before}
          </button>
          <button type="button" aria-pressed={mode === "after"} onClick={() => side("after")} className={cn("relative z-10 flex items-center justify-center gap-1.5 rounded-full py-2 transition-colors duration-300", mode === "after" ? "text-white" : "text-[var(--ink-3)]")}>
            <Mark size={13} spot={mode === "after" ? "#fff" : "var(--spot)"} />
            {HERO_EXAMPLES.after}
          </button>
        </div>

        <ol key={`${ex.key}-${mode}`} className="mt-3 grid min-h-[19.5rem] content-start gap-0.5 sm:min-h-[18rem]">
          {steps.map((step, i) => (
            <Row key={step.text} step={step} mode={mode} i={i} />
          ))}
        </ol>

        {/* what changes */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {ex.stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-[var(--paper-2)] px-3.5 py-3">
              <p className="text-[0.72rem] text-[var(--ink-3)]">{s.label}</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
                <span className={cn("t-num transition-all duration-500", mode === "after" ? "w-full text-[0.75rem] leading-snug text-[var(--ink-4)] line-through decoration-[rgba(180,65,47,0.5)]" : "w-full text-[0.92rem] font-semibold leading-snug text-[var(--ink)] sm:text-[0.98rem]")}>{s.before}</span>
                {mode === "after" ? (
                  <span key={`${ex.key}-${s.label}`} className="story-fade t-num w-full text-[0.92rem] font-semibold leading-snug tracking-[-0.015em] sm:text-[0.98rem] text-[var(--done)]">
                    {s.after}
                  </span>
                ) : null}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
