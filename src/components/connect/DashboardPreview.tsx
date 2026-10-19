import { CONNECT } from "@/content/site";
import { Icon } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";

const { dashboard } = CONNECT;

/** The payoff of connecting the parts: one screen an owner checks each morning. Illustrative numbers. */
export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-lift)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line-soft)] px-5 py-3.5 sm:px-6">
        <span className="flex items-center gap-2 text-[0.85rem] font-semibold text-[var(--ink)]">
          <Mark size={16} />
          {CONNECT.hub.label}
        </span>
        <span className="text-[0.78rem] text-[var(--ink-3)]">Monday, 8:00am</span>
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-[1.15rem] font-semibold tracking-[-0.02em] text-[var(--ink)]">{dashboard.greeting}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {dashboard.tiles.map((t) => (
            <div key={t.label} className="grid grid-cols-[5.75rem_1fr] items-center gap-x-3 rounded-2xl bg-[var(--paper-2)] px-4 py-3 sm:block sm:py-3.5">
              <p className="col-start-2 text-[0.78rem] text-[var(--ink-3)]">{t.label}</p>
              <p className="t-num col-start-1 row-span-2 row-start-1 text-[1.45rem] font-semibold leading-none tracking-[-0.03em] text-[var(--ink)] sm:mt-1 sm:text-[1.6rem]">{t.value}</p>
              <p className="col-start-2 mt-0.5 text-[0.78rem] text-[var(--ink-2)] sm:mt-1.5">{t.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-[rgba(45,74,224,0.22)] bg-[var(--spot-soft)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5 text-[0.92rem] leading-snug text-[var(--ink)]">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--spot)] text-white">
              <Icon name="clock" size={12} strokeWidth={2.2} />
            </span>
            <span>
              <span className="font-semibold">{dashboard.attention.label}: </span>
              {dashboard.attention.text}
            </span>
          </p>
          <span aria-hidden className="shrink-0 self-start rounded-full bg-[var(--ink)] px-3.5 py-1.5 text-[0.8rem] font-medium text-[var(--paper)] sm:self-auto">
            Review and send
          </span>
        </div>
      </div>
    </div>
  );
}
