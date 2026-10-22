import { useQuery } from "@tanstack/react-query";

import { ArtistsSelect } from "@/features/pick-artist";
import { Lede } from "@/shared/primitives/lede";
import { useArtistStore, useScope } from "@/shared/scope";
import { format } from "@/utils/format";

import { listeningQueries } from "./api";

export const ListeningLede = () => {
  const scope = useScope();
  const artist = useArtistStore((s) => s.artist);
  const { data: time } = useQuery(listeningQueries.listeningTime.queryOptions(scope));
  const { data: days } = useQuery(listeningQueries.activeDays.queryOptions(scope));

  const minutes = time?.value ?? 0;
  const active = days?.value ?? 0;

  return (
    <Lede>
      <Lede.Kicker>
        <ArtistsSelect />
      </Lede.Kicker>
      {!time || !days ? (
        <Lede.Pending />
      ) : minutes === 0 ? (
        <Lede.Title>No listening in this period.</Lede.Title>
      ) : (
        <>
          <Lede.Title>
            {format.as(minutes, "minutes")}
            {artist ? ` of ${artist.name}` : ""} over {format.count(active)} active{" "}
            {active === 1 ? "day" : "days"}.
          </Lede.Title>
          {/* <Lede.Text>
            That is about <Lede.Em>{format.as(minutes / Math.max(active, 1), "minutes")}</Lede.Em>{" "}
            on each day you listened.
          </Lede.Text> */}
        </>
      )}
    </Lede>
  );
};
