import type { SVGProps } from "react";

/**
 * One line-icon family: 24px grid, 1.6 stroke, round joins. Icons are decoration; the text next to
 * them always carries the meaning, so every icon is aria-hidden.
 */

export type IconName =
  | "mail"
  | "phone"
  | "chat"
  | "invoice"
  | "calendar"
  | "sheet"
  | "box"
  | "report"
  | "file"
  | "arrow"
  | "arrowDown"
  | "check"
  | "person"
  | "copies"
  | "inbox"
  | "month"
  | "rules"
  | "ask"
  | "tools"
  | "log"
  | "plus"
  | "clock"
  | "users"
  | "bank"
  | "list"
  | "cart"
  | "wallet"
  | "menu"
  | "close";

const PATHS: Record<IconName, React.ReactNode> = {
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
    </>
  ),
  phone: (
    <path d="M6.6 3.8h2.6l1.4 4-1.9 1.3a10.5 10.5 0 0 0 6.2 6.2l1.3-1.9 4 1.4v2.6a2 2 0 0 1-2.2 2A16.2 16.2 0 0 1 4.6 6a2 2 0 0 1 2-2.2Z" />
  ),
  chat: (
    <>
      <path d="M20 12.2c0 3.9-3.6 7-8 7a9 9 0 0 1-3.2-.6L4.5 20l1.2-3.4A6.6 6.6 0 0 1 4 12.2c0-3.9 3.6-7 8-7s8 3.1 8 7Z" />
      <path d="M8.5 12.2h.01M12 12.2h.01M15.5 12.2h.01" strokeWidth="2.2" />
    </>
  ),
  invoice: (
    <>
      <path d="M6 3.5h12v17l-2.4-1.5-2.4 1.5-2.4-1.5-2.4 1.5L6 19V3.5Z" />
      <path d="M9 8h6M9 11.5h6M9 15h3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <path d="M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 17h.01M12 17h.01" strokeWidth="2.2" />
    </>
  ),
  sheet: (
    <>
      <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
      <path d="M3.5 9h17M3.5 14.5h17M9.5 9v11" />
    </>
  ),
  box: (
    <>
      <path d="m12 3 8 4.2v9.6L12 21l-8-4.2V7.2L12 3Z" />
      <path d="m4.3 7.3 7.7 4.2 7.7-4.2M12 11.5V21" />
    </>
  ),
  report: (
    <>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 16v-4M12 16V8M16 16v-6.5" />
    </>
  ),
  file: (
    <>
      <path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-5.5-5.5Z" />
      <path d="M13.5 3.5V9H19M8.5 13h7M8.5 16.5h5" />
    </>
  ),
  arrow: <path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5" />,
  arrowDown: <path d="M12 5v14M6.5 13.5 12 19l5.5-5.5" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  person: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
  copies: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2.2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  inbox: (
    <>
      <path d="M3.5 13.5 6 5.5h12l2.5 8V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-4.5Z" />
      <path d="M3.5 13.5h4.8l1.2 2.5h5l1.2-2.5h4.8" />
    </>
  ),
  month: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4M12 12.5v3M12 18.2h.01" />
    </>
  ),
  rules: (
    <>
      <path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11" />
      <path d="m3.8 6.3 1.1 1.1 2-2.2M3.8 11.8l1.1 1.1 2-2.2M3.8 17.3l1.1 1.1 2-2.2" />
    </>
  ),
  ask: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1.1.9-1.1 1.6v.4M12 16.8h.01" />
    </>
  ),
  tools: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />
    </>
  ),
  log: (
    <>
      <path d="M6 3.5h9l4 4v13H6v-17Z" />
      <path d="M9 11h7M9 14.5h7M9 18h4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3 19.5a6 6 0 0 1 12 0M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14a6 6 0 0 1 3.5 5.5" />
    </>
  ),
  bank: (
    <>
      <path d="M3.5 9.5 12 4.5l8.5 5H3.5Z" />
      <path d="M5.5 10v7M10 10v7M14 10v7M18.5 10v7M3.5 19.5h17" />
    </>
  ),
  list: <path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />,
  cart: (
    <>
      <path d="M3.5 4.5h2.2l2 11h10.8l1.8-7.5H7" />
      <circle cx="9.5" cy="19" r="1.3" />
      <circle cx="17" cy="19" r="1.3" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
      <rect x="4" y="8" width="16.5" height="11.5" rx="2.5" />
      <path d="M16 14h.01" strokeWidth="2.4" />
    </>
  ),
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
};

export function Icon({ name, size = 20, strokeWidth = 1.6, ...rest }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
