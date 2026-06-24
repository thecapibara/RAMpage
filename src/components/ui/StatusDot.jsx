import React from 'react';

const STATES = {
  idle:   { dot: 'bg-fox-3' },
  active: { dot: 'bg-lime' },
  error:  { dot: 'bg-red' },
};

export default function StatusDot({ state = 'idle', className = '' }) {
  const s = STATES[state] || STATES.idle;
  return <span className={`inline-block w-2 h-2 rounded-full ${s.dot} ${className}`} />;
}