import { Link, useSearch } from "@tanstack/react-router";

import { Pane } from "@/shared/primitives/pane";
import { Discoveries, FROM } from "@/widgets/discoveries/discoveries";
import { listTitles } from "@/widgets/discoveries/list";
import { SeeAll } from "@/widgets/discoveries/see-all";
import { Page } from "@/widgets/page/page";

export const DiscoveriesPage = () => {
  const { list } = useSearch({ from: FROM });

  if (!list) {
    return (
      <Page title="Discoveries" width="full">
        <Discoveries />
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
        Discoveries
      </Link>
      <span aria-hidden className="text-muted-foreground/60">
        /
      </span>
      <Pane.Title className="truncate">{listTitles[list]}</Pane.Title>
    </div>
  );

  return (
    <Page title={title} width="full">
      <SeeAll list={list} />
    </Page>
  );
};
