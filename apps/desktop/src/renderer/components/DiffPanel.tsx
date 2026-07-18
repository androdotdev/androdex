import { useUiStore } from "../lib/store";

export function DiffPanel() {
  const diffOpen = useUiStore((s) => s.diffOpen);
  const diffMode = useUiStore((s) => s.diffMode);
  const setDiffMode = useUiStore((s) => s.setDiffMode);

  if (!diffOpen) return null;
  return (
    <div className="w-96 border-l border-slate-800 bg-slate-950 flex flex-col">
      <div className="h-12 border-b border-slate-800 flex items-center gap-2 px-3">
        <button
          onClick={() => setDiffMode("working")}
          className={`text-xs px-2 py-1 rounded ${diffMode === "working" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400"}`}
        >
          Working
        </button>
        <button
          onClick={() => setDiffMode("branch")}
          className={`text-xs px-2 py-1 rounded ${diffMode === "branch" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400"}`}
        >
          Branch
        </button>
      </div>
      <div className="flex-1 p-3 text-xs text-slate-500 overflow-auto">
        Select a session to view diff
      </div>
    </div>
  );
}
