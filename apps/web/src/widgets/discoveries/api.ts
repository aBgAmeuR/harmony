import type { Scope } from "@/shared/scope";

import { series } from "@/data/aggregate";
import { scopeFilter } from "@/data/filter";
import { releasesFn, type Release } from "@/data/releases";
import { addDays, parseDay } from "@/shared/lib/date";
import { query } from "@/shared/lib/query";

export type WeekPoint = { name: string; value: number };

export type ReleaseMark = Release & { periodLabel: string };

const weekLabel = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")} ${date.toLocaleDateString("en-US", { month: "short" })} ${date.getFullYear()}`;

const weekOf = (date: Date) => addDays(date, -((date.getDay() + 6) % 7));

const weeklyFn = async (scope: Scope) => {
  if (scope.artistId === undefined) return [];
  const { points } = await series(scopeFilter(scope), ["playtime"], "week");
  return points.map((point) => ({
    name: weekLabel(parseDay(point.key)),
    value: Math.round(point.playtime),
  }));
};

const releasesOfFn = async ({ artistId, from, to }: Scope) => {
  if (artistId === undefined) return [];
  const releases = await releasesFn({ artistId, from, to });
  return releases.map((release) => ({
    ...release,
    periodLabel: weekLabel(weekOf(parseDay(release.releaseDate))),
  }));
};

export const discoveryQueries = {
  weekly: query("discoveries-weekly", weeklyFn),
  releases: query("discoveries-releases", releasesOfFn),
};
