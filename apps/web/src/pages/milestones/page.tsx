import { Link, useSearch } from "@tanstack/react-router";

import { Pane } from "@/shared/primitives/pane";
import { FROM, Milestones, usePeriodLabel } from "@/widgets/milestones/milestones";
import { SeeAll } from "@/widgets/milestones/see-all";
import { Page } from "@/widgets/page/page";

export const MilestonesPage = () => {
  const { list } = useSearch({ from: FROM });
  const label = usePeriodLabel();

  if (!list) {
    return (
      <Page title="Milestones" width="full">
        <Milestones />
      </Page>
    );
  }

  const title = (
    <div className="flex min-w-0 items-center gap-1">
      <Link
        from={FROM}
        to="."
        search={({ list: _list, ...prev }) => prev}
        className="font-semibold tracking-tight text-muted-foreground underline-offset-3 transition-colors hover:text-foreground hover:underline"
      >
        Milestones
      </Link>
      <span aria-hidden className="text-muted-foreground/60">
        /
      </span>
      <Pane.Title className="truncate">{label}</Pane.Title>
    </div>
  );

  return (
    <Page title={title} width="full">
      <SeeAll />
    </Page>
  );
};
