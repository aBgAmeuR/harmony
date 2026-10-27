import { useQuery } from "@tanstack/react-query";
import { Suspense, lazy } from "react";

import { interactionQueries } from "@/entities/interaction";
import { usePeriod } from "@/shared/scope";

const InteractionsTable = lazy(() =>
  import("@/entities/interaction/ui/interactions-table").then((m) => ({
    default: m.InteractionsTable,
  })),
);

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
      <Suspense>
        <InteractionsTable interactions={data ?? []} enabled={enabled} />
      </Suspense>
    </div>
  );
};
