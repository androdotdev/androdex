import { useState } from "react";
import { useInputStore } from "../lib/store";
import { useSessionStore } from "../lib/store";

export function PromptInput() {
  const { promptInput, setPromptInput } = useInputStore();
  const { activeSessionId } = useSessionStore();
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!promptInput.trim() || !activeSessionId || sending) return;
    setSending(true);
    try {
      await window.api.promptSession(activeSessionId, [
        { type: "text", text: promptInput },
      ]);
      setPromptInput("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950 p-3">
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
