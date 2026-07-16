import { useUiStore } from "../lib/store";

export function DiffPanel() {
  const { diffOpen, diffMode, setDiffMode } = useUiStore();
  if (!diffOpen) return null;

  return (
    <div className="w-80 border-l border-slate-800 bg-slate-950 flex flex-col">
      <div className="p-3 border-b border-slate-800 flex items-center gap-2">
        <span className="text-sm text-slate-200">Diff</span>
        <div className="ml-auto flex gap-1">
          {(["working", "branch"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setDiffMode(m)}
              className={`text-xs px-2 py-1 rounded capitalize ${
                diffMode === m ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3 text-xs font-mono text-slate-400">
        <p className="text-slate-600">No diff loaded</p>
      </div>
    </div>
  );
}
