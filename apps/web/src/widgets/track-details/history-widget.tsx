import { Icon, InformationCircleIcon } from "@harmony/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";
import { useQuery } from "@tanstack/react-query";

import { trackQueries } from "@/entities/track";
import { Grid } from "@/shared/primitives/grid";
import { Section } from "@/shared/primitives/section";
import { Stat } from "@/shared/primitives/stat";
import { usePeriod } from "@/shared/scope";
import { format } from "@/utils/format";

type HistoryWidgetProps = {
  trackId: number;
};

const formatStreak = (days: number | undefined): string => {
  if (days === undefined) return "-";
  if (days === 1) return "1 day";
  return `${days} days`;
};

const formatStreakStart = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined;
  return `Started ${format.date(value)}`;
};

export const HistoryWidget = ({ trackId }: HistoryWidgetProps) => {
  const { from, to } = usePeriod();
  const { data } = useQuery(trackQueries.history.queryOptions({ trackId, from, to }));

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
    <Section size="sm">
      <Section.Title>History</Section.Title>
      <Grid variant="ruled">
        {rows.map((row) => (
          <Stat key={row.label} layout="row">
            <Stat.Label className="shrink-0">{row.label}</Stat.Label>
            {row.detail ? (
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1">
                  <Icon icon={InformationCircleIcon} className="size-2.5 text-muted-foreground" />
                  <Stat.Value>{row.value}</Stat.Value>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{row.detail}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Stat.Value>{row.value}</Stat.Value>
            )}
          </Stat>
        ))}
      </Grid>
    </Section>
  );
};
