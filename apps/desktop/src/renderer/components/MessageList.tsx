import { useSessionStore } from "../lib/store";

export function MessageList() {
  const activeSessionId = useSessionStore((s) => s.activeSessionId);
  const messages = useSessionStore((s) => s.messages);
  const msgs = activeSessionId ? messages[activeSessionId] || [] : [];

  if (!activeSessionId) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        Let's build
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {msgs.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-8">No messages yet</p>
      )}
      {msgs.map((m) => (
        <div
          key={m.id}
          className={`max-w-2xl mx-auto p-3 rounded-lg text-sm ${
            m.role === "user"
              ? "bg-slate-800 text-slate-100 ml-auto"
              : "bg-slate-900 text-slate-200"
          }`}
        >
          <div className="text-xs text-slate-500 mb-1">{m.role}</div>
          <div className="whitespace-pre-wrap">{m.content}</div>
          {m.toolCalls?.map((t) => (
            <div key={t.id} className="mt-2 p-2 rounded bg-black/30 text-xs font-mono">
              <span className="text-cyan-400">{t.tool}</span> {t.command}
              {t.output && <pre className="mt-1 text-slate-400 whitespace-pre-wrap">{t.output}</pre>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
