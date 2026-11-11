import { useQuery } from "@tanstack/react-query";
import { Suspense, lazy } from "react";

import { trackQueries } from "@/entities/track";
import { usePeriod } from "@/shared/scope";

const InteractionsTable = lazy(() =>
  import("./interactions-table").then((m) => ({
    default: m.InteractionsTable,
  })),
);

type InteractionsProps = {
  trackId: number;
  enabled?: boolean;
};

export const Interactions = ({ trackId, enabled }: InteractionsProps) => {
  const range = usePeriod();
  const { data } = useQuery({
    ...trackQueries.interactions({ trackId, range }),
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
