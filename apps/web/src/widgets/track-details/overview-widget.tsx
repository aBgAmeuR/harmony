import { useQuery } from "@tanstack/react-query";

import { trackQueries } from "@/entities/track";
import { measure } from "@/shared/lib/measure";
import { Grid } from "@/shared/primitives/grid";
import { Section } from "@/shared/primitives/section";
import { Stat } from "@/shared/primitives/stat";
import { usePeriod } from "@/shared/scope";

type OverviewWidgetProps = {
  trackId: number;
};

export const OverviewWidget = ({ trackId }: OverviewWidgetProps) => {
  const { from, to } = usePeriod();
  const { data } = useQuery(trackQueries.overview.queryOptions({ trackId, from, to }));

  const stats = [
    { ...measure.streams, value: data?.streams },
    { ...measure.playtime, value: data?.timeListenedMin },
    { ...measure.completion, value: data?.avgCompletion },
    { ...measure.skipRate, value: data?.skipRate },
  ];

  return (
    <Section size="sm">
      <Section.Title>Overview</Section.Title>
      <Grid cols={2} variant="ruled">
        {stats.map((stat) => (
          <Stat key={stat.label}>
            <Stat.Label>{stat.label}</Stat.Label>
            <Stat.Value value={stat.value} kind={stat.kind} size="md" />
          </Stat>
        ))}
      </Grid>
    </Section>
  );
};
