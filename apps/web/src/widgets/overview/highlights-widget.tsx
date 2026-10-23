import type { ReactNode } from "react";

import { intensity } from "@harmony/charts/v4";
import { ArrowRight01Icon, Icon } from "@harmony/icons";
import { Card } from "@harmony/ui/components/card";
import { Skeleton } from "@harmony/ui/components/skeleton";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import type { Highlights } from "@/data/overview/highlights";
import type { Range } from "@/data/overview/range";

import { Art } from "@/shared/primitives/art";
import { Section } from "@/shared/primitives/section";
import { format } from "@/utils/format";

import { overviewQueries } from "./api";
import { shortDate } from "./format";
import { useRanges } from "./use-range";

type MomentProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  // The page that tells more, and its name on the link.
  to: "./listening" | "./milestones" | "./discoveries" | "./tracks";
  more: string;
  children: ReactNode;
};

// One moment of the period: what happened, a small picture of it, and where to read more.
const Moment = ({ label, value, hint, to, more, children }: MomentProps) => (
  <Card size="xs" className="gap-0">
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="truncate text-lg font-semibold tabular-nums">{value}</span>
        {hint ? (
          <span className="truncate text-xs text-muted-foreground tabular-nums">{hint}</span>
        ) : null}
      </div>
      <div className="mt-auto">{children}</div>
    </div>
    <Link
      from="/app/$packageId"
      to={to}
      preload="intent"
      className="flex items-center justify-between border-t px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
    >
      {more}
      <Icon icon={ArrowRight01Icon} size={14} />
    </Link>
  </Card>
);

// The month of the peak day as a calendar, Monday first, brighter where you listened more.
const PeakMonth = ({ days, peak }: { days: Highlights["peakMonth"]; peak: string }) => {
  const first = days[0] ? new Date(`${days[0].date}T00:00:00`) : null;
  // Empty cells before the first day, so each column is one weekday.
  const offset = first ? (first.getDay() + 6) % 7 : 0;
  const max = Math.max(0, ...days.map((day) => day.minutes));

  return (
    <div
      className="grid grid-cols-7 gap-1"
      role="img"
      aria-label="Listening in the month of the peak day"
    >
      {Array.from({ length: offset }, (_, i) => (
        <span key={`empty-${i}`} />
      ))}
      {days.map((day) => (
        <span
          key={day.date}
          title={`${shortDate(day.date)} · ${format.as(day.minutes, "minutes")}`}
          className={cn("h-3.5 rounded-sm", day.date === peak && "ring-2 ring-foreground")}
          style={{ backgroundColor: intensity(day.minutes, max) }}
        />
      ))}
    </div>
  );
};

const time = (date: Date | string) =>
  (typeof date === "string" ? new Date(`${date}T00:00:00`) : date).getTime();

const monthName = (date: Date) => date.toLocaleDateString("en-US", { month: "short" });

const DAY = 86_400_000;
// Month names under the timeline.
const MONTH_LABELS = 5;

type StreakLineProps = { range: Range; start: string; end: string };

// The period as a track with a small line per week, the streak drawn over it.
const StreakLine = ({ range, start, end }: StreakLineProps) => {
  const from = time(range.from);
  const span = Math.max(time(range.to) - from + DAY, DAY);
  // One small line per week of the period.
  const weeks = Math.max(1, Math.ceil(span / (7 * DAY)));
  const left = Math.max(0, (time(start) - from) / span);
  const width = Math.min(1 - left, Math.max(0.01, (time(end) - time(start) + DAY) / span));
  const labels = Array.from({ length: MONTH_LABELS }, (_, i) =>
    monthName(new Date(from + ((span - DAY) * i) / (MONTH_LABELS - 1))),
  );

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="relative flex h-5.5 items-center justify-between overflow-hidden rounded-sm"
        role="img"
        aria-label="The longest streak within the period"
      >
        {Array.from({ length: weeks }, (_, i) => (
          <span key={i} className="h-full w-0.5 rounded-sm bg-foreground/10" />
        ))}
        <span
          className="absolute inset-y-0 rounded-sm bg-chart-1"
          style={{ left: `${left * 100}%`, width: `${width * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {labels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
    </div>
  );
};

const DOTS = 40;

// The share of new artists as dots out of forty.
const NewDots = ({ share }: { share: number }) => {
  const filled = Math.round(share * DOTS);
  return (
    <div
      className="grid grid-cols-20 gap-1"
      role="img"
      aria-label={`${format.as(share, "percent")} new`}
    >
      {Array.from({ length: DOTS }, (_, i) => (
        <span
          key={i}
          className={cn("aspect-square rounded-full", i < filled ? "bg-chart-1" : "bg-muted")}
        />
      ))}
    </div>
  );
};

// Four moments of the period, each one a way into a page with the details.
export const HighlightsWidget = () => {
  const { range, full } = useRanges();
  const { data } = useQuery(overviewQueries.highlights.queryOptions(range));
  const { data: kpis } = useQuery(overviewQueries.kpis.queryOptions(range, full));

  const artists = kpis?.current.totals.artists ?? 0;

  return (
    <Section size="md">
      <Section.Title>Where to look next</Section.Title>
      <Section.Text>Four moments from this period, each one a way into the details.</Section.Text>
      {!data ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {/* The cards with a picture run taller than the ones below them. */}
          {["h-58", "h-58", "h-49", "h-49"].map((height, i) => (
            <Skeleton key={i} className={cn("rounded-lg", height)} />
          ))}
        </div>
      ) : (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Moment
            label="Peak day"
            value={data.peakDay ? shortDate(data.peakDay.date) : "-"}
            hint={
              data.peakDay
                ? `${format.as(data.peakDay.minutes, "minutes")} · ${format.count(data.peakDay.streams)} streams`
                : null
            }
            to="./listening"
            more="Listening Habits"
          >
            {data.peakDay ? <PeakMonth days={data.peakMonth} peak={data.peakDay.date} /> : null}
          </Moment>

          <Moment
            label="Longest streak"
            value={`${format.count(data.streak.days)} days in a row`}
            hint={
              data.streak.start && data.streak.end
                ? `${shortDate(data.streak.start)} - ${shortDate(data.streak.end)}`
                : null
            }
            to="./milestones"
            more="Milestones"
          >
            {data.streak.start && data.streak.end ? (
              <StreakLine range={range} start={data.streak.start} end={data.streak.end} />
            ) : null}
          </Moment>

          <Moment
            label="New artists"
            value={
              data.newArtists === null ? "-" : `${format.count(data.newArtists)} first listens`
            }
            hint={
              data.newArtists === null
                ? "Needs history before this period"
                : artists > 0
                  ? `${format.as(data.newArtists / artists, "percent")} of the ${format.count(artists)} artists you played`
                  : null
            }
            to="./discoveries"
            more="Discoveries"
          >
            {data.newArtists !== null && artists > 0 ? (
              <NewDots share={data.newArtists / artists} />
            ) : null}
          </Moment>

          <Moment
            label="Most replayed"
            value={data.replayed?.name ?? "-"}
            hint={data.replayed?.description}
            to="./tracks"
            more="All your tracks"
          >
            {data.replayed ? (
              <div className="flex items-center gap-3">
                <Art
                  src={data.replayed.image}
                  alt={data.replayed.name}
                  size="lg"
                  fallback="initials"
                />
                <div className="flex flex-col">
                  <span className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
                    {format.count(data.replayed.streams)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    streams, more than any other track
                  </span>
                </div>
              </div>
            ) : null}
          </Moment>
        </div>
      )}
    </Section>
  );
};
