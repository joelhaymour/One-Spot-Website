import { NETWORK } from "@/content/copy";
import { CEO, DEPARTMENTS, DEPARTMENT_BY_ID, type AgentId, type DepartmentId } from "@/content/departments";

/**
 * The relay as data. Step 0 is the organisation at rest; step n plays RELAY[n - 1].
 * The DOM, the SVG fallback and the WebGL choreography all read this, so the copy deck stays the script.
 */

export type RelayParty = AgentId | "owner";

export interface RelayBeat {
  from: AgentId;
  to: RelayParty;
  speaker: string;
  line: string;
  caption: string;
}

export const RELAY: readonly RelayBeat[] = NETWORK.relay;
export const STEPS = RELAY.length + 1;

/** Slot order shared by every per-agent buffer: the CEO Agent first, then DEPARTMENTS order. */
export const AGENT_ORDER: readonly AgentId[] = ["ceo", ...DEPARTMENTS.map((d) => d.id)];
export const agentSlot = (id: AgentId) => AGENT_ORDER.indexOf(id);
export const departmentIndex = (id: DepartmentId) => DEPARTMENTS.findIndex((d) => d.id === id);
export const isDepartment = (id: RelayParty): id is DepartmentId => id !== "ceo" && id !== "owner";

export const beatAt = (step: number): RelayBeat | null => (step >= 1 ? (RELAY[step - 1] ?? null) : null);

/** The agents on stage in a step. The owner is the visitor, so never in this list. */
export function involvedIn(step: number): AgentId[] {
  const beat = beatAt(step);
  if (!beat) return [];
  return [beat.from, beat.to].filter((p): p is AgentId => p !== "owner");
}

/** A message from the CEO Agent is always somebody's news. This is whose. */
export function originOf(step: number): DepartmentId | null {
  for (let s = step; s >= 1; s--) {
    const from = RELAY[s - 1]?.from;
    if (from && isDepartment(from)) return from;
  }
  return null;
}

export const accentOf = (id: RelayParty) => (isDepartment(id) ? DEPARTMENT_BY_ID[id].accent : CEO.accent);
export const accentRgbOf = (id: RelayParty) => (isDepartment(id) ? DEPARTMENT_BY_ID[id].accentRgb : CEO.accentRgb);
