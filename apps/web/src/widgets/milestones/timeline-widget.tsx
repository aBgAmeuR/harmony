import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { ListeningSessions, ListeningStreak, TimelineEvent } from "@/data/milestones/types";

import { useScope } from "@/shared/scope";

import { milestoneQueries } from "./api";
import { formatCount, sessionDurationParts } from "./format";
import { MilestonesTimeline } from "./timeline";

const withRecordEvents = (
  events: TimelineEvent[],
  streak: ListeningStreak | undefined,
  sessions: ListeningSessions | undefined,
): TimelineEvent[] => {
  const extra: TimelineEvent[] = [];

  if (sessions && sessions.longestMinutes > 0 && sessions.longestStart) {
    const duration = sessionDurationParts(sessions.longestMinutes, "long");
    extra.push({
      id: `session-${sessions.longestStart}`,
      date: sessions.longestStart,
      label: "Record session",
      entity: `${duration.value} ${duration.unit} of continuous listening`,
      subtitle: "",
      image: null,
    });
  }

  if (streak && streak.longestDays >= 2 && streak.longestEnd) {
    extra.push({
      id: `streak-${streak.longestEnd}`,
      date: streak.longestEnd,
      label: "Longest streak",
      entity: `${formatCount(streak.longestDays)} days of daily listening`,
      subtitle: "",
      image: null,
    });
  }

  return [...events, ...extra].toSorted(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  );
};

export const TimelineWidget = () => {
  const filter = useScope();
  const { data: events = [], isPending } = useQuery(milestoneQueries.timeline.queryOptions(filter));
  const { data: streak } = useQuery(milestoneQueries.streak.queryOptions(filter));
  const { data: sessions } = useQuery(milestoneQueries.sessions.queryOptions(filter));

  const rows = useMemo(
    () => withRecordEvents(events, streak, sessions),
    [events, streak, sessions],
  );

  return <MilestonesTimeline rows={rows} isPending={isPending} />;
};
