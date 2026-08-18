"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import LogoIcon from "@/app/icon.svg";
import { AuthButton } from "@/components/auth/auth-button";
import { MobileNav } from "@/components/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";

export const navLinks = [
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Events", href: "/events" },
];

export function Header() {
  const scrolled = useScroll(10);
  const { status } = useSession();

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
          animate={status !== "loading" ? { opacity: 1 } : {}}
        >
          <nav className="hidden items-center md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={buttonVariants({
                  variant: "ghost",
                  className: "justify-start",
                })}
              >
                {link.label}
              </Link>
            ))}
            <div className="ms-2 h-6 border-r"></div>
          </nav>
            <AuthButton />
          <MobileNav />
        </motion.div>
      </div>
    </header>
  );
}
