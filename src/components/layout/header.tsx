"use client";

import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

import LogoIcon from "@/app/icon.svg";
import { MobileNav } from "@/components/layout/mobile-nav";
import { isNavLinkActive, navLinks } from "@/config/nav";
import { AuthButton } from "@/features/auth/components/auth-button";
import { useEventsCount } from "@/features/events/hooks/use-events-count";
import { PlayerSearch } from "@/features/player/components/player-search";
import { useScroll } from "@/hooks/use-scroll";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-foreground/5",
        className,
      )}
    >
      <LogoIcon className="size-6" />
      <span className="font-black text-[15px] tracking-tight">csdeaf</span>
    </Link>
  );
}

export function NavCount({ count }: { count: number | null | undefined }) {
  if (!count) return null;
  return (
    <span className="ml-1.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 font-mono font-semibold text-[10px] text-primary-foreground tabular-nums">
      {count}
    </span>
  );
}

export function Header() {
  const scrolled = useScroll(8);
  const pathname = usePathname();
  const { data: eventsCount } = useEventsCount();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-200",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md"
          : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isNavLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-8 items-center rounded-md px-3 font-medium text-sm transition-colors",
                  active
                    ? "bg-foreground/[0.07] text-foreground"
                    : "text-muted-foreground hover:bg-foreground/4 hover:text-foreground",
                )}
              >
                {link.label}
                {link.href === "/events" && <NavCount count={eventsCount} />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <PlayerSearch className="hidden w-56 lg:block" />
          <AuthButton />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
