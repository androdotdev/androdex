import type { StateCreator } from "zustand";

export interface SessionSlice {
    sessions: Session[];
    activeSessionId: string | null;
    messages: Record<string, Message[]>;
    sessionLoading: boolean;
    setSessions: (sessions: Session[]) => void;
    setActiveSession: (id: string | null) => void;
    ensureActiveSession: () => string;
    setMessages: (sessionId: string, messages: Message[]) => void;
}

export const createSessionSlice: StateCreator<SessionSlice> = (set, get) => ({
    sessions: [],
    activeSessionId: null,
    messages: {},
    sessionLoading: false,
    setSessions: (s) => set({ sessions: s }),
    setActiveSession: (id) => set({ activeSessionId: id }),
    ensureActiveSession: () => {
        const current = get().activeSessionId;
        if (current) return current;
        const id = "session-" + Date.now();
        const session = { id, title: "default", agent: "auto", model: "", directory: ".", state: "open", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        set((s) => ({ sessions: [session, ...s.sessions], activeSessionId: id }));
        return id;
    },
    setMessages: (id, msgs) =>
        set((s) => ({ messages: { ...s.messages, [id]: msgs } })),
});
