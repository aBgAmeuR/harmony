import { colors, type Series } from "@harmony/charts/v4";

import { measures } from "@/data/measures";
import { format } from "@/shared/lib/format";

type Charted = "playtime" | "streams";

// Chart series of a measure, keyed by its name: every chart labels and formats it like the rest
// of the app. Use the key as the marks' `z`.
export const seriesOf = (key: Charted, color: string = colors.primary): Series => ({
  [key]: {
    label: measures[key].label,
    color,
    format: (value) => format.as(value, measures[key].kind),
  },
});
