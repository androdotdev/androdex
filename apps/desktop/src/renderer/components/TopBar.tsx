import { useEffect, useState } from "react";
import { useUiStore } from "../lib/store";

const MODES = ["plan", "build", "auto"] as const;

export function TopBar() {
  const agentMode = useUiStore((s) => s.agentMode);
  const setAgentMode = useUiStore((s) => s.setAgentMode);
  const model = useUiStore((s) => s.model);
  const setModel = useUiStore((s) => s.setModel);
  const toggleDiff = useUiStore((s) => s.toggleDiff);
  const toggleSettings = useUiStore((s) => s.toggleSettings);
  const diffOpen = useUiStore((s) => s.diffOpen);
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.api.listModels();
        const list: ModelInfo[] = res.data || [];
        const names = list.map((m) => m.id || m.name || String(m));
        setModels(names);
        // Set default model if none selected and we have models
        if (!model && names.length > 0) {
          setModel(names[0]);
        }
      } catch {
        // models API may not be available yet
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
        <span className="text-xs text-slate-600 mx-1">|</span>
        {loading ? (
          <span className="text-xs text-slate-500">models…</span>
        ) : models.length > 0 ? (
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="text-xs bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-cyan-600"
          >
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-slate-500">no models</span>
        )}
      </div>
      <button
        onClick={toggleDiff}
        className={`text-xs px-3 py-1 rounded ${
          diffOpen ? "bg-slate-700 text-cyan-400" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
        }`}
      >
        Diff
      </button>
      <button
        onClick={toggleSettings}
        className="text-xs px-3 py-1 rounded bg-slate-800 text-slate-400 hover:bg-slate-700"
      >
        Settings
      </button>
    </div>
  );
}
