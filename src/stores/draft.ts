import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
type Draft = { roomId: string; date: string; slotId: string; savedAt: number };
export const useDraft = create<{
  draft: Draft | null;
  save: (draft: Omit<Draft, "savedAt">) => void;
  clear: () => void;
}>()(
  persist(
    (set) => ({
      draft: null,
      save: (draft) => set({ draft: { ...draft, savedAt: Date.now() } }),
      clear: () => set({ draft: null }),
    }),
    {
      name: "studyspace-draft-v1",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
