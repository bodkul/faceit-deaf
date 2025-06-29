"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FaceitIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export default function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-4 flex items-center gap-2 lg:mr-6">
        <FaceitIcon className="size-6 fill-[#ff5500] text-[#ff5500]" />
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm xl:gap-6">
        <Link
          href="/events"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/events" ? "text-foreground" : "text-foreground/80",
          )}
        >
          Events
        </Link>
        <Link
          href="/leaderboard"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/leaderboard"
              ? "text-foreground"
              : "text-foreground/80",
          )}
        >
          Leaderboard
        </Link>
        <Link
          href="/teams"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/teams" ? "text-foreground" : "text-foreground/80",
          )}
        >
          Teams
        </Link>
        <Link
          href="/maps"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/maps" ? "text-foreground" : "text-foreground/80",
          )}
        >
          Maps
        </Link>
      </nav>
    </div>
  );
}
