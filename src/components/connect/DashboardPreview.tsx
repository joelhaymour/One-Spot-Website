"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { CONNECT, type DashboardScreen } from "@/content/site";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";

const { dashboard } = CONNECT;
const { needs, done } = dashboard;
type Done = Record<string, boolean>;

const TONE: Record<DashboardScreen["rows"][number]["tone"], string> = {
  done: "pill-done",
  wait: "pill-wait",
  risk: "pill-risk",
  spot: "pill-spot",
  plain: "",
};

function Label({ children }: { children: ReactNode }) {
  return <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)]">{children}</p>;
}

/** Every screen sits in the same grid cell, so switching tabs never changes the card's height. */
function Screen({ k, on, children }: { k: string; on: boolean; children: ReactNode }) {
  return (
    <div id={`dash-${k}`} role="tabpanel" aria-labelledby={`dash-tab-${k}`} data-on={on || undefined} aria-hidden={!on} inert={!on} className="connect-panel [grid-area:1/1]">
      {children}
    </div>
  );
}

function Today({ on, doneMap, onDo }: { on: boolean; doneMap: Done; onDo: (key: string) => void }) {
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const left = needs.items.filter((n) => !doneMap[n.key]).length;

  // The button goes once it's used, so focus moves to the confirmation in its place.
  const act = (key: string) => {
    onDo(key);
    rowRefs.current[key]?.focus();
  };

  return (
    <Screen k="today" on={on}>
      <p className="text-[1.1rem] font-semibold tracking-[-0.02em] text-pretty text-[var(--ink)]">{dashboard.greeting}</p>

      <div className="mt-3.5 grid grid-cols-3 gap-1.5 sm:gap-2">
        {dashboard.stats.map((t) => (
          <div key={t.label} className="min-w-0 rounded-xl bg-[var(--paper-2)] px-2.5 py-2.5 min-[380px]:px-3">
            <p className="text-[0.72rem] leading-tight text-[var(--ink-2)]">{t.label}</p>
            <p className="t-num mt-1 text-[1.1rem] font-semibold leading-none tracking-[-0.03em] text-[var(--ink)] min-[380px]:text-[1.2rem] sm:text-[1.3rem]">{t.value}</p>
          </div>
        ))}
      </div>

      {/* what got done without the owner */}
      <div className="mt-4">
        <Label>{done.label}</Label>
        <ul className="mt-2 grid gap-x-4 gap-y-1.5 @[26rem]:grid-cols-2">
          {done.items.map((d) => (
            <li key={d} className="flex items-center gap-2 text-[0.86rem] leading-snug text-[var(--ink)]">
              <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-[var(--done-soft)] text-[var(--done)]">
                <Icon name="check" size={11} strokeWidth={2.6} />
              </span>
              {d}
            </li>
          ))}
        </ul>
      </div>

      {/* the few things that need the owner: prepared for them, theirs to approve */}
      <div className="mt-4 [--reveal-delay:0.15s] [--reveal-y:8px] lg:[--reveal-delay:0.75s]" data-reveal>
        <Label>
          {needs.label} · {left ? left : needs.allDone}
        </Label>
        <ul className="mt-2 grid gap-1.5">
          {needs.items.map((n) => {
            const isDone = doneMap[n.key];
            return (
              <li
                key={n.key}
                ref={(el) => {
                  rowRefs.current[n.key] = el;
                }}
                tabIndex={-1}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-[background-color,border-color] duration-300 ease-[var(--ease-out)]",
                  isDone ? "border-[rgba(43,122,87,0.25)] bg-[var(--done-soft)]" : "border-[rgba(45,74,224,0.22)] bg-[var(--spot-soft)]",
                )}
              >
                <p className="flex items-start gap-2 text-[0.86rem] leading-snug text-pretty text-[var(--ink)]">
                  <span className={cn("mt-px grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-white transition-colors duration-300", isDone ? "bg-[var(--done)]" : "bg-[var(--spot)]")}>
                    <Icon name={isDone ? "check" : "clock"} size={11} strokeWidth={isDone ? 2.6 : 2.2} />
                  </span>
                  <span key={isDone ? "done" : "open"} className="dash-swap">
                    {isDone ? n.doneText : n.text}
                  </span>
                </p>
                {isDone ? null : (
                  <button type="button" onClick={() => act(n.key)} className="dash-send shrink-0 rounded-full bg-[var(--ink)] px-3 py-1.5 text-[0.75rem] font-medium text-[var(--paper)]">
                    {/* phones get the short word, so the message keeps its room */}
                    <span className="@[26rem]:hidden">{n.short}</span>
                    <span className="hidden @[26rem]:inline">{n.action}</span>
                    <span className="sr-only"> {needs.example}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Screen>
  );
}

function PartScreen({ k, on, screen, doneMap }: { k: string; on: boolean; screen: DashboardScreen; doneMap: Done }) {
  return (
    <Screen k={k} on={on}>
      <p className="text-[1.1rem] font-semibold tracking-[-0.02em] text-[var(--ink)]">{screen.summary}</p>
      <ul className="mt-3 grid">
        {screen.rows.map((r, i) => {
          const changed = r.linked && doneMap[r.linked];
          return (
            <li key={r.what} className="connect-row flex items-center justify-between gap-3 border-b border-[var(--line-soft)] py-2.5 last:border-b-0" style={{ "--i": i } as CSSProperties}>
              <span className="min-w-0">
                <span className="block truncate text-[0.88rem] text-[var(--ink)]">{r.what}</span>
                <span className="t-num block text-[0.75rem] text-[var(--ink-3)]">{r.when}</span>
              </span>
              <span key={changed ? "changed" : "as-is"} className={cn("pill dash-swap shrink-0", changed ? "pill-done" : TONE[r.tone])}>
                {changed ? r.doneStatus : r.status}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 flex items-center gap-1.5 text-[0.75rem] text-[var(--ink-3)]">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--done)]" />
        {screen.from}
      </p>
    </Screen>
  );
}

/**
 * The payoff of connecting the parts: the one screen an owner checks each morning. Today shows what got
 * done for them since yesterday and the few things that need them, and those buttons work (we prepare
 * it, they approve it). The tabs are simple screens for each part, and they stay in step with Today:
 * sign the contract there and Paperwork shows it signed. Illustrative, with the map's numbers.
 */
export function DashboardPreview({ className }: { className?: string }) {
  const [tab, setTab] = useState(dashboard.tabs[0].key);
  const [doneMap, setDoneMap] = useState<Done>({});
  const [said, setSaid] = useState("");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onDo = (key: string) => {
    setDoneMap((m) => ({ ...m, [key]: true }));
    setSaid(needs.items.find((n) => n.key === key)?.doneText ?? "");
  };

  // Arrow keys move between tabs, as in any tab list.
  const keys = (e: KeyboardEvent) => {
    const i = dashboard.tabs.findIndex((t) => t.key === tab);
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = dashboard.tabs[(i + step + dashboard.tabs.length) % dashboard.tabs.length].key;
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={cn("overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-lift)]", className)}>
      <div className="flex items-center justify-between gap-3 px-5 pb-1 pt-3.5 sm:px-6">
        <span className="flex items-center gap-2 text-[0.85rem] font-semibold text-[var(--ink)]">
          <Mark size={16} />
          {CONNECT.hub.label}
        </span>
        <span className="flex items-center gap-1.5 text-[0.78rem] text-[var(--ink-3)]">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--done)]" />
          {dashboard.status}
        </span>
      </div>

      {/* the other screens, so it's clear this is one view of many */}
      <div role="tablist" aria-label={dashboard.tabsLabel} onKeyDown={keys} className="no-scrollbar flex justify-between gap-0 overflow-x-auto border-b border-[var(--line-soft)] px-2 sm:justify-start sm:gap-1 sm:px-4">
        {dashboard.tabs.map((t) => {
          const on = t.key === tab;
          return (
            <button
              key={t.key}
              ref={(el) => {
                tabRefs.current[t.key] = el;
              }}
              type="button"
              role="tab"
              id={`dash-tab-${t.key}`}
              aria-selected={on}
              aria-controls={`dash-${t.key}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setTab(t.key)}
              className={cn(
                "dash-tab relative shrink-0 whitespace-nowrap px-1 py-2.5 text-[0.8rem] font-medium transition-colors duration-200 min-[380px]:px-1.5 sm:px-2.5",
                on ? "text-[var(--ink)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]",
              )}
            >
              {t.label}
              <span aria-hidden className={cn("absolute inset-x-1 bottom-0 sm:inset-x-2 h-[2px] rounded-full transition-opacity duration-200", on ? "bg-[var(--spot)] opacity-100" : "opacity-0")} />
            </button>
          );
        })}
      </div>

      <div className="@container grid p-5 sm:p-6">
        <Today on={tab === "today"} doneMap={doneMap} onDo={onDo} />
        {dashboard.tabs.slice(1).map((t) => (
          <PartScreen key={t.key} k={t.key} on={tab === t.key} screen={dashboard.screens[t.key]} doneMap={doneMap} />
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {said}
      </p>
    </div>
  );
}
