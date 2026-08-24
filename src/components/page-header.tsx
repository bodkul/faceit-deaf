import { cn } from "@/lib/utils";

type PageHeaderProps = { children: React.ReactNode; className?: string };

export function PageHeader({ children, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeaderHeading({ children, className }: PageHeaderProps) {
  return <div className={cn("flex flex-col gap-2", className)}>{children}</div>;
}

export function PageHeaderTitle({ children, className }: PageHeaderProps) {
  return (
    <h1
      className={cn(
        "scroll-m-20 font-bold font-heading text-3xl xl:text-4xl",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function PageHeaderDescription({
  children,
  className,
}: PageHeaderProps) {
  return (
    <p className={cn("text-muted-foreground sm:text-lg", className)}>
      {children}
    </p>
  );
}

export function PageHeaderActions({ children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>{children}</div>
  );
}
