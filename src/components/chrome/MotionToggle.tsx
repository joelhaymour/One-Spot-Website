"use client";

import { useEffect } from "react";
import { useExperience } from "@/state/experience";

const STORAGE_KEY = "one-spot:motion-paused";

/**
 * The visitor's stop button for everything that moves on its own (WCAG 2.2.2).
 * Scenes read `paused` from the store; CSS loops stop through html[data-paused="true"], a rule that
 * lives in globals.css.
 */
export function MotionToggle() {
  const paused = useExperience((s) => s.paused);
  const setPaused = useExperience((s) => s.setPaused);

  // The choice outlives a reload within the visit. Storage can be unavailable (private mode): ignore.
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === "1") setPaused(true);
    } catch {
      // storage unavailable
    }
  }, [setPaused]);

  useEffect(() => {
    const root = document.documentElement;
    if (paused) root.dataset.paused = "true";
    else delete root.dataset.paused;
    return () => {
      delete root.dataset.paused;
    };
  }, [paused]);

  const toggle = () => {
    const next = !paused;
    setPaused(next);
    try {
      if (next) window.sessionStorage.setItem(STORAGE_KEY, "1");
      else window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable
    }
  };

  return (
    <button
      type="button"
      aria-pressed={paused}
      onClick={toggle}
      className="glass group fixed bottom-[max(16px,env(safe-area-inset-bottom))] right-[max(16px,env(safe-area-inset-right))] z-[60] flex h-9 items-center gap-2.5 rounded-full px-3 text-[var(--text-1)] transition-colors duration-200 ease-[var(--ease-out)] hover:text-[var(--text-0)] max-lg:w-9 max-lg:justify-center max-lg:px-0"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden className="shrink-0">
        {paused ? <path d="M2 0.9v8.2a0.4 0.4 0 0 0 0.6 0.35l6.6-4.1a0.4 0.4 0 0 0 0-0.7L2.6 0.55A0.4 0.4 0 0 0 2 0.9Z" /> : <path d="M1.5 0.5h2.4v9H1.5zM6.1 0.5h2.4v9H6.1z" />}
      </svg>
      <span className="t-label text-current max-lg:sr-only">{paused ? "Resume motion" : "Pause motion"}</span>
    </button>
  );
}
