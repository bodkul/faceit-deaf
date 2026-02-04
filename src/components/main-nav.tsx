"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FaceitIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Ranking", href: "/ranking" },
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
        {navigation.map((item) => (
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
        ))}
      </nav>
    </div>
  );
}
