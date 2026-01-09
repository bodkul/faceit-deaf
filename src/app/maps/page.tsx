"use client";

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
import { formatMapPicks } from "@/lib/formatMapPicks";
import { supabaseClient } from "@/lib/supabase";

const chartConfig = {
  count: { label: "Count" },
} satisfies ChartConfig;

export default function Page() {
  const { data: maps } = useQuery({
    queryKey: ["map-picks-count"],
    queryFn: async () => {
      const { data } = await supabaseClient.rpc("get_map_picks_count");
      return data;
    },
    select: (data) => formatMapPicks(data ?? []),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maps</CardTitle>
        <CardDescription>Distribution of maps played</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={maps}
            layout="vertical"
            margin={{ right: 16 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              axisLine={false}
              dataKey="map"
              hide
              tickFormatter={(value) => value.slice(0, 3)}
              tickLine={false}
              tickMargin={10}
              type="category"
            />
            <XAxis dataKey="count" hide type="number" />
            <Bar className="fill-orange-500" dataKey="count" radius={4}>
              <LabelList
                className="fill-background"
                dataKey="map"
                fontSize={12}
                offset={8}
                position="insideLeft"
              />
              <LabelList
                className="fill-foreground"
                dataKey="count"
                fontSize={12}
                offset={8}
                position="right"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
