"use client";

import { startTransition, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, EASE } from "@/lib/gsap";
import { DEPARTMENT_BY_ID, departmentHref, type DepartmentId } from "@/content/departments";
import { useExperience } from "@/state/experience";
import { useLenis } from "./SmoothScroll";

/**
 * Stepping through the display.
 *
 *   idle -> entering (cover grows out of the clicked tile; route commits behind it; holds if the
 *   network is slow) -> arriving (department page has mounted; cover lifts) -> idle
 *   idle -> leaving (cover closes) -> returning (home has mounted at the restored scroll) -> idle
 *
 * The cover is a transform-only FLIP from the tile's rectangle, so nothing is ever rasterised at 8x
 * and the page swap (and any jank it causes) happens where nobody can see it.
 */

let coverEl: HTMLDivElement | null = null;
let labelEl: HTMLDivElement | null = null;
let stageEl: HTMLElement | null = null;

/** The element that should recede while the cover grows (the display the visitor is leaving). */
export function registerStage(el: HTMLElement | null) {
  stageEl = el;
}

export function useDepartmentTransition() {
  const router = useRouter();
  const lenis = useLenis();

  const enter = useCallback(
    (dept: DepartmentId, origin: HTMLElement | null) => {
      const state = useExperience.getState();
      const href = departmentHref(dept);
      if (state.phase !== "idle") return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!coverEl || reduce || state.tier === "static") {
        state.setHomeScrollY(window.scrollY);
        router.push(href);
        return;
      }

      const d = DEPARTMENT_BY_ID[dept];
      state.setHomeScrollY(window.scrollY);
      state.setPhase("entering", dept);
      lenis?.stop();

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const r = origin?.getBoundingClientRect() ?? new DOMRect(vw / 2 - 80, vh / 2 - 50, 160, 100);
      coverEl.style.setProperty("--cover-rgb", d.accentRgb);
      if (labelEl) labelEl.textContent = d.agentName;

      gsap.killTweensOf([coverEl, labelEl, stageEl]);
      gsap.set(coverEl, { visibility: "visible", opacity: 1, x: r.left, y: r.top, scaleX: r.width / vw, scaleY: r.height / vh, borderRadius: 0 });
      gsap.set(labelEl, { opacity: 0 });

      const tl = gsap.timeline({
        onComplete: () => startTransition(() => router.push(href)),
      });
      tl.to(coverEl, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.95, ease: EASE.camera }, 0);
      if (stageEl) tl.to(stageEl, { scale: 1.32, opacity: 0, duration: 0.95, ease: EASE.camera, transformOrigin: `${r.left + r.width / 2}px ${r.top + r.height / 2}px` }, 0);
      tl.to(labelEl, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.6);
    },
    [router, lenis],
  );

  const leave = useCallback(() => {
    const state = useExperience.getState();
    if (state.phase !== "idle") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!coverEl || reduce || state.tier === "static") {
      router.push("/");
      return;
    }
    state.setPhase("leaving");
    lenis?.stop();
    coverEl.style.setProperty("--cover-rgb", "244, 247, 255");
    if (labelEl) labelEl.textContent = "The Business";
    gsap.killTweensOf([coverEl, labelEl]);
    gsap.set(coverEl, { visibility: "visible", opacity: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 });
    gsap.set(labelEl, { opacity: 0 });
    gsap
      .timeline({ onComplete: () => startTransition(() => router.push("/")) })
      .to(coverEl, { opacity: 1, duration: 0.5, ease: "power2.inOut" }, 0)
      .to(labelEl, { opacity: 1, duration: 0.4 }, 0.25);
  }, [router, lenis]);

  return { enter, leave };
}

/** Mounted once in the root layout so it survives the route change it is hiding. */
export function TransitionLayer() {
  const cover = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const phase = useExperience((s) => s.phase);
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    coverEl = cover.current;
    labelEl = label.current;
    return () => {
      coverEl = null;
      labelEl = null;
    };
  }, []);

  // The destination has mounted: lift the cover.
  useEffect(() => {
    const { setPhase } = useExperience.getState();
    const arrived = (phase === "entering" && pathname.startsWith("/departments/")) || (phase === "leaving" && pathname === "/");
    if (arrived) setPhase(phase === "entering" ? "arriving" : "returning");
  }, [phase, pathname]);

  useEffect(() => {
    if (phase !== "arriving" && phase !== "returning") return;
    const el = cover.current;
    if (!el) return;
    const { setPhase } = useExperience.getState();
    const tween = gsap.to(el, {
      opacity: 0,
      duration: 0.9,
      delay: 0.15,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(el, { visibility: "hidden" });
        if (stageEl) gsap.set(stageEl, { clearProps: "transform,opacity" });
        setPhase("idle", null);
        lenis?.start();
      },
    });
    return () => {
      tween.kill();
    };
  }, [phase, lenis]);

  // Never strand the visitor behind a cover if a navigation fails.
  useEffect(() => {
    if (phase !== "entering" && phase !== "leaving") return;
    const id = window.setTimeout(() => {
      const el = cover.current;
      if (el) gsap.to(el, { opacity: 0, duration: 0.4, onComplete: () => gsap.set(el, { visibility: "hidden" }) });
      if (stageEl) gsap.set(stageEl, { clearProps: "transform,opacity" });
      useExperience.getState().setPhase("idle", null);
      lenis?.start();
    }, 6000);
    return () => window.clearTimeout(id);
  }, [phase, lenis]);

  return (
    <div
      ref={cover}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[80] origin-top-left"
      style={{
        visibility: "hidden",
        backgroundImage:
          "radial-gradient(70% 60% at 50% 46%, rgba(var(--cover-rgb, 244, 247, 255), 0.11), rgba(var(--cover-rgb, 244, 247, 255), 0.02) 55%, transparent 75%)",
        backgroundColor: "#050608",
        boxShadow: "inset 0 0 0 1px rgba(var(--cover-rgb, 244, 247, 255), 0.35)",
      }}
    >
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex items-center gap-3">
          <span className="spot spot-breathe" style={{ ["--accent-rgb" as string]: "var(--cover-rgb, 244, 247, 255)" }} />
          <div ref={label} className="t-label text-[var(--text-1)]" />
        </div>
      </div>
    </div>
  );
}
