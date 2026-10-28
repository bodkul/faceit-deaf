import { cn } from "cn";

const tones = {
  live: { dot: "bg-live", text: "bg-live/10 text-live ring-live/20" },
  win: { dot: "bg-win", text: "bg-win/10 text-win ring-win/20" },
  warning: {
    dot: "bg-warning",
    text: "bg-warning/10 text-warning ring-warning/20",
  },
  muted: {
    dot: "bg-faint",
    text: "bg-foreground/[0.05] text-muted-foreground ring-foreground/10",
  },
} as const;

export type StatusTone = keyof typeof tones;

/** A tinted pill with a colored dot, e.g. "● Live" or "● Finished". */
export function StatusPill({
  tone,
  pulse = false,
  children,
  className,
}: {
  tone: StatusTone;
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const { dot, text } = tones[tone];

  return (
    <span
      className={cn(
        "inline-flex h-5.5 shrink-0 items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        text,
        className,
      )}
    >
      <span className="relative flex size-1.5">
        {pulse && (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:hidden",
              dot,
            )}
          />
        )}
        <span
          className={cn("relative inline-flex size-1.5 rounded-full", dot)}
        />
      </span>
      {children}
    </span>
  );
}
