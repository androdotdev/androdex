import { useState } from "react";
import { useInputStore, useSessionStore } from "../lib/store";

export function PromptInput() {
  const promptInput = useInputStore((s) => s.promptInput);
  const setPromptInput = useInputStore((s) => s.setPromptInput);
  const activeSessionId = useSessionStore((s) => s.activeSessionId);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!promptInput.trim() || !activeSessionId || sending) return;
    setSending(true);
    setError(null);
    try {
      await window.api.promptSession(activeSessionId, [
        { type: "text", text: promptInput },
      ]);
      setPromptInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950 p-3">
      {error && (
        <p className="text-xs text-rose-400 mb-2 px-1">{error}</p>
      )}
      <div className="flex gap-2">
        <textarea
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask anything..."
          rows={2}
          className="flex-1 resize-none bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-600"
        />
        <button
          onClick={send}
          disabled={sending || !activeSessionId}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
