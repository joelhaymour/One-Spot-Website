"use client";

import { useState } from "react";
import { AgentSlot } from "@/components/agent/AgentSlot";
import { AgentSvg } from "@/components/agent/AgentSvg";
import { DEPARTMENTS, type AgentId, type AgentMood } from "@/content/departments";

const MOODS: AgentMood[] = ["idle", "observe", "think", "act", "transmit", "alert"];
const AGENTS: AgentId[] = ["ceo", ...DEPARTMENTS.map((d) => d.id)];

export function LabClient() {
  const [mood, setMood] = useState<AgentMood>("idle");
  const [agent, setAgent] = useState<AgentId>("ceo");
  const [load, setLoad] = useState(0);
  const [learn, setLearn] = useState(0);

  return (
    <main className="min-h-svh px-8 py-10">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {AGENTS.map((a) => (
          <button key={a} onClick={() => setAgent(a)} className={`rounded-md border px-3 py-1.5 text-xs ${agent === a ? "border-white/40 bg-white/10" : "border-white/10"}`}>
            {a}
          </button>
        ))}
        <span className="mx-3 h-4 w-px bg-white/15" />
        {MOODS.map((m) => (
          <button key={m} onClick={() => setMood(m)} className={`rounded-md border px-3 py-1.5 text-xs ${mood === m ? "border-white/40 bg-white/10" : "border-white/10"}`}>
            {m}
          </button>
        ))}
        <span className="mx-3 h-4 w-px bg-white/15" />
        <button onClick={() => setLoad((l) => (l >= 1 ? 0 : l + 0.25))} className="rounded-md border border-white/10 px-3 py-1.5 text-xs">
          load {load}
        </button>
        <button onClick={() => setLearn((l) => l + 1)} className="rounded-md border border-white/10 px-3 py-1.5 text-xs">
          learn {learn}
        </button>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-8">
        <AgentSlot key={agent} agent={agent} mood={mood} load={load} learnCount={learn} className="h-[78svh] w-full" deferMs={0} />
        <div className="grid grid-cols-2 gap-4">
          {AGENTS.map((a) => (
            <div key={a} className="panel h-44 p-3" style={{ ["--accent-rgb" as string]: a === "ceo" ? "234,242,255" : DEPARTMENTS.find((d) => d.id === a)!.accentRgb }}>
              <AgentSvg agent={a} mood={mood} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
