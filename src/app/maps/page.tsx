"use client";

import { useQuery } from "@supabase-cache-helpers/postgrest-swr";
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
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type CustomTooltipProps,
} from "@/components/ui/chart";
import { formatMapPicks } from "@/lib/formatMapPicks";
import { supabase } from "@/lib/supabase";

const chartConfig = {
  map: { color: "var(--chart-1)" },
  label: { color: "var(--background)" },
  count: { label: "Count" },
} satisfies ChartConfig;

export default function Page() {
  const { data } = useQuery(supabase.rpc("get_map_picks_count"));
  const maps = formatMapPicks(data ?? undefined);

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
              dataKey="map"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={(props: CustomTooltipProps) => (
                <ChartTooltipContent {...props} hideIndicator hideLabel />
              )}
            />
            <Bar dataKey="count" fill="var(--color-map)" radius={4}>
              <LabelList
                dataKey="map"
                position="insideLeft"
                offset={8}
                className="fill-(--color-label)"
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
      </CardContent>
    </Card>
  );
}
