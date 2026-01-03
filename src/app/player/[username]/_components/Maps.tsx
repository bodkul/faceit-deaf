"use client";

import { useQuery } from "@tanstack/react-query";
import { countBy, map, orderBy } from "lodash-es";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { supabaseClient } from "@/lib/supabase";

const chartConfig = {
  map: {
    label: "Map",
    color: "oklch(70.5% 0.213 47.604)",
  },
} satisfies ChartConfig;

export function Maps({ playerId }: { playerId: string }) {
  const { data } = useQuery({
    queryKey: ["player-matches", playerId],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("player_matches")
        .select("map")
        .eq("player_id", playerId)
        .order("finished_at", { ascending: false });
      return data;
    },
  });

  const mapsCount = countBy(data, "map");
  const mapsArray = map(mapsCount, (count, map) => ({ map, count }));
  const maps = orderBy(mapsArray, ["count", "map"], ["desc", "asc"]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maps Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart accessibilityLayer data={maps}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="map"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const short = value.slice(3);
                return short.charAt(0).toUpperCase() + short.slice(1);
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" fill="var(--color-map)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
