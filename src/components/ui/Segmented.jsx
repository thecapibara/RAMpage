import React from 'react';

export default function Segmented({ options, value, onChange, disabled, className = '' }) {
  return (
    <div className={`inline-flex flex-wrap gap-0.5 p-1 bg-ink-1 rounded-lg border border-line ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={`flex-1 min-w-max px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            value === opt.value
              ? 'bg-lime/15 text-lime'
              : 'text-fox-2 hover:text-fox'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}