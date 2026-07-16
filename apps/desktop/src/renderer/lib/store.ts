import { create } from "zustand";
import { createSessionSlice, type SessionSlice } from "./store/session.store";
import { createUiSlice, type UiSlice } from "./store/ui.store";
import { createInputSlice, type InputSlice } from "./store/input.store";

type Store = SessionSlice & UiSlice & InputSlice;

export const useStore = create<Store>()((...a) => ({
  ...createSessionSlice(...a),
  ...createUiSlice(...a),
  ...createInputSlice(...a),
}));

export const useUiStore = () => useStore();
export const useSessionStore = () => useStore();
export const useInputStore = () => useStore();
