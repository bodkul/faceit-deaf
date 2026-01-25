"use client";

import { IconMap } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMapPicks } from "@/lib/formatMapPicks";
import { supabaseClient } from "@/lib/supabase";

const chartConfig = {
  count: { label: "Count" },
} satisfies ChartConfig;

function MapChart({
  data,
}: {
  data: Array<{ map: string; count: number }> | undefined;
}) {
  if (!data?.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconMap />
          </EmptyMedia>
          <EmptyTitle>No map data</EmptyTitle>
          <EmptyDescription>
            Map statistics will appear here once matches are played.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ right: 16 }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="map"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
          hide
        />
        <XAxis dataKey="count" type="number" hide />
        <Bar dataKey="count" className="fill-primary" radius={4}>
          <LabelList
            dataKey="map"
            position="insideLeft"
            offset={8}
            className="fill-background"
            fontSize={12}
          />
          <LabelList
            dataKey="count"
            position="right"
            offset={8}
            className="fill-foreground"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function EloMaps() {
  const { data: maps } = useQuery({
    queryKey: ["map-picks-count"],
    queryFn: async () => {
      const { data } = await supabaseClient.rpc("get_map_picks_count");
      return data;
    },
    select: (data) => formatMapPicks(data ?? []),
  });

  return <MapChart data={maps} />;
}

function EventMaps() {
  // TODO: Implement event-based map statistics when data is available
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconMap />
        </EmptyMedia>
        <EmptyTitle>Coming soon</EmptyTitle>
        <EmptyDescription>
          Event map statistics will show map picks and bans from tournaments.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export default function MapsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maps</CardTitle>
        <CardDescription>
          Distribution of maps played in ranked matches and tournaments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="elo">
          <TabsList className="mb-4">
            <TabsTrigger value="elo">ELO Matches</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="elo">
            <EloMaps />
          </TabsContent>

          <TabsContent value="events">
            <EventMaps />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
