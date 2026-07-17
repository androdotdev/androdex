import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useUiStore } from "../lib/store";

export function Terminal() {
  const terminalOpen = useUiStore((s) => s.terminalOpen);
  const toggleTerminal = useUiStore((s) => s.toggleTerminal);
  const ref = useRef<HTMLDivElement>(null);
  const term = useRef<XTerm | undefined>(undefined);

  useEffect(() => {
    if (!terminalOpen || !ref.current) return;
    const t = new XTerm({ fontSize: 12, theme: { background: "#020617" } });
    const fit = new FitAddon();
    t.loadAddon(fit);
    t.open(ref.current);
    fit.fit();
    term.current = t;
    const id = "main";
    window.api.terminalSpawn?.(id, t.cols, t.rows);
    const offData = window.api.onTerminalData?.(id, (d) => t.write(d));
    t.onData((d) => window.api.terminalWrite?.(id, d));
    const onResize = () => fit.fit();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      offData?.();
      window.api.terminalDestroy?.(id);
      t.dispose();
    };
  }, [terminalOpen]);

  if (!terminalOpen) return null;
  return (
    <div className="h-48 border-t border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between px-3 py-1 border-b border-slate-800">
        <span className="text-xs text-slate-400">Terminal</span>
        <button onClick={toggleTerminal} className="text-xs text-slate-500 hover:text-slate-300">
          ×
        </button>
      </div>
      <div ref={ref} className="p-2 h-full" />
    </div>
  );
}
