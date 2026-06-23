import React from 'react';

const STATES = {
  idle:   { dot: 'bg-[#5A5A62]', ring: '' },
  active: { dot: 'bg-[#34D399]', ring: 'shadow-[0_0_8px_#34D399]' },
  error:  { dot: 'bg-[#F87171]', ring: '' },
};

export default function StatusDot({ state = 'idle', className = '' }) {
  const s = STATES[state] || STATES.idle;
  return <span className={`inline-block w-2 h-2 rounded-full ${s.dot} ${s.ring} ${className}`} />;
}
