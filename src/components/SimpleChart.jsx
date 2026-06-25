import React from 'react';
import { useId } from 'react';

const SimpleChart = React.memo(({ data, max, label, unit }) => {
  const gradId = useId().replace(/:/g, '');
  if (!data || data.length < 2) {
    return (
      <div className="h-full flex items-center justify-center text-[11px] uppercase tracking-widest text-fox-3">
        waiting for data…
      </div>
    );
  }
  const h = 100;
  const safeMax = max && max > 0 ? max : Math.max(...data, 1);
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * 100},${h - (Math.min(d, safeMax) / safeMax) * h}`).join(' ');
  const lastVal = data[data.length - 1];
  const displayVal = typeof lastVal === 'number' && !isNaN(lastVal) ? lastVal.toFixed(0) : '0';

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg" style={{ background: 'rgba(0,0,0,.3)', border: '1px solid rgba(255,255,255,.07)' }}>
      <div className="gridbar absolute inset-0" />
      <svg viewBox={`0 0 100 ${h}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`fill${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34D399" stopOpacity=".22" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M 0 ${h} L ${pts} L 100 ${h} Z`} fill={`url(#fill${gradId})`} />
        <polyline
          points={pts}
          fill="none"
          stroke="#34D399"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="absolute top-2 left-3 label">{label}</div>
      <div className="absolute top-2 right-3 mono text-xs font-semibold text-fox">{displayVal} {unit}</div>
    </div>
  );
});

SimpleChart.displayName = 'SimpleChart';
export default SimpleChart;