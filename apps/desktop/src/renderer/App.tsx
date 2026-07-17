import { useEffect, useRef, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { MessageList } from "./components/MessageList";
import { PromptInput } from "./components/PromptInput";
import { DiffPanel } from "./components/DiffPanel";
import { Terminal } from "./components/Terminal";
import { useUiStore, useSessionStore } from "./lib/store";

export default function App() {
  const terminalOpen = useUiStore((s) => s.terminalOpen);
  const toggleTerminal = useUiStore((s) => s.toggleTerminal);
  const setSessions = useSessionStore((s) => s.setSessions);
  const setActiveSession = useSessionStore((s) => s.setActiveSession);
  const setMessages = useSessionStore((s) => s.setMessages);
  const model = useUiStore((s) => s.model);
  const agentMode = useUiStore((s) => s.agentMode);
  const [initDone, setInitDone] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const initLock = useRef(false);

  // On mount: create a default session so the send button is enabled.
  // useRef lock guards against StrictMode double-fire (React 18/19 dev).
  useEffect(() => {
    if (initLock.current) return;
    initLock.current = true;
    (async () => {
      try {
        const listRes = await window.api.listSessions({ limit: 10 });
        const existing = listRes.data || [];
        if (existing.length > 0) {
          setSessions(existing);
          setActiveSession(existing[0].id);
          try {
            const msgsRes = await window.api.getSessionMessages(existing[0].id, { limit: 50 });
            if (msgsRes.data) setMessages(existing[0].id, msgsRes.data);
          } catch {}
          setInitDone(true);
          return;
        }
        const res = await window.api.createSession({
          title: "default",
          agent: agentMode,
          model: model || undefined,
          directory: ".",
        });
        if (res.data) {
          setSessions([res.data]);
          setActiveSession(res.data.id);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to initialize session";
        console.error("Androdex init error:", e);
        setInitError(msg);
      } finally {
        setInitDone(true);
      }
    })();
  }, []);

  if (!initDone) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-sm">
        {initError ? (
          <div className="text-center space-y-2">
            <p className="text-rose-400">Failed to start</p>
            <p className="text-slate-400 max-w-md">{initError}</p>
          </div>
        ) : (
          <p className="text-slate-400">Starting Androdex…</p>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-950 text-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-w-0">
            <MessageList />
            <PromptInput />
            <button
              onClick={toggleTerminal}
              className="text-xs px-3 py-1 bg-slate-900 border-t border-slate-800 text-slate-400 hover:text-cyan-400"
            >
              {terminalOpen ? "Hide Terminal" : "Show Terminal"}
            </button>
            <Terminal />
          </div>
          <DiffPanel />
        </div>
      </main>
    </div>
  );
}
