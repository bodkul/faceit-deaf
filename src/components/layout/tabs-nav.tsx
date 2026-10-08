"use client";

import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

type TabConfig = {
  value: string;
  label: string;
  path: string;
};

/** Route-based tabs: an underlined strip that scrolls on narrow screens. */
export function TabsNav({
  basePath,
  tabs,
}: {
  basePath: string;
  tabs: readonly TabConfig[];
}) {
  const pathname = usePathname();

  // Longest matching path wins, so the "" (overview) tab never swallows the
  // others.
  const activeTab = [...tabs]
    .sort((a, b) => b.path.length - a.path.length)
    .find(
      (tab) =>
        pathname === `${basePath}${tab.path}` ||
        (tab.path && pathname.startsWith(`${basePath}${tab.path}/`)),
    )?.value;

  return (
    <nav className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-1 border-border border-b">
        {tabs.map((tab) => {
          const active = activeTab === tab.value;
          return (
            <Link
              key={tab.value}
              href={`${basePath}${tab.path}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative -mb-px border-b-2 px-3 py-2.5 font-medium text-sm transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
