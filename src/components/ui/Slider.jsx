import React, { useId } from 'react';

export default function Slider({ label, value, min, max, step = 1, onChange, disabled, suffix = '', valueClassName = 'text-fox', displayValue = null }) {
  const id = useId();
  const pct = ((Number(value) - Number(min)) / (Number(max) - Number(min))) * 100;
  // displayValue overrides the shown value for non-linear sliders (e.g. the
  // GPU resolution slider whose value is a log2 index but should read "2K").
  const shown = displayValue != null ? displayValue : `${value}${suffix}`;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label htmlFor={id} className="label">{label}</label>
        <span className={`font-mono text-sm ${valueClassName}`}>{shown}</span>
      </div>
      <input
        id={id}
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