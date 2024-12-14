/* eslint-disable no-unused-vars */
import { cookieStorage } from "@repo/zustand-cookie-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ListLayoutStore {
  list_layout: "grid" | "list";
  setListLayout: (list_layout: "grid" | "list") => void;
}

export const useListLayout = create<ListLayoutStore>((set) => ({
  list_layout: "list",
  setListLayout: (list_layout) => set({ list_layout }),
}));

interface SideBarStore {
  isSidebarOpen: boolean;
  setSidebarOpen: (isSidebarOpen: boolean) => void;
}

export const useSidebar = create(
  persist<SideBarStore>(
    (set) => ({
      isSidebarOpen: false,
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
    }),
    {
      name: "sidebar",
      storage: createJSONStorage(() => cookieStorage),
    },
  ),
);

interface UserPreferencesStore {
  showEmail: boolean;
  setShowEmail: (showEmail: boolean) => void;
}

export const useUserPreferences = create(
  persist<UserPreferencesStore>(
    (set) => ({
      showEmail: true,
      setShowEmail: (showEmail) => set({ showEmail }),
    }),
    {
      name: "user-preferences",
    },
  ),
);
