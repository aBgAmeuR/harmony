import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";

import { format } from "@/utils/format";

import { overviewQueries } from "./api";
import { shortDate } from "./format";
import { Picture } from "./ui/picture";
import { Playtime } from "./ui/playtime";
import { useRanges } from "./use-range";

export const HighlightsWidget = () => {
  const { range } = useRanges();
  const { data } = useQuery(overviewQueries.highlights.queryOptions(range));

  if (!data) return null;

  const { peakDay, streak, newArtists, replayed } = data;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card size="xs" className="p-2">
        <CardHeader>
          <CardDescription>Peak day</CardDescription>
          <CardTitle className="text-xl font-semibold tracking-tight tabular-nums">
            {peakDay ? shortDate(peakDay.date) : "-"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          {peakDay ? (
            <span className="flex items-center gap-1.5">
              <Playtime minutes={peakDay.minutes} />
              <span>·</span>
              <span className="tabular-nums">{format.count(peakDay.streams)} streams</span>
            </span>
          ) : null}
        </CardContent>
      </Card>

      <Card size="xs" className="p-2">
        <CardHeader>
          <CardDescription>Longest streak</CardDescription>
          <CardTitle className="text-xl font-semibold tracking-tight tabular-nums">
            {format.count(streak.days)} days
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground tabular-nums">
          {streak.start && streak.end
            ? `${shortDate(streak.start)} - ${shortDate(streak.end)}`
            : null}
        </CardContent>
      </Card>

      <Card size="xs" className="p-2">
        <CardHeader>
          <CardDescription>New artists</CardDescription>
          <CardTitle className="text-xl font-semibold tracking-tight tabular-nums">
            {newArtists === null ? "-" : format.count(newArtists)}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          {newArtists === null ? "Needs history before this period" : "First listened this period"}
        </CardContent>
      </Card>

      <Card size="xs" className="p-2">
        <CardHeader>
          <CardDescription>Most replayed</CardDescription>
          <CardTitle className="truncate text-xl font-semibold tracking-tight">
            {replayed?.name ?? "-"}
          </CardTitle>
          {replayed ? (
            <CardAction>
              <Picture src={replayed.image} name={replayed.name} size="lg" />
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent className="truncate text-muted-foreground">
          {replayed
            ? `${replayed.description ? `${replayed.description} · ` : ""}${format.count(replayed.streams)} streams`
            : null}
        </CardContent>
      </Card>
    </div>
  );
};
