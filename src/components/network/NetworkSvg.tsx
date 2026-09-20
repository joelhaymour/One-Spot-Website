import { memo } from "react";
import { DEPARTMENTS, type AgentId } from "@/content/departments";
import { AgentSvg } from "@/components/agent/AgentSvg";
import { cn } from "@/lib/cn";
import { pct, type FlatBox, type FlatScene } from "./flat";
import { RELAY, accentOf, beatAt, departmentIndex, involvedIn, isDepartment, originOf } from "./relay";
import styles from "./network.module.css";

/**
 * The organisation, flat. Server-rendered, so it is what everyone sees first; visitors on the static tier
 * (reduced motion, data saver, no WebGL) keep it. Same floor plan and camera as the 3D scene.
 * Decorative: the relay's text equivalent is the caption list.
 */

interface NetworkSvgProps {
  scene: FlatScene;
  step: number;
  className?: string;
}

const boxStyle = (box: FlatBox) => ({ left: pct(box.left), top: pct(box.top), width: pct(box.width), height: pct(box.height) });

/** Where an agent's attention is during a step, for the flat drawing: [gazeX, gazeY]. */
function attention(id: AgentId, step: number, scene: FlatScene): readonly [number, number] {
  const beat = beatAt(step);
  if (!beat || (beat.from !== id && beat.to !== id)) return [0, 0];
  if (id !== "ceo") {
    // Up and across, at the CEO Agent.
    const i = departmentIndex(id);
    const toward = scene.ceo.left + scene.ceo.width / 2 - (scene.departments[i].left + scene.departments[i].width / 2);
    return [Math.sign(toward) * Math.min(1, Math.abs(toward) * 2.4), 0.8];
  }
  const other = beat.from === "ceo" ? beat.to : beat.from;
  if (!isDepartment(other)) return [0, -0.4];
  const box = scene.departments[departmentIndex(other)];
  const toward = box.left + box.width / 2 - (scene.ceo.left + scene.ceo.width / 2);
  return [Math.sign(toward) * Math.min(1, Math.abs(toward) * 2.4), -0.25];
}

export const NetworkSvg = memo(function NetworkSvg({ scene, step, className }: NetworkSvgProps) {
  const involved = involvedIn(step);
  const dimmed = (id: AgentId) => step > 0 && !involved.includes(id);
  const ceoGaze = attention("ceo", step, scene);
  const ownerBeat = beatAt(step)?.to === "owner";

  return (
    <div className={cn("absolute inset-0", className)}>
      <div className="absolute transition-opacity duration-500 ease-[var(--ease-out)]" style={{ ...boxStyle(scene.ceo), opacity: dimmed("ceo") ? 0.45 : 1 }}>
        <AgentSvg agent="ceo" mood={step > 0 && !dimmed("ceo") ? "observe" : "idle"} gazeX={ceoGaze[0]} gazeY={ceoGaze[1]} />
      </div>
      {scene.paintOrder.map((i) => {
        const d = DEPARTMENTS[i];
        const gaze = attention(d.id, step, scene);
        const on = step > 0 && !dimmed(d.id);
        return (
          <div key={d.id} className="absolute transition-opacity duration-500 ease-[var(--ease-out)]" style={{ ...boxStyle(scene.departments[i]), opacity: dimmed(d.id) ? 0.45 : 1 }}>
            <AgentSvg agent={d.id} accent={d.accent} mood={on ? "observe" : "idle"} gazeX={gaze[0]} gazeY={gaze[1]} />
          </div>
        );
      })}

      {/* Over the agents: the front of the register ring, where messages dock, is in front of the CEO Agent's body. */}
      <svg viewBox={scene.viewBox} className="absolute inset-0 h-full w-full overflow-visible" fill="none" aria-hidden>
        {/* Every department has one line, and it goes to the CEO Agent. There are no others. */}
        {scene.links.map((link, i) => (
          <path key={DEPARTMENTS[i].id} d={link.up} stroke="var(--line-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {RELAY.map((beat, i) => {
          const n = i + 1;
          const dept = isDepartment(beat.from) ? beat.from : isDepartment(beat.to) ? beat.to : null;
          if (!dept) return null;
          const link = scene.links[departmentIndex(dept)];
          const end = beat.from === dept ? link.ceoEnd : link.deptEnd;
          const color = accentOf(originOf(n) ?? dept);
          return (
            <g key={n}>
              <path d={beat.from === dept ? link.up : link.down} pathLength={1} stroke={color} strokeWidth="3" strokeLinecap="round" className={styles.relay} data-on={step === n} />
              <circle cx={end[0]} cy={end[1]} r="7" fill={color} className={styles.landing} data-on={step === n} />
            </g>
          );
        })}
        <circle cx={scene.ceoFront[0]} cy={scene.ceoFront[1]} r="7" fill="var(--spot)" className={styles.landing} data-on={ownerBeat} />
      </svg>
    </div>
  );
});
