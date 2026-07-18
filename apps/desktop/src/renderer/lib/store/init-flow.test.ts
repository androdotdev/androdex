import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "../store.js";

describe("ensureActiveSession — creates session on demand", () => {
  beforeEach(() => {
    useStore.setState({
      sessions: [],
      activeSessionId: null,
      messages: {},
      sessionLoading: false,
      terminalOpen: false,
      diffOpen: false,
      diffMode: "working",
      agentMode: "auto",
      model: "",
    } as any);
  });

  it("should create a local session when activeSessionId is null (RED — method missing)", () => {
    const state = useStore.getState() as any;
    expect(state.activeSessionId).toBeNull();

    // This method doesn't exist yet — it should auto-create a session
    state.ensureActiveSession();

    const s = useStore.getState() as any;
    expect(s.activeSessionId).not.toBeNull();
    expect(typeof s.activeSessionId).toBe("string");
    expect(s.sessions).toHaveLength(1);
    expect(s.sessions[0].id).toBe(s.activeSessionId);
  });
});
