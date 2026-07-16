import { useUiStore } from "../lib/store";

const MODES = ["plan", "build", "auto"] as const;

export function TopBar() {
  const { agentMode, setAgentMode, toggleDiff, diffOpen } = useUiStore();

  return (
    <div className="h-12 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => setAgentMode(m)}
            className={`text-xs px-3 py-1 rounded capitalize ${
              agentMode === m
                ? "bg-cyan-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <button
        onClick={toggleDiff}
        className={`text-xs px-3 py-1 rounded ${
          diffOpen ? "bg-slate-700 text-cyan-400" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
        }`}
      >
        Diff
      </button>
    </div>
  );
}
