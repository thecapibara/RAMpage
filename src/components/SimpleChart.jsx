import React from 'react';

const SimpleChart = React.memo(({ data, color, max, label, unit }) => {
    if (!data || data.length < 2) return <div className="h-full flex items-center justify-center text-xs text-slate-600">Waiting for data...</div>;
    const h = 100;
    const pts = data.map((d, i) => `${(i/(data.length-1))*100},${h - ((d/max)*h)}`).join(' ');
    const lastVal = data[data.length-1];
    const displayVal = (typeof lastVal === 'number' && !isNaN(lastVal)) ? lastVal.toFixed(1) : '0.0';
    
    return (
        <div className="relative h-full w-full overflow-hidden">
             <svg viewBox={`0 0 100 ${h}`} className="w-full h-full" preserveAspectRatio="none">
                <path d={`M 0 ${h} L ${pts} L 100 ${h} Z`} fill={color} fillOpacity="0.2" />
                <polyline points={pts} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
             </svg>
             <div className="absolute top-1 right-2 text-[10px] font-mono font-bold" style={{color}}>{displayVal} {unit}</div>
             <div className="absolute top-1 left-2 text-[10px] font-bold text-slate-500 uppercase">{label}</div>
        </div>
    );
});

SimpleChart.displayName = 'SimpleChart';

export default SimpleChart;
