import { useQuery } from "@tanstack/react-query";

import { InteractionsTable } from "@/features/interactions/components/interactions-table";
import { query } from "@/lib/query";
import { useInstantRangeQuery } from "@/lib/stores/date-range-store";

type InteractionsProps = {
  trackId: number;
  enabled?: boolean;
};

export const Interactions = ({ trackId, enabled }: InteractionsProps) => {
  const { from, to } = useInstantRangeQuery();
  const { data } = useQuery(query.interactions.track.queryOptions({ trackId, from, to }));

  return (
    <div className="h-full min-h-0">
      <InteractionsTable interactions={data ?? []} enabled={enabled} />
    </div>
  );
};
