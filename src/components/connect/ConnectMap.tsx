"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { CONNECT, type ConnectPart } from "@/content/site";
import { cn } from "@/lib/cn";
import { AnchorButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";

type Key = string;

const PARTS = CONNECT.parts;
const OTHER = CONNECT.other;
const KEYS: Key[] = [...PARTS.map((p) => p.key), OTHER.key];

/**
 * Where each part sits around the dashboard, in % of the map. Phones put the dashboard on top and the
 * parts in two columns under it, joined by one line down the middle; wider screens set them in a ring.
 */
const SPOTS: Record<Key, { m: [number, number]; d: [number, number] }> = {
  customers: { m: [25, 45], d: [24, 17] },
  work: { m: [75, 45], d: [76, 17] },
  money: { m: [25, 65], d: [86, 50] },
  paperwork: { m: [75, 65], d: [76, 83] },
  stock: { m: [25, 85], d: [24, 83] },
  other: { m: [75, 85], d: [14, 50] },
};
const HUB = { m: [50, 17] as [number, number], d: [50, 50] as [number, number] };

/** How long each part stays lit while the map plays on its own. */
const STEP_MS = 5200;
const CYCLE_MS = 1700;

type Line = { key: Key; d: string };

function Node({ k, label, note, icon, on, onPick, dashed, sub }: { k: Key; label: string; note?: string; icon: string; on: boolean; onPick: (k: Key) => void; dashed?: boolean; sub?: string }) {
  const [mx, my] = SPOTS[k].m;
  const [dx, dy] = SPOTS[k].d;
  return (
    <button
      type="button"
      data-node={k}
      aria-pressed={on}
      onClick={() => onPick(k)}
      style={{ "--mx": `${mx}%`, "--my": `${my}%`, "--dx": `${dx}%`, "--dy": `${dy}%` } as CSSProperties}
      className={cn(
        "absolute left-[var(--mx)] top-[var(--my)] z-10 flex w-[43%] max-w-[168px] -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-out)] active:scale-[0.97] md:left-[var(--dx)] md:top-[var(--dy)] md:w-auto md:max-w-[220px] md:px-3.5",
        dashed && !on && "border-dashed",
        on ? "border-[var(--spot)] bg-[var(--card)] shadow-[0_0_0_4px_rgba(45,74,224,0.12),var(--shadow-lift)]" : "border-[var(--line-strong)] bg-[var(--card)] shadow-[var(--shadow-card)] hover:border-[var(--ink-4)]",
      )}
    >
      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-colors duration-300", on ? "bg-[var(--spot)] text-white" : "bg-[var(--paper-2)] text-[var(--ink-2)]")}>
        <Icon name={icon as never} size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.86rem] font-semibold leading-tight tracking-[-0.01em] text-[var(--ink)] md:text-[0.92rem]">{label}</span>
        {sub || note ? <span className="mt-0.5 block text-[0.72rem] leading-tight text-[var(--ink-3)]">{sub ?? note}</span> : null}
      </span>
    </button>
  );
}

function PartPanel({ part }: { part: ConnectPart }) {
  return (
    <div key={part.key} className="story-fade">
      <p className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--spot)] text-white">
          <Icon name={part.icon} size={17} />
        </span>
        <span className="text-[1.35rem] font-semibold tracking-[-0.025em] text-[var(--ink)]">{part.label}</span>
        {part.note ? <span className="text-[0.85rem] text-[var(--ink-3)]">({part.note.toLowerCase()})</span> : null}
      </p>

      <p className="mt-6 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)]">{CONNECT.labels.tools}</p>
      <ul className="mt-2.5 flex flex-wrap gap-1.5">
        {part.tools.map((t) => (
          <li key={t} className="rounded-full border border-[var(--line-strong)] bg-[var(--paper)] px-3 py-1 text-[0.85rem] text-[var(--ink-2)]">
            {t}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)]">{CONNECT.labels.outcomes}</p>
      <ul className="mt-2.5 grid gap-2">
        {part.outcomes.map((o, i) => (
          <li key={o} className="story-row flex items-start gap-2.5 text-[0.98rem] leading-snug text-[var(--ink)]" style={{ "--i": i } as CSSProperties}>
            <span className="mt-[3px] grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--done-soft)] text-[var(--done)]">
              <Icon name="check" size={12} strokeWidth={2.6} />
            </span>
            {o}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)]">{CONNECT.labels.examples}</p>
      <ul className="mt-2.5 grid gap-1.5 text-[0.92rem] leading-snug text-[var(--ink-2)]">
        {part.examples.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

function OtherPanel({ chip }: { chip: number }) {
  return (
    <div key="other" className="story-fade">
      <p className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--spot)] text-white">
          <Icon name="plus" size={17} />
        </span>
        <span className="text-[1.35rem] font-semibold tracking-[-0.025em] text-[var(--ink)]">{OTHER.label}</span>
      </p>
      <p className="mt-5 text-[1.15rem] font-semibold leading-snug tracking-[-0.02em] text-[var(--ink)]">{OTHER.title}</p>
      <p className="mt-2 text-[0.98rem] leading-relaxed text-[var(--ink-2)]">{OTHER.body}</p>

      {/* the tools a business might add, plugging in one after another */}
      <ul className="mt-6 grid gap-2">
        {OTHER.cycle.map((t, i) => (
          <li
            key={t}
            className={cn(
              "flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 text-[0.92rem] transition-[background-color,border-color,color] duration-300",
              i === chip ? "border-[var(--spot)] bg-[var(--spot-soft)] text-[var(--ink)]" : "border-dashed border-[var(--line-strong)] text-[var(--ink-2)]",
            )}
          >
            {t}
            <span className={cn("flex items-center gap-1 text-[0.78rem] font-medium transition-opacity duration-300", i === chip ? "text-[var(--spot)] opacity-100" : "opacity-0")}>
              <Mark size={12} spot="var(--spot)" /> Connected
            </span>
          </li>
        ))}
      </ul>
      <AnchorButton href="#contact" size="sm" className="mt-6">
        {OTHER.action}
      </AnchorButton>
    </div>
  );
}

/**
 * The parts of a business around one dashboard. Pick a part to light its line into the dashboard and see
 * where it usually lives, what changes once it's connected, and a couple of examples. The open slot,
 * "Anything else", shows other tools plugging in one after another. It plays through on its own while on
 * screen, and stops the moment a visitor picks a part.
 */
export function ConnectMap({ className }: { className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Key>(KEYS[0]);
  const [auto, setAuto] = useState(false);
  const [visible, setVisible] = useState(false);
  const [chip, setChip] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Draw a line from every part to the dashboard, measured from where they really sit.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const hub = hubRef.current;
    if (!frame || !hub) return;
    const measure = () => {
      const f = frame.getBoundingClientRect();
      const h = hub.getBoundingClientRect();
      const hx = h.left - f.left + h.width / 2;
      const hy = h.top - f.top + h.height / 2;
      const stacked = !window.matchMedia("(min-width: 768px)").matches;
      const next: Line[] = [];
      frame.querySelectorAll<HTMLElement>("[data-node]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const x = r.left - f.left + r.width / 2;
        const y = r.top - f.top + r.height / 2;
        if (stacked) {
          // from the part's inner edge to the middle, then up the spine into the dashboard
          const edge = x < hx ? r.right - f.left : r.left - f.left;
          next.push({ key: el.dataset.node!, d: `M${edge} ${y} H${hx} V${hy}` });
          return;
        }
        const mx = (x + hx) / 2;
        next.push({ key: el.dataset.node!, d: `M${x} ${y} C${mx} ${y}, ${mx} ${hy}, ${hx} ${hy}` });
      });
      setBox({ w: f.width, h: f.height });
      setLines(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);

  // Plays on its own while on screen, once motion is on.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || document.documentElement.dataset.motion !== "on") return;
    let started = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting && !started) {
          started = true;
          setAuto(true);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(frame);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || !visible) return;
    const t = setTimeout(() => setActive((k) => KEYS[(KEYS.indexOf(k) + 1) % KEYS.length]), active === OTHER.key ? STEP_MS * 1.6 : STEP_MS);
    return () => clearTimeout(t);
  }, [auto, visible, active]);

  // "Anything else": the next tool plugs in every couple of seconds.
  useEffect(() => {
    if (active !== OTHER.key || document.documentElement.dataset.motion !== "on") return;
    const t = setInterval(() => setChip((c) => (c + 1) % OTHER.cycle.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [active]);

  const pick = (k: Key) => {
    setAuto(false);
    setActive(k);
  };

  const part = PARTS.find((p) => p.key === active);

  return (
    <div className={cn("grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-8", className)}>
      {/* the map */}
      <div ref={frameRef} className="relative h-[540px] overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--paper-2)] md:h-[520px]">
        <div aria-hidden className="dot-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,#000_35%,transparent_85%)]" />

        <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox={`0 0 ${box.w || 1} ${box.h || 1}`}>
          {[...lines].sort((a, b) => Number(a.key === active) - Number(b.key === active)).map((l) => {
            const on = l.key === active;
            return (
              <path
                key={l.key}
                d={l.d}
                fill="none"
                className={cn(on && "connect-flow")}
                stroke={on ? "var(--spot)" : "var(--ink-4)"}
                strokeWidth={on ? 2.25 : 1.25}
                strokeDasharray={on ? "6 7" : "3 6"}
                strokeLinecap="round"
                style={{ transition: "stroke 300ms var(--ease-out), stroke-width 300ms var(--ease-out)" }}
              />
            );
          })}
        </svg>

        {/* the dashboard in the middle */}
        <div
          ref={hubRef}
          style={{ "--mx": `${HUB.m[0]}%`, "--my": `${HUB.m[1]}%`, "--dx": `${HUB.d[0]}%`, "--dy": `${HUB.d[1]}%` } as CSSProperties}
          className="absolute left-[var(--mx)] top-[var(--my)] z-20 w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-[var(--line)] bg-[var(--card)] p-3.5 text-center shadow-[var(--shadow-float)] md:left-[var(--dx)] md:top-[var(--dy)] md:w-[180px] md:p-4"
        >
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--ink)] text-[var(--paper)]">
            <Mark size={22} spot="var(--spot-light)" />
          </span>
          <p className="mt-2.5 text-[0.98rem] font-semibold tracking-[-0.02em] text-[var(--ink)]">{CONNECT.hub.label}</p>
          <p className="mt-0.5 text-[0.75rem] text-[var(--ink-3)]">{CONNECT.hub.sub}</p>
          {/* a few rows that hint at the screen */}
          <span aria-hidden className="mt-3 grid gap-1">
            <span className="h-1.5 rounded-full bg-[var(--paper-3)]" />
            <span className="h-1.5 w-3/4 rounded-full bg-[var(--paper-3)]" />
            <span className="h-1.5 w-1/2 rounded-full bg-[var(--spot)]" />
          </span>
        </div>

        {PARTS.map((p) => (
          <Node key={p.key} k={p.key} label={p.label} note={p.note} icon={p.icon} on={active === p.key} onPick={pick} />
        ))}
        <Node k={OTHER.key} label={OTHER.label} icon={OTHER.icon} on={active === OTHER.key} onPick={pick} dashed sub={active === OTHER.key ? OTHER.cycle[chip] : "Your other tools"} />

        <p className="absolute bottom-3 left-4 z-10 text-[0.72rem] text-[var(--ink-3)] md:bottom-4 md:left-5">{CONNECT.note}</p>
      </div>

      {/* what the chosen part means */}
      <div className="rounded-[24px] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow-card)] sm:p-7" aria-live={auto && visible ? "off" : "polite"}>
        {part ? <PartPanel part={part} /> : <OtherPanel chip={chip} />}
      </div>
    </div>
  );
}
