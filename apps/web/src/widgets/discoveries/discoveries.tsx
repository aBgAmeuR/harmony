import type { ReactNode } from "react";

import { ArrowRight01Icon, Icon } from "@harmony/icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { format } from "@/shared/lib/format";
import { Band } from "@/shared/primitives/band";
import { Empty } from "@/shared/primitives/empty";
import { usePeriod } from "@/shared/scope";

import type { DiscoveryList } from "./list";

import { discoveryQueries } from "./api";
import { listTitles } from "./list";
import { NewArtistsChart } from "./new-artists-chart";
import {
  awayLabel,
  backLabel,
  FindRow,
  FindTable,
  ReleaseGap,
  spanLabel,
  weeksLabel,
} from "./rows";
import { DiscoveryStats } from "./stats";

const PREVIEW = 5;

export const FROM = "/app/$packageId/discoveries";

export const useDiscoveries = () => {
  const range = usePeriod();
  const summary = useQuery(discoveryQueries.summary(range));
  const found = useQuery(discoveryQueries.found(range));
  const returns = useQuery(discoveryQueries.returns(range));
  const atRelease = useQuery(discoveryQueries.atRelease(range));
  return {
    range,
    failed: [summary, found, returns, atRelease].some((query) => query.isError),
    summary: summary.data,
    found: found.data,
    returns: returns.data,
    atRelease: atRelease.data,
  };
};

export const LoadFailed = () => (
  <Empty className="h-40">
    <p>Your discoveries could not be loaded.</p>
  </Empty>
);

export const FreshHistory = () => (
  <Empty className="h-40">
    <p>Your history starts in this period, so every artist in it is new.</p>
    <p>Pick a later period to see what you discovered.</p>
  </Empty>
);

type PreviewProps = {
  list: DiscoveryList;
  count: number;
  children: ReactNode;
};

const Preview = ({ list, count, children }: PreviewProps) => (
  <section aria-labelledby={list} className="flex flex-col">
    <Band id={list} title={listTitles[list]} count={format.count(count)}>
      {count > PREVIEW ? (
        <Link
          from={FROM}
          to="."
          search={(prev) => ({ ...prev, list })}
          className="ml-auto inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          See all
          <Icon icon={ArrowRight01Icon} size={12} />
        </Link>
      ) : null}
    </Band>
    {count === 0 ? (
      <p className="px-3 py-3 text-xs text-muted-foreground">None in this period.</p>
    ) : (
      <FindTable>{children}</FindTable>
    )}
  </section>
);

export const Discoveries = () => {
  const { range, failed, summary, found, returns, atRelease } = useDiscoveries();
  if (failed) return <LoadFailed />;
  if (!summary || !found || !returns || !atRelease) return null;
  if (summary.fresh) return <FreshHistory />;

  const passed = found.filter((row) => row.passed);

  return (
    <>
      <DiscoveryStats
        summary={summary}
        found={found.length}
        atRelease={atRelease.length}
        returns={returns.length}
      />
      <div className="flex flex-col gap-3 pt-3 pb-8">
        <NewArtistsChart range={range} found={found} />
        <Preview list="passed" count={passed.length}>
          {passed.slice(0, PREVIEW).map((row, index) => (
            <FindRow
              key={row.id}
              find={row}
              opens="artist"
              rank={index + 1}
              when={spanLabel(row.start, row.last)}
              note={weeksLabel(row.weeks)}
            />
          ))}
        </Preview>
        <Preview list="release" count={atRelease.length}>
          {atRelease.slice(0, PREVIEW).map((row, index) => (
            <FindRow
              key={row.id}
              find={row}
              opens="album"
              sub={row.sub}
              rank={index + 1}
              when={<ReleaseGap row={row} />}
              note={weeksLabel(row.weeks)}
            />
          ))}
        </Preview>
        <Preview list="back" count={returns.length}>
          {returns.slice(0, PREVIEW).map((row) => (
            <FindRow
              key={row.id}
              find={row}
              opens="artist"
              when={backLabel(row)}
              note={awayLabel(row.away)}
            />
          ))}
        </Preview>
      </div>
    </>
  );
};
