import React from 'react';

export default function Slider({ label, value, min, max, step = 1, onChange, disabled, suffix = '', valueClassName = 'text-fox' }) {
  const pct = ((Number(value) - Number(min)) / (Number(max) - Number(min))) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="label">{label}</span>
        <span className={`font-mono text-sm ${valueClassName}`}>{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--p': `${pct}%` }}
        className="range disabled:opacity-40"
      />
    </div>
  );
}