import { useQuery } from "@tanstack/react-query";

import { trackQueries } from "@/entities/track";
import { Delta } from "@/shared/primitives/delta";
import { Grid } from "@/shared/primitives/grid";
import { Section } from "@/shared/primitives/section";
import { Stat } from "@/shared/primitives/stat";
import { usePeriod } from "@/shared/scope";

type VsAverageWidgetProps = {
  trackId: number;
};

export const VsAverageWidget = ({ trackId }: VsAverageWidgetProps) => {
  const { from, to } = usePeriod();
  const { data } = useQuery(trackQueries.vsAverage.queryOptions({ trackId, from, to }));

  const rows = data?.rows ?? [
    { label: "Streams", multiplier: 0 },
    { label: "Completion", multiplier: 0 },
    { label: "Replay rate", multiplier: 0 },
  ];

  return (
    <Section size="sm">
      <Section.Title>Vs. average</Section.Title>
      <Grid variant="ruled">
        {rows.map((row) => (
          <Stat key={row.label} layout="row">
            <Stat.Label>{row.label}</Stat.Label>
            <Delta kind="ratio" value={data ? row.multiplier : null} />
          </Stat>
        ))}
      </Grid>
    </Section>
  );
};
