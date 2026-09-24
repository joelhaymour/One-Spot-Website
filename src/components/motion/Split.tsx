import type { CSSProperties, ElementType } from "react";
import { cn } from "@/lib/cn";

interface SplitProps {
  lines: readonly string[];
  /** Line index set in italic with the spot color. Defaults to the last line when there are two or more. */
  accent?: number | null;
  as?: ElementType;
  className?: string;
  /** Seconds before the first word rises. */
  delay?: number;
  id?: string;
}

/**
 * A headline whose words rise out of a mask as it enters. Real text in the server HTML, readable with
 * no JS; the Reveals observer adds data-shown and CSS staggers each word by its --i.
 */
export function Split({ lines, accent, as: Tag = "h2", className, delay = 0, id }: SplitProps) {
  const accentLine = accent === undefined ? (lines.length > 1 ? lines.length - 1 : null) : accent;
  let i = 0;

  return (
    <Tag id={id} data-split="" className={className} style={{ "--split-delay": `${delay}s` } as CSSProperties}>
      {lines.map((line, li) => {
        const words = line.split(" ");
        const content = words.map((word, wi) => (
          <span key={wi}>
            <span className="split-word">
              <span style={{ "--i": i++ } as CSSProperties}>{word}</span>
            </span>
            {wi < words.length - 1 ? " " : null}
          </span>
        ));
        return (
          <span key={li} className={cn("split-line")}>
            {li === accentLine ? <em>{content}</em> : content}
            {li < lines.length - 1 ? " " : null}
          </span>
        );
      })}
    </Tag>
  );
}
