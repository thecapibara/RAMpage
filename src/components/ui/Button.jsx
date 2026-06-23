import React from 'react';
import Icons from '../icons';

const VARIANTS = {
  primary: 'bg-white text-black hover:bg-[#ECECEC] font-semibold',
  destructive: 'bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/40 hover:bg-[#F87171]/25',
  secondary: 'bg-transparent border border-[#232327] text-[#8B8B92] hover:border-[#3A3A42] hover:text-[#ECECEC]',
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
