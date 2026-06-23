import React from 'react';

export default function Segmented({ options, value, onChange, disabled }) {
  return (
    <div className="inline-flex gap-1 p-1 bg-[#0A0A0C] rounded-lg border border-[#232327]">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            value === opt.value
              ? 'bg-[#34D399]/15 text-[#34D399]'
              : 'text-[#8B8B92] hover:text-[#ECECEC]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
