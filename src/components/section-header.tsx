import { IconArrowRight } from "@tabler/icons-react";
import { cn } from "cn";
import Link from "next/link";

export function SectionHeader({
  title,
  description,
  href,
  linkLabel = "View all",
  children,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  linkLabel?: string;
  /** Extra content next to the title, e.g. a count badge. */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          {children}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {linkLabel}
          <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
