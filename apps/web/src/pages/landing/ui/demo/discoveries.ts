import type { ArtistRelease, WeeklyActivityPoint } from "@/data/discoveries/types";

// Ken Carson on the demo package from April to September 2026, as `weeklyActivityFn` and
// `artistReleasesFn` return it.
const WEEKS = [
  "06 Apr 2026",
  "13 Apr 2026",
  "20 Apr 2026",
  "27 Apr 2026",
  "04 May 2026",
  "11 May 2026",
  "18 May 2026",
  "25 May 2026",
  "01 Jun 2026",
  "08 Jun 2026",
  "15 Jun 2026",
  "22 Jun 2026",
  "29 Jun 2026",
  "06 Jul 2026",
  "13 Jul 2026",
  "20 Jul 2026",
  "27 Jul 2026",
  "03 Aug 2026",
  "10 Aug 2026",
  "17 Aug 2026",
  "24 Aug 2026",
  "31 Aug 2026",
  "07 Sep 2026",
  "14 Sep 2026",
  "21 Sep 2026",
  "28 Sep 2026",
  "05 Oct 2026",
];

// Minutes per week.
const MINUTES = [
  118, 89, 39, 30, 15, 9, 34, 32, 61, 26, 110, 65, 721, 753, 336, 176, 166, 80, 142, 80, 270, 4,
  113, 69, 101, 0, 0,
];

export const WEEKLY: WeeklyActivityPoint[] = WEEKS.map((name, i) => ({
  name,
  value: MINUTES[i] ?? 0,
}));

export const RELEASES: ArtistRelease[] = [
  { album: "xperiment", releaseDate: "2026-07-03", periodLabel: "29 Jun 2026", image: null },
  { album: "Possession", releaseDate: "2026-07-10", periodLabel: "06 Jul 2026", image: null },
  {
    album: "xperiment - cartunez",
    releaseDate: "2026-08-27",
    periodLabel: "24 Aug 2026",
    image: null,
  },
];
