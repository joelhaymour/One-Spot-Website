"use client";

import { useState } from "react";
import { AGENTS } from "@/content/site";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";

type Stage = "draft" | "firmer" | "sent" | "call";

const { demo } = AGENTS;

interface LogLine {
  time: string;
  text: string;
}

const START: LogLine[] = [
  { time: "9:11", text: "Checked 42 open invoices" },
  { time: "9:12", text: "Drafted a reminder for #1042. Waiting for Dana." },
];

/**
 * "Try it. You're the owner." A real decision in miniature: the agent proposes, the owner decides,
 * and every step lands in the activity log. Shows, without saying so, who is in charge.
 */
export function AgentDemo() {
  const [stage, setStage] = useState<Stage>("draft");
  const [log, setLog] = useState<LogLine[]>(START);
  const [firm, setFirm] = useState(false);
  const decided = stage === "sent" || stage === "call";
  const draft = firm ? demo.drafts.firmer : demo.drafts.friendly;

  const add = (lines: LogLine[]) => setLog((current) => [...current, ...lines]);

  const act = (next: Stage) => {
    if (next === "firmer") {
      setFirm(true);
      add([{ time: "9:13", text: "Rewrote the reminder in a firmer tone, as asked" }]);
    }
    if (next === "sent") add([{ time: "9:14", text: "Sent the reminder to Tom at Jensen Co. Approved by Dana." }]);
    if (next === "call") add([{ time: "9:14", text: "Added “Call Tom at Jensen Co.” to Dana's list" }]);
    setStage(next);
  };

  const reset = () => {
    setStage("draft");
    setFirm(false);
    setLog(START);
  };

  return (
    <div className="relative rounded-[30px] border border-[var(--night-line)] bg-[var(--night-2)] p-5 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] sm:p-7">
      <p className="t-eyebrow">{demo.eyebrow}</p>

      <div className="mt-6 flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--night-3)] text-[var(--night-text)]">
          <Mark size={22} spot="#7EDDAD" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.95rem] font-medium tracking-[-0.01em]">{demo.agent}</p>
          <p className="text-[0.78rem] text-[var(--night-text-3)]">Harbor Home Services · {demo.time}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[0.72rem] font-medium transition-colors duration-500",
            decided ? "bg-[rgba(126,221,173,0.14)] text-[#7EDDAD]" : "bg-[rgba(232,182,92,0.14)] text-[#E8B65C]",
          )}
        >
          {decided ? "Done" : "Waiting for you"}
        </span>
      </div>

      <p className="mt-5 text-[0.98rem] leading-[1.55] text-[var(--night-text)]">{demo.message}</p>

      <blockquote key={draft} className="story-fade relative mt-4 rounded-2xl border border-[var(--night-line)] bg-[var(--night-3)] p-4 text-[0.92rem] leading-[1.55] text-[var(--night-text-2)]">
        <span className="mb-2 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--night-text-3)]">
          <Icon name="mail" size={14} />
          To: Tom, Jensen Co.
        </span>
        {draft}
      </blockquote>

      {stage === "firmer" && <p className="story-fade mt-3 text-[0.85rem] text-[var(--night-text-3)]">{demo.firmerNote}</p>}

      <div aria-live="polite">
        {decided ? (
          <div className="story-fade mt-5 flex items-start gap-3 rounded-2xl bg-[rgba(126,221,173,0.08)] p-4">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#7EDDAD] text-[var(--night)]">
              <Icon name="check" size={13} strokeWidth={2.8} />
            </span>
            <p className="text-[0.92rem] leading-[1.5] text-[var(--night-text)]">{stage === "sent" ? demo.replies.send : demo.replies.call}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {decided ? (
          <button type="button" onClick={reset} className="btn btn-sm border border-[var(--night-line)] text-[var(--night-text-2)] hover:border-[var(--night-text-3)] hover:text-[var(--night-text)]">
            {demo.reset}
          </button>
        ) : (
          <>
            <button type="button" onClick={() => act("sent")} className="btn btn-sm btn-light">
              <Icon name="check" size={15} strokeWidth={2.2} />
              {demo.actions.send}
            </button>
            {stage !== "firmer" && (
              <button type="button" onClick={() => act("firmer")} className="btn btn-sm border border-[var(--night-line)] text-[var(--night-text)] hover:border-[var(--night-text-3)]">
                {demo.actions.firmer}
              </button>
            )}
            <button type="button" onClick={() => act("call")} className="btn btn-sm border border-[var(--night-line)] text-[var(--night-text)] hover:border-[var(--night-text-3)]">
              <Icon name="phone" size={15} />
              {demo.actions.call}
            </button>
          </>
        )}
      </div>

      <div className="mt-6 border-t border-[var(--night-line)] pt-4">
        <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--night-text-3)]">
          <Icon name="log" size={14} />
          Activity log
        </p>
        <ol className="mt-3 grid gap-1.5">
          {log.map((line, i) => (
            <li key={`${i}-${line.text}`} className="story-fade flex gap-3 text-[0.8rem] leading-[1.45]">
              <span className="t-num shrink-0 text-[var(--night-text-3)]">{line.time}</span>
              <span className="text-[var(--night-text-2)]">{line.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
