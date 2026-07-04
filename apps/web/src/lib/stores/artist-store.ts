import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Catalog } from "@/components/catalog/catalog";

type ArtistState = {
  artist: Pick<Catalog, "id" | "name" | "image"> | null;
  setArtist: (artist: Pick<Catalog, "id" | "name" | "image"> | null) => void;
};

export const useArtistStore = create(
  persist<ArtistState>(
    (set) => ({
      artist: null,
      setArtist: (artist) => set({ artist }),
    }),
    {
      name: "harmony-selected-artist",
    },
  ),
);
