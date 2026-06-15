import type { StateCreator } from "zustand";

export interface InputSlice {
    promptInput: string;
    setPromptInput: (value: string) => void;
}
export const createInputSlice: StateCreator<InputSlice> = (set) => ({
    promptInput: "",
    setPromptInput: (value) => set({ promptInput: value }),
});
