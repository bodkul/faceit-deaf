"use client";

import { IconChevronDown } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { FaceitIcon } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const statsSubmenu = [
  { name: "Ranking", href: "/stats/ranking" },
  { name: "Maps", href: "/stats/maps" },
];

const navigation = [
  { name: "Home", href: "/" },
  { name: "Stats", href: "/stats", submenu: statsSubmenu },
  { name: "Events", href: "/events" },
  { name: "Teams", href: "/teams" },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-4 flex items-center gap-2 lg:mr-6">
        <FaceitIcon className="size-6 fill-[#ff5500] text-[#ff5500]" />
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm xl:gap-6">
        {navigation.map((item) =>
          item.submenu ? (
            <DropdownMenu key={item.href}>
              <DropdownMenuTrigger
                className={cn(
                  "flex cursor-pointer items-center gap-1 outline-none transition-colors hover:text-foreground/80",
                  pathname.startsWith(item.href)
                    ? "text-foreground"
                    : "text-foreground/80",
                )}
              >
                {item.name}
                <IconChevronDown className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {item.submenu.map((subitem) => (
                  <DropdownMenuItem key={subitem.href} asChild>
                    <Link
                      href={subitem.href}
                      className={cn(
                        "cursor-pointer",
                        pathname.startsWith(subitem.href) && "bg-accent",
                      )}
                    >
                      {subitem.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname.startsWith(item.href)
                  ? "text-foreground"
                  : "text-foreground/80",
              )}
            >
              {item.name}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
