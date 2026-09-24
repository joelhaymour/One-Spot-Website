"use client";

import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from "react";
import { WHAT, type PillarScene } from "@/content/site";
import { cn } from "@/lib/cn";
import { Split } from "@/components/motion/Split";
import { AutomateScene } from "@/components/scenes/AutomateScene";
import { ConnectScene } from "@/components/scenes/ConnectScene";
import { OrganizeScene } from "@/components/scenes/OrganizeScene";
import { SeeScene } from "@/components/scenes/SeeScene";
import { scrollToId } from "@/components/motion/SmoothScroll";

const SCENE: Record<PillarScene, ComponentType<{ active: boolean }>> = {
  connect: ConnectScene,
  organize: OrganizeScene,
  automate: AutomateScene,
  see: SeeScene,
};

const SHORT: Record<PillarScene, string> = { connect: "Connect", organize: "Organize", automate: "Automate", see: "See clearly" };

/** On phones each illustration sits under its own step and plays when it comes into view. */
function InlineScene({ scene }: { scene: PillarScene }) {
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
 * 02 · The four jobs. Steps scroll on the left; on wide screens one sticky stage on the right plays the
 * illustration for whichever step is under the reading line. Scroll picks the step; each illustration
 * then runs on its own clock.
 */
export function WhatWeDo() {
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
    if (!el.id) el.id = `what-${i + 1}`;
    scrollToId(el.id);
  };

  return (
    <section id="what" aria-labelledby="what-title" className="section bg-[var(--paper)]">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,32rem)] lg:items-end lg:gap-16">
          <div>
            <p className="t-eyebrow" data-reveal>
              {WHAT.eyebrow}
            </p>
            <Split id="what-title" lines={WHAT.headline} className="t-h2 mt-6" />
          </div>
          <p className="t-lead" data-reveal style={{ "--reveal-delay": "0.2s" } as CSSProperties}>
            {WHAT.lead}
          </p>
        </div>

        <div className="mt-16 grid gap-16 lg:mt-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <ol>
            {WHAT.pillars.map((p, i) => (
              <li
                key={p.scene}
                ref={(el) => {
                  steps.current[i] = el;
                }}
                data-index={i}
                className={cn(
                  "flex flex-col justify-center border-t border-[var(--line)] py-10 transition-opacity duration-700 lg:min-h-[76vh] lg:border-t-0 lg:py-0",
                  wide && active !== i && "lg:opacity-30",
                )}
              >
                <div data-reveal>
                  <p className="t-num flex items-center gap-3 text-[0.85rem] font-medium text-[var(--ink-3)]">
                    <span className={cn("grid h-8 w-8 place-items-center rounded-full border text-[0.78rem] transition-colors duration-500", active === i && wide ? "border-[var(--spot)] bg-[var(--spot)] text-white" : "border-[var(--line-strong)] text-[var(--ink-2)]")}>
                      {i + 1}
                    </span>
                    {SHORT[p.scene]}
                  </p>
                  <h3 className="t-h3 mt-6 max-w-[16ch]">{p.title}</h3>
                  <p className="t-body mt-5 max-w-[30rem] text-[1.075rem]">{p.body}</p>
                  <p className="mt-6 flex max-w-[30rem] gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 text-[0.95rem] leading-[1.5] text-[var(--ink)]">
                    <span className="mt-[3px] shrink-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--spot)]">For example</span>
                    <span>{p.example}</span>
                  </p>
                </div>
                <InlineScene scene={p.scene} />
              </li>
            ))}
          </ol>

          <div className="relative hidden lg:block">
            <div className="sticky top-[calc(50vh-min(340px,42vh))] h-[min(680px,84vh)]">
              <div className="relative h-full overflow-hidden rounded-[32px] border border-[var(--line)] bg-[var(--paper-2)]">
                <div aria-hidden className="dot-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_85%)]" />
                {/* which of the four is playing */}
                <div className="absolute inset-x-0 top-0 z-10 flex justify-center gap-1.5 p-5">
                  {WHAT.pillars.map((p, i) => (
                    <button
                      key={p.scene}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Show step ${i + 1}: ${SHORT[p.scene]}`}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-[0.75rem] font-medium transition-colors duration-300",
                        active === i ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]",
                      )}
                    >
                      {SHORT[p.scene]}
                    </button>
                  ))}
                </div>
                {WHAT.pillars.map((p, i) => {
                  const Scene = SCENE[p.scene];
                  const on = wide && active === i;
                  return (
                    <div
                      key={p.scene}
                      className={cn(
                        "absolute inset-0 flex items-center justify-center px-[8%] pb-[6%] pt-[12%] transition-[opacity,transform] duration-700 ease-[var(--ease-out)]",
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
      </div>
    </section>
  );
}
