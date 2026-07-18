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

// Selector-scoped hooks: each component selects only what it needs,
// preventing unnecessary re-renders when unrelated slices change.
export function useUiStore<T>(selector: (state: UiSlice) => T): T {
  return useStore((s) => selector(s as UiSlice));
}
export function useSessionStore<T>(selector: (state: SessionSlice) => T): T {
  return useStore((s) => selector(s as SessionSlice));
}
export function useInputStore<T>(selector: (state: InputSlice) => T): T {
  return useStore((s) => selector(s as InputSlice));
}
