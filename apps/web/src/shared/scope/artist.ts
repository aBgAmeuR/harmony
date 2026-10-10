import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PickedArtist = {
  id: number;
  name: string;
  image: string | null;
};

type ArtistState = {
  artist: PickedArtist | null;
  setArtist: (artist: PickedArtist | null) => void;
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
