import React from 'react';
import Icons from '../icons';

const VARIANTS = {
  primary: 'bg-fox text-ink-1 font-semibold hover:bg-white',
  destructive: 'bg-red/15 text-red border border-red/40 hover:bg-red/25',
  secondary: 'bg-white/[.03] border border-line text-fox-2 hover:text-fox hover:border-line-strong',
  ghost: 'text-fox-2 hover:text-fox',
};

export default function Button({ variant = 'primary', icon, children, className = '', ...props }) {
  const Icon = icon ? Icons[icon] : null;
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${className}`}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}