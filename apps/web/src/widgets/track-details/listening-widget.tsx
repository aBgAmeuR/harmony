import { Bar, BarChart, ChartTooltip, Grid as ChartGrid, XAxis } from "@harmony/charts/v2";
import { useQuery } from "@tanstack/react-query";

import type { ListeningDayPart } from "@/data/tracks/listening";

import { trackQueries } from "@/entities/track";
import { Grid } from "@/shared/primitives/grid";
import { Meter } from "@/shared/primitives/meter";
import { Section } from "@/shared/primitives/section";
import { usePeriod } from "@/shared/scope";
import { format } from "@/utils/format";

type ListeningWidgetProps = {
  trackId: number;
};

export const ListeningWidget = ({ trackId }: ListeningWidgetProps) => {
  const { from, to } = usePeriod();
  const { data } = useQuery(trackQueries.listening.queryOptions({ trackId, from, to }));

  const monthly = data?.monthly ?? [];
  const weekly = data?.weekly ?? [];
  const dayParts = data?.dayParts ?? [];
  const peakDayPart = dayParts.reduce<ListeningDayPart | null>(
    (peak, part) => (!peak || part.share > peak.share ? part : peak),
    null,
  );

  return (
    <Section size="sm">
      <Section.Title>Listening</Section.Title>
      <Grid variant="ruled">
        <div className="px-2.5 pt-4 pb-0">
          <BarChart className="aspect-[5/2]" data={monthly} xDataKey="name">
            <Bar dataKey="value" fill="var(--chart-2)" />
            <ChartGrid />
            <XAxis />
            <ChartTooltip suffix="min" />
          </BarChart>
        </div>

        <div className="px-2.5 pt-2.5 pb-0">
          <p className="text-xs font-normal text-muted-foreground">Weekly</p>
          <BarChart className="aspect-[5/1]" data={weekly} xDataKey="name">
            <Bar dataKey="value" fill="var(--chart-2)" />
            <ChartGrid />
            <XAxis />
            <ChartTooltip />
          </BarChart>
        </div>

        <div className="flex flex-col gap-2 px-2.5 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-normal text-muted-foreground">Time of day</p>
            {peakDayPart && peakDayPart.share > 0 ? (
              <span className="text-xs font-medium">
                {format.as(peakDayPart.share, "percent")} {peakDayPart.label}
              </span>
            ) : null}
          </div>
          <Meter size="lg">
            {dayParts.map((part, index) => (
              <Meter.Seg
                key={part.key}
                value={part.share}
                label={`${part.label} · ${format.as(part.share, "percent")}`}
                style={{ opacity: 1 - index * 0.18 }}
              />
            ))}
          </Meter>
        </div>
      </Grid>
    </Section>
  );
};
