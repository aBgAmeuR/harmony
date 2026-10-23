import type { TimelineEvent } from "@/data/milestones/types";

const cover = (id: string) => `/landing/covers/m-${id}.webp`;

// Six of the demo package's 2026 milestones, with the record session and the longest streak
// the timeline widget adds to them.
export const TIMELINE: TimelineEvent[] = [
  {
    id: "first-1-2026-01-01",
    date: "2026-01-01",
    label: "First listen",
    entity: "Fenty Face",
    subtitle: "Lucy Bedroque",
    image: cover("first-1-2026-01-01"),
  },
  {
    id: "hours-100-2026-02-09",
    date: "2026-02-09",
    label: "100 hours listened",
    entity: "Blick Sum",
    subtitle: "Latto",
    image: cover("hours-100-2026-02-09"),
  },
  {
    id: "streams-10000-2026-04-24",
    date: "2026-04-24",
    label: "10,000 streams reached",
    entity: "Amped",
    subtitle: "Lil Uzi Vert",
    image: cover("streams-10000-2026-04-24"),
  },
  {
    id: "session-2026-04-29 07:35:07",
    date: "2026-04-29 07:35:07",
    label: "Record session",
    entity: "9.3 hours of continuous listening",
    subtitle: "",
    image: null,
  },
  {
    id: "hours-1000-2026-09-12",
    date: "2026-09-12",
    label: "1,000 hours listened",
    entity: "Try and Fail",
    subtitle: "SLAYR, SoFaygo",
    image: cover("hours-1000-2026-09-12"),
  },
  {
    id: "streak-2026-09-18",
    date: "2026-09-18",
    label: "Longest streak",
    entity: "138 days of daily listening",
    subtitle: "",
    image: null,
  },
];
