import { cn } from "cn";

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
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>{children}</div>
  );
}

export function PageHeaderTitle({ children, className }: PageHeaderProps) {
  return (
    <h1
      className={cn(
        "font-heading scroll-m-20 text-2xl font-bold tracking-tight sm:text-3xl",
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
    <p className={cn("max-w-2xl text-muted-foreground", className)}>
      {children}
    </p>
  );
}

export function PageHeaderActions({ children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>{children}</div>
  );
}
