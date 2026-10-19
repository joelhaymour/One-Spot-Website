"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type FocusEvent, type PointerEvent, type ReactNode } from "react";
import { CONNECT, type ConnectIcon, type ConnectPart } from "@/content/site";
import { cn } from "@/lib/cn";
import { AnchorButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";

type Key = string;
type Item = { key: Key; label: string; note: string; icon: ConnectIcon; hub: string };

const PARTS = CONNECT.parts;
const OTHER = CONNECT.other;
const ITEMS: Item[] = [...PARTS, OTHER];
const KEYS: Key[] = ITEMS.map((p) => p.key);

/**
 * Where each part sits, in % of the map. Phones put the dashboard on top and the parts in two columns
 * under it, joined by one line down the middle; wider screens set them in a ring around it.
 */
const SPOTS: Record<Key, { m: [number, number]; d: [number, number] }> = {
  customers: { m: [25, 48], d: [24, 17] },
  work: { m: [75, 48], d: [76, 17] },
  money: { m: [25, 65], d: [84, 50] },
  paperwork: { m: [75, 65], d: [76, 83] },
  stock: { m: [25, 82], d: [24, 83] },
  other: { m: [75, 82], d: [16, 50] },
};
const HUB = { m: [50, 20] as [number, number], d: [50, 50] as [number, number] };

/** How long each part stays lit while the map plays through on its own (once). */
const STEP_MS = 6500;
/** "Anything else": the next tool plugs in this often, and its step lasts until the last one is in. */
const CYCLE_MS = 1700;
const OTHER_MS = OTHER.cycle.length * CYCLE_MS + 700;
/** The first time the dashboard is fully in view, every part sends a pulse into it and fills its row. */
const FILL_MS = 2300;
/** A pulse takes this long to land; its row lights as it does (the CSS delays match). */
const LAND_MS = 560;
/** A resting mouse stops holding the tour after this long without moving. */
const HOVER_IDLE_MS = 3000;

/** p0 and p1: where the line leaves the part and reaches the dashboard, in % of its length. */
type Line = { key: Key; d: string; p0: number; p1: number };

const pulseVars = (l: Line, delay = 0) => ({ "--p0": l.p0, "--p1": l.p1, "--pulse-delay": `${delay}ms` }) as CSSProperties;

const spot = (s: { m: [number, number]; d: [number, number] }) =>
  ({ "--mx": `${s.m[0]}%`, "--my": `${s.m[1]}%`, "--dx": `${s.d[0]}%`, "--dy": `${s.d[1]}%` }) as CSSProperties;

const noop = () => () => {};
const motionOn = () => document.documentElement.dataset.motion === "on";

function PartNode({ item, lit, selected, onPick }: { item: Item; lit: boolean; selected: boolean; onPick: (k: Key) => void }) {
  return (
    <button
      type="button"
      data-node={item.key}
      aria-pressed={selected}
      aria-controls={`connect-${item.key}`}
      onClick={() => onPick(item.key)}
      style={spot(SPOTS[item.key])}
      className={cn(
        "connect-node absolute left-[var(--mx)] top-[var(--my)] z-10 flex min-h-[70px] w-[43%] max-w-[168px] -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-2xl border px-3 py-2 text-left md:left-[var(--dx)] md:top-[var(--dy)] md:min-h-[68px] md:w-[196px] md:max-w-none md:px-3.5",
        item.key === OTHER.key && !lit && "border-dashed",
        lit ? "border-[var(--spot)] bg-[var(--card)] shadow-[0_0_0_4px_rgba(45,74,224,0.12),var(--shadow-lift)]" : "border-[var(--line-strong)] bg-[var(--card)] shadow-[var(--shadow-card)] hover:border-[var(--ink-4)]",
      )}
    >
      <span className={cn("hidden h-8 w-8 shrink-0 place-items-center rounded-xl transition-colors duration-300 md:grid", lit ? "bg-[var(--spot)] text-white" : "bg-[var(--paper-2)] text-[var(--ink-2)]")}>
        <Icon name={item.icon} size={16} />
      </span>
      <span className="min-w-0">
        <span className={cn("block text-[0.86rem] font-semibold leading-tight tracking-[-0.01em] transition-colors duration-300 md:text-[0.92rem] md:text-[var(--ink)]", lit ? "text-[var(--spot)]" : "text-[var(--ink)]")}>{item.label}</span>
        <span className="mt-0.5 block text-[0.72rem] leading-tight text-[var(--ink-3)]">{item.note}</span>
      </span>
    </button>
  );
}

function Label({ children }: { children: string }) {
  return <p className="text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)]">{children}</p>;
}

function Title({ k, icon, label }: { k: Key; icon: ConnectIcon; label: string }) {
  return (
    <p className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--spot)] text-white">
        <Icon name={icon} size={17} />
      </span>
      <span id={`connect-${k}-title`} className="text-[1.35rem] font-semibold tracking-[-0.025em] text-[var(--ink)]">
        {label}
      </span>
    </p>
  );
}

/** Every panel sits in the same grid cell, so the card is always as tall as the tallest and nothing below it jumps. */
function Panel({ k, on, children }: { k: Key; on: boolean; children: ReactNode }) {
  return (
    <div id={`connect-${k}`} data-on={on || undefined} aria-hidden={!on} inert={!on} className="connect-panel [grid-area:1/1]">
      {children}
    </div>
  );
}

function PartPanel({ part, on }: { part: ConnectPart; on: boolean }) {
  return (
    <Panel k={part.key} on={on}>
      <Title k={part.key} icon={part.icon} label={part.label} />
      <div className="mt-6 grid gap-6 md:max-xl:grid-cols-3 md:max-xl:gap-8">
        <div>
          <Label>{CONNECT.labels.tools}</Label>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {part.tools.map((t) => (
              <li key={t} className="rounded-full border border-[var(--line-strong)] bg-[var(--paper)] px-3 py-1 text-[0.85rem] text-[var(--ink-2)]">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Label>{CONNECT.labels.outcomes}</Label>
          <ul className="mt-2.5 grid gap-2">
            {part.outcomes.map((o, i) => (
              <li key={o} className="connect-row flex items-start gap-2.5 text-[0.98rem] leading-snug text-pretty text-[var(--ink)]" style={{ "--i": i } as CSSProperties}>
                <span className="mt-[3px] grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--done-soft)] text-[var(--done)]">
                  <Icon name="check" size={12} strokeWidth={2.6} />
                </span>
                {o}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Label>{CONNECT.labels.examples}</Label>
          <ul className="mt-2.5 grid gap-1.5 text-[0.92rem] leading-snug text-[var(--ink-2)]">
            {part.examples.map((e) => (
              <li key={e.who} className="text-pretty">
                <span className="font-medium text-[var(--ink)]">{e.who}</span> · {e.what}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

/** chip: the tool plugging in right now, or -1 when every one is connected (the resting state). */
function OtherPanel({ on, chip }: { on: boolean; chip: number }) {
  return (
    <Panel k={OTHER.key} on={on}>
      <Title k={OTHER.key} icon={OTHER.icon} label={OTHER.label} />
      <div className="flex flex-col md:max-xl:grid md:max-xl:grid-cols-2 md:max-xl:gap-x-8">
        <div>
          <p className="mt-5 text-[1.15rem] font-semibold leading-snug tracking-[-0.02em] text-balance text-[var(--ink)]">{OTHER.title}</p>
          <p className="mt-2 text-[0.98rem] leading-relaxed text-pretty text-[var(--ink-2)]">{OTHER.body}</p>
        </div>

        {/* the tools a business might add, plugging in one after another and staying connected */}
        <ul className="mt-5 grid gap-1.5 md:max-xl:col-start-2 md:max-xl:row-span-2 md:max-xl:row-start-1 md:max-xl:flex md:max-xl:flex-wrap md:max-xl:content-start">
          {OTHER.cycle.map((t, i) => {
            const now = i === chip;
            const done = chip < 0 || i < chip;
            return (
              <li
                key={t}
                className={cn(
                  "flex items-center justify-between gap-3 whitespace-nowrap rounded-2xl border px-3.5 py-2 text-[0.92rem] transition-[background-color,border-color,color] duration-300",
                  now ? "border-[var(--spot)] bg-[var(--spot-soft)] text-[var(--ink)]" : done ? "border-[var(--line-strong)] bg-[var(--card)] text-[var(--ink)]" : "border-dashed border-[var(--line-strong)] text-[var(--ink-2)]",
                )}
              >
                {t}
                <span className={cn("flex items-center gap-1 text-[0.78rem] font-medium transition-[opacity,color] duration-300", now ? "text-[var(--spot)]" : "text-[var(--ink-3)]", now || done ? "opacity-100" : "opacity-0")}>
                  <Mark size={12} spot={now ? "var(--spot)" : "var(--ink-3)"} /> <span className="max-[379px]:sr-only">{OTHER.connected}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <AnchorButton href="#contact" size="sm" className="mt-6 self-start md:max-xl:col-start-1 md:max-xl:row-start-2 md:max-xl:justify-self-start">
          {OTHER.action}
        </AnchorButton>
      </div>
    </Panel>
  );
}

/**
 * The parts of a business around one dashboard. The dashboard in the middle holds one row per part, with
 * the same numbers as the morning screen in the hero. Pick a part: its line lights, a pulse runs into the
 * dashboard and its row lights, and the panel shows where that part usually lives, what changes once it's
 * connected, and two examples. "Anything else" plugs other tools in one after another, on the map itself.
 *
 * The first time the dashboard is fully in view, every part sends a pulse in and fills its row; then it
 * plays through once (pausing while someone moves a mouse over it, tabs through it or reads the panel) and
 * rests on "Anything else" with every tool connected.
 * Without motion it shows the finished state.
 */
export function ConnectMap({ className }: { className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fillTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const picked = useRef(false);
  const ratios = useRef({ frame: 0, panel: 0 });

  const motion = useSyncExternalStore(noop, motionOn, () => false);
  const [active, setActive] = useState<Key>(KEYS[0]);
  const [auto, setAuto] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  const [reading, setReading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [chip, setChip] = useState(-1);
  const [landed, setLanded] = useState(-1);
  const [otherRun, setOtherRun] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [started, setStarted] = useState(false);
  const [filled, setFilled] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // No attribute (server, no motion) means finished; with motion the rows start dim until the first fill.
  const fill = !motion ? undefined : filled ? "done" : started ? "running" : "idle";
  const ready = fill === undefined || fill === "done";
  const held = hover || focusIn;

  // Draw a line from every part to the dashboard, measured from where they really sit, and note where
  // each one leaves its part and reaches the dashboard so a pulse runs only the visible stretch.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const hub = hubRef.current;
    const svg = svgRef.current;
    if (!frame || !hub || !svg) return;
    const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const measure = () => {
      const f = frame.getBoundingClientRect();
      const h = hub.getBoundingClientRect();
      const hx = h.left - f.left + h.width / 2;
      const hy = h.top - f.top + h.height / 2;
      const hubBox = { l: h.left - f.left, t: h.top - f.top, r: h.right - f.left, b: h.bottom - f.top };
      const stacked = !window.matchMedia("(min-width: 768px)").matches;
      const next: Line[] = [];
      svg.appendChild(probe);
      frame.querySelectorAll<HTMLElement>("[data-node]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const node = { l: r.left - f.left, t: r.top - f.top, r: r.right - f.left, b: r.bottom - f.top };
        const x = node.l + r.width / 2;
        const y = node.t + r.height / 2;
        let d: string;
        if (stacked) {
          // from the part's inner edge to the middle, then up the spine into the dashboard
          d = `M${x < hx ? node.r : node.l} ${y} H${hx} V${hy}`;
        } else {
          const mx = (x + hx) / 2;
          d = `M${x} ${y} C${mx} ${y}, ${mx} ${hy}, ${hx} ${hy}`;
        }
        probe.setAttribute("d", d);
        const len = probe.getTotalLength();
        const inside = (b: typeof node, t: number) => {
          const p = probe.getPointAtLength((t / 100) * len);
          return p.x >= b.l && p.x <= b.r && p.y >= b.t && p.y <= b.b;
        };
        let p0 = 0;
        while (p0 < 100 && inside(node, p0)) p0 += 1;
        let p1 = p0;
        while (p1 < 100 && !inside(hubBox, p1)) p1 += 1;
        next.push({ key: el.dataset.node!, d, p0, p1 });
      });
      probe.remove();
      setBox({ w: f.width, h: f.height });
      setLines(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);

  /** Light a part: its line, one pulse into the dashboard, its row and its panel. */
  const light = useCallback((k: Key) => {
    setActive(k);
    setPulse((n) => n + 1);
    setLanded(-1);
    if (k === OTHER.key && motionOn()) {
      setChip(0);
      setOtherRun((r) => r + 1);
    } else {
      setChip(-1);
    }
  }, []);

  // While the map is mostly on screen it may play; below the side-by-side layout it holds still once
  // someone has scrolled on to read the panel.
  useEffect(() => {
    const frame = frameRef.current;
    const panel = panelRef.current;
    if (!frame || !panel || !motionOn()) return;
    const update = () => {
      const { frame: fr, panel: pr } = ratios.current;
      setVisible(fr >= 0.4);
      setReading(pr >= 0.5 && fr < 0.99 && !window.matchMedia("(min-width: 1280px)").matches);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.current[e.target === frame ? "frame" : "panel"] = e.intersectionRatio;
        update();
      },
      { threshold: [0, 0.4, 0.5, 0.99] },
    );
    io.observe(frame);
    io.observe(panel);
    return () => io.disconnect();
  }, []);

  // First full sight of the dashboard: every part fills its row, then the map plays through once.
  useEffect(() => {
    const hub = hubRef.current;
    if (!hub || !motionOn()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 0.9 || picked.current) return;
        io.disconnect();
        setStarted(true);
        fillTimer.current = setTimeout(() => {
          if (picked.current) return;
          setFilled(true);
          setAuto(true);
          light(KEYS[0]);
        }, FILL_MS);
      },
      { threshold: [0, 0.9] },
    );
    io.observe(hub);
    return () => {
      io.disconnect();
      clearTimeout(fillTimer.current);
    };
  }, [light]);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  // The tour: one step at a time, ending on "Anything else".
  useEffect(() => {
    if (!auto || !visible || held || reading || hidden) return;
    const last = active === OTHER.key;
    const t = setTimeout(() => (last ? setAuto(false) : light(KEYS[KEYS.indexOf(active) + 1])), last ? OTHER_MS : STEP_MS);
    return () => clearTimeout(t);
  }, [auto, visible, held, reading, hidden, active, light]);

  // "Anything else": each tool plugs in with its own pulse and lands on the dashboard as the pulse
  // arrives; then they all rest connected.
  useEffect(() => {
    if (otherRun === 0 || active !== OTHER.key) return;
    let i = 0;
    let land = setTimeout(() => setLanded(0), LAND_MS);
    const t = setInterval(() => {
      i += 1;
      if (i >= OTHER.cycle.length) {
        setChip(-1);
        setLanded(-1);
        clearInterval(t);
        return;
      }
      const n = i;
      setChip(n);
      setPulse((p) => p + 1);
      land = setTimeout(() => setLanded(n), LAND_MS);
    }, CYCLE_MS);
    return () => {
      clearInterval(t);
      clearTimeout(land);
    };
  }, [otherRun, active]);

  const pick = (k: Key) => {
    picked.current = true;
    clearTimeout(fillTimer.current);
    setStarted(true);
    setFilled(true);
    setAuto(false);
    light(k);
  };

  // Hold the tour while a mouse is actually moving over it (a cursor resting while the page scrolls
  // underneath doesn't count), or while keyboard focus is inside.
  const moved = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || (!e.movementX && !e.movementY)) return;
    setHover(true);
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHover(false), HOVER_IDLE_MS);
  };
  const left = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(hoverTimer.current);
    setHover(false);
  };
  const focused = (e: FocusEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).matches(":focus-visible")) setFocusIn(true);
  };
  const blurred = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Element | null)) setFocusIn(false);
  };

  const lit = ready ? lines.find((l) => l.key === active) : undefined;
  const landing = active === OTHER.key && landed >= 0 ? OTHER.cycle[landed] : undefined;

  return (
    <div
      className={cn("grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] xl:gap-8", className)}
      onPointerMove={moved}
      onPointerLeave={left}
      onFocus={focused}
      onBlur={blurred}
    >
      {/* the map */}
      <div
        ref={frameRef}
        data-map
        data-visible={visible || undefined}
        data-fill={fill}
        className="relative h-[540px] overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--paper-2)] md:h-[560px] xl:h-auto xl:min-h-[520px]"
      >
        <div aria-hidden className="dot-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,#000_35%,transparent_85%)]" />

        <svg ref={svgRef} aria-hidden className="absolute inset-0 h-full w-full" viewBox={`0 0 ${box.w || 1} ${box.h || 1}`}>
          {lines.map((l) => (
            <path key={l.key} d={l.d} fill="none" stroke="var(--ink-4)" strokeWidth={1.25} strokeDasharray="3 6" strokeLinecap="round" />
          ))}
          {lit ? <path key={`lit-${lit.key}`} d={lit.d} fill="none" className="connect-lit" stroke="var(--spot)" strokeWidth={2.25} strokeDasharray="6 7" strokeLinecap="round" /> : null}
          {fill === "running"
            ? lines.map((l, i) => (
                <g key={`fill-${l.key}`} style={pulseVars(l, i * 200 + 300)}>
                  <path d={l.d} pathLength={100} className="connect-pulse connect-pulse-halo" />
                  <path d={l.d} pathLength={100} className="connect-pulse" />
                </g>
              ))
            : null}
          {lit && pulse > 0 ? (
            <g key={`pulse-${pulse}`} style={pulseVars(lit)}>
              <path d={lit.d} pathLength={100} className="connect-pulse connect-pulse-halo" />
              <path d={lit.d} pathLength={100} className="connect-pulse" />
            </g>
          ) : null}
        </svg>

        {/* the dashboard in the middle: one row per part, the same numbers as the morning screen */}
        <div
          ref={hubRef}
          style={spot(HUB)}
          className="absolute left-[var(--mx)] top-[var(--my)] z-20 w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-[var(--line)] bg-[var(--card)] p-3 shadow-[var(--shadow-float)] md:left-[var(--dx)] md:top-[var(--dy)] md:w-[204px] md:p-4"
        >
          <span className="mx-auto hidden h-8 w-8 place-items-center rounded-full bg-[var(--ink)] text-[var(--paper)] md:grid">
            <Mark size={16} spot="var(--spot-light)" />
          </span>
          <p className="text-center text-[0.95rem] font-semibold tracking-[-0.02em] text-[var(--ink)] md:mt-2">{CONNECT.hub.label}</p>
          <ul aria-hidden className="mt-2.5 grid gap-0.5 md:mt-3">
            {ITEMS.map((it, i) => {
              const on = ready && active === it.key;
              const text = it.key === OTHER.key && on && landing ? landing : it.hub;
              return (
                <li key={it.key} data-on={on || undefined} className="hub-row t-num flex items-center gap-1.5 rounded-md px-1.5 py-[3px] text-[0.7rem] leading-tight md:text-[0.75rem]" style={{ "--i": i } as CSSProperties}>
                  <Icon name={it.icon} size={12} className="hub-icon shrink-0" />
                  <span key={text} className="dash-swap min-w-0 truncate">
                    {text}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div role="group" aria-label={CONNECT.labels.parts}>
          {ITEMS.map((it) => (
            <PartNode key={it.key} item={it} lit={ready && active === it.key} selected={active === it.key} onPick={pick} />
          ))}
        </div>

        <p className="absolute bottom-3 left-4 right-4 z-10 text-[0.72rem] leading-snug text-[var(--ink-3)] md:bottom-4 md:left-5">{CONNECT.note}</p>
      </div>

      {/* what the chosen part means */}
      <div ref={panelRef} role="region" aria-labelledby={`connect-${active}-title`} className="grid rounded-[24px] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow-card)] sm:p-7">
        {PARTS.map((p) => (
          <PartPanel key={p.key} part={p} on={active === p.key} />
        ))}
        <OtherPanel on={active === OTHER.key} chip={chip} />
      </div>
    </div>
  );
}
