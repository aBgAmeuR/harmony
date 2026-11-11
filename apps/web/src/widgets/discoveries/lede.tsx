import { useQuery } from "@tanstack/react-query";

import { ArtistsSelect } from "@/features/pick-artist";
import { format } from "@/shared/lib/format";
import { Lede } from "@/shared/primitives/lede";
import { useArtistStore, useScope } from "@/shared/scope";

import type { WeekPoint } from "./api";

import { discoveryQueries } from "./api";

export const DiscoveriesLede = () => {
  const filter = useScope();
  const artist = useArtistStore((s) => s.artist);
  const { data: releases } = useQuery(discoveryQueries.releases(filter));
  const { data: weeks = [] } = useQuery(discoveryQueries.weekly(filter));

  // Releases come oldest first.
  const latest = releases?.at(-1);
  const peak = weeks.reduce<WeekPoint | undefined>(
    (best, week) => (week.value > (best?.value ?? 0) ? week : best),
    undefined,
  );

  return (
    <Lede>
      <Lede.Kicker>
        <ArtistsSelect />
      </Lede.Kicker>
      {!artist ? (
        <Lede.Title>Pick an artist to line up their releases with your listening.</Lede.Title>
      ) : !releases ? (
        <Lede.Pending />
      ) : (
        <>
          <Lede.Title>Your listening of {artist.name}, release by release.</Lede.Title>
          <Lede.Text>
            {latest ? (
              <>
                <Lede.Em>{format.count(releases.length)}</Lede.Em>{" "}
                {releases.length === 1 ? "release" : "releases"} in this period, the latest is{" "}
                <Lede.Em>{latest.album}</Lede.Em>.{" "}
              </>
            ) : (
              "No releases in this period. "
            )}
            {peak ? (
              <>
                Your biggest week started on <Lede.Em>{peak.name}</Lede.Em>, with{" "}
                <Lede.Em>{format.as(peak.value, "minutes")}</Lede.Em>.
              </>
            ) : null}
          </Lede.Text>
        </>
      )}
    </Lede>
  );
};
