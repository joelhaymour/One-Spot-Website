"use client";

import { create } from "zustand";
import type { QualityTier } from "@/lib/capabilities";
import type { DepartmentId } from "@/content/departments";

export type TransitionPhase = "idle" | "entering" | "arriving" | "leaving" | "returning";

export interface ViewportPoint {
  /** client-space pixels */
  x: number;
  y: number;
}

interface ExperienceState {
  /** null until detected on the client; render the SVG fallback until then. */
  tier: QualityTier | null;
  setTier: (tier: QualityTier) => void;

  /** Department the visitor is pointing at in the HUD. Drives tile state and the CEO Agent's gaze. */
  hoveredDept: DepartmentId | null;
  setHoveredDept: (id: DepartmentId | null) => void;

  /** Where the CEO Agent should look, in client pixels. null = free attention (follows the HUD's own events). */
  gazeTarget: ViewportPoint | null;
  setGazeTarget: (p: ViewportPoint | null) => void;

  /** Route transition between the HUD and a department workstation. */
  phase: TransitionPhase;
  activeDept: DepartmentId | null;
  setPhase: (phase: TransitionPhase, dept?: DepartmentId | null) => void;

  /** Scroll offset to restore when stepping back out of a department into the HUD. */
  homeScrollY: number | null;
  setHomeScrollY: (y: number | null) => void;
  /** True when that offset was taken at one of the display's doors (so "Back to the Hub" restores it). */
  homeFromDisplay: boolean;
  setHomeFromDisplay: (v: boolean) => void;

  /** Visitor pressed "Pause motion": ambient loops and the HUD's event script stop (WCAG 2.2.2). */
  paused: boolean;
  setPaused: (paused: boolean) => void;
}

export const useExperience = create<ExperienceState>((set) => ({
  tier: null,
  setTier: (tier) => set({ tier }),

  hoveredDept: null,
  setHoveredDept: (hoveredDept) => set({ hoveredDept }),

  gazeTarget: null,
  setGazeTarget: (gazeTarget) => set({ gazeTarget }),

  phase: "idle",
  activeDept: null,
  setPhase: (phase, dept) =>
    set((s) => ({ phase, activeDept: dept === undefined ? s.activeDept : dept })),

  homeScrollY: null,
  setHomeScrollY: (homeScrollY) => set({ homeScrollY }),
  homeFromDisplay: false,
  setHomeFromDisplay: (homeFromDisplay) => set({ homeFromDisplay }),

  paused: false,
  setPaused: (paused) => set({ paused }),
}));
