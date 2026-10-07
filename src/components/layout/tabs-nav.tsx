"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type TabConfig = {
  value: string;
  label: string;
  path: string;
};

export function TabsNav({
  basePath,
  tabs,
}: {
  basePath: string;
  tabs: readonly TabConfig[];
}) {
  const pathname = usePathname();

  const activeTab = tabs.find(
    (tab) =>
      pathname === `${basePath}${tab.path}` ||
      (tab.path && pathname.startsWith(`${basePath}${tab.path}`)),
  )?.value;

  return (
    <div
      role="tablist"
      className="flex gap-1 rounded-xl border border-neutral-800 bg-neutral-900/50 p-1"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={`${basePath}${tab.path}`}
          role="tab"
          aria-selected={activeTab === tab.value}
          className={[
            "flex-1 rounded-lg px-4 py-2 text-center font-medium text-sm transition-all duration-200",
            activeTab === tab.value
              ? "bg-neutral-800 text-white"
              : "text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-300",
          ].join(" ")}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
