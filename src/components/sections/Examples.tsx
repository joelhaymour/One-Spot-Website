"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { EXAMPLES } from "@/content/site";
import { STORIES, type StoryActor } from "@/content/stories";
import { cn } from "@/lib/cn";
import { Split } from "@/components/motion/Split";
import { Icon, type IconName } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";

type Mode = "before" | "after";

const INDUSTRY_ICON: Record<string, IconName> = {
  home: "phone",
  construction: "hardhat",
  dealership: "car",
  clinic: "calendar",
  wholesale: "box",
  services: "file",
};

function Actor({ actor }: { actor: StoryActor }) {
  const base = "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full";
  switch (actor) {
    case "agent":
      return (
        <span className={cn(base, "bg-[var(--spot)] text-white shadow-[0_0_0_5px_rgba(45,74,224,0.12)]")}>
          <Mark size={18} spot="#fff" />
        </span>
      );
    case "owner":
      return <span className={cn(base, "bg-[var(--ink)] text-[0.7rem] font-semibold text-[var(--paper)]")}>You</span>;
    case "customer":
      return (
        <span className={cn(base, "bg-[#ece7fa] text-[#6a4fc4]")}>
          <Icon name="person" size={17} />
        </span>
      );
    case "wait":
      return (
        <span className={cn(base, "bg-[var(--wait-soft)] text-[var(--wait)]")}>
          <Icon name="clock" size={17} />
        </span>
      );
    default:
      return (
        <span className={cn(base, "border border-[var(--line-strong)] bg-[var(--card)] text-[var(--ink-2)]")}>
          <Icon name="person" size={17} />
        </span>
      );
  }
}

/**
 * 04 · Examples. One ordinary moment in four kinds of business, before and after. The visitor picks the
 * business that looks like theirs and flips between the two versions of the same evening.
 */
export function Examples() {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("before");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();
  const story = STORIES[index];
  const steps = mode === "before" ? story.before : story.after;
  const after = mode === "after";

  const pick = (i: number) => {
    setIndex(i);
    setMode("before");
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = STORIES.length - 1;
    let next = -1;
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next < 0) return;
    event.preventDefault();
    pick(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="examples" aria-labelledby="examples-title" className="section">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,30rem)] lg:items-end lg:gap-16">
          <div>
            <p className="t-eyebrow" data-reveal>
              {EXAMPLES.eyebrow}
            </p>
            <Split id="examples-title" lines={EXAMPLES.headline} className="t-h2 mt-6" />
          </div>
          <p className="t-lead" data-reveal style={{ "--reveal-delay": "0.2s" } as CSSProperties}>
            {EXAMPLES.lead}
          </p>
        </div>

        {/* which business */}
        <div role="tablist" aria-label="Kind of business" className="-mx-[var(--gutter)] mt-12 flex gap-2 overflow-x-auto px-[var(--gutter)] pb-2 [scrollbar-width:none]" data-reveal>
          {STORIES.map((s, i) => (
            <button
              key={s.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${uid}-tab-${s.id}`}
              aria-selected={i === index}
              aria-controls={`${uid}-panel`}
              tabIndex={i === index ? 0 : -1}
              onClick={() => pick(i)}
              onKeyDown={onTabKey}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-full border px-4 py-2.5 text-[0.92rem] font-medium tracking-[-0.01em] transition-[background-color,border-color,color] duration-300",
                i === index ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]" : "border-[var(--line-strong)] bg-[var(--card)] text-[var(--ink-2)] hover:border-[var(--ink-3)] hover:text-[var(--ink)]",
              )}
            >
              <Icon name={INDUSTRY_ICON[s.id] ?? "tools"} size={17} />
              {s.industry}
            </button>
          ))}
        </div>

        <div
          id={`${uid}-panel`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${story.id}`}
          className="card mt-6 grid overflow-hidden lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
          data-reveal
        >
          {/* the moment, the switch, and what changed */}
          <div className="flex flex-col border-b border-[var(--line)] p-6 sm:p-10 lg:border-b-0 lg:border-r">
            <p className="text-[0.85rem] text-[var(--ink-3)]">{story.business}</p>
            <h3 key={story.id} className="t-h3 story-fade mt-4 max-w-[18ch]">
              {story.moment}
            </h3>

            <div role="radiogroup" aria-label="Show the moment" className="relative mt-8 grid w-full max-w-[22rem] grid-cols-2 rounded-full bg-[var(--paper-2)] p-1">
              <span
                aria-hidden
                className={cn(
                  "absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-full shadow-[var(--shadow-card)] transition-[transform,background-color] duration-500 ease-[var(--ease-out)]",
                  after ? "translate-x-full bg-[var(--spot)]" : "bg-[var(--card)]",
                )}
              />
              {(["before", "after"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "relative z-10 rounded-full py-2.5 text-[0.9rem] font-medium transition-colors duration-300",
                    mode === m ? (m === "after" ? "text-white" : "text-[var(--ink)]") : "text-[var(--ink-3)] hover:text-[var(--ink)]",
                  )}
                >
                  {m === "before" ? EXAMPLES.before : EXAMPLES.after}
                </button>
              ))}
            </div>

            <dl className="mt-auto grid gap-0 pt-10">
              {story.outcomes.map((o) => (
                <div key={o.label} className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-t border-[var(--line)] py-3.5">
                  <dt className="text-[0.9rem] text-[var(--ink-2)]">{o.label}</dt>
                  <dd className="flex items-baseline justify-end gap-2.5 text-right">
                    <span className={cn("t-num text-[0.95rem] transition-colors duration-500", after ? "text-[var(--ink-4)] line-through decoration-[var(--ink-4)]" : "font-medium text-[var(--wait)]")}>{o.before}</span>
                    {after && (
                      <span key={story.id} className="story-fade t-num inline-flex items-baseline gap-2.5 text-[0.95rem] font-semibold text-[var(--done)]">
                        <Icon name="arrow" size={13} className="self-center text-[var(--ink-3)]" />
                        {o.after}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* the same moment, step by step */}
          <div className={cn("relative p-6 transition-colors duration-700 sm:p-10", after ? "bg-[rgba(228,232,251,0.35)]" : "bg-[var(--card)]")}>
            <p className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">
              <span className={cn("h-2 w-2 rounded-full", after ? "bg-[var(--spot)]" : "bg-[var(--wait)]")} />
              {after ? EXAMPLES.after : EXAMPLES.before}
            </p>
            <ol key={`${story.id}-${mode}`} className="mt-6" aria-live="polite">
              {steps.map((step, i) => (
                <li key={i} className="story-row relative grid grid-cols-[auto_1fr] gap-x-4 pb-6 last:pb-0 sm:grid-cols-[5.6rem_auto_1fr]" style={{ "--i": i } as CSSProperties}>
                  <span className="t-num pt-2 text-[0.8rem] leading-tight text-[var(--ink-3)] max-sm:hidden">{step.time}</span>
                  <span className="relative flex justify-center">
                    <Actor actor={step.actor} />
                    {i < steps.length - 1 && (
                      <span
                        aria-hidden
                        className={cn(
                          "absolute left-1/2 top-9 -bottom-6 w-0 -translate-x-1/2 border-l",
                          after ? "border-solid border-[rgba(45,74,224,0.35)]" : "border-dashed border-[var(--ink-4)]",
                        )}
                      />
                    )}
                  </span>
                  <div className="pt-1">
                    <p className="t-num mb-0.5 text-[0.75rem] text-[var(--ink-3)] sm:hidden">{step.time}</p>
                    <p className="text-[0.95rem] font-medium tracking-[-0.012em] text-[var(--ink)]">{step.who}</p>
                    <p className="mt-0.5 text-[0.95rem] leading-[1.5] text-[var(--ink-2)]">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            {!after && (
              <button
                type="button"
                onClick={() => setMode("after")}
                className="story-row group mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--spot)] px-5 py-3 text-[0.92rem] font-medium text-white shadow-[0_12px_28px_-12px_rgba(45,74,224,0.7)] transition-colors hover:bg-[var(--spot-deep)]"
                style={{ "--i": steps.length } as CSSProperties}
              >
                {EXAMPLES.switchPrompt}
                <Icon name="arrow" size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>

        <p className="t-small mt-5">{EXAMPLES.disclaimer}</p>
      </div>
    </section>
  );
}
