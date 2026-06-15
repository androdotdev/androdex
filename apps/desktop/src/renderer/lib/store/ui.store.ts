import type { StateCreator } from "zustand";

export interface UiSlice {
    terminalOpen: boolean;
    diffOpen: boolean;
    diffMode: "working" | "branch";
    agentMode: "plan" | "build" | "auto";
    model: string;
    toggleTerminal: () => void;
    toggleDiff: () => void;
    setDiffMode: (mode: "working" | "branch") => void;
    setAgentMode: (mode: "plan" | "build" | "auto") => void;
    setModel: (model: string) => void;
}
export const createUiSlice: StateCreator<UiSlice> = (set) => ({
    terminalOpen: false,
    diffOpen: false,
    diffMode: "working",
    agentMode: "auto",
    model: "",
    toggleTerminal: () => set((s) => ({ terminalOpen: !s.terminalOpen })),
    toggleDiff: () => set((s) => ({ diffOpen: !s.diffOpen })),
    setDiffMode: (mode) => set({ diffMode: mode }),
    setAgentMode: (mode) => set({ agentMode: mode }),
    setModel: (model) => set({ model }),
});
