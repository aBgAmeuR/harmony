import { Icon, InformationCircleIcon } from "@harmony/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";
import { useQuery } from "@tanstack/react-query";

import { query } from "@/lib/query";
import { useInstantRangeQuery } from "@/lib/stores/date-range-store";
import { format } from "@/utils/format";

type HistoryWidgetProps = {
  trackId: number;
};

function formatStreak(days: number | undefined): string {
  if (days === undefined) return "-";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function formatStreakStart(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return `Started ${format.date(value)}`;
}

export const HistoryWidget = ({ trackId }: HistoryWidgetProps) => {
  const { from, to } = useInstantRangeQuery();
  const { data } = useQuery(query.tracks.history.queryOptions({ trackId, from, to }));

  const rows = [
    {
      label: "Longest streak",
      value: formatStreak(data?.longestStreakDays),
      detail: formatStreakStart(data?.longestStreakStart),
    },
    {
      label: "First played",
      value: format.date(data?.firstPlayed),
      detail: data?.firstPlayedOnRelease ? "Streamed on release day" : undefined,
    },
    {
      label: "Last played",
      value: format.date(data?.lastPlayed),
    },
  ];

  return (
    <section className="flex flex-col gap-1.5">
      <p className="text-xs font-normal text-muted-foreground">History</p>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={`flex items-center justify-between gap-3 px-2.5 py-1.5 ${
              index < rows.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className="shrink-0 text-xs text-muted-foreground">{row.label}</span>
            <div className="flex min-w-0 items-center justify-end gap-1 text-right">
              {row.detail ? (
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <Icon icon={InformationCircleIcon} className="size-2.5 text-muted-foreground" />
                    <p className="text-xs font-medium">{row.value}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{row.detail}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <p className="text-xs font-medium">{row.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
