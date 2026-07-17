import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "../store.js";

describe("renderer store slices", () => {
  beforeEach(() => {
    // reset store to initial state between tests
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

  it("session slice: setSessions populates and setActiveSession selects", () => {
    const s = useStore.getState() as any;
    s.setSessions([{ id: "a", title: "t", agent: "x", model: "m", directory: "/", state: "open", createdAt: "", updatedAt: "" }]);
    expect(useStore.getState().sessions).toHaveLength(1);
    useStore.getState().setActiveSession("a");
    expect(useStore.getState().activeSessionId).toBe("a");
  });

  it("session slice: setMessages stores per-session keyed map", () => {
    const msg = { id: "m1", role: "user", content: "hi", timestamp: "", toolCalls: [], status: "done" } as any;
    useStore.getState().setMessages("a", [msg]);
    expect((useStore.getState().messages as any)["a"]).toHaveLength(1);
  });

  it("ui slice: toggleTerminal flips terminalOpen", () => {
    const before = useStore.getState().terminalOpen;
    useStore.getState().toggleTerminal();
    expect(useStore.getState().terminalOpen).toBe(!before);
  });

  it("ui slice: setModel updates model field", () => {
    useStore.getState().setModel("claude-sonnet");
    expect(useStore.getState().model).toBe("claude-sonnet");
  });

  it("ui slice: setAgentMode accepts plan/build/auto", () => {
    useStore.getState().setAgentMode("plan");
    expect(useStore.getState().agentMode).toBe("plan");
  });
});
