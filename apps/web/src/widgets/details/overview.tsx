import { ArrowRight01Icon, Icon } from "@harmony/icons";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";

import { playsFn } from "@/data/details";
import { measures } from "@/data/measures";
import { isoDay } from "@/shared/lib/date";
import { format, platformLabel, toDate } from "@/shared/lib/format";
import { Empty } from "@/shared/primitives/empty";
import { Grid } from "@/shared/primitives/grid";
import { Stat } from "@/shared/primitives/stat";
import { periodLabel, useDateRangeStore, usePeriod } from "@/shared/scope";

import { AlbumFoot } from "./album-tracks";
import { detailQueries, monthlySpan } from "./api";
import { Card, Foot, KeyFacts, Strip, Top, Units, useRank, useTop, type PartProps } from "./kit";

const Kpis = ({ item, filter }: PartProps) => {
  const period = usePeriod();
  const { base, rank } = useRank(item);
  const { data: stats } = useQuery(detailQueries.stats(filter));
  const { data: all } = useQuery(detailQueries.stats(period));
  const { data: streak } = useQuery(detailQueries.streak(filter));

  return (
    <Grid variant="ruled" className="grid-cols-4">
      <Stat className="gap-0.5 px-2.5 py-2">
        <Stat.Label>{measures.playtime.label}</Stat.Label>
        <Stat.Value value={stats?.playtime} kind="minutes" size="md" />
        <Stat.Hint className="truncate">
          {stats && all ? format.as(stats.playtime / all.playtime, "percent") : "-"} of total
        </Stat.Hint>
      </Stat>
      <Stat className="gap-0.5 px-2.5 py-2">
        <Stat.Label>{measures.streams.label}</Stat.Label>
        <Stat.Value value={stats?.streams} size="md" />
        <Stat.Hint className="truncate">
          {stats ? format.as(stats.streams / stats.days, "ratio") : "-"} / active day
        </Stat.Hint>
      </Stat>
      <Stat className="gap-0.5 px-2.5 py-2">
        <Stat.Label>Rank</Stat.Label>
        <Stat.Value size="md">{rank ? `#${format.count(rank.rank)}` : "-"}</Stat.Value>
        <Stat.Hint className="truncate">
          of {rank ? format.count(rank.total) : "-"} {base.title.toLowerCase()}
        </Stat.Hint>
      </Stat>
      <Stat className="gap-0.5 px-2.5 py-2">
        <Stat.Label>{measures.days.label}</Stat.Label>
        <Stat.Value value={stats?.days} size="md" />
        <Stat.Hint className="truncate">
          {streak ? `${format.count(streak.longestDays)}-day streak` : "-"}
        </Stat.Hint>
      </Stat>
    </Grid>
  );
};

const BARS = 60;

type Play = Awaited<ReturnType<typeof playsFn>>[number];

const dayOf = (played: string) => isoDay(toDate(played));

const weekOf = (played: string) => {
  const date = toDate(played);
  return isoDay(
    new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7)),
  );
};

const EveryPlay = ({ filter }: PartProps) => {
  const { data = [] } = useQuery(detailQueries.plays(filter));
  const plays = data.toReversed();
  const [main] = Object.entries(Object.groupBy(plays, (play) => play.platform)).toSorted(
    (a, b) => (b[1]?.length ?? 0) - (a[1]?.length ?? 0),
  );
  const skipped = plays.filter((play) => play.skipped).length;
  const byDay = Object.entries(Object.groupBy(plays, (play) => dayOf(play.played)));
  const grain = plays.length <= BARS ? "play" : byDay.length <= BARS ? "day" : "week";
  const groups: [string, Play[] | undefined][] =
    grain === "play"
      ? plays.map((play) => [play.played, [play]])
      : grain === "day"
        ? byDay
        : Object.entries(Object.groupBy(plays, (play) => weekOf(play.played)));
  const bars = groups.map(([key, group = []]) => {
    const ms = group.reduce((sum, play) => sum + play.ms, 0);
    const cut = group.filter((play) => play.skipped).length;
    const onMain = group.filter((play) => play.platform === main?.[0]).length;
    return {
      ms,
      main: onMain * 2 >= group.length,
      skipped: cut * 2 > group.length,
      tip:
        grain === "play"
          ? `${format.dateTime(key)} · ${format.duration(ms)}${cut ? " · skipped" : ""}`
          : `${grain === "week" ? "Week of " : ""}${format.date(key)} · ${format.count(group.length)} plays · ${format.duration(ms)}${cut ? ` · ${cut} skipped` : ""}`,
    };
  });

  return (
    <Card
      title="Every play"
      caption={`${format.count(plays.length)} plays · ${grain === "play" ? "height is time heard" : `one bar per ${grain}`}`}
    >
      <Strip
        className="h-14"
        label={`${plays.length} plays in order, one bar per ${grain}, height is time heard`}
        values={bars.map((bar) => bar.ms)}
        tip={(index) => bars[index]?.tip ?? "-"}
        tone={(index) =>
          cn(
            bars[index]?.main ? "bg-chart-1" : "bg-chart-4",
            bars[index]?.skipped && "border-t-2 border-foreground",
          )
        }
      />
      <div className="flex flex-wrap gap-x-3.5 text-[11px]">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-xs bg-chart-1" />
          {main ? platformLabel(main[0]) : "-"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-xs bg-chart-4" />
          Other devices
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-2 bg-foreground" />
          Skipped
        </span>
      </div>
      <Foot>
        <span>
          <b>{format.count(plays.length - skipped)}</b> heard through
        </span>
        <span>
          <b>{format.count(skipped)}</b> cut short
        </span>
        <span>
          <b>{format.count(plays.filter((play) => play.shuffle).length)}</b> on shuffle
        </span>
      </Foot>
    </Card>
  );
};

const AlbumShape = ({ item }: PartProps) => {
  const range = usePeriod();
  const { data: tracks = [] } = useQuery(
    detailQueries.albumTracks({ albumId: Number(item.id), range }),
  );
  const never = tracks.filter((track) => track.streams === 0);

  return (
    <Card title="Album shape" caption="time per track, in album order">
      <Strip
        className="h-14"
        label="Time per track in album order"
        values={tracks.map((track) => track.playtime)}
        tip={(index) =>
          `${index + 1}. ${tracks[index]?.name ?? ""} · ${format.as(tracks[index]?.playtime ?? 0, "minutes")}`
        }
      />
      <AlbumFoot albumId={Number(item.id)} />
      {never.length > 0 ? (
        <span className="text-muted-foreground">
          Never played: {never.map((track) => track.name).join(", ")}
        </span>
      ) : null}
    </Card>
  );
};

const GenreShare = ({ filter }: PartProps) => {
  const period = usePeriod();
  const { data: stats } = useQuery(detailQueries.stats(filter));
  const { data: all } = useQuery(detailQueries.stats(period));
  const share = stats && all ? stats.playtime / all.playtime : 0;

  return (
    <Card title="Share of your listening" caption="one square is 1%">
      <Units
        label="Share of your listening"
        parts={[
          { share, label: "This genre", className: "bg-chart-1" },
          { share: 1 - share, label: "Everything else", className: "bg-chart-4" },
        ]}
      />
    </Card>
  );
};

type PreviewsProps = PartProps & { onTab: (tab: string) => void };

const Previews = ({ onTab, ...part }: PreviewsProps) => {
  const { item, filter } = part;
  const mode = useDateRangeStore((store) => store.mode);
  const period = usePeriod();
  const { rank } = useRank(item);
  const { data: stats } = useQuery(detailQueries.stats(filter));
  const { data: ever } = useQuery(detailQueries.stats({ rules: filter.rules }));
  const { data: monthly } = useQuery(
    detailQueries.monthly({ ...monthlySpan(mode, period.from, period.to), rules: filter.rules }),
  );
  const { data: habits } = useQuery(detailQueries.habits(filter));
  const top = useTop(part, "artists");
  const [weekday] = (habits?.weekdays ?? []).toSorted((a, b) => b.value - a.value);
  const [hour] = (habits?.hours ?? []).toSorted((a, b) => b.value - a.value);
  const topShare =
    top.slice(0, 5).reduce((sum, row) => sum + Number(row.playtime), 0) / (stats?.playtime || 1);

  const cards = [
    {
      tab: "history",
      chart: (monthly?.points ?? []).map((point) => ({
        label: format.month(point.key),
        value: point.playtime,
      })),
      text: (
        <>
          <b>#{rank ? format.count(rank.rank) : "-"}</b> this period.{" "}
          {ever ? format.count(ever.streams) : "-"} plays all time.
        </>
      ),
    },
    {
      tab: "habits",
      chart: (habits?.hours ?? []).map((row) => ({ label: `${row.label}h`, value: row.value })),
      text: (
        <>
          Mostly <b>{weekday?.label ?? "-"}</b>, around {hour?.label ?? "-"}h.{" "}
          {stats ? format.as(stats.finishedRate, "percent") : "-"} finished.
        </>
      ),
    },
    ...(item.kind === "artist"
      ? [
          {
            tab: "catalogue",
            text: (
              <>
                <b>{stats ? format.count(stats.tracks) : "-"}</b> of the{" "}
                {ever ? format.count(ever.tracks) : "-"} tracks you know.
              </>
            ),
          },
        ]
      : []),
    ...(item.kind === "genre"
      ? [
          {
            tab: "mix",
            text: (
              <>
                Top 5 artists hold <b>{format.as(topShare, "percent")}</b>.
              </>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex gap-3">
      {cards.map((card) => (
        <button
          key={card.tab}
          type="button"
          onClick={() => onTab(card.tab)}
          className="flex min-w-0 flex-1 cursor-pointer flex-col gap-1.5 rounded-lg border border-border bg-card px-3 py-3 text-left text-xs transition-colors hover:bg-muted/50 [&_b]:font-semibold [&_b]:text-foreground"
        >
          <span className="flex items-center justify-between font-semibold text-foreground capitalize">
            {card.tab}
            <Icon icon={ArrowRight01Icon} className="size-3" />
          </span>
          {"chart" in card && card.chart ? (
            <Strip
              className="h-9"
              values={card.chart.map((bar) => bar.value)}
              label={`${card.tab} preview`}
              tip={(index) => {
                const bar = card.chart[index];
                return bar ? `${bar.label} · ${format.as(bar.value, "minutes")}` : "-";
              }}
            />
          ) : null}
          <span className="line-clamp-2 text-[11px]">{card.text}</span>
        </button>
      ))}
    </div>
  );
};

const KeyDates = ({ filter }: PartProps) => {
  const mode = useDateRangeStore((store) => store.mode);
  const { from, to } = usePeriod();

  return (
    <Card title="Key dates" caption={periodLabel(mode, from, to)}>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        <KeyFacts filter={filter} />
      </div>
    </Card>
  );
};

export const Overview = ({ onTab, ...part }: PreviewsProps) => {
  const { item, info } = part;
  const { data: stats } = useQuery(detailQueries.stats(part.filter));

  if (stats?.streams === 0) {
    return <Empty variant="framed">“{info.name}” was not played in this period.</Empty>;
  }

  return (
    <>
      <Kpis {...part} />
      {item.kind === "track" ? <EveryPlay {...part} /> : null}
      {item.kind === "album" ? <AlbumShape {...part} /> : null}
      {item.kind === "genre" ? <GenreShare {...part} /> : null}
      {item.kind === "artist" ? (
        <Top
          {...part}
          title="Top tracks"
          base="tracks"
          caption={`${stats ? format.count(stats.tracks) : "-"} tracks played`}
        />
      ) : null}
      {item.kind === "genre" ? (
        <Top
          {...part}
          title="Top artists"
          base="artists"
          caption={`${stats ? format.count(stats.artists) : "-"} artists`}
        />
      ) : null}
      <Previews {...part} onTab={onTab} />
      {item.kind === "genre" ? null : <KeyDates {...part} />}
    </>
  );
};
