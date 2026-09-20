import type { ReactNode } from "react";

/**
 * Eight generic tool glyphs, drawn on a 24-unit grid centred on the origin.
 * Monochrome line work only: these stand for kinds of software, never for a product.
 */

const GLYPHS: Record<string, ReactNode> = {
  Email: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M4 7.5 12 13.5 20 7.5" />
    </>
  ),
  CRM: (
    <>
      <circle cx="12" cy="9" r="3.2" />
      <path d="M5.5 19.5c0-3.6 2.9-5.6 6.5-5.6s6.5 2 6.5 5.6" />
    </>
  ),
  Spreadsheets: (
    <>
      <rect x="4" y="4.5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M4 14.5h16M10 4.5v15" />
    </>
  ),
  Documents: (
    <>
      <path d="M7 3.5h7l4 4v13H7z" />
      <path d="M14 3.5v4h4M9.8 12.5h5.4M9.8 16h5.4" />
    </>
  ),
  Chat: <path d="M6.5 5h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H11l-4 3.5V16h-.5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />,
  Accounting: (
    <>
      <rect x="5.5" y="3.5" width="13" height="17" rx="2" />
      <path d="M8.5 7.5h7M8.7 12h.01M12 12h.01M15.3 12h.01M8.7 16h.01M12 16h.01M15.3 16h.01" />
    </>
  ),
  Calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  Support: (
    <>
      <path d="M5.5 14v-2a6.5 6.5 0 0 1 13 0v2" />
      <rect x="4" y="13.5" width="3.6" height="5.5" rx="1.3" />
      <rect x="16.4" y="13.5" width="3.6" height="5.5" rx="1.3" />
      <path d="M18.2 19c0 1.6-2 2.3-4.4 2.3" />
    </>
  ),
};

export function ToolGlyph({ name }: { name: string }) {
  return (
    <g transform="translate(-12 -12)" fill="none" stroke="var(--text-1)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {GLYPHS[name] ?? <circle cx="12" cy="12" r="6" />}
    </g>
  );
}
