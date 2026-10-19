"use client";

import { useRef, useState } from "react";
import { CONNECT } from "@/content/site";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";

const { dashboard } = CONNECT;
const { needs } = dashboard;

/**
 * The payoff of connecting the parts: the one screen an owner checks each morning. Illustrative numbers
 * in words most businesses use, matching the rows on the map's dashboard. The one thing that needs the
 * owner arrives last, and "Review and send" works: we prepare it, they approve it.
 */
export function DashboardPreview({ className }: { className?: string }) {
  const [sent, setSent] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  // The button goes once it's used, so focus moves to the confirmation in its place.
  const send = () => {
    setSent(true);
    rowRef.current?.focus();
  };

  return (
    <div className={cn("overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-lift)]", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line-soft)] px-5 py-3.5 sm:px-6">
        <span className="flex items-center gap-2 text-[0.85rem] font-semibold text-[var(--ink)]">
          <Mark size={16} />
          {CONNECT.hub.label}
        </span>
        <span className="flex items-center gap-1.5 text-[0.78rem] text-[var(--ink-3)]">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--done)]" />
          {dashboard.status}
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-[1.15rem] font-semibold tracking-[-0.02em] text-pretty text-[var(--ink)]">{dashboard.greeting}</p>
        <div className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
          {dashboard.tiles.map((t) => (
            <div key={t.label} className="min-w-0 rounded-2xl bg-[var(--paper-2)] px-2.5 py-3 min-[380px]:px-3 sm:px-4 sm:py-3.5">
              <p className="flex items-center gap-1.5 text-[0.72rem] leading-tight text-[var(--ink-2)] max-sm:min-h-[2lh] max-sm:items-start sm:text-[0.78rem]">
                <Icon name={t.icon} size={13} className="hidden shrink-0 text-[var(--ink-3)] sm:block lg:max-xl:hidden" />
                {t.label}
              </p>
              <p className="t-num mt-1.5 text-[1.1rem] font-semibold leading-none min-[380px]:text-[1.2rem] tracking-[-0.03em] text-[var(--ink)] sm:text-[1.6rem] lg:max-xl:text-[1.35rem]">{t.value}</p>
              <p className="mt-1.5 text-[0.72rem] leading-snug text-[var(--ink-2)] sm:text-[0.78rem]">{t.detail}</p>
            </div>
          ))}
        </div>

        {/* the one thing that needs the owner: drafted for them, theirs to send. On a phone the card is
            already on the first screen, so the row follows the card quickly; on desktop it arrives last. */}
        <div data-reveal className="[--reveal-delay:0.15s] [--reveal-y:8px] lg:[--reveal-delay:0.75s]">
          <div
            ref={rowRef}
            tabIndex={-1}
            className={cn(
              "mt-3 flex flex-col gap-3 rounded-2xl border px-4 py-3.5 transition-[background-color,border-color] duration-300 ease-[var(--ease-out)] sm:flex-row sm:items-center sm:justify-between",
              sent ? "border-[rgba(43,122,87,0.25)] bg-[var(--done-soft)]" : "border-[rgba(45,74,224,0.22)] bg-[var(--spot-soft)]",
            )}
          >
            <p className="flex items-start gap-2.5 text-[0.92rem] leading-snug text-pretty text-[var(--ink)]">
              <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white transition-colors duration-300", sent ? "bg-[var(--done)]" : "bg-[var(--spot)]")}>
                <Icon name={sent ? "check" : "clock"} size={12} strokeWidth={sent ? 2.6 : 2.2} />
              </span>
              <span key={sent ? "sent" : "needs"} className="dash-swap">
                {sent ? (
                  <>
                    <span className="font-semibold">{needs.sentLabel} </span>
                    {needs.sentText}
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{needs.label}: </span>
                    {needs.text}
                  </>
                )}
              </span>
            </p>
            {sent ? null : (
              <button type="button" onClick={send} className="dash-send shrink-0 self-start rounded-full bg-[var(--ink)] px-3.5 py-1.5 text-[0.8rem] font-medium text-[var(--paper)] sm:self-auto">
                {needs.action}
                <span className="sr-only"> {needs.example}</span>
              </button>
            )}
          </div>
          <p className="sr-only" aria-live="polite">
            {sent ? `${needs.sentLabel} ${needs.sentText}` : ""}
          </p>
          <p className="mt-2.5 text-[0.8rem] text-pretty text-[var(--ink-3)]">{needs.more}</p>
        </div>
      </div>
    </div>
  );
}
