import { useNavigate, useSearch } from "@tanstack/react-router";

import { Pane } from "@/shared/primitives/pane";
import { BaseView } from "@/widgets/base/base-view";
import { BaseMenu } from "@/widgets/base/controls";
import { resolveView, switchBase } from "@/widgets/base/view";
import { Page } from "@/widgets/page/page";
import { TrackSheet } from "@/widgets/track-details/track-sheet";

import type { ExplorerSearch } from "./search";

const FROM = "/app/$packageId/explorer";

// Every base of the package, picked next to the title, with its view kept in the URL.
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
      <BaseMenu view={view} onBase={(base) => void change(switchBase(view, base))} />
    </div>
  );

  return (
    <Page title={title} width="full" className="mx-auto max-w-5xl" aside={<TrackSheet />}>
      <BaseView state={search} onChange={change} page selectedId={search.track} />
    </Page>
  );
};
