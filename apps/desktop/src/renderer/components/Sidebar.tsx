import { useState } from "react";
import { useSessionStore, useUiStore } from "../lib/store";

export function Sidebar() {
  const sessions = useSessionStore((s) => s.sessions);
  const activeSessionId = useSessionStore((s) => s.activeSessionId);
  const setActiveSession = useSessionStore((s) => s.setActiveSession);
  const setSessions = useSessionStore((s) => s.setSessions);
  const model = useUiStore((s) => s.model);
  const agentMode = useUiStore((s) => s.agentMode);
  const [createError, setCreateError] = useState<string | null>(null);

  const createNew = async () => {
    setCreateError(null);
    try {
      const res = await window.api.createSession({
        title: "new thread",
        agent: agentMode,
        model: model || undefined,
        directory: ".",
      });
      if (res.data) {
        setSessions([res.data, ...sessions]);
        setActiveSession(res.data.id);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create session";
      console.error("Sidebar createSession error:", e);
      setCreateError(msg);
      setTimeout(() => setCreateError(null), 4000);
    }
  };

  return (
    <aside className="w-64 h-full border-r border-slate-800 bg-slate-950 flex flex-col">
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-200">Threads</span>
        <button
          onClick={createNew}
          className="text-xs px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white"
        >
          + New
        </button>
      </div>
      {createError && (
        <div className="px-3 py-2 text-xs text-rose-400 bg-rose-950/30 border-b border-rose-900/30">
          {createError}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.length === 0 && (
          <p className="text-xs text-slate-500 px-2 py-4 text-center">No sessions yet</p>
        )}
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSession(s.id)}
            className={`w-full text-left px-2 py-2 rounded text-xs truncate ${
              activeSessionId === s.id
                ? "bg-slate-800 text-cyan-400"
                : "text-slate-300 hover:bg-slate-900"
            }`}
          >
            {s.title || "Untitled"}
          </button>
        ))}
      </div>
    </aside>
  );
}
