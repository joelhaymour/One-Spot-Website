"use client";

import { Component, type ReactNode } from "react";
import { Panel } from "@/components/ui/Panel";
import { Region } from "./contract";

const REGIONS = ["A", "B", "C", "D"] as const;

/**
 * The console with nothing on it yet: four empty hairline panels exactly where a screen will draw
 * its own, so a screen chunk that arrives late fills in rather than pops in.
 */
export function ScreenFallback() {
  return (
    <>
      {REGIONS.map((id) => (
        <Region key={id} id={id}>
          <Panel className="h-full w-full">
            <div aria-hidden className="h-9 border-b border-[var(--line-faint)]" />
          </Panel>
        </Region>
      ))}
    </>
  );
}

/** A screen that throws must not take the story down with it: the shell, log and captions carry on. */
export class ScreenBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <ScreenFallback /> : this.props.children;
  }
}
