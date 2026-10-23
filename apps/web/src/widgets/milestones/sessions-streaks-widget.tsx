import { useQuery } from "@tanstack/react-query";

import type { ListeningStreak } from "@/data/milestones/types";

import { Grid } from "@/shared/primitives/grid";
import { Section } from "@/shared/primitives/section";
import { Stat } from "@/shared/primitives/stat";
import { useScope } from "@/shared/scope";

import { milestoneQueries } from "./api";
import { formatCount, formatMilestoneDate } from "./format";

const streakCaption = (streak: ListeningStreak | undefined): string => {
  if (!streak || streak.longestDays < 2 || !streak.longestStart || !streak.longestEnd) {
    return "Listen on consecutive days to build one";
  }
  return `${formatMilestoneDate(streak.longestStart)} to ${formatMilestoneDate(streak.longestEnd)}`;
};

export const SessionsStreaksWidget = () => {
  const filter = useScope();
  const { data: streak } = useQuery(milestoneQueries.streak.queryOptions(filter));
  const { data: sessions } = useQuery(milestoneQueries.sessions.queryOptions(filter));

  const hasStreak = streak !== undefined && streak.longestDays >= 2;
  const hasSessions = sessions !== undefined && sessions.sessions > 0;
  // A placeholder while the data loads, so "no sessions" is not shown by mistake.
  const noSessions = sessions === undefined ? "…" : "No sessions in this range";

  return (
    <Section aria-labelledby="sessions-and-streaks">
      <Section.Title id="sessions-and-streaks">Sessions and Streaks</Section.Title>
      <Grid cols={3} className="grid-cols-3 gap-4">
        <Stat className="p-0">
          <Stat.Label>Average session</Stat.Label>
          <Stat.Value value={hasSessions ? sessions.avgMinutes : null} kind="minutes" />
          <Stat.Hint className="text-pretty">
            {hasSessions ? `on ${formatCount(sessions.sessions)} sessions` : noSessions}
          </Stat.Hint>
        </Stat>
        <Stat className="p-0">
          <Stat.Label>Longest session</Stat.Label>
          <Stat.Value value={hasSessions ? sessions.longestMinutes : null} kind="minutes" />
          <Stat.Hint className="text-pretty">
            {hasSessions && sessions.longestStart
              ? formatMilestoneDate(sessions.longestStart)
              : noSessions}
          </Stat.Hint>
        </Stat>
        <Stat className="p-0">
          <Stat.Label>Longest listening streak</Stat.Label>
          <Stat.Value>{hasStreak ? `${formatCount(streak.longestDays)} days` : "-"}</Stat.Value>
          <Stat.Hint className="text-pretty">
            {streak === undefined ? "…" : streakCaption(hasStreak ? streak : undefined)}
          </Stat.Hint>
        </Stat>
      </Grid>
    </Section>
  );
};
