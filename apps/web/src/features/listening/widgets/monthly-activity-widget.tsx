import { Bar, BarChart, ChartTooltip, Grid, XAxis } from "@harmony/charts/v2";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";

import { query } from "@/lib/query";
import { useArtistStore } from "@/lib/stores/artist-store";
import { useInstantRangeQuery } from "@/lib/stores/date-range-store";

export function MonthlyActivityWidget() {
  const artistId = useArtistStore((s) => s.artist?.id);
  const { from, to } = useInstantRangeQuery();
  const { data = [] } = useQuery(
    query.listeningHabits.monthlyActivity.queryOptions({ artistId, from, to }),
  );

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Monthly Activity</CardTitle>
        <CardAction>
          <div className="flex items-center gap-2">
            <div className="size-2 shrink-0 rounded-full bg-chart-2" />
            <span className="text-xs text-legend-foreground">Time Listening</span>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <BarChart className="aspect-[4/1]" data={data} xDataKey="name">
          <Bar dataKey="value" fill="var(--chart-2)" />
          <Grid />
          <XAxis />
          <ChartTooltip suffix="min" />
        </BarChart>
      </CardContent>
    </Card>
  );
}
