import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { Sessions } from "@/data/milestones";
import type { Streak } from "@/data/streak";

import { format } from "@/shared/lib/format";
import { useScope } from "@/shared/scope";

import type { TimelineEvent } from "./api";

import { milestoneQueries } from "./api";
import { sessionDurationParts } from "./format";
import { MilestonesTimeline } from "./timeline";

const withRecordEvents = (
  events: TimelineEvent[],
  streak: Streak | undefined,
  sessions: Sessions | undefined,
) => {
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
      entity: `${format.count(streak.longestDays)} days of daily listening`,
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
  const { data: events = [], isPending } = useQuery(milestoneQueries.timeline(filter));
  const { data: streak } = useQuery(milestoneQueries.streak(filter));
  const { data: sessions } = useQuery(milestoneQueries.sessions(filter));

  const rows = useMemo(
    () => withRecordEvents(events, streak, sessions),
    [events, streak, sessions],
  );

  return <MilestonesTimeline rows={rows} isPending={isPending} />;
};
