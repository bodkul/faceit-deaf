import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlayerTabsProps {
  children: React.ReactNode;
}

export function PlayerTabs({ children }: PlayerTabsProps) {
  return (
    <Tabs className="gap-4 lg:col-span-2" defaultValue="overview">
      <TabsList className="w-full">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="matches">Matches</TabsTrigger>
        <TabsTrigger value="maps">Maps</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
