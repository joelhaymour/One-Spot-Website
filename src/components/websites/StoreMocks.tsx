/**
 * Two versions of the same (fictional) online store, drawn at 960 x 600 and scaled by the compare frame.
 * Pure illustration: aria-hidden, no real links. "Before" is a typical cluttered store; "After" is what a
 * One Spot rebuild looks like: a short menu, size and in-stock filters, fit on every card, and the cart
 * suggesting the piece that completes the set.
 */

import type { ReactNode } from "react";

export const MOCK_W = 960;
export const MOCK_H = 600;

const BEFORE_NAV = ["HOME", "SHOP", "NEW!!", "SALE", "BIKINIS", "TOPS", "BOTTOMS", "ONE PIECES", "COVER UPS", "MERCH", "GIFT CARDS", "ABOUT US", "CONTACT", "FAQ", "BLOG", "REVIEWS"];
const BEFORE_SIZES = ["XS", "XSmall", "X-Small", "S", "Small", "SM", "M", "Med", "Medium", "L", "Lg"];
const BEFORE_CARDS = [
  { title: "Bikini Top - Coral - NEW!!", price: "$44.00", sold: false },
  { title: "Bikini Top Coral (Tie) FINAL", price: "$59.00 $29.00", sold: true },
  { title: "One Piece Seafoam", price: "$74.00", sold: false },
  { title: "Top - Navy - 2025 collection", price: "$44.00", sold: true },
];

const AFTER_CARDS = [
  { title: "Coral tie top", price: "$44", fit: "True to size", tone: "linear-gradient(160deg,#f6b8a4,#e8735a)", dots: ["#e8735a", "#1f3a5f", "#f2e6d8"], badge: "New" },
  { title: "Seafoam one-piece", price: "$74", fit: "Runs small", tone: "linear-gradient(160deg,#bfe3d8,#6fb7a4)", dots: ["#6fb7a4", "#e8735a"], badge: null },
  { title: "Sand ribbed bottom", price: "$38", fit: "True to size", tone: "linear-gradient(160deg,#f3e7d7,#d8c2a4)", dots: ["#d8c2a4", "#1f3a5f", "#6fb7a4"], badge: null },
  { title: "Navy halter top", price: "$46", fit: "Runs big", tone: "linear-gradient(160deg,#5b7599,#1f3a5f)", dots: ["#1f3a5f", "#e8735a"], badge: "Back in stock" },
];

function Browser({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div style={{ width: MOCK_W, height: MOCK_H }} className="flex flex-col overflow-hidden bg-white">
      <div className={`flex h-[34px] shrink-0 items-center gap-2 px-3.5 ${dark ? "bg-[#e9e6e1]" : "bg-[#ece8e1]"}`}>
        <span className="h-[10px] w-[10px] rounded-full bg-[#e0dcd5]" />
        <span className="h-[10px] w-[10px] rounded-full bg-[#e0dcd5]" />
        <span className="h-[10px] w-[10px] rounded-full bg-[#e0dcd5]" />
        <span className="ml-3 h-[20px] w-[300px] rounded-md bg-white/80 px-3 text-[11px] leading-[20px] text-[#7f848c]">seasideswim.com/collections/all</span>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

export function BeforeStore() {
  return (
    <Browser>
      <div className="h-full bg-white font-[Arial,Helvetica,sans-serif] text-[#222]">
        <div className="bg-[#111] py-[5px] text-center text-[10px] font-bold tracking-wide text-[#ffe23d]">
          FREE SHIPPING ON SOME ORDERS!!! SEE DETAILS ★ NEW ARRIVALS ★ SALE SALE SALE ★ FOLLOW US @SEASIDESWIM
        </div>
        <div className="flex items-center justify-between px-5 pt-3">
          <span className="font-[Times_New_Roman,serif] text-[22px] font-bold tracking-[0.12em]">SEASIDE SWIM CO.</span>
          <span className="flex gap-3 text-[11px] text-[#555]">
            <span>Search</span>
            <span>Login</span>
            <span>Cart (0)</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-5 pt-2 text-[10.5px] text-[#1a0dab] underline">
          {BEFORE_NAV.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
        <div className="mx-5 mt-3 flex h-[88px] flex-col items-center justify-center bg-[linear-gradient(90deg,#ffe23d,#ff7ab8)] text-center">
          <span className="font-[Impact,Arial_Black,sans-serif] text-[30px] leading-none tracking-wide text-[#1b1b1b]">SUMMER SALE!!! UP TO 50% OFF*</span>
          <span className="mt-1 text-[9px] text-[#333]">*select styles only, exclusions apply, see store for details</span>
        </div>
        <div className="mx-5 mt-3 flex items-center justify-between border-y border-[#ddd] py-1.5 text-[10.5px] text-[#555]">
          <span>Showing 1 - 24 of 787 products</span>
          <span>Sort by: Featured ▾</span>
        </div>
        <div className="mx-5 mt-1.5 flex flex-wrap items-center gap-x-2 text-[10.5px] text-[#555]">
          <span className="font-bold">Size:</span>
          {BEFORE_SIZES.map((s) => (
            <span key={s} className="text-[#1a0dab] underline">
              {s}
            </span>
          ))}
        </div>
        <div className="mx-5 mt-3 grid grid-cols-4 gap-3">
          {BEFORE_CARDS.map((c) => (
            <div key={c.title}>
              <div className="relative h-[168px] bg-[#dedede]">
                <span className="absolute inset-0 grid place-items-center text-[10px] text-[#999]">image</span>
                {c.sold && <span className="absolute left-2 top-2 bg-black px-1.5 py-0.5 text-[9px] font-bold text-white">SOLD OUT</span>}
              </div>
              <p className="mt-1.5 text-[11px] leading-tight">{c.title}</p>
              <p className="mt-0.5 text-[11px] font-bold">{c.price}</p>
            </div>
          ))}
        </div>
      </div>
    </Browser>
  );
}

export function AfterStore() {
  return (
    <Browser>
      <div className="h-full bg-[#fbf7f2] font-[family-name:var(--font-sans)] text-[#1c2430]">
        <div className="bg-[#1f3a5f] py-[5px] text-center text-[10px] tracking-[0.06em] text-[#f7efe6]">Free shipping on orders over $150</div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center px-7 py-3.5">
          <span className="flex gap-5 text-[12px]">
            <span className="font-medium">Shop new</span>
            <span>Tops</span>
            <span>Bottoms</span>
            <span>One-pieces</span>
            <span className="text-[#c4533d]">Sale</span>
          </span>
          <span className="font-[family-name:var(--font-serif)] text-[26px] italic leading-none tracking-[-0.01em]">Seaside</span>
          <span className="flex items-center justify-end gap-4 text-[12px]">
            <span>Search</span>
            <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-[#1f3a5f] text-[10px] font-semibold text-white">2</span>
          </span>
        </div>
        <div className="flex items-end justify-between px-7 pt-2">
          <div>
            <p className="font-[family-name:var(--font-serif)] text-[30px] leading-none tracking-[-0.015em]">Bikini tops</p>
            <p className="mt-1 text-[11px] text-[#6b7280]">48 styles</p>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="mr-1 text-[#6b7280]">Size</span>
            {["XS", "S", "M", "L", "XL"].map((s) => (
              <span key={s} className={`grid h-[26px] min-w-[30px] place-items-center rounded-full border px-2 ${s === "M" ? "border-[#1f3a5f] bg-[#1f3a5f] text-white" : "border-[#d9d2c8] bg-white"}`}>
                {s}
              </span>
            ))}
            <span className="mx-1.5 h-4 w-px bg-[#d9d2c8]" />
            <span className="flex items-center gap-1.5">
              <span className="relative h-[16px] w-[28px] rounded-full bg-[#6fb7a4]">
                <span className="absolute right-[2px] top-[2px] h-[12px] w-[12px] rounded-full bg-white" />
              </span>
              In stock only
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4 px-7">
          {AFTER_CARDS.map((c) => (
            <div key={c.title}>
              <div className="relative h-[196px] overflow-hidden rounded-[14px]" style={{ background: c.tone }}>
                <div className="absolute inset-x-[30%] top-[26%] h-[34%] rounded-t-[40%] rounded-b-[18%] bg-white/25" />
                {c.badge && <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[9.5px] font-medium">{c.badge}</span>}
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-[12px] font-medium">{c.title}</p>
                <p className="text-[12px]">{c.price}</p>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="flex gap-1">
                  {c.dots.map((d) => (
                    <span key={d} className="h-[9px] w-[9px] rounded-full border border-black/10" style={{ background: d }} />
                  ))}
                </span>
                <span className="rounded-full bg-[#eef6f3] px-1.5 py-0.5 text-[9.5px] text-[#2f7d68]">{c.fit}</span>
              </div>
            </div>
          ))}
        </div>
        {/* the cart suggesting the matching bottom */}
        <div className="absolute bottom-5 right-6 flex w-[270px] items-center gap-3 rounded-[14px] border border-[#e6ded3] bg-white p-3 shadow-[0_18px_40px_-18px_rgba(31,58,95,0.45)]">
          <span className="h-[46px] w-[40px] shrink-0 rounded-[8px] bg-[linear-gradient(160deg,#f6b8a4,#e8735a)]" />
          <div className="min-w-0 flex-1">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#c4533d]">Complete the set</p>
            <p className="text-[11.5px] font-medium">Coral tie bottom · M</p>
            <p className="text-[11px] text-[#6b7280]">$38</p>
          </div>
          <span className="rounded-full bg-[#1f3a5f] px-2.5 py-1 text-[10.5px] font-medium text-white">+ Add</span>
        </div>
      </div>
    </Browser>
  );
}
