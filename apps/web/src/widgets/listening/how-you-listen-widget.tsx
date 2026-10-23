import { Skeleton } from "@harmony/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";

import { Section } from "@/shared/primitives/section";
import { useScope } from "@/shared/scope";

import { listeningQueries } from "./api";
import { HowYouListenCard, percent, shareOf } from "./how-you-listen";
import { SectionPending } from "./ui/section-pending";

// Loads the plays' styles and devices, then draws them with `HowYouListenCard`.
export const HowYouListenWidget = () => {
  const filter = useScope();
  const { data: style = [], isPending: stylePending } = useQuery(
    listeningQueries.listeningStyle.queryOptions(filter),
  );
  const { data: platforms = [], isPending: platformsPending } = useQuery(
    listeningQueries.platforms.queryOptions(filter),
  );

  if (stylePending || platformsPending) {
    return (
      <SectionPending title="How you listen">
        <Skeleton className="h-48 rounded-lg" />
      </SectionPending>
    );
  }

  const device = platforms[0];
  const listened = platforms.some((platform) => platform.value > 0);

  return (
    <Section size="md">
      <Section.Title>How you listen</Section.Title>
      <Section.Text>
        {listened ? (
          <>
            You let <strong>{percent(shareOf(style, "finished"))}</strong> of your plays run to the
            end and skip <strong>{percent(shareOf(style, "skipped"))}</strong>.{" "}
            <strong>{percent(shareOf(style, "shuffle"))}</strong> are on shuffle
            {device ? (
              <>
                , and most happen on <strong>{device.label}</strong>
              </>
            ) : null}
            .
          </>
        ) : (
          "No listening in this period."
        )}
      </Section.Text>
      <HowYouListenCard style={style} platforms={platforms} className="mt-3" />
    </Section>
  );
};
