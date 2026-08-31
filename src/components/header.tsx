"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import LogoIcon from "@/app/icon.svg";
import { AuthButton } from "@/components/auth/auth-button";
import { MobileNav } from "@/components/mobile-nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useEventsCount } from "@/hooks/use-events-count";
import { useScroll } from "@/hooks/use-scroll";
import { navLinks } from "@/lib/nav-links";
import { cn } from "@/lib/utils";

export function Header() {
  const scrolled = useScroll(10);
  const { status } = useSession();

  const { data: eventsCount, isSuccess: isEventsCountLoaded } =
    useEventsCount();

  const isHeaderReady = status !== "loading" && isEventsCountLoaded;

  const badgeCountByHref: Partial<Record<string, number | null>> = {
    "/events": eventsCount,
  };

  return (
    <header
      className={cn("sticky top-0 z-50 w-full border-transparent border-b", {
        "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50":
          scrolled,
      })}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
        <Link
          className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50"
          href="/"
        >
          <LogoIcon className="size-6" />
          <span className="font-black">
            csdeaf
            <span className="text-neutral-600">.pro</span>
          </span>
        </Link>
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={isHeaderReady ? { opacity: 1 } : {}}
        >
          <nav className="hidden items-center md:flex">
            {navLinks.map((link) => {
              const badgeCount = badgeCountByHref[link.href];

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={buttonVariants({
                    variant: "ghost",
                    className: "justify-start",
                  })}
                >
                  {link.label}
                  {!!badgeCount && (
                    <Badge variant="destructive">{badgeCount}</Badge>
                  )}
                </Link>
              );
            })}
            <div className="ms-2 h-6 border-r"></div>
          </nav>
          <AuthButton />
          <MobileNav />
        </motion.div>
      </div>
    </header>
  );
}
