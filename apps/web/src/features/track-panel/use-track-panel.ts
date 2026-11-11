import { useNavigate, useSearch } from "@tanstack/react-router";

import { parseTrack } from "./parse";

// The open track lives in the `track` search param, so any page can show the panel and share it.
export const useTrackPanel = () => {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();

  const trackId = parseTrack("track" in search ? search.track : undefined);
  const setTrack = (id: number | undefined) =>
    navigate({ to: ".", search: (prev) => ({ ...prev, track: id }), replace: true });

  return { trackId, setTrack };
};
