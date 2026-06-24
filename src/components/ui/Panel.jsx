import React from 'react';
import StatusDot from './StatusDot';

export default function Panel({ title, status, action, children, className = '' }) {
  return (
    <section className={`glass rounded-xl p-6 ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            {status && <StatusDot state={status} />}
            {title && <h2 className="text-sm font-semibold text-fox tracking-wide">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}