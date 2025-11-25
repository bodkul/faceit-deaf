"use client";

import _ from "lodash";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
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
  const maps = _(data)
    .countBy("map")
    .map((count, map) => ({ map, count }))
    .orderBy(["count", "map"], ["desc", "asc"])
    .value();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maps Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart
            accessibilityLayer
            data={maps}
            margin={{
              top: 20,
            }}
          >
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
