import { useQuery } from "@tanstack/react-query";

import { InteractionsTable } from "@/entities/interaction";
import { interactionQueries } from "@/entities/interaction";
import { usePeriod } from "@/shared/scope";

type InteractionsProps = {
  trackId: number;
  enabled?: boolean;
};

export const Interactions = ({ trackId, enabled }: InteractionsProps) => {
  const { from, to } = usePeriod();
  const { data } = useQuery({
    ...interactionQueries.track.queryOptions({ trackId, from, to }),
    enabled,
  });

  return (
    <div className="h-full min-h-0">
      <InteractionsTable interactions={data ?? []} enabled={enabled} />
    </div>
  );
};
