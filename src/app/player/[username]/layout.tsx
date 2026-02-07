"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { use } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {playerCard}

      <Tabs className="gap-4 lg:col-span-2" value={getTabValue()}>
        <TabsList className="w-full">
          <TabsTrigger value="overview" asChild>
            <Link href={`/player/${username}`}>Overview</Link>
          </TabsTrigger>
          <TabsTrigger value="matches" asChild>
            <Link href={`/player/${username}/matches`}>Matches</Link>
          </TabsTrigger>
          <TabsTrigger value="maps" asChild>
            <Link href={`/player/${username}/maps`}>Maps</Link>
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 space-y-4">{tabs}</div>
      </Tabs>
    </div>
  );
}
