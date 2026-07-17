import type { StateCreator } from "zustand";

export interface SessionSlice {
    sessions: Session[];
    activeSessionId: string | null;
    messages: Record<string, Message[]>;
    sessionLoading: boolean;
    setSessions: (sessions: Session[]) => void;
    setActiveSession: (id: string | null) => void;
    setMessages: (sessionId: string, messages: Message[]) => void;
    appendMessage: (sessionId: string, message: Message) => void;
}

export const createSessionSlice: StateCreator<SessionSlice> = (set) => ({
    sessions: [],
    activeSessionId: null,
    messages: {},
    sessionLoading: false,
    setSessions: (s) => set({ sessions: s }),
    setActiveSession: (id) => set({ activeSessionId: id }),
    setMessages: (id, msgs) =>
        set((s) => ({ messages: { ...s.messages, [id]: msgs } })),
    appendMessage: (id, msg) =>
        set((s) => ({
            messages: {
                ...s.messages,
                [id]: [...(s.messages[id] || []), msg],
            },
        })),
});
