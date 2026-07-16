import { useSessionStore } from "../lib/store";

export function Sidebar() {
  const { sessions, activeSessionId, setActiveSession } = useSessionStore();

  return (
    <aside className="w-64 h-full border-r border-slate-800 bg-slate-950 flex flex-col">
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-200">Threads</span>
        <button className="text-xs px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white">
          + New
        </button>
      </div>
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
