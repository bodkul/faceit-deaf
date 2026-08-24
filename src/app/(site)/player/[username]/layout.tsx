"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { use } from "react";

export default function PlayerLayout({
  playerCard,
  tabs,
  params,
}: LayoutProps<"/player/[username]">) {
  const { username } = use(params);
  const pathname = usePathname();

  const getTabValue = () => {
    if (pathname === `/player/${username}`) return "overview";
    if (pathname.startsWith(`/player/${username}/matches`)) return "matches";
    if (pathname.startsWith(`/player/${username}/maps`)) return "maps";
    return "";
  };

  const tabValue = getTabValue();

  const tabs_nav = [
    { value: "overview", label: "Overview", href: `/player/${username}` },
    { value: "matches", label: "Matches", href: `/player/${username}/matches` },
    { value: "maps", label: "Maps", href: `/player/${username}/maps` },
  ];

  return (
    <div className="flex flex-col gap-4">
      {playerCard}

      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="flex gap-1 rounded-xl border border-neutral-800 bg-neutral-900/50 p-1">
          {tabs_nav.map((tab) => (
            <Link
              key={tab.value}
              href={tab.href}
              className={[
                "flex-1 rounded-lg px-4 py-2 text-center font-medium text-sm transition-all duration-200",
                tabValue === tab.value
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-300",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-4">{tabs}</div>
      </div>
    </div>
  );
}
