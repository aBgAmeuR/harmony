import {
  barY,
  Chart,
  chartBase,
  colors,
  columnBand,
  columnTooltip,
  defineChart,
  xBand,
  yValue,
} from "@harmony/charts/v4";
import { Button } from "@harmony/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { Rule } from "@/data/filter";

import { seriesOf } from "@/entities/measure";
import { isoDay, parseDay } from "@/shared/lib/date";
import { Section } from "@/shared/primitives/section";
import { showPeriod, useDateRangeStore, usePeriod } from "@/shared/scope";

import { itemQueries, monthlySpan } from "./api";

const ACTIVE = colors.primary;
const DIMMED = "color-mix(in srgb, var(--chart-1) 30%, transparent)";

const short = new Intl.DateTimeFormat("en-US", { month: "short" });

const SERIES = seriesOf("playtime", ACTIVE);

type MonthlyProps = {
  rule: Rule;
};

export const Monthly = ({ rule }: MonthlyProps) => {
  const mode = useDateRangeStore((s) => s.mode);
  const { from, to } = usePeriod();

  const span = monthlySpan(mode, from, to);
  const { data } = useQuery(itemQueries.monthly({ ...span, rules: [rule] }));

  const first = isoDay(new Date(from.getFullYear(), from.getMonth(), 1));
  const last = isoDay(to);

  const definition = useMemo(() => {
    const rows = (data?.points ?? []).map((month) => ({
      label: month.key,
      value: month.playtime,
      active: month.key >= first && month.key <= last,
    }));

    return defineChart({
      ...chartBase,
      marks: [
        barY(rows, {
          id: "months",
          x: "label",
          y: "value",
          z: () => "playtime",
          fill: (row) => (row.active ? ACTIVE : DIMMED),
          radius: 2,
        }),
        columnBand(),
      ],
      scales: {
        x: xBand({ format: (label) => short.format(parseDay(label)) }),
        y: yValue(),
      },
      ...columnTooltip(SERIES),
    });
  }, [data, first, last]);

  return (
    <Section>
      <Section.Head>
        <Section.Title>Monthly activity</Section.Title>
        {mode === "month" ? (
          <Section.Action>
            <Button variant="outline" onClick={() => showPeriod("year", from)}>
              Show {from.getFullYear()}
            </Button>
          </Section.Action>
        ) : null}
      </Section.Head>
      <Chart
        definition={definition}
        aspectRatio={5}
        ariaLabel="Monthly listening"
        onSelect={(point) => point && showPeriod("month", parseDay(point.datum.label))}
      />
    </Section>
  );
};
