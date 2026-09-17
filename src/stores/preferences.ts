import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EMPTY_FILTERS, Filters } from "../domain/model";
type Preferences = {
  filters: Filters;
  favorites: string[];
  reminders: boolean;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  toggleFavorite: (id: string) => void;
  setReminders: (enabled: boolean) => void;
};
export const usePreferences = create<Preferences>()(
  persist(
    (set) => ({
      filters: EMPTY_FILTERS,
      favorites: [],
      reminders: true,
      setFilters: (filters) =>
        set((s) => ({ filters: { ...s.filters, ...filters } })),
      resetFilters: () => set({ filters: EMPTY_FILTERS }),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((v) => v !== id)
            : [...s.favorites, id],
        })),
      setReminders: (reminders) => set({ reminders }),
    }),
    {
      name: "studyspace-preferences-v1",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
