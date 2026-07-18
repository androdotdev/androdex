import { useEffect, useState } from "react";
import { useUiStore } from "../lib/store";

interface ProviderInfo {
  id: string;
  name: string;
  source: string;
  hasKey: boolean;
}

export function SettingsPanel() {
  const settingsOpen = useUiStore((s) => s.settingsOpen);
  const toggleSettings = useUiStore((s) => s.toggleSettings);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!settingsOpen) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await window.api.getProviders();
        const list: any[] = res.data || [];
        setProviders(
          list.map((p: any) => ({
            id: p.id,
            name: p.name,
            source: p.source,
            hasKey: !!p.key,
          })),
        );
        const keys: Record<string, string> = {};
        for (const p of list) {
          if (p.key) keys[p.id] = "••••••••";
        }
        setApiKeys(keys);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to load providers",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [settingsOpen]);

  const handleSave = async (providerId: string) => {
    const raw = apiKeys[providerId];
    if (!raw || raw === "••••••••" || raw.trim() === "") return;
    setSaving(providerId);
    setSaved(false);
    setError(null);
    try {
      await window.api.updateConfig({
        provider: {
          [providerId]: { options: { apiKey: apiKeys[providerId] } },
        },
      });
      setSaved(true);
      // Update the display to show the mask now that it's saved
      setApiKeys((k) => ({ ...k, [providerId]: "••••••••" }));
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to save provider",
      );
    } finally {
      setSaving(null);
    }
  };

  if (!settingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">Provider Settings</h2>
          <button onClick={toggleSettings} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <p className="text-xs text-rose-400 bg-rose-950/30 px-3 py-2 rounded border border-rose-900/30">{error}</p>
          )}
          {loading ? (
            <p className="text-xs text-slate-500 text-center py-8">Loading providers…</p>
          ) : providers.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No providers found. Make sure the opencode server is running.</p>
          ) : (
            providers.map((p) => (
              <div key={p.id} className="border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-slate-200">{p.name}</span>
                    <span className={`ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      p.hasKey ? "bg-emerald-900/50 text-emerald-400" : "bg-slate-800 text-slate-500"
                    }`}>
                      {p.hasKey ? "configured" : "no key"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-600 uppercase">{p.source}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder={p.hasKey ? "Enter new key to replace…" : "Paste your API key…"}
                    value={apiKeys[p.id] ?? ""}
                    onChange={(e) => setApiKeys((k) => ({ ...k, [p.id]: e.target.value }))}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-600"
                  />
                  <button
                    onClick={() => handleSave(p.id)}
                    disabled={saving === p.id || !apiKeys[p.id] || apiKeys[p.id] === "••••••••"}
                    className="px-3 py-1.5 rounded text-xs bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white whitespace-nowrap"
                  >
                    {saving === p.id ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          {saved ? (
            <span className="text-xs text-emerald-400">✓ Saved</span>
          ) : (
            <span className="text-xs text-slate-600">Keys are stored server-side via opencode config</span>
          )}
          <button onClick={toggleSettings} className="text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700">Close</button>
        </div>
      </div>
    </div>
  );
}
