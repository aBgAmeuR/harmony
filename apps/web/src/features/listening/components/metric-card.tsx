import { ArrowExpandIcon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { useQuery } from "@tanstack/react-query";

import { FormattedMetric } from "@/components/format/formatted-metric";

import { listeningQueries } from "../queries";
import { MetricSparkline } from "./metric-sparkline";

type ListeningMetricQuery = (typeof listeningQueries)[
  | "listeningTime"
  | "totalStreams"
  | "activeDays"
  | "uniqueTracks"];

type MetricCardProps = {
  label: string;
  unit?: string;
  query: ListeningMetricQuery;
};

export const MetricCard = ({ label, unit, query }: MetricCardProps) => {
  const { data } = useQuery(query.queryOptions());

  return (
    <div className="flex flex-col justify-between">
      <div className="flex justify-between px-4 pt-3">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{label}</span>
          <FormattedMetric size="lg" value={data?.value} unit={unit} />
        </div>
        <Button variant="ghost" size="icon" className="-me-1! -mt-1!">
          <Icon icon={ArrowExpandIcon} />
        </Button>
      </div>
      <MetricSparkline trend={data?.trend} />
    </div>
  );
};
