"use client";

import Link from "next/link";

import Logo from "@/app/icon.svg";
import { UserButton } from "@/components/auth/user-button";
import { MobileNav } from "@/components/mobile-nav";
import { PlayerSearch } from "@/components/player-search";
import { Button } from "@/components/ui/button";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";

export const navLinks = [
  {
    label: "Leaderboard",
    href: "/leaderboard",
  },
  {
    label: "Tournament",
    href: "/tournament",
  },
];
function SeparatorVertical() {
  return <div className="hidden h-5 w-px bg-border md:block" />;
}

export function Header() {
  const scrolled = useScroll(10);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-6xl border-transparent border-b md:rounded-md md:border md:transition-all md:ease-out",
        {
          "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-5xl md:shadow":
            scrolled,
        },
      )}
    >
      <nav
        className={cn(
          "flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
          {
            "md:px-2": scrolled,
          },
        )}
      >
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50"
          >
            <Logo className="size-6" />
            <span className="font-black text-white tracking-tight">
              csdeaf
              <span className="text-neutral-600">.pro</span>
            </span>
          </Link>
          <SeparatorVertical />
          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <Button asChild key={link.label} size="sm" variant="ghost">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <PlayerSearch />
          <SeparatorVertical />
          <UserButton />
        </div>
        <MobileNav />
      </nav>
    </header>
  );
}
