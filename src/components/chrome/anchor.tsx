"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, type ComponentProps, type MouseEvent } from "react";
import { useLenis } from "@/components/motion/SmoothScroll";
import { useExperience } from "@/state/experience";

/**
 * In-page links ("/#contact") for a site whose scrolling is owned by Lenis.
 * Same route: scroll there ourselves. Other route: let the link navigate, remember the target, and
 * land on it once the home route has mounted (the scroll owner resets to the top on route change).
 * The hrefs stay real, so new-tab, no-JS and crawlers get ordinary links.
 */

type LenisInstance = NonNullable<ReturnType<typeof useLenis>>;

let pending: { path: string; id: string } | null = null;

const parseHref = (href: string) => {
  const i = href.indexOf("#");
  return i < 0 ? { path: href || "/", id: "" } : { path: href.slice(0, i) || "/", id: href.slice(i + 1) };
};

const pageTop = (el: Element) => Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY));

// power3.inOut, to match the site's camera moves
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function scrollToY(top: number, lenis: LenisInstance | null, instant = false) {
  // A long smooth scroll would drag the visitor through every scene on the way. Cut instead.
  const far = Math.abs(top - window.scrollY) > window.innerHeight * 2.5;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const immediate = instant || far || reduce;
  if (lenis) lenis.scrollTo(top, { immediate, force: true, duration: 1.2, easing: easeInOut });
  else window.scrollTo({ top, behavior: immediate ? "instant" : "smooth" });
}

/** Scroll to an element and hand it keyboard focus, as a native fragment link would. */
export function scrollToElement(el: HTMLElement, lenis: LenisInstance | null, instant = false) {
  scrollToY(pageTop(el), lenis, instant);
  if (el.closest("[aria-hidden='true']")) return;
  if (!el.hasAttribute("tabindex")) {
    el.setAttribute("tabindex", "-1");
    el.style.outline = "none";
  }
  el.focus({ preventScroll: true });
}

/** Click handler for any link whose href may carry a hash. Leaves modified clicks to the browser. */
export function useAnchorNav() {
  const pathname = usePathname();
  const lenis = useLenis();

  return useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const { path, id } = parseHref(href);

      if (path !== pathname) {
        pending = id ? { path, id } : null;
        return;
      }
      if (!id) {
        event.preventDefault();
        scrollToY(0, lenis);
        window.history.replaceState(null, "", path);
        return;
      }
      const el = document.getElementById(id);
      if (!el) return;
      event.preventDefault();
      scrollToElement(el, lenis);
      window.history.replaceState(null, "", `#${id}`);
    },
    [pathname, lenis],
  );
}

/**
 * Mount once (the Nav does). Completes a cross-route anchor click after the new route has mounted.
 * Two passes: the restore slot in the store lets the scroll owner land on the target in its own
 * first frame when it reads it in time; the pass a frame later covers the case where it did not.
 */
export function usePendingAnchor() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (!pending || pending.path !== pathname) return;
    const el = document.getElementById(pending.id);
    if (!el) {
      pending = null;
      return;
    }

    const y = pageTop(el);
    if (pathname === "/") useExperience.getState().setHomeScrollY(y);

    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        pending = null;
        const store = useExperience.getState();
        if (store.homeScrollY === y) store.setHomeScrollY(null);
        scrollToElement(el, lenis, true);
      });
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [pathname, lenis]);
}

type AnchorLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/** next/link that understands "/#section" under smooth scrolling. */
export function AnchorLink({ href, onClick, ...rest }: AnchorLinkProps) {
  const go = useAnchorNav();
  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);
        go(event, href);
      }}
      {...rest}
    />
  );
}
