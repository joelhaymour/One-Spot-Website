"use client";

import { memo } from "react";
import { StatusChip } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { Appear, ConsolePanel, InReport, MONO, Meter, Swap, Tick, wait } from "../finance/kit";
import { LOW_ITEM, PURCHASE_ORDER, STOCK, STOCK_SCALE } from "./data";

interface InventoryPanelProps {
  active: boolean;
  /** Item 2210 has crossed its reorder point and a purchase order has been drafted. */
  ordered: boolean;
  reported: boolean;
}

const COLS = "minmax(0,1fr) 46px 128px";
const NEUTRAL = "rgba(255,255,255,0.34)";

/** The order of events once the low item is noticed: the draft opens, quotes come in, the best is chosen. */
const DRAFT_AT = 350;
const QUOTES_AT = 650;
const CHOSEN_AT = QUOTES_AT + PURCHASE_ORDER.quotes.length * 160 + 420;

export const InventoryPanel = memo(function InventoryPanel({ active, ordered, reported }: InventoryPanelProps) {
  return (
    <ConsolePanel
      label="Inventory"
      active={active}
      className="flex flex-col"
      right={
        <>
          <InReport on={reported} order={2} />
          <Swap
            index={ordered ? 1 : 0}
            delay={ordered ? CHOSEN_AT : 0}
            className="justify-items-end"
            items={[
              <StatusChip key="rest">{STOCK.length} items tracked</StatusChip>,
              <StatusChip key="po" tone="accent">
                Awaiting approval
              </StatusChip>,
            ]}
          />
        </>
      }
    >
      <div role="table" aria-label="Stock on hand">
        <div role="row" className={cn("grid h-[18px] items-start gap-x-2.5 border-b border-[var(--line-faint)] text-[var(--text-2)]", MONO)} style={{ gridTemplateColumns: COLS }}>
          <span role="columnheader">Item</span>
          <span role="columnheader" className="text-right">
            On hand
          </span>
          <span role="columnheader">Days of stock</span>
        </div>
        {STOCK.map((item) => {
          const low = item.id === LOW_ITEM && ordered;
          return (
            <div
              key={item.id}
              role="row"
              className="relative isolate grid h-[22px] items-center gap-x-2.5 border-b border-[var(--line-faint)] text-[10.5px] last:border-b-0"
              style={{ gridTemplateColumns: COLS }}
            >
              {item.id === LOW_ITEM && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-x-1.5 inset-y-px -z-10 rounded-[5px] bg-white/[0.045] transition-opacity duration-500 ease-[var(--ease-out)]"
                  style={{ opacity: ordered ? 1 : 0 }}
                />
              )}
              <span role="cell" className="flex min-w-0 items-center gap-2">
                <span className={cn(MONO, "shrink-0 text-[var(--text-2)]")}>{item.id}</span>
                <span className="truncate text-[11px] text-[var(--text-0)]">{item.name}</span>
              </span>
              <span role="cell" className="t-num text-right text-[var(--text-1)]">
                {item.onHand}
              </span>
              <span role="cell" className="flex items-center gap-2.5">
                <Meter value={item.days / STOCK_SCALE} color={low ? "var(--warn)" : NEUTRAL} duration={600} />
                <span className={cn("t-num w-[34px] shrink-0 text-right transition-colors duration-500", low ? "text-[var(--warn)]" : "text-[var(--text-1)]")}>
                  {item.days} d
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto border-t border-[var(--line-faint)] pt-2">
        <Swap
          block
          index={ordered ? 1 : 0}
          delay={ordered ? DRAFT_AT - 140 : 0}
          items={[
            <span key="rest" className="flex flex-col gap-[7px]">
              <span className={cn(MONO, "flex h-2.5 items-center justify-between text-[var(--text-2)]")}>
                <span>Purchase orders</span>
                <span>None waiting</span>
              </span>
              <span className="block text-[10.5px] leading-[1.3] text-[var(--text-1)]">Every item is above its reorder point.</span>
              <span className="block text-[10.5px] leading-[1.3] text-[var(--text-2)]">Last order {PURCHASE_ORDER.last}, delivered on time.</span>
            </span>,
            <span key="po" className="flex flex-col gap-[7px]">
              <span className={cn(MONO, "flex h-2.5 items-center justify-between text-[var(--text-2)]")}>
                <span>
                  <span className="text-[var(--text-0)]">{PURCHASE_ORDER.number}</span> · draft
                </span>
                <span>
                  {PURCHASE_ORDER.quantity} × item {LOW_ITEM}
                </span>
              </span>
              <span className="grid grid-cols-3 gap-1.5">
                {PURCHASE_ORDER.quotes.map((quote, i) => (
                  <Appear as="span" key={quote.vendor} on={ordered} delay={QUOTES_AT + i * 160} y={4} className="block">
                    <span
                      className="flex h-[40px] flex-col justify-between rounded-[6px] border px-2 py-[6px] transition-[opacity,border-color] duration-500 ease-[var(--ease-out)]"
                      style={{
                        // Once the choice is made the other two quotes step back.
                        opacity: ordered && !quote.best ? 0.6 : 1,
                        borderColor: ordered && quote.best ? "var(--line-strong)" : "var(--line-faint)",
                        transitionDelay: ordered ? wait(CHOSEN_AT) : "0ms",
                      }}
                    >
                      <span className="flex items-center justify-between gap-1">
                        <span className="truncate text-[10px] leading-[1.25] text-[var(--text-1)]">{quote.vendor}</span>
                        {quote.best && <Tick on={ordered} delay={CHOSEN_AT} size={11} />}
                      </span>
                      <span className="flex items-baseline justify-between gap-1">
                        <span className="t-num text-[11.5px] leading-none text-[var(--text-0)]">{quote.price}</span>
                        <span className={cn(MONO, "text-[var(--text-2)]")}>{quote.lead}</span>
                      </span>
                    </span>
                  </Appear>
                ))}
              </span>
              <span className="block text-[10.5px] leading-[1.3] text-[var(--text-0)]">
                <TypedText text={PURCHASE_ORDER.note} active={ordered} delay={(CHOSEN_AT + 300) / 1000} speed={52} />
              </span>
            </span>,
          ]}
        />
      </div>
    </ConsolePanel>
  );
});
