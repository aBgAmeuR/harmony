import type { Series } from "@harmony/charts/v4";

import { format } from "@/utils/format";

import { measure } from "./measure";

type Measure = keyof typeof measure;

// Chart series of a measured quantity, keyed by its name: every chart labels and formats it like
// the rest of the app. Use the key as the marks' `z`.
export const seriesOf = (key: Measure, color = "var(--chart-1)"): Series => ({
  [key]: {
    label: measure[key].label,
    color,
    format: (value) => format.as(value, measure[key].kind),
  },
});
