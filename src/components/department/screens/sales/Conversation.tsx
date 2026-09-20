"use client";

import { Dot, Panel, PanelHeader, StatusChip } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { Fade, Initials, Swap, Tag, Tick, wait } from "./kit";
import { ENQUIRY, REPLY, REPLY_DELAY_S, REPLY_DONE_MS, REPLY_SPEED, THREADS } from "./data";

interface ConversationProps {
  /** The agent has opened Dana's enquiry and is answering it. */
  replying: boolean;
  active: boolean;
}

/** Region B. The inbox at rest; one thread, read and answered, once the agent follows up. */
export function Conversation({ replying, active }: ConversationProps) {
  return (
    <Panel active={active} className="h-full overflow-hidden">
      <PanelHeader
        label="Conversation"
        right={
          <Swap
            flipped={replying}
            delayMs={REPLY_DONE_MS}
            align="end"
            first={<span className="t-label">5 unanswered</span>}
            second={<StatusChip tone="ok">Replied 08:47</StatusChip>}
          />
        }
      />
      <div className="relative h-[370px]">
        <Fade on={!replying} y={0} className="absolute inset-0">
          <Inbox />
        </Fade>
        <Fade on={replying} y={10} delayMs={200} className="absolute inset-0">
          <ThreadView on={replying} />
        </Fade>
      </div>
    </Panel>
  );
}

function Inbox() {
  return (
    <ul className="px-3.5">
      {THREADS.map((t, i) => (
        <li key={t.id} className="flex gap-3 border-t border-[var(--line-faint)] py-[14px] first:border-t-0">
          <Initials name={t.name} className="mt-[1px]" />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate text-[12px] text-[var(--text-0)]">{t.name}</span>
              <Tag>{t.via}</Tag>
              <span className="t-num ml-auto font-mono text-[10.5px] text-[var(--text-2)]">{t.time}</span>
            </span>
            <span className="mt-[5px] flex items-center gap-2">
              <span className="truncate text-[11.5px] text-[var(--text-1)]">{t.snippet}</span>
              {/* only the newest enquiry carries the light */}
              {i === 0 ? <Dot tone="accent" className="ml-auto" /> : null}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function ThreadView({ on }: { on: boolean }) {
  return (
    <div className="px-3.5">
      <div className="flex items-center gap-3 border-b border-[var(--line-faint)] pb-3 pt-1">
        <Initials name="Dana Whitfield" size={30} />
        <span className="min-w-0">
          <span className="block text-[12.5px] text-[var(--text-0)]">Dana Whitfield</span>
          <span className="block text-[10.5px] text-[var(--text-2)]">Whitfield Property · Website form</span>
        </span>
        <Tag className="ml-auto">New lead</Tag>
      </div>

      {/* what she asked */}
      <div className="mt-3 rounded-[9px] border border-[var(--line)] bg-white/[0.02] px-3 py-2.5">
        <div className="t-label !text-[9px]">Dana · 08:44</div>
        <p className="mt-2 text-[12px] leading-[1.5] text-[var(--text-1)]">
          {ENQUIRY.map((part, i) =>
            part.key ? (
              // her own words, marked as the agent picks them up
              <span
                key={i}
                className={cn("border-b transition-colors duration-700 ease-[var(--ease-out)]", on ? "border-[var(--line-strong)] text-[var(--text-0)]" : "border-transparent")}
                style={{ transitionDelay: on ? wait(500 + i * 90) : "0ms" }}
              >
                {part.text}
              </span>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}
        </p>
      </div>

      {/* what the agent writes back */}
      <div className="ml-6 mt-2.5 rounded-[9px] border border-[var(--line-strong)] bg-white/[0.04] px-3 py-2.5">
        <div className="t-label !text-[9px] !text-[var(--text-1)]">Sales Agent · reply</div>
        <p className="mt-2 text-[12px] leading-[1.5] text-[var(--text-0)]">
          <TypedText text={REPLY} active={on} speed={REPLY_SPEED} delay={REPLY_DELAY_S} />
        </p>
      </div>

      <Fade on={on} delayMs={REPLY_DONE_MS} y={4} className="ml-6 mt-2.5 flex items-center gap-2">
        <Tick on={on} delayMs={REPLY_DONE_MS + 150} />
        <span className="text-[11.5px] text-[var(--text-0)]">Sent 2 min 40 s after enquiry</span>
        <span className="ml-auto text-[10.5px] text-[var(--text-2)]">Thu 10:00 held in the calendar</span>
      </Fade>
    </div>
  );
}
