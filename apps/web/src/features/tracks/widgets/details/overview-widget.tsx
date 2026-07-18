import { useQuery } from "@tanstack/react-query";

import { FormattedMetric } from "@/components/format/formatted-metric";
import { query } from "@/lib/query";
import { useInstantRangeQuery } from "@/lib/stores/date-range-store";

type OverviewWidgetProps = {
  trackId: number;
};

export const OverviewWidget = ({ trackId }: OverviewWidgetProps) => {
  const { from, to } = useInstantRangeQuery();
  const { data } = useQuery(query.tracks.overview.queryOptions({ trackId, from, to }));

  return (
    <section className="flex flex-col gap-1.5">
      <p className="text-xs font-normal text-muted-foreground">Overview</p>
      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-card [&>*]:border-border [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(odd)]:border-r">
        <StatCell label="Total streams" value={data?.streams} />
        <StatCell label="Time listened" value={data?.timeListenedMin} unit="min" />
        <StatCell label="Avg completion" value={data?.avgCompletion} unit="%" />
        <StatCell label="Skip rate" value={data?.skipRate} unit="%" />
      </div>
    </section>
  );
};

type StatCellProps = {
  label: string;
  value?: number;
  unit?: string;
};

const StatCell = ({ label, value, unit }: StatCellProps) => {
  return (
    <div className="flex flex-col px-2.5 py-1.5">
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      <FormattedMetric size="md" value={value} unit={unit} />
    </div>
  );
};
