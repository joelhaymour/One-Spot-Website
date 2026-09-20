import { useId } from "react";
import type { AgentId, AgentMood } from "@/content/departments";
import { cn } from "@/lib/cn";

/**
 * DATUM, drawn flat. This is what paints first, what reduced-motion and no-WebGL visitors keep,
 * and what stands in wherever a 3D agent would be too small to read (tiles, captions, the nav).
 *
 * Front elevation: slab split by a lit seam, smoked glass, one Spot, one ring woven around the body
 * (back arc under, front arc over: the weave is what makes it read as an object, not an icon).
 */

interface AgentSvgProps {
  agent: AgentId;
  accent?: string;
  mood?: AgentMood;
  /** -1..1 horizontal attention. Moves the Spot and fakes a small yaw of the upper block. */
  gazeX?: number;
  /** -1..1 vertical attention. */
  gazeY?: number;
  className?: string;
  title?: string;
}

const RING_DASH: Partial<Record<AgentId, string>> = {
  marketing: "0 40 468 40", // open arc
  operations: "128 9", // four segments
  administration: "3 42.6", // twelve studs drawn over a plain band
};

export function AgentSvg({ agent, accent = "rgb(var(--accent-rgb))", mood = "idle", gazeX = 0, gazeY = 0, className, title }: AgentSvgProps) {
  const id = useId();
  const ceo = agent === "ceo";
  const W = ceo ? 120 : 100;
  const H = ceo ? 360 : 251;
  const vbW = ceo ? 320 : 200;
  const vbH = ceo ? 400 : 290;
  const ox = (vbW - W) / 2;
  const oy = (vbH - H) / 2;
  const seamY = oy + H - 90;
  const glass = ceo ? { x: ox + 22, y: oy + 15, w: 76, h: 330, r: 12 } : { x: ox + 20, y: oy + 8, w: 60, h: 148, r: 10 };
  const homeY = ceo ? oy + H * 0.2 : oy + H * 0.26;
  const spotX = vbW / 2 + gazeX * (ceo ? 24 : 18);
  const spotY = homeY - gazeY * (ceo ? 60 : 30);
  const ringRx = ceo ? 102 : 85;
  const ringCy = homeY + 6;
  const thinking = mood === "think";
  const spotR = thinking ? 2.2 : mood === "observe" ? 4.4 : 3.5;
  const haloR = thinking ? 8 : mood === "observe" ? 22 : 16;
  const spotColor = ceo ? "#f4f7ff" : accent;
  const ringPath = (front: boolean) =>
    `M ${vbW / 2 - ringRx} ${ringCy} A ${ringRx} ${ringRx * 0.17} 0 0 ${front ? 0 : 1} ${vbW / 2 + ringRx} ${ringCy}`;

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className={cn("block h-full w-full overflow-visible", className)} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#33373d" />
          <stop offset="0.5" stopColor="#24272c" />
          <stop offset="1" stopColor="#191b1f" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07080a" />
          <stop offset="1" stopColor="#0d0f12" />
        </linearGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor={spotColor} stopOpacity="0.85" />
          <stop offset="0.35" stopColor={spotColor} stopOpacity="0.22" />
          <stop offset="1" stopColor={spotColor} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <rect x={glass.x} y={glass.y} width={glass.w} height={glass.h} rx={glass.r} />
        </clipPath>
      </defs>

      {/* ring: back arc, under the body */}
      <path d={ringPath(false)} fill="none" stroke="#9aa1ab" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray={RING_DASH[agent]} />
      {agent === "finance" && <path d={ringPath(false)} fill="none" stroke="#9aa1ab" strokeOpacity="0.35" strokeWidth="1.2" transform="translate(0 5)" />}
      {ceo && <ellipse cx={vbW / 2} cy={ringCy + 30} rx={145} ry={20} fill="none" stroke="#9aa1ab" strokeOpacity="0.4" strokeWidth="1.3" />}

      {/* body */}
      <g style={{ transformOrigin: `${vbW / 2}px ${seamY}px`, transform: ceo ? undefined : `translateX(${gazeX * 2}px) scaleX(${1 - Math.abs(gazeX) * 0.06})`, transition: "transform 600ms var(--ease-out)" }}>
        <rect x={ox} y={oy} width={W} height={ceo ? H : H - 90 - 2} rx={18} fill={`url(#${id}-body)`} />
        <rect x={ox} y={oy} width="1" height={ceo ? H : H - 92} rx="0.5" fill="#fff" opacity="0.14" transform={`translate(1 0)`} />
        <rect x={glass.x} y={glass.y} width={glass.w} height={glass.h} rx={glass.r} fill={`url(#${id}-glass)`} stroke="#a9afb8" strokeWidth="0.75" strokeOpacity="0.8" />
        <g clipPath={`url(#${id}-clip)`}>
          <rect x={glass.x + glass.w * 0.16} y={glass.y} width={glass.w * 0.1} height={glass.h} fill="#fff" opacity="0.05" />
          <g style={{ transform: `translate(${spotX}px, ${spotY}px)`, transition: "transform 280ms cubic-bezier(.2,.8,.2,1)" }}>
            <circle r={haloR} fill={`url(#${id}-halo)`} style={{ transition: "r 300ms var(--ease-out)" }} />
            <circle r={spotR} fill="#fff" style={{ transition: "r 300ms var(--ease-out)" }} />
          </g>
        </g>
      </g>
      {!ceo && (
        <>
          <rect x={ox} y={seamY + 1} width={W} height={89} rx={18} fill={`url(#${id}-body)`} />
          <rect x={ox + 3} y={seamY - 1.5} width={W - 6} height={4} fill={accent} opacity="0.25" />
          <rect x={ox + 3} y={seamY - 0.25} width={W - 6} height={1.5} fill={accent} />
        </>
      )}

      {/* ring: front arc, over the body */}
      <path d={ringPath(true)} fill="none" stroke="#c3c8d0" strokeWidth="1.6" strokeDasharray={RING_DASH[agent]} />
      {agent === "finance" && <path d={ringPath(true)} fill="none" stroke="#c3c8d0" strokeWidth="1.3" transform="translate(0 5)" />}
      {agent === "knowledge" && (
        <>
          <path d={ringPath(true)} fill="none" stroke="#c3c8d0" strokeOpacity="0.8" strokeWidth="1.3" transform="translate(0 4.5)" />
          <path d={ringPath(true)} fill="none" stroke="#c3c8d0" strokeOpacity="0.6" strokeWidth="1.3" transform="translate(0 -4.5)" />
        </>
      )}
      {agent === "sales" && <rect x={vbW / 2 + ringRx * 0.55} y={ringCy + ringRx * 0.17 * 0.72} width="6" height="5" fill="#c3c8d0" />}
      <rect x={vbW / 2 - 2} y={ringCy + ringRx * 0.17 - 1.4} width="4" height="2.4" fill={spotColor} style={{ filter: `drop-shadow(0 0 3px ${spotColor})` }} />
    </svg>
  );
}

/** The logo: the agent collapsed to a spot inside a ring. */
export function Mark({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <ellipse cx="12" cy="12" rx="10.2" ry="10.2" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.9" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </svg>
  );
}
