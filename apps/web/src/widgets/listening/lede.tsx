import { useQuery } from "@tanstack/react-query";

import { ArtistsSelect } from "@/features/pick-artist";
import { format } from "@/shared/lib/format";
import { Lede } from "@/shared/primitives/lede";
import { useArtistStore, useScope } from "@/shared/scope";

import { listeningQueries } from "./api";

export const ListeningLede = () => {
  const scope = useScope();
  const artist = useArtistStore((s) => s.artist);
  const { data: time } = useQuery(listeningQueries.metric({ scope, measure: "playtime" }));
  const { data: days } = useQuery(listeningQueries.metric({ scope, measure: "days" }));

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
        </>
      )}
    </Lede>
  );
};
