import { cn } from "@/lib/cn";
import diagram from "@/components/process/diagram.module.css";
import { ToolGlyph } from "./ToolGlyph";
import { translate, type Tool } from "./layout";

/**
 * The nodes of the eight-tools drawing, shared by the hero (before and after, on a clock) and the flows
 * chapter (the after ring, with work routed around it). Authored in the drawing's user units; labels and
 * glyphs read the --u / --k scale that useSvgUnit writes on the frame (see process/diagram.module.css).
 */

/** The hairline every connection is drawn in. */
export const THREAD = "rgba(255, 255, 255, 0.17)";

/** A tool tile with its label. `index` marks the live copy the morph moves (and gives it its flash ring). */
export function TileNode({ tool, at, index }: { tool: Tool; at: readonly [number, number]; index?: number }) {
  return (
    <g data-tile={index} transform={translate(at)}>
      <g className={diagram.glyph}>
        <rect x="-26" y="-26" width="52" height="52" rx="13" fill="var(--bg-2)" stroke="var(--line-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {index !== undefined && (
          <rect data-flash x="-26" y="-26" width="52" height="52" rx="13" fill="none" stroke="var(--text-0)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" style={{ opacity: 0 }} />
        )}
        <ToolGlyph name={tool.label} />
      </g>
      <text className={diagram.label} textAnchor="middle" style={{ transform: "translate(0, calc(var(--k) * 26px + var(--u) * 15px))" }}>
        {tool.label}
      </text>
    </g>
  );
}

/** One Spot, in the middle. */
export function MarkGlyph() {
  return (
    <>
      <g className={diagram.glyph}>
        <circle r="36" fill="rgba(var(--spot-rgb), 0.05)" />
        <circle r="23" fill="var(--void)" stroke="var(--text-0)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        <circle r="5.8" fill="var(--spot)" />
      </g>
      <text className={cn(diagram.label, diagram.labelStrong)} style={{ transform: "translate(calc(var(--k) * 23px + var(--u) * 9px), calc(var(--u) * 3.5px))" }}>
        One Spot
      </text>
    </>
  );
}

/** The owner. */
export function YouGlyph() {
  return (
    <>
      <g className={diagram.glyph}>
        <circle r="13" fill="var(--void)" />
        <circle r="6.5" fill="var(--text-0)" />
      </g>
      <text className={cn(diagram.label, diagram.labelStrong)} style={{ transform: "translate(calc(var(--k) * 6.5px + var(--u) * 8px), calc(var(--u) * 3.5px))" }}>
        You
      </text>
    </>
  );
}

/** An agent's spot on a connection. */
export function AgentDot() {
  return (
    <g className={diagram.glyph}>
      <circle r="7" fill="rgba(var(--spot-rgb), 0.1)" />
      <circle r="2.6" fill="var(--spot)" />
    </g>
  );
}
