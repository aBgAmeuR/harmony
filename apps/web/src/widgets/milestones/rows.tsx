import type { ReactNode } from "react";

import {
  Calendar01Icon,
  Calendar03Icon,
  CalendarCheckIn01Icon,
  Clock01Icon,
  Icon,
  MusicNote01Icon,
  PlayIcon,
  Timer02Icon,
  UserMultiple02Icon,
  type IconSvgElement,
} from "@harmony/icons";
import { Badge } from "@harmony/ui/components/badge";

import { within, type Best, type Mark, type Next } from "@/data/milestones";
import { useDetail, type Detail } from "@/features/detail-panel";
import { parseDay, rangeDays, type Range } from "@/shared/lib/date";
import { format } from "@/shared/lib/format";
import { Media } from "@/shared/primitives/media";
import { Meter } from "@/shared/primitives/meter";
import { Table } from "@/shared/primitives/table";

const plural = (n: number, word: string) => `${format.count(n)} ${word}${n === 1 ? "" : "s"}`;

const titles = {
  hours: (n) => `${format.count(n)} hours listened`,
  streams: (n) => `${format.count(n)} streams`,
  tracks: (n) => `${format.count(n)} unique tracks`,
  artists: (n) => `${format.count(n)} unique artists`,
  artist: (n, name) => `${format.count(n)} streams of ${name}`,
  track: (n, name) => `${format.count(n)} plays of ${name}`,
  anniversary: (n, name) => `${plural(n, "year")} with ${name}`,
} satisfies Record<Mark["kind"], (n: number, name: string | null) => string>;

const opens = {
  hours: "track",
  streams: "track",
  tracks: "track",
  artists: "artist",
  artist: "artist",
  track: "track",
  anniversary: "artist",
} as const;

const glyphs = {
  hours: Clock01Icon,
  streams: PlayIcon,
  tracks: MusicNote01Icon,
  artists: UserMultiple02Icon,
  artist: null,
  track: null,
  anniversary: null,
} as const;

const tags = {
  hours: "Total",
  streams: "Total",
  tracks: "Total",
  artists: "Total",
  artist: "Artist",
  track: "Track",
  anniversary: "Anniversary",
} as const;

const yearsBefore = (day: string, years: number) => {
  const date = parseDay(day);
  return new Date(date.getFullYear() - years, date.getMonth(), date.getDate());
};

const markSubs = {
  hours: (mark) => `On ${mark.name}, ${mark.sub}`,
  streams: (mark) => `On ${mark.name}, ${mark.sub}`,
  tracks: (mark) => `On ${mark.name}, ${mark.sub}`,
  artists: (mark) => `With ${mark.name}`,
  artist: (mark) => `On ${mark.sub}`,
  track: (mark) => mark.sub,
  anniversary: (mark) =>
    `First play on ${format.date(yearsBefore(mark.date, mark.threshold))}, ${mark.sub}`,
} satisfies Record<Mark["kind"], (mark: Mark) => string | null>;

const Glyph = ({ icon }: { icon: IconSvgElement }) => (
  <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-muted text-muted-foreground">
    <Icon icon={icon} />
  </div>
);

type ArtProps = { icon: IconSvgElement | null; image: string | null; name: string | null };

const Picture = ({ icon, image, name }: ArtProps) =>
  icon ? <Glyph icon={icon} /> : <Media.Art src={image} alt={name ?? ""} />;

const Line = ({ detail, children }: { detail: Detail | null; children: ReactNode }) => {
  const { open, current } = useDetail();
  if (!detail) return <Table.Row className="border-0">{children}</Table.Row>;
  const select = () => void open(detail);

  return (
    <Table.Row
      selected={current?.kind === detail.kind && current.id === detail.id}
      onSelect={select}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        select();
      }}
      className="border-0 outline-none focus-visible:bg-muted/50"
    >
      {children}
    </Table.Row>
  );
};

export const Rows = ({ children }: { children: ReactNode }) => (
  <div className="@container">
    <Table>
      <Table.Body>{children}</Table.Body>
    </Table>
  </div>
);

const MarkRow = ({ mark }: { mark: Mark }) => (
  <Line detail={{ kind: opens[mark.kind], id: mark.id }}>
    <Table.Cell className="w-24 pl-3 text-xs text-muted-foreground tabular-nums">
      {format.date(mark.date)}
    </Table.Cell>
    <Table.Cell className="max-w-0">
      <Media>
        <Picture icon={glyphs[mark.kind]} image={mark.image} name={mark.name} />
        <Media.Body>
          <Media.Title>{titles[mark.kind](mark.threshold, mark.name)}</Media.Title>
          <Media.Sub>{markSubs[mark.kind](mark)}</Media.Sub>
        </Media.Body>
      </Media>
    </Table.Cell>
    <Table.Cell className="w-28 pr-3 text-right">
      <Badge variant="secondary">{tags[mark.kind]}</Badge>
    </Table.Cell>
  </Line>
);

export const MarkList = ({ marks }: { marks: readonly Mark[] }) => (
  <Rows>
    {marks.map((mark) => (
      <MarkRow key={`${mark.kind}-${mark.threshold}-${mark.id}`} mark={mark} />
    ))}
  </Rows>
);

const nextSubs = {
  hours: () => "All time",
  streams: () => "All time",
  tracks: () => "All time",
  artists: () => "All time",
  artist: () => "Artist",
  track: (row) => row.sub,
} satisfies Record<Next["kind"], (row: Next) => string | null>;

const eta = (row: Next) => {
  if (row.eta === null) return "No recent plays";
  if (row.passed) return "Likely reached";
  return `around ${row.days <= 60 ? format.date(row.eta) : format.month(row.eta)}`;
};

export const NextRow = ({ row }: { row: Next }) => {
  const title = titles[row.kind](row.target, row.name);
  const left = `${format.count(row.target - row.current)} to go`;

  return (
    <Line detail={row.id === null ? null : { kind: opens[row.kind], id: row.id }}>
      <Table.Cell className="max-w-0 pl-3">
        <Media>
          <Picture icon={glyphs[row.kind]} image={row.image} name={row.name} />
          <Media.Body>
            <Media.Title>{title}</Media.Title>
            <Media.Sub>{nextSubs[row.kind](row)}</Media.Sub>
          </Media.Body>
        </Media>
      </Table.Cell>
      <Table.Cell className="hidden w-48 @xl:table-cell">
        <div className="flex flex-col gap-1.5">
          <Meter
            value={row.current - row.previous}
            max={row.target - row.previous}
            size="sm"
            label={`${title}, ${left}`}
          />
          <span className="text-xs text-muted-foreground tabular-nums">
            {format.count(row.current)} / {format.count(row.target)}
          </span>
        </div>
      </Table.Cell>
      <Table.Cell className="w-28 text-right text-sm tabular-nums">{left}</Table.Cell>
      <Table.Cell className="w-36 pr-3 text-right text-xs text-muted-foreground">
        {eta(row)}
      </Table.Cell>
    </Line>
  );
};

const bestTitles = {
  day: "Biggest day",
  week: "Biggest week",
  session: "Longest session",
  streak: "Longest streak",
  track: "Most plays of a track in a day",
  artists: "Most artists in a day",
} as const;

const bestGlyphs = {
  day: Calendar03Icon,
  week: Calendar01Icon,
  session: Timer02Icon,
  streak: CalendarCheckIn01Icon,
  track: null,
  artists: UserMultiple02Icon,
} as const;

const values = {
  day: (value) => format.as(value, "minutes"),
  week: (value) => format.as(value, "minutes"),
  session: (value) => format.as(value, "minutes"),
  streak: (value) => plural(value, "day"),
  track: (value) => plural(value, "play"),
  artists: (value) => plural(value, "artist"),
} satisfies Record<Best["id"], (value: number) => string>;

const bestSubs = {
  day: (best) => plural(best.n, "stream"),
  week: (best) => plural(best.n, "stream"),
  session: (best) => `${plural(best.n, "stream")} in a row`,
  streak: (best) => `${plural(best.n, "stream")}, not a day off`,
  track: (best) => [best.track, best.artists].filter(Boolean).join(", "),
  artists: (best) => `Out of ${plural(best.n, "stream")}`,
} satisfies Record<Best["id"], (best: Best) => string>;

const span = (start: string, finish: string) =>
  start === finish ? format.date(start) : `${format.date(start)} – ${format.date(finish)}`;

const held = (finish: string, last: string) => {
  const years = Math.floor(rangeDays({ from: parseDay(finish), to: parseDay(last) }) / 365.25);
  return years >= 1 ? `held ${plural(years, "year")}` : null;
};

type BestRowProps = { best: Best; range: Range; last: string };

export const BestRow = ({ best, range, last }: BestRowProps) => (
  <Line detail={best.trackId === null ? null : { kind: "track", id: best.trackId }}>
    <Table.Cell className="max-w-0 pl-3">
      <Media>
        <Picture icon={bestGlyphs[best.id]} image={best.image} name={best.track} />
        <Media.Body>
          <Media.Title>{bestTitles[best.id]}</Media.Title>
          <Media.Sub>{bestSubs[best.id](best)}</Media.Sub>
        </Media.Body>
      </Media>
    </Table.Cell>
    <Table.Cell className="w-28 text-right text-sm font-semibold tabular-nums">
      {values[best.id](best.value)}
    </Table.Cell>
    <Table.Cell className="hidden w-52 text-xs text-muted-foreground tabular-nums @xl:table-cell">
      {span(best.start, best.finish)}
    </Table.Cell>
    <Table.Cell className="w-60 pr-3">
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        {within(best.finish, range) ? (
          <>
            <Badge variant="active">New</Badge>
            {best.prev === null || best.prevStart === null ? null : (
              <span className="truncate">
                beat {values[best.id](best.prev)} from {parseDay(best.prevStart).getFullYear()}
              </span>
            )}
          </>
        ) : (
          held(best.finish, last)
        )}
      </div>
    </Table.Cell>
  </Line>
);
