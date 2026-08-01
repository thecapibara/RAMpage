import React, { useState } from 'react';
import Icons from './icons';

export default function LogsPanel({ logs }) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const last = logs[0];

  const copyLogs = async () => {
    const text = logs.slice().reverse().map(l => `${l.time} ${l.text}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* clipboard API unsupported */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="mt-4 glass rounded-xl overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-line bg-ink-1/40">
        <div className="flex items-center gap-2">
          <Icons.Terminal size={13} className="text-fox-3" />
          <span className="label">event log</span>
          {logs.length > 0 && (
            <span className="mono text-[10px] text-fox-3">{logs.length} entries</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={copyLogs}
            disabled={logs.length === 0}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-fox-3 hover:text-fox bg-transparent hover:bg-white/[.04] border border-transparent hover:border-line transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Copy logs to clipboard"
          >
            {copied ? <Icons.Check size={12} className="text-lime" /> : <Icons.Copy size={12} />}
            <span>{copied ? 'copied' : 'copy'}</span>
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center justify-center rounded-md px-1.5 py-1 text-fox-3 hover:text-fox bg-transparent hover:bg-white/[.04] border border-transparent hover:border-line transition-colors"
            title={open ? 'Hide' : 'Show'}
          >
            <Icons.ChevronDown size={14} className={open ? '' : '-rotate-90'} />
          </button>
        </div>
      </div>

      {/* body */}
      {open && (
        <div className="selectable px-4 py-3 max-h-56 overflow-y-auto mono text-[11px] leading-relaxed">
          {logs.length === 0 ? (
            <div className="text-fox-3 flex items-center gap-2">
              <span className="text-fox-3">&gt;</span> system ready…
            </div>
          ) : (
            logs.map((l, i) => {
              const s = String(l.text ?? l);
              const isError = l.type === 'error' || s.includes('Error');
              const isWarn = l.type === 'warn' || s.includes('warning') || s.includes('Warning');
              const isHash = s.includes('⛏️');
              const isOk = l.type === 'success' || s.includes('success') || s.includes('Complete') || isHash;
              const cls = isError ? 'text-red' : isOk ? 'text-lime' : isWarn ? 'text-amber' : 'text-fox-2';
              const time = l.time ?? (s.match(/^\[([^\]]+)\]/)?.[0] ?? '---------');
              const rest = l.time ? l.text : (s.match(/^\[[^\]]+\]\s*(.*)/)?.[1] ?? s);
              return (
                <div key={i} className="flex gap-2 py-0.5 hover:bg-white/[.02] -mx-2 px-2 rounded transition-colors">
                  <span className="text-fox-3 shrink-0 select-none">{time}</span>
                  <span className={cls}>{rest}</span>
                </div>
              );
            })
          )}
        </div>
      )}
      {!open && last && (
        <div className="px-4 py-2.5 mono text-xs text-fox-2 truncate">
          <span className="text-fox-3">&gt;</span> {last.time} {last.text}
        </div>
      )}
    </div>
  );
}