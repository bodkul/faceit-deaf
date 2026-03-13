"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Logo from "@/app/icon.svg";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Ranking", href: "/ranking" },
  { name: "Tournament", href: "/tournament" },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center gap-2">
        <Logo className="size-6" />
        <span className="font-black text-white tracking-tight">
          {siteConfig.name}
          <span className="text-neutral-600">.pro</span>
        </span>
      </Link>
      <nav className="flex items-center gap-1 text-sm">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1.5 font-medium transition-all duration-200",
              isActiveRoute(pathname, item.href)
                ? "bg-neutral-800 text-white"
                : "text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-300",
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
