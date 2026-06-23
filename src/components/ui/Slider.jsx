import React from 'react';

export default function Slider({ label, value, min, max, step = 1, onChange, disabled, suffix = '', valueClassName = 'text-[#ECECEC]' }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-[#8B8B92]">{label}</span>
        <span className={`font-mono ${valueClassName}`}>{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-[#232327] rounded-lg accent-[#ECECEC] disabled:opacity-40"
      />
    </div>
  );
}
