"use client";

import { useState } from "react";
import { WEBSITES } from "@/content/site";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icons";

const { cart } = WEBSITES;

type Pick = { name: string; detail: string; price: number };

const money = (n: number) => `$${n}`;

function Suggestion({ item, added, onAdd, accent }: { item: Pick; added: boolean; onAdd: () => void; accent?: boolean }) {
  return (
    <li className={cn("flex min-w-0 items-center gap-3 rounded-2xl border p-3 transition-colors duration-500", added ? "border-[rgba(43,122,87,0.3)] bg-[var(--done-soft)]" : "border-[var(--line)] bg-[var(--card)]")}>
      <span className={cn("h-11 w-9 shrink-0 rounded-lg", accent ? "bg-[linear-gradient(160deg,#f6b8a4,#e8735a)]" : "bg-[linear-gradient(160deg,#f3e7d7,#d8c2a4)]")} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9rem] font-medium text-[var(--ink)]">{item.name}</span>
        <span className="block truncate text-[0.78rem] text-[var(--ink-3)]">{item.detail}</span>
      </span>
      <span className="t-num text-[0.88rem] text-[var(--ink-2)]">{money(item.price)}</span>
      <button
        type="button"
        onClick={onAdd}
        disabled={added}
        className={cn(
          "inline-flex h-8 min-w-[4.5rem] items-center justify-center gap-1 rounded-full px-3 text-[0.8rem] font-medium transition-colors duration-300",
          added ? "bg-[var(--done)] text-white" : "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--spot)]",
        )}
      >
        {added ? (
          <>
            <Icon name="check" size={13} strokeWidth={2.4} />
            {cart.added}
          </>
        ) : (
          `+ ${cart.add}`
        )}
      </button>
    </li>
  );
}

/** A bag that nudges toward free shipping and offers the matching piece. The visitor adds things and watches the bar fill. */
export function CartDemo() {
  const [added, setAdded] = useState<string[]>([]);
  const extras: Pick[] = [cart.set, ...cart.addOns];
  const subtotal = cart.items.reduce((t, i) => t + i.price, 0) + extras.filter((e) => added.includes(e.name)).reduce((t, e) => t + e.price, 0);
  const left = Math.max(0, cart.threshold - subtotal);
  const pct = Math.min(100, (subtotal / cart.threshold) * 100);
  const add = (name: string) => setAdded((a) => (a.includes(name) ? a : [...a, name]));

  return (
    <div className="rounded-[26px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-lift)] sm:p-7">
      <div className="flex items-center justify-between">
        <p className="t-eyebrow">{cart.eyebrow}</p>
        {added.length > 0 && (
          <button type="button" onClick={() => setAdded([])} className="text-[0.8rem] text-[var(--ink-3)] underline underline-offset-4 hover:text-[var(--ink)]">
            {cart.reset}
          </button>
        )}
      </div>

      <div className="mt-5 flex items-baseline justify-between">
        <p className="font-[family-name:var(--font-serif)] text-[1.9rem] leading-none tracking-[-0.015em]">{cart.title}</p>
        <p className="t-num text-[1rem] font-medium">{money(subtotal)}</p>
      </div>

      <ul className="mt-4 grid gap-1.5 border-b border-[var(--line)] pb-4">
        {cart.items.map((i) => (
          <li key={i.name} className="flex items-center justify-between text-[0.88rem]">
            <span className="text-[var(--ink)]">
              {i.name} <span className="text-[var(--ink-3)]">· {i.detail}</span>
            </span>
            <span className="t-num text-[var(--ink-2)]">{money(i.price)}</span>
          </li>
        ))}
        {extras
          .filter((e) => added.includes(e.name))
          .map((e) => (
            <li key={e.name} className="story-fade flex items-center justify-between text-[0.88rem]">
              <span className="text-[var(--ink)]">{e.name}</span>
              <span className="t-num text-[var(--ink-2)]">{money(e.price)}</span>
            </li>
          ))}
      </ul>

      {/* free-shipping nudge */}
      <div className="mt-4" aria-live="polite">
        <p className={cn("flex items-center gap-2 text-[0.9rem]", left === 0 ? "font-medium text-[var(--done)]" : "text-[var(--ink)]")}>
          {left === 0 ? (
            <>
              <Icon name="check" size={16} strokeWidth={2.2} />
              {cart.unlocked}
            </>
          ) : (
            <>
              <span className="t-num font-semibold">{money(left)}</span> {cart.away}
            </>
          )}
        </p>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[var(--paper-2)]">
          <div
            className={cn("h-full rounded-full transition-[width,background-color] duration-700 ease-[var(--ease-out)]", left === 0 ? "bg-[var(--done)]" : "bg-[var(--spot)]")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#c4533d]">{cart.setTitle}</p>
      <ul className="mt-2">
        <Suggestion item={cart.set} added={added.includes(cart.set.name)} onAdd={() => add(cart.set.name)} accent />
      </ul>

      <p className="mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">{cart.addOnsTitle}</p>
      <ul className="mt-2 grid gap-2">
        {cart.addOns.map((a) => (
          <Suggestion key={a.name} item={a} added={added.includes(a.name)} onAdd={() => add(a.name)} />
        ))}
      </ul>

      <p className="t-small mt-5">{cart.note}</p>
    </div>
  );
}
