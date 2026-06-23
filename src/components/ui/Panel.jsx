import React from 'react';
import StatusDot from './StatusDot';

export default function Panel({ title, status, action, children, className = '' }) {
  return (
    <section className={`bg-[#161618] border border-[#232327] rounded-xl ${className}`}>
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#232327]">
        <div className="flex items-center gap-2.5">
          {status && <StatusDot state={status} />}
          <h2 className="text-sm font-semibold text-[#ECECEC] tracking-wide">{title}</h2>
        </div>
        {action}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}
