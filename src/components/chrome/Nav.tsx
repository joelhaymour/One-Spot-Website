"use client";

import { useEffect, useRef, useState } from "react";
import { NAV, NAV_CTA } from "@/content/site";
import { Lockup } from "@/components/ui/Mark";
import { Icon } from "@/components/ui/Icons";
import { AnchorButton, AnchorLink } from "@/components/ui/Button";
import { useLenis } from "@/components/motion/SmoothScroll";
import { cn } from "@/lib/cn";

const SECTION_IDS = NAV.map((item) => item.href.slice(1));
/** The bar gains its surface once the page has moved this far (px). */
const SOLID_AFTER = 24;
/** Below this the bar never hides. */
const HIDE_AFTER = 200;
const DIRECTION_SLOP = 8;

/** One rAF-throttled scroll reader: surface, hide-on-scroll-down, and the section under the reading line. */
function useBar() {
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;
    let anchors: { id: string; top: number }[] = [];

    const measure = () => {
      anchors = SECTION_IDS.flatMap((id) => {
        const el = document.getElementById(id);
        return el ? [{ id, top: el.getBoundingClientRect().top + window.scrollY }] : [];
      }).sort((a, b) => a.top - b.top);
    };

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setSolid(y > SOLID_AFTER);
      if (y <= HIDE_AFTER) {
        setHidden(false);
        lastY = y;
      } else if (Math.abs(y - lastY) >= DIRECTION_SLOP) {
        setHidden(y > lastY);
        lastY = y;
      }
      const line = y + window.innerHeight * 0.4;
      let current: string | null = null;
      for (const a of anchors) {
        if (a.top > line) break;
        current = a.id;
      }
      const contact = document.getElementById("contact");
      if (contact && contact.getBoundingClientRect().top < window.innerHeight * 0.4) current = null;
      setActive(current);
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(() => {
      measure();
      request();
    });
    observer.observe(document.body);
    window.addEventListener("scroll", request, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", request);
      cancelAnimationFrame(frame);
    };
  }, []);

  return { solid, hidden, active };
}

export function Nav() {
  const { solid, hidden, active } = useBar();
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const menuRef = useRef<HTMLDivElement>(null);

  // The phone menu holds the page still and closes on Escape.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      lenis?.start();
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  const close = () => setOpen(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-transform duration-[var(--t-ui)] ease-[var(--ease-out)]",
        hidden && !open && "-translate-y-full",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 border-b transition-[background-color,border-color] duration-[var(--t-ui)]",
          solid || open ? "border-[var(--line-strong)] bg-[rgba(232,213,163,0.97)]" : "border-transparent bg-transparent",
        )}
      />
      <nav aria-label="Main" className="wrap relative flex h-[var(--nav-h)] items-center justify-between gap-6">
        <AnchorLink href="#top" aria-label="One Spot, back to the top" className="-m-2 rounded-[4px] p-2 text-[var(--ink)]" onNavigate={close}>
          <span data-logo className="block">
            <Lockup />
          </span>
        </AnchorLink>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const isActive = active === item.href.slice(1);
            return (
              <li key={item.href}>
                <AnchorLink
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative rounded-[4px] px-3.5 py-2 text-[0.92rem] font-medium tracking-[-0.01em] transition-colors duration-[var(--t-ui)]",
                    isActive ? "text-[var(--ink)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]",
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-3.5 bottom-[4px] h-[2px] origin-left bg-[var(--ink)] transition-transform duration-[var(--t-ui)] ease-[var(--ease-out)]",
                      isActive ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </AnchorLink>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <AnchorButton href={NAV_CTA.href} size="sm" arrow={false} className="max-[359px]:hidden">
            {NAV_CTA.label}
          </AnchorButton>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-[4px] border-[1.5px] border-[var(--ink)] text-[var(--ink)] lg:hidden"
          >
            <Icon name={open ? "close" : "menu"} size={18} />
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!open}
        className="relative h-[calc(100svh-var(--nav-h))] overflow-y-auto bg-[var(--paper)] lg:hidden"
      >
        <ul className="wrap flex flex-col pt-6">
          {NAV.map((item) => (
            <li key={item.href} className="border-b border-[var(--line)]">
              <AnchorLink href={item.href} onNavigate={close} className="t-h3 flex items-baseline justify-between py-5 text-[2.4rem]">
                {item.label}
              </AnchorLink>
            </li>
          ))}
        </ul>
        <div className="wrap mt-8 pb-10">
          <AnchorButton href={NAV_CTA.href} onNavigate={close} className="w-full">
            {NAV_CTA.label}
          </AnchorButton>
        </div>
      </div>
    </header>
  );
}
