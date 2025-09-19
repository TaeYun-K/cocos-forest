import { create } from "zustand";
import type { Cell } from "../types/forest";

type UIState = {
  selected: Cell | null;
  modalVisible: boolean;
  showHitbox: boolean;
  showCocoTip: boolean;
  setSelected: (c: Cell | null) => void;
  setModalVisible: (v: boolean) => void;
  toggleHitbox: () => void;
  toggleCocoTip: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  selected: null,
  modalVisible: false,
  showHitbox: true,
  showCocoTip: false,
  setSelected: (c) => set({ selected: c }),
  setModalVisible: (v) => set({ modalVisible: v }),
  toggleHitbox: () => set((s) => ({ showHitbox: !s.showHitbox })),
  toggleCocoTip: () => set((s) => ({ showCocoTip: !s.showCocoTip })),
}));
