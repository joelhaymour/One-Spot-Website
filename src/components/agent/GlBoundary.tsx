"use client";

import { Component, type ReactNode } from "react";
import { useExperience } from "@/state/experience";

/**
 * Guards every doorway into the lazy 3D chunk from the DOM side. If the chunk fails to load (flaky
 * network, a redeploy that removed an old hashed file) or anything inside it throws, the site drops to
 * the static tier and the SVG agents that were already on screen simply stay.
 * Must not import anything from src/gl: it has to exist when that chunk does not.
 */
export class GlBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    useExperience.getState().setTier("static");
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
