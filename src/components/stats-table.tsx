import { cn } from "cn";

/**
 * Dense numeric table for player stats. Scrolls horizontally on narrow
 * screens while the first (`sticky`) column stays in place.
 */
export function StatsTable({
  className,
  minWidth = 560,
  fixed = false,
  children,
}: {
  className?: string;
  /** Width below which the table scrolls instead of squeezing columns. */
  minWidth?: number;
  /**
   * Fixed layout: column widths come from the header, so stacked tables
   * (one per team) line up.
   */
  fixed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-x-auto",
        // Fade on the right hints that the table scrolls on small screens.
        "mask-[linear-gradient(to_right,black_85%,transparent)] sm:mask-none",
        className,
      )}
    >
      <table
        className={cn("w-full text-sm", fixed && "table-fixed")}
        style={{ minWidth }}
      >
        {children}
      </table>
    </div>
  );
}

const stickyCell =
  "sticky left-0 z-10 bg-card shadow-[1px_0_0_var(--border)] sm:shadow-none";

export function StatsTh({
  className,
  sticky,
  align = "right",
  children,
  ...props
}: React.ComponentProps<"th"> & {
  sticky?: boolean;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      scope="col"
      className={cn(
        "h-9 px-3 font-mono text-[11px] font-medium tracking-wider whitespace-nowrap text-faint uppercase first:pl-4 last:pr-4",
        align === "left" && "text-left",
        align === "right" && "text-right",
        align === "center" && "text-center",
        sticky && stickyCell,
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export type CellTone = "win" | "loss" | "warning" | "strong" | "muted";

export const cellToneClass: Record<CellTone, string> = {
  win: "text-win",
  loss: "text-loss",
  warning: "text-warning",
  strong: "font-semibold text-foreground",
  muted: "text-muted-foreground",
};

export function StatsTd({
  className,
  sticky,
  align = "right",
  tone,
  numeric = true,
  children,
  ...props
}: React.ComponentProps<"td"> & {
  sticky?: boolean;
  align?: "left" | "right" | "center";
  tone?: CellTone | null;
  numeric?: boolean;
}) {
  return (
    <td
      className={cn(
        "h-11 px-3 whitespace-nowrap first:pl-4 last:pr-4",
        numeric && "font-mono tabular-nums",
        align === "left" && "text-left",
        align === "right" && "text-right",
        align === "center" && "text-center",
        tone ? cellToneClass[tone] : numeric && "text-foreground/85",
        sticky && stickyCell,
        className,
      )}
      {...props}
    >
      {children ?? <span className="text-faint">—</span>}
    </td>
  );
}

/** Tone for a signed difference: positive is good, negative is bad. */
export function diffTone(value: number | null | undefined): CellTone | null {
  if (value == null || value === 0) return null;
  return value > 0 ? "win" : "loss";
}

/** Tone for a ratio around 1.0 (K/D, rating). */
export function ratioTone(
  value: number | null | undefined,
  { good = 1.1, bad = 0.9 } = {},
): CellTone | null {
  if (value == null) return null;
  if (value >= good) return "win";
  if (value < bad) return "loss";
  return null;
}
