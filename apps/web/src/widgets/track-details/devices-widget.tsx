import { useQuery } from "@tanstack/react-query";

import { trackQueries } from "@/entities/track";
import { Empty } from "@/shared/primitives/empty";
import { Grid } from "@/shared/primitives/grid";
import { Section } from "@/shared/primitives/section";
import { Stat } from "@/shared/primitives/stat";
import { usePeriod } from "@/shared/scope";

type DevicesWidgetProps = {
  trackId: number;
};

export const DevicesWidget = ({ trackId }: DevicesWidgetProps) => {
  const { from, to } = usePeriod();
  const { data } = useQuery(trackQueries.devices.queryOptions({ trackId, from, to }));

  const devices = data?.devices ?? [];

  return (
    <Section size="sm">
      <Section.Title>Devices</Section.Title>
      {devices.length > 0 ? (
        <Grid variant="ruled">
          {devices.map((device) => (
            <Stat key={device.label} layout="row">
              <Stat.Label className="text-foreground">{device.label}</Stat.Label>
              <Stat.Value value={device.share} kind="percent" />
            </Stat>
          ))}
        </Grid>
      ) : (
        <Empty variant="framed" className="py-2 text-xs">
          No device data
        </Empty>
      )}
    </Section>
  );
};
