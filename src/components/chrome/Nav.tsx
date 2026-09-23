"use client";

import { useEffect, useId, useRef, useState, type FocusEvent, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BUSINESS, NAV, SITE } from "@/content/copy";
import { DEPARTMENT_BY_SLUG, type Department } from "@/content/departments";
import { Mark } from "@/components/agent/AgentSvg";
import { LinkButton } from "@/components/ui/Button";
import { useLenis } from "@/components/motion/SmoothScroll";
import { cn } from "@/lib/cn";
import { AnchorLink, scrollToElement, useAnchorNav, usePendingAnchor } from "./anchor";

const CONTACT_HREF = "/#contact";
const BUSINESS_HREF = NAV.find((item) => item.href.endsWith("#business"))?.href ?? "/#business";
const SECTION_IDS = [...NAV.map((item) => item.href.split("#")[1]), "contact"];

/** The bar turns solid once the page has moved this far (px). */
const SOLID_AFTER = 40;
/** Below this the bar never hides: the top of a page always shows its navigation. */
const HIDE_AFTER = 160;
/** Scroll travel (px) before direction counts, so trackpad jitter cannot flap the bar. */
const DIRECTION_SLOP = 8;

interface BarState {
  scrolled: boolean;
  hidden: boolean;
  /** id of the section under the reading line, home route only */
  activeId: string | null;
}

/**
 * One rAF-throttled scroll reader for everything the bar needs. Reads window.scrollY, which is
 * correct with or without Lenis. Section tops are cached and re-measured only when the page
 * resizes, so a scroll frame costs a handful of number comparisons and no layout reads.
 */
function useBarState(trackSections: boolean): BarState {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;
    let anchors: { id: string; top: number }[] = [];
    let viewport = window.innerHeight;

    const measure = () => {
      viewport = window.innerHeight;
      if (!trackSections) {
        anchors = [];
        return;
      }
      const els = new Set<HTMLElement>(document.querySelectorAll<HTMLElement>("main > section[id]"));
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el) els.add(el);
      }
      anchors = [...els]
        .map((el) => ({ id: el.id, top: el.getBoundingClientRect().top + window.scrollY }))
        .sort((a, b) => a.top - b.top);
    };

    // React only hears about a scroll frame when one of the three answers actually changes.
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > SOLID_AFTER);

      if (y <= HIDE_AFTER) {
        setHidden(false);
        lastY = y;
      } else if (Math.abs(y - lastY) >= DIRECTION_SLOP) {
        setHidden(y > lastY);
        lastY = y;
      }

      const line = y + viewport * 0.4;
      let current: string | null = null;
      for (const anchor of anchors) {
        if (anchor.top > line) break;
        current = anchor.id;
      }
      setActiveId(current);
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      request();
    };

    // Fires once on observe, which doubles as the initial read.
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);
    window.addEventListener("scroll", request, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", request);
      cancelAnimationFrame(frame);
    };
  }, [trackSections]);

  return { scrolled, hidden, activeId };
}

function MenuGlyph({ open }: { open: boolean }) {
  const line = "absolute left-0 top-1/2 h-px w-full bg-current transition-transform duration-300 ease-[var(--ease-out)]";
  return (
    <span aria-hidden className="relative block h-3 w-[18px]">
      <span className={cn(line, open ? "rotate-45" : "-translate-y-[4px]")} />
      <span className={cn(line, open ? "-rotate-45" : "translate-y-[4px]")} />
    </span>
  );
}

function Breadcrumb({ department, className, onNavigate }: { department: Department; className?: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2.5 text-[0.8125rem] tracking-[-0.005em]">
        <li>
          <AnchorLink href={BUSINESS_HREF} onClick={onNavigate} className="text-[var(--text-1)] transition-colors duration-200 hover:text-[var(--text-0)]">
            {BUSINESS.short}
          </AnchorLink>
        </li>
        <li aria-hidden className="text-[var(--text-3)]">
          /
        </li>
        <li className="flex items-center gap-2 text-[var(--text-0)]" aria-current="page">
          <span className="block h-1.5 w-1.5 rounded-full" style={{ background: department.accent }} />
          {department.name}
        </li>
      </ol>
    </nav>
  );
}

export function Nav() {
  const pathname = usePathname();
  const lenis = useLenis();
  const go = useAnchorNav();
  usePendingAnchor();

  const menuId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // The menu remembers the route it was opened on, so any navigation closes it without an effect.
  const [menuAt, setMenuAt] = useState<string | null>(null);
  const [keyboardInside, setKeyboardInside] = useState(false);
  const open = menuAt === pathname;

  const onHome = pathname === "/";
  const { scrolled, hidden, activeId } = useBarState(onHome);

  const slug = pathname.startsWith("/departments/") ? pathname.split("/")[2] : undefined;
  const department: Department | undefined = slug ? DEPARTMENT_BY_SLUG[slug] : undefined;

  // Never slide away from someone who is using it.
  const offscreen = hidden && !open && !keyboardInside;
  const solid = scrolled || open;

  useEffect(() => {
    if (!open) return;
    const openedAt = window.scrollY;
    const close = () => setMenuAt(null);
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close();
      toggleRef.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) close();
    };
    const onScroll = () => {
      if (Math.abs(window.scrollY - openedAt) > 120) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  const onFocus = (event: FocusEvent<HTMLElement>) => {
    // Pointer clicks also focus links; only keyboard focus should pin the bar.
    if (event.target.matches(":focus-visible")) setKeyboardInside(true);
  };
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardInside(false);
  };

  const skip = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("content") ?? document.querySelector<HTMLElement>("main");
    if (!target) return;
    event.preventDefault();
    scrollToElement(target, lenis, true);
  };

  const closeMenu = () => setMenuAt(null);

  return (
    <>
      <a
        href="#content"
        onClick={skip}
        className="fixed left-4 top-3 z-[90] -translate-y-[300%] rounded-full bg-[var(--text-0)] px-4 py-2 text-[0.8125rem] font-medium text-[#08090b] transition-transform duration-200 ease-[var(--ease-out)] focus:translate-y-0"
      >
        Skip to content
      </a>

      <header
        ref={headerRef}
        onFocus={onFocus}
        onBlur={onBlur}
        className={cn(
          "fixed inset-x-0 top-0 z-[60] transition-transform duration-[480ms] ease-[var(--ease-out)]",
          offscreen && "-translate-y-full",
        )}
      >
        {/* The solid state is a separate layer so only its opacity ever animates. */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 border-b border-[var(--line)] bg-[rgba(4,5,6,0.94)] transition-opacity duration-300 ease-[var(--ease-out)]",
            solid ? "opacity-100" : "opacity-0",
          )}
        />

        <div className="relative mx-auto grid h-[var(--nav-h)] w-full max-w-[1888px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-[var(--gutter)]">
          <Link
            href="/"
            onClick={(event) => {
              closeMenu();
              go(event, "/");
            }}
            aria-label={`${SITE.name}, home`}
            className="flex items-center gap-2.5 justify-self-start text-[var(--text-0)]"
          >
            <Mark size={22} />
            <span className="text-[0.9375rem] font-medium tracking-[-0.02em]">{SITE.name}</span>
          </Link>

          {department ? (
            <Breadcrumb department={department} className="hidden md:block" />
          ) : (
            <nav aria-label="Primary" className="hidden md:block">
              <ul className="flex items-center gap-8">
                {NAV.map((item) => {
                  const current = onHome && activeId === item.href.split("#")[1];
                  return (
                    <li key={item.href}>
                      <AnchorLink
                        href={item.href}
                        aria-current={current ? "location" : undefined}
                        className={cn(
                          "group relative block py-2 text-[0.8125rem] tracking-[-0.005em] transition-colors duration-200 hover:text-[var(--text-0)]",
                          current ? "text-[var(--text-0)]" : "text-[var(--text-1)]",
                        )}
                      >
                        {item.label}
                        <span
                          aria-hidden
                          className={cn(
                            "absolute inset-x-0 bottom-0.5 h-px origin-left bg-[var(--text-0)] transition-transform duration-[480ms] ease-[var(--ease-out)]",
                            current ? "scale-x-100" : "scale-x-0",
                          )}
                        />
                      </AnchorLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          <div className="col-start-3 flex items-center gap-2 justify-self-end">
            <LinkButton
              href={CONTACT_HREF}
              onClick={(event) => {
                closeMenu();
                go(event, CONTACT_HREF);
              }}
              className="h-9! whitespace-nowrap px-4! text-[0.8125rem]! max-[400px]:px-3!"
            >
              {SITE.action}
            </LinkButton>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setMenuAt(open ? null : pathname)}
              className="-mr-2.5 flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-0)] md:hidden"
            >
              <span className="sr-only">Menu</span>
              <MenuGlyph open={open} />
            </button>
          </div>
        </div>

        {/* Disclosure panel. Always in the DOM (links are in the server HTML); hidden from focus and
            assistive tech by visibility, revealed with opacity and a short slide. */}
        <div
          id={menuId}
          className={cn(
            "absolute inset-x-0 top-full border-b border-[var(--line)] bg-[rgba(4,5,6,0.98)] px-[var(--gutter)] pb-6 pt-2 transition-[opacity,transform,visibility] duration-300 ease-[var(--ease-out)] md:hidden",
            open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0",
          )}
        >
          {department && <Breadcrumb department={department} onNavigate={closeMenu} className="border-b border-[var(--line-faint)] py-4" />}
          <nav aria-label="Primary">
            <ul>
              {NAV.map((item) => (
                <li key={item.href} className="border-b border-[var(--line-faint)]">
                  <AnchorLink
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={onHome && activeId === item.href.split("#")[1] ? "location" : undefined}
                    className="flex items-center justify-between py-4 text-[1.0625rem] tracking-[-0.015em] text-[var(--text-0)]"
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={cn("spot transition-opacity duration-300", onHome && activeId === item.href.split("#")[1] ? "opacity-100" : "opacity-0")}
                    />
                  </AnchorLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
