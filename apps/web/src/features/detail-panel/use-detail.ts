import { useNavigate, useSearch } from "@tanstack/react-router";
import { createContext, useContext } from "react";

import { formatTrail, parseTrail, type Detail } from "./trail";

export const DetailNested = createContext(false);

export const useDetail = () => {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const nested = useContext(DetailNested);

  const trail = parseTrail("detail" in search ? search.detail : undefined);
  const go = (next: Detail[]) =>
    navigate({ to: ".", search: (prev) => ({ ...prev, detail: formatTrail(next) }) });

  return {
    trail,
    current: trail.at(-1),
    open: (detail: Detail) => go(nested ? [...trail, detail] : [detail]),
    show: go,
    back: () => go(trail.slice(0, -1)),
    close: () => go([]),
  };
};
