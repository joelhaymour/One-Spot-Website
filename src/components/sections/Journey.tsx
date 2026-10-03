"use client";

import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from "react";
import { JOURNEY, type StepKey } from "@/content/site";
import { cn } from "@/lib/cn";
import { Split } from "@/components/motion/Split";
import { BuildScene } from "@/components/scenes/BuildScene";
import { FindScene } from "@/components/scenes/FindScene";
import { ListenScene } from "@/components/scenes/ListenScene";
import { LookScene } from "@/components/scenes/LookScene";
import { MapScene } from "@/components/scenes/MapScene";
import { ShowScene } from "@/components/scenes/ShowScene";
import { scrollToId } from "@/components/motion/SmoothScroll";

const SCENE: Record<StepKey, ComponentType<{ active: boolean }>> = {
  look: LookScene,
  listen: ListenScene,
  map: MapScene,
  find: FindScene,
  show: ShowScene,
  build: BuildScene,
};

/** On phones each illustration sits under its own step and plays when it comes into view. */
function InlineScene({ scene }: { scene: StepKey }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Scene = SCENE[scene];
  return (
    <div ref={ref} className="mt-8 rounded-[26px] border border-[var(--line)] bg-[var(--paper-2)] px-4 py-8 sm:px-8 lg:hidden">
      <Scene active={active} />
    </div>
  );
}

/**
 * 01 · How we work: the six steps of the One Spot journey, the same ones every account moves through in
 * the HUD. Steps scroll on the left; on wide screens one sticky stage on the right plays the illustration
 * for whichever step is under the reading line, with the journey rail above it filling as you go.
 */
export function Journey() {
  const [active, setActive] = useState(0);
  const steps = useRef<(HTMLLIElement | null)[]>([]);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
      },
      { rootMargin: "-46% 0px -46% 0px" },
    );
    steps.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) => {
    const el = steps.current[i];
    if (!el) return;
    if (!el.id) el.id = `how-${i + 1}`;
    scrollToId(el.id);
  };

  return (
    <section id="how" aria-labelledby="how-title" className="section bg-[var(--paper)]">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,32rem)] lg:items-end lg:gap-16">
          <div>
            <p className="t-eyebrow" data-reveal>
              {JOURNEY.eyebrow}
            </p>
            <Split id="how-title" lines={JOURNEY.headline} className="t-h2 mt-6" />
          </div>
          <p className="t-lead" data-reveal style={{ "--reveal-delay": "0.2s" } as CSSProperties}>
            {JOURNEY.lead}
          </p>
        </div>

        <div className="mt-16 grid gap-16 lg:mt-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <ol>
            {JOURNEY.steps.map((p, i) => (
              <li
                key={p.key}
                ref={(el) => {
                  steps.current[i] = el;
                }}
                data-index={i}
                className={cn(
                  "flex flex-col justify-center border-t border-[var(--line)] py-10 transition-opacity duration-700 lg:min-h-[72vh] lg:border-t-0 lg:py-0",
                  wide && active !== i && "lg:opacity-30",
                )}
              >
                <div data-reveal>
                  <p className="t-num flex items-center gap-3 text-[0.85rem] font-medium text-[var(--ink-3)]">
                    <span className={cn("grid h-8 w-8 place-items-center rounded-full border text-[0.78rem] transition-colors duration-500", active === i && wide ? "border-[var(--spot)] bg-[var(--spot)] text-white" : "border-[var(--line-strong)] text-[var(--ink-2)]")}>
                      {i + 1}
                    </span>
                    {p.short}
                  </p>
                  <p className="mt-6 text-[0.95rem] font-medium text-[var(--spot)]">{p.question}</p>
                  <h3 className="t-h3 mt-2 max-w-[18ch]">{p.title}</h3>
                  <p className="t-body mt-5 max-w-[30rem] text-[1.075rem]">{p.body}</p>
                </div>
                <InlineScene scene={p.key} />
              </li>
            ))}
          </ol>

          <div className="relative hidden lg:block">
            <div className="sticky top-[calc(50vh-min(350px,43vh))] h-[min(700px,86vh)]">
              <div className="relative h-full overflow-hidden rounded-[32px] border border-[var(--line)] bg-[var(--paper-2)]">
                <div aria-hidden className="dot-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_85%)]" />
                {/* the journey rail, as in the HUD: done in ink, the current step in the spot */}
                <div className="absolute inset-x-0 top-0 z-10 grid grid-cols-6 gap-1 px-6 pt-5">
                  {JOURNEY.steps.map((p, i) => (
                    <button key={p.key} type="button" onClick={() => goTo(i)} aria-label={`Show step ${i + 1}: ${p.short}`} className="group min-w-0 text-left">
                      <span className={cn("block h-[5px] rounded-full transition-colors duration-500", i < active ? "bg-[var(--ink)]" : i === active ? "bg-[var(--spot)]" : "bg-[var(--line-strong)] group-hover:bg-[var(--ink-4)]")} />
                      <span className={cn("mt-2 block truncate text-[0.72rem] font-medium transition-colors duration-500", i === active ? "text-[var(--spot)]" : i < active ? "text-[var(--ink-2)]" : "text-[var(--ink-4)] group-hover:text-[var(--ink-2)]")}>
                        {p.short}
                      </span>
                    </button>
                  ))}
                </div>
                {JOURNEY.steps.map((p, i) => {
                  const Scene = SCENE[p.key];
                  const on = wide && active === i;
                  return (
                    <div
                      key={p.key}
                      className={cn(
                        "absolute inset-0 flex items-center justify-center px-[7%] pb-[5%] pt-[13%] transition-[opacity,transform] duration-700 ease-[var(--ease-out)]",
                        active === i ? "opacity-100" : "pointer-events-none scale-[0.97] opacity-0",
                      )}
                    >
                      <Scene active={on} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <p className="t-small mt-10 lg:mt-4">{JOURNEY.note}</p>
      </div>
    </section>
  );
}
