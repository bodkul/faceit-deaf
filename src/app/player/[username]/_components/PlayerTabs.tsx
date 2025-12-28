import { ReactNode } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlayerTabsProps {
  children: ReactNode;
}

export function PlayerTabs({ children }: PlayerTabsProps) {
  return (
    <Tabs defaultValue="overview" className="gap-4 lg:col-span-2">
      <TabsList className="w-full">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="matches">Matches</TabsTrigger>
        <TabsTrigger value="maps">Maps</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
