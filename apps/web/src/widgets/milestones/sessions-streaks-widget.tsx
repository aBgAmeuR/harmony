import { useQuery } from "@tanstack/react-query";

import type { ListeningStreak } from "@/data/milestones/types";

import { Stat } from "@/shared/primitives/stat";
import { useScope } from "@/shared/scope";

import { milestoneQueries } from "./api";
import { formatCount, formatMilestoneDate, sessionDurationParts } from "./format";

const streakCaption = (streak: ListeningStreak | undefined): string => {
  if (!streak || streak.longestDays < 2 || !streak.longestStart || !streak.longestEnd) {
    return "Listen on consecutive days to build one";
  }
  return `${formatMilestoneDate(streak.longestStart)} to ${formatMilestoneDate(streak.longestEnd)}`;
};

const Tile = ({
  label,
  value,
  unit,
  caption,
}: {
  label: string;
  value: number | undefined;
  unit: string;
  caption: string;
}) => {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <Stat size="lg" value={value} unit={unit} />
      <p className="text-[10px] text-pretty text-muted-foreground">{caption}</p>
    </div>
  );
};

export const SessionsStreaksWidget = () => {
  const filter = useScope();
  const { data: streak } = useQuery(milestoneQueries.streak.queryOptions(filter));
  const { data: sessions } = useQuery(milestoneQueries.sessions.queryOptions(filter));

  const hasStreak = streak !== undefined && streak.longestDays >= 2;
  const hasSessions = sessions !== undefined && sessions.sessions > 0;
  const avg = sessionDurationParts(sessions?.avgMinutes ?? 0);
  const longest = sessionDurationParts(sessions?.longestMinutes ?? 0);
  const noSessions = "No sessions in this range";

  return (
    <section className="min-w-0 space-y-3" aria-labelledby="sessions-and-streaks">
      <h2 id="sessions-and-streaks" className="text-base font-semibold tracking-tight">
        Sessions and Streaks
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Tile
            label="Average session"
            value={hasSessions ? avg.value : undefined}
            unit={avg.unit}
            caption={hasSessions ? `on ${formatCount(sessions.sessions)} sessions` : noSessions}
          />
          <Tile
            label="Longest session"
            value={hasSessions ? longest.value : undefined}
            unit={longest.unit}
            caption={
              hasSessions && sessions.longestStart
                ? formatMilestoneDate(sessions.longestStart)
                : noSessions
            }
          />
          <Tile
            label="Longest listening streak"
            value={hasStreak ? streak.longestDays : undefined}
            unit="days"
            caption={streakCaption(hasStreak ? streak : undefined)}
          />
        </div>
      </div>
    </section>
  );
};
