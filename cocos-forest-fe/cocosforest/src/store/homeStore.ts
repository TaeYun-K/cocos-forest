import { create } from "zustand";
import type { Cell } from "../types/forest";

type UIState = {
  selected: Cell | null;
  modalVisible: boolean;
  showCocoTip: boolean;
  setSelected: (c: Cell | null) => void;
  setModalVisible: (v: boolean) => void;
  toggleCocoTip: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  selected: null,
  modalVisible: false,
  showCocoTip: false,
  setSelected: (c) => set({ selected: c }),
  setModalVisible: (v) => set({ modalVisible: v }),
  toggleCocoTip: () => set((s) => ({ showCocoTip: !s.showCocoTip })),
}));
