import { useNavigate, useSearch } from "@tanstack/react-router";

import { Pane } from "@/shared/primitives/pane";
import { BaseView } from "@/widgets/base/base-view";
import { BaseMenu } from "@/widgets/base/controls";
import { resolveView } from "@/widgets/base/view";
import { Page } from "@/widgets/page/page";
import { TrackSheet } from "@/widgets/track-details/track-sheet";

import type { ExplorerSearch } from "./search";

const FROM = "/app/$packageId/explorer";

export const ExplorerPage = () => {
  const search = useSearch({ from: FROM });
  const navigate = useNavigate({ from: FROM });

  const change = (patch: ExplorerSearch, replace = false) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace });

  const view = resolveView(search);
  const title = (
    <div className="flex min-w-0 items-center gap-1">
      <Pane.Title>Explorer</Pane.Title>
      <span aria-hidden className="text-muted-foreground/60">
        /
      </span>
      <BaseMenu view={view} onChange={change} />
    </div>
  );

  return (
    <Page title={title} width="full" className="mx-auto max-w-5xl" aside={<TrackSheet />}>
      <BaseView state={search} onChange={change} page selectedId={search.track} />
    </Page>
  );
};
