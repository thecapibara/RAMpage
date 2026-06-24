import React from 'react';
import Icons from './icons';
import StatusDot from './ui/StatusDot';

const NAV = [
  { view: 'RAM',     label: 'RAM & CPU',  icon: 'Cpu' },
  { view: 'STORAGE', label: 'Storage',    icon: 'HardDrive' },
  { view: 'GPU',     label: 'GPU',        icon: 'Monitor' },
  { view: 'NETWORK', label: 'Network',    icon: 'Wifi' },
  { view: 'BENCH',   label: 'Benchmarks', icon: 'Trophy' },
];

export default function Sidebar({ view, onViewChange, status, activeViews, onReset }) {
  return (
    <aside className="glass w-60 shrink-0 m-3 mr-0 rounded-xl flex flex-col overflow-hidden">
      <div className="px-4 py-4 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-line bg-ink-1">
            <Icons.Zap size={16} className="text-lime" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-display text-[14px] font-bold tracking-[0.08em] leading-none">
              <span className="text-lime">RAM</span><span className="text-fox">PAGE</span><span className="text-red">!</span>
            </h1>
            <div className="mono text-[9px] text-fox-3 mt-1.5 tracking-tight">v4.5 • Full Stress Suite • JustGL</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const Icon = Icons[item.icon];
          const isActive = view === item.view;
          const isRunning = activeViews.includes(item.view);
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/[.05] text-fox'
                  : 'text-fox-2 hover:text-fox hover:bg-white/[.03]'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-lime' : ''} />
              <span className="flex-1 text-left">{item.label}</span>
              {isRunning && <StatusDot state="active" />}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-line space-y-2.5">
        <div className="flex items-center gap-2 px-1 text-xs">
          <StatusDot state={status} />
          <span className="uppercase tracking-wide font-semibold text-fox-2">{status}</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium bg-white/[.03] border border-line text-fox-2 hover:text-red hover:border-red/40 transition-colors"
        >
          <Icons.RotateCcw size={13} />
          Emergency reset
        </button>
      </div>
    </aside>
  );
}