"use client";

import { countBy, map, orderBy } from "lodash-es";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { usePlayerMaps } from "@/hooks/usePlayerMaps";

const chartConfig = {
  map: {
    label: "Map",
    color: "oklch(70.5% 0.213 47.604)",
  },
} satisfies ChartConfig;

export function Maps({ playerId }: { playerId: string }) {
  const { data } = usePlayerMaps(playerId);

  const mapsCount = countBy(data, "map");
  const mapsArray = map(mapsCount, (count, map) => ({ map, count }));
  const maps = orderBy(mapsArray, ["count", "map"], ["desc", "asc"]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maps Statistics</CardTitle>
        <CardDescription>
          Distribution of maps played by this player
        </CardDescription>
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
