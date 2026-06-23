import React, { useState } from 'react';

export default function LogsPanel({ logs }) {
  const [open, setOpen] = useState(false);
  const last = logs[0];

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-[#0A0A0C] border border-[#232327] rounded-lg text-xs text-[#8B8B92] hover:text-[#ECECEC] transition-colors"
      >
        <span className="flex items-center gap-2 uppercase tracking-wide">
          <span className="text-[#5A5A62]">&gt;_</span> logs
        </span>
        <span className="text-[#5A5A62]">{open ? 'hide' : 'show'}</span>
      </button>
      {open && (
        <div className="mt-2 max-h-48 overflow-y-auto bg-[#0A0A0C] border border-[#232327] rounded-lg p-3 font-mono text-xs space-y-0.5">
          {logs.length === 0 ? (
            <div className="text-[#5A5A62]">&gt; system ready…</div>
          ) : (
            logs.map((l, i) => (
              <div key={i} className={l.includes('Error') ? 'text-[#F87171]' : 'text-[#8B8B92]'}>
                <span className="text-[#5A5A62]">&gt;</span> {l}
              </div>
            ))
          )}
        </div>
      )}
      {!open && last && (
        <div className="mt-2 px-4 py-2 bg-[#0A0A0C] border border-[#232327] rounded-lg font-mono text-xs text-[#8B8B92] truncate">
          <span className="text-[#5A5A62]">&gt;</span> {last}
        </div>
      )}
    </div>
  );
}
