"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { TOOLS } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { Split } from "@/components/motion/Split";
import { Icon, type IconName } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";

type Spot = { x: number; y: number; r?: number };

const HUB: Spot = { x: 50, y: 54 };

/** Where each app ends up: a calm ring around One Spot. This is also the no-motion layout. */
const RING: Spot[] = TOOLS.apps.map((_, i) => {
  const a = -Math.PI / 2 + (i / TOOLS.apps.length) * Math.PI * 2;
  return { x: HUB.x + Math.cos(a) * 35, y: HUB.y + Math.sin(a) * 33 };
});

/** Where each app starts: piled on the desk, overlapping, a little crooked. Same order as TOOLS.apps. */
const SCATTER: Spot[] = [
  { x: 24, y: 34, r: -5 }, // Email
  { x: 66, y: 30, r: 4 }, // Accounting
  { x: 47, y: 68, r: -3 }, // CRM
  { x: 80, y: 62, r: 6 }, // Shared drive
  { x: 20, y: 72, r: 3 }, // Spreadsheet
  { x: 48, y: 40, r: -7 }, // Calendar
  { x: 34, y: 53, r: 5 }, // Field app
];

/** One job, hopping from app to app (indexes into TOOLS.apps). */
const HOPS = [6, 0, 4, 1, 2, 3, 0, 5, 1, 2, 0];

function AppWindow({ name, icon, color }: { name: string; icon: string; color: string }) {
  return (
    <div className="w-[104px] rounded-[12px] border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-float)] sm:w-[150px] sm:rounded-[14px]">
      <div className="flex items-center gap-1 border-b border-[var(--line-soft)] px-1.5 py-1.5 sm:gap-1.5 sm:px-2.5 sm:py-2">
        <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-md text-white sm:h-6 sm:w-6" style={{ background: color }}>
          <Icon name={icon as IconName} size={12} strokeWidth={1.9} />
        </span>
        <span className="whitespace-nowrap text-[0.6rem] font-semibold tracking-[-0.01em] text-[var(--ink)] sm:text-[0.78rem]">{name}</span>
      </div>
      <div className="grid gap-1.5 px-2 py-2 sm:px-2.5 sm:py-2.5">
        <span className="h-1.5 w-[80%] rounded-full bg-[var(--paper-3)]" />
        <span className="h-1.5 w-[55%] rounded-full bg-[var(--paper-3)]" />
        <span className="hidden h-1.5 w-[68%] rounded-full bg-[var(--paper-3)] sm:block" />
      </div>
    </div>
  );
}

/**
 * 02 · Your tools. One job moving through a typical office: the cursor hops between seven apps that
 * don't talk to each other while the click count climbs. Then One Spot arrives in the middle, the apps
 * settle into a ring around it, and the count falls. Scrubbed by scroll through a CSS-sticky track.
 *
 * The connected ring is the natural layout, so without motion that is what a visitor sees.
 */
export function Tools() {
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  // The lines are drawn in real pixels (so dash-drawing by path length stays exact), sized to the frame.
  const [size, setSize] = useState({ w: 1000, h: 600 });

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const track = trackRef.current;
      const frame = frameRef.current;
      if (!track || !frame || document.documentElement.dataset.motion !== "on") return;
      const q = gsap.utils.selector(frame);
      const apps = q(".t-app") as HTMLElement[];
      const clicks = q(".t-clicks")[0] as HTMLElement | undefined;
      const retyped = q(".t-retyped")[0] as HTMLElement | undefined;
      const count = { c: 0, r: 0 };
      const paint = () => {
        if (clicks) clicks.textContent = String(Math.round(count.c));
        if (retyped) retyped.textContent = String(Math.round(count.r));
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: track, start: "top top", end: "bottom bottom", scrub: 0.5, invalidateOnRefresh: true },
      });

      // Opening state: apps piled up, nothing connected.
      apps.forEach((app, i) => {
        tl.fromTo(
          app,
          { left: `${SCATTER[i].x}%`, top: `${SCATTER[i].y}%`, rotation: SCATTER[i].r ?? 0, zIndex: 2 + i },
          { left: `${SCATTER[i].x}%`, top: `${SCATTER[i].y}%`, rotation: SCATTER[i].r ?? 0, duration: 0.001, immediateRender: true },
          0,
        );
      });
      tl.fromTo(q(".t-spoke"), { strokeDashoffset: 1 }, { strokeDashoffset: 1, duration: 0.001, immediateRender: true }, 0)
        .fromTo(q(".t-hub"), { scale: 0, opacity: 0 }, { scale: 0, opacity: 0, duration: 0.001, immediateRender: true }, 0)
        .fromTo(q(".t-after"), { opacity: 0 }, { opacity: 0, duration: 0.001, immediateRender: true }, 0)
        .fromTo(q(".t-before"), { opacity: 1 }, { opacity: 1, duration: 0.001, immediateRender: true }, 0)
        .fromTo(q(".t-trail"), { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 1, opacity: 1, duration: 0.001, immediateRender: true }, 0)
        .fromTo(q(".t-cursor"), { left: `${SCATTER[HOPS[0]].x}%`, top: `${SCATTER[HOPS[0]].y}%`, opacity: 0 }, { opacity: 1, duration: 0.03, immediateRender: true }, 0.01)
        .fromTo(q(".t-close"), { opacity: 0, y: 12 }, { opacity: 0, y: 12, duration: 0.001, immediateRender: true }, 0)
;
      paint();

      // Phase one: the job hops from app to app. Every hop is clicks, and some are retyping.
      const HOP = 0.042;
      HOPS.forEach((h, i) => {
        const at = 0.04 + i * HOP;
        const target = apps[h];
        tl.to(q(".t-cursor"), { left: `${SCATTER[h].x}%`, top: `${SCATTER[h].y}%`, duration: HOP * 0.7, ease: "power2.inOut" }, at)
          .set(target, { zIndex: 20 + i }, at + HOP * 0.5)
          .fromTo(target, { scale: 1 }, { scale: 1.06, duration: HOP * 0.15, yoyo: true, repeat: 1 }, at + HOP * 0.55)
          .fromTo(q(".t-ripple"), { left: `${SCATTER[h].x}%`, top: `${SCATTER[h].y}%`, scale: 0.3, opacity: 0.6 }, { scale: 1.6, opacity: 0, duration: HOP * 0.4 }, at + HOP * 0.6);
      });
      const hopsEnd = 0.04 + HOPS.length * HOP;
      tl.to(q(".t-trail"), { strokeDashoffset: 0, duration: hopsEnd - 0.04 }, 0.04).fromTo(
        count,
        { c: 0, r: 0 },
        { c: TOOLS.before.clicks, r: TOOLS.before.retyped, duration: hopsEnd - 0.04, onUpdate: paint, immediateRender: false },
        0.04,
      );

      // Phase two: One Spot in the middle, the apps settle around it, the count falls.
      const p2 = hopsEnd + 0.06;
      tl.to(q(".t-before"), { opacity: 0, duration: 0.03 }, p2)
        .to(q(".t-after"), { opacity: 1, duration: 0.03 }, p2 + 0.03)
        .to(q(".t-trail"), { opacity: 0, duration: 0.05 }, p2)
        .to(q(".t-cursor"), { opacity: 0, duration: 0.04 }, p2)
        .to(q(".t-hub"), { scale: 1, opacity: 1, duration: 0.08, ease: "back.out(1.6)" }, p2 + 0.02);
      apps.forEach((app, i) => {
        tl.to(app, { left: `${RING[i].x}%`, top: `${RING[i].y}%`, rotation: 0, duration: 0.16, ease: "power2.inOut" }, p2 + 0.04 + i * 0.008);
      });
      tl.to(q(".t-spoke"), { strokeDashoffset: 0, duration: 0.08, stagger: 0.012 }, p2 + 0.18)
        .fromTo(count, { c: TOOLS.before.clicks, r: TOOLS.before.retyped }, { c: TOOLS.after.clicks, r: TOOLS.after.retyped, duration: 0.2, ease: "power1.inOut", onUpdate: paint, immediateRender: false }, p2 + 0.08)
        .to(q(".t-close"), { opacity: 1, y: 0, duration: 0.05 }, p2 + 0.3)
        .to({}, { duration: 0.08 });

      frame.dataset.ready = "";
    },
    { scope: trackRef },
  );

  const px = (p: Spot) => [(p.x / 100) * size.w, (p.y / 100) * size.h] as const;
  const trail = HOPS.map((h) => px(SCATTER[h]).join(",")).join(" ");
  const hub = px(HUB);

  return (
    <section id="tools" aria-labelledby="tools-title" className="relative bg-[var(--paper)] pt-[clamp(96px,13vw,184px)]">
      <div className="wrap grid gap-8 lg:grid-cols-[1fr_minmax(0,32rem)] lg:items-end lg:gap-16">
        <div>
          <p className="t-eyebrow" data-reveal>
            {TOOLS.eyebrow}
          </p>
          <Split id="tools-title" lines={TOOLS.headline} className="t-h2 mt-6" />
        </div>
        <p className="t-lead" data-reveal style={{ "--reveal-delay": "0.2s" } as CSSProperties}>
          {TOOLS.lead}
        </p>
      </div>

      <div ref={trackRef} className="tools-track relative">
        <div className="tools-stage flex items-center">
          <div className="wrap h-full">
            <div ref={frameRef} aria-hidden className="tools-frame relative h-full select-none overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--paper-2)]">
              <div className="dot-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_85%)]" />

              {/* where we are, and the count */}
              <div className="absolute inset-x-0 top-0 z-[60] flex items-start justify-between gap-4 p-4 sm:p-6">
                <span className="relative inline-grid text-[0.72rem] font-medium sm:text-[0.8rem]">
                  <span className="t-before col-start-1 row-start-1 inline-flex items-center gap-2 rounded-full bg-[var(--card)] px-3 py-1.5 text-[var(--ink-2)] opacity-0 shadow-[var(--shadow-card)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--risk)]" />
                    {TOOLS.before.label}
                  </span>
                  <span className="t-after col-start-1 row-start-1 inline-flex items-center gap-2 rounded-full bg-[var(--spot)] px-3 py-1.5 text-white shadow-[var(--shadow-card)]">
                    <Mark size={13} spot="#fff" />
                    {TOOLS.after.label}
                  </span>
                </span>
                <div className="rounded-2xl bg-[var(--card)] px-3.5 py-2.5 text-right shadow-[var(--shadow-card)] sm:px-4 sm:py-3">
                  <p className="whitespace-nowrap text-[0.62rem] font-medium text-[var(--ink-3)] sm:text-[0.72rem]">{TOOLS.counter}</p>
                  <p className="t-clicks t-num text-[1.8rem] font-semibold leading-none tracking-[-0.04em] text-[var(--ink)] sm:text-[2.4rem]">{TOOLS.after.clicks}</p>
                  <p className="mt-1 hidden text-[0.72rem] text-[var(--ink-3)] sm:block">
                    {TOOLS.retyped}: <span className="t-retyped t-num font-semibold text-[var(--ink)]">{TOOLS.after.retyped}</span>
                  </p>
                </div>
              </div>

              {/* the trail of hops, and the spokes once connected */}
              <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${size.w} ${size.h}`}>
                <polyline className="t-trail" points={trail} fill="none" stroke="var(--risk)" strokeOpacity="0.5" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="1" pathLength={1} opacity="0" />
                {RING.map((p, i) => {
                  const [x, y] = px(p);
                  return <line key={i} className="t-spoke" x1={hub[0]} y1={hub[1]} x2={x} y2={y} stroke="var(--spot)" strokeOpacity="0.5" strokeWidth="1.75" strokeDasharray="1" pathLength={1} />;
                })}
              </svg>

              {/* One Spot, in the middle */}
              <div className="t-hub absolute z-[40] -translate-x-1/2 -translate-y-1/2" style={{ left: `${HUB.x}%`, top: `${HUB.y}%` }}>
                <span className="tools-pulse absolute inset-0 rounded-full" />
                <span className="relative flex items-center gap-2 rounded-full bg-[var(--ink)] py-2 pl-2 pr-3.5 text-[0.8rem] font-semibold text-[var(--paper)] shadow-[var(--shadow-float)] sm:py-2.5 sm:pl-2.5 sm:pr-4 sm:text-[0.9rem]">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--paper)] text-[var(--ink)] sm:h-7 sm:w-7">
                    <Mark size={16} />
                  </span>
                  One Spot
                </span>
              </div>

              {TOOLS.apps.map((a, i) => (
                <div key={a.name} className="t-app absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${RING[i].x}%`, top: `${RING[i].y}%`, zIndex: 2 + i }}>
                  <AppWindow name={a.name} icon={a.icon} color={a.color} />
                </div>
              ))}

              <span className="t-ripple pointer-events-none absolute z-[70] h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--ink)] opacity-0" />
              <span className="t-cursor pointer-events-none absolute z-[80] opacity-0 drop-shadow-[0_4px_8px_rgba(21,23,27,0.3)]" style={{ left: "50%", top: "50%" }}>
                <Icon name="cursor" size={26} strokeWidth={1.4} className="fill-[var(--ink)] text-white" />
              </span>

              <p className="t-close absolute inset-x-0 bottom-0 z-[60] p-5 text-center text-[0.9rem] font-medium text-[var(--ink)] sm:p-7 sm:text-[1.05rem]">{TOOLS.close}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
