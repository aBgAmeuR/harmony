import { ArrowExpandIcon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Card } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";

import type { Kind } from "@/utils/format";

import { Spark } from "@/shared/primitives/spark";
import { Stat } from "@/shared/primitives/stat";
import { useScope } from "@/shared/scope";

import { listeningQueries } from "../api";

type ListeningMetricQuery = (typeof listeningQueries)[
  | "listeningTime"
  | "totalStreams"
  | "activeDays"
  | "uniqueTracks"];

type MetricCardProps = {
  label: string;
  kind?: Kind;
  query: ListeningMetricQuery;
};

export const MetricCard = ({ label, kind, query }: MetricCardProps) => {
  const filter = useScope();
  const { data } = useQuery(query.queryOptions(filter));

  return (
    <Card size="xs">
      <Stat>
        <Stat.Label>{label}</Stat.Label>
        <Stat.Value value={data?.value} kind={kind} />
        <Stat.Aside>
          <Button variant="ghost" size="icon" className="-me-1 -mt-1">
            <Icon icon={ArrowExpandIcon} />
          </Button>
        </Stat.Aside>
      </Stat>
      <Spark data={(data?.trend ?? []).map((point) => point.value)} className="aspect-6/1 h-auto" />
    </Card>
  );
};
