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
    <aside className="w-60 shrink-0 bg-[#0A0A0C] border-r border-[#232327] flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#232327]">
        <h1 className="text-lg font-semibold text-[#ECECEC] tracking-wide">
          <span className="text-[#34D399]">RAM</span>PAGE!
        </h1>
        <div className="text-[10px] text-[#5A5A62] uppercase tracking-[0.2em] mt-0.5">stress suite</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {NAV.map((item) => {
          const Icon = Icons[item.icon];
          const isActive = view === item.view;
          const isRunning = activeViews.includes(item.view);
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors border-l-2 ${
                isActive
                  ? 'bg-[#34D399]/5 text-[#ECECEC] border-[#34D399]'
                  : 'text-[#8B8B92] hover:text-[#ECECEC] hover:bg-[#161618] border-transparent'
              }`}
            >
              <Icon size={16} />
              <span className="flex-1 text-left">{item.label}</span>
              {isRunning && <StatusDot state="active" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#232327] space-y-3">
        <div className="flex items-center gap-2 text-xs text-[#8B8B92]">
          <StatusDot state={status} />
          <span className="uppercase tracking-wide">{status}</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-[#5A5A62] hover:text-[#F87171] transition-colors"
        >
          Reset all…
        </button>
      </div>
    </aside>
  );
}
