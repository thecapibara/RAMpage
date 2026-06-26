import React from 'react';
import Icons from './icons';
import StatusDot from './ui/StatusDot';

const NAV = [
  { view: 'RAM',     label: 'RAM & CPU',  icon: 'Cpu' },
  { view: 'STORAGE', label: 'Storage',    icon: 'HardDrive' },
  { view: 'GPU',     label: 'GPU',        icon: 'Monitor' },
  { view: 'NETWORK', label: 'Network',    icon: 'Wifi' },
  { view: 'WEBRTC',  label: 'WebRTC',     icon: 'Share2' },
  { view: 'IDB',     label: 'IndexedDB',  icon: 'Database' },
  { view: 'SW',      label: 'SW hammer',  icon: 'Bolt' },
  { view: 'AUDIO',   label: 'Audio',      icon: 'Flame' },
  { view: 'PIXEL',   label: 'Pixel 2D',   icon: 'Aperture' },
  { view: 'BENCH',   label: 'Benchmarks', icon: 'Trophy' },
];

export default function Sidebar({
  view, onViewChange, status, activeViews, onReset,
  isMobile, open, onClose,
  mobileDisabled = [], // array of view ids unavailable on mobile
}) {
  const asideClass = isMobile
    ? `glass fixed z-50 inset-y-3 left-3 w-72 max-w-[85vw] rounded-xl flex flex-col overflow-hidden transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-[110%]'}`
    : 'glass w-60 shrink-0 m-3 mr-0 rounded-xl flex flex-col overflow-hidden';

  return (
    <>
      {/* mobile overlay */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside className={asideClass}>
        <div className="px-4 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-line bg-ink-1">
              <Icons.Zap size={16} className="text-lime" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-display text-[14px] font-bold tracking-[0.08em] leading-none">
                <span className="text-lime">RAM</span><span className="text-fox">PAGE</span><span className="text-red">!</span>
              </h1>
              <div className="mono text-[9px] text-fox-3 mt-1.5 tracking-tight">v5.1 • Full Stress Suite • JustGL</div>
            </div>
          </div>
          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-fox-3 hover:text-fox hover:bg-white/[.06] transition-colors"
              aria-label="Close menu"
            >
              <Icons.X size={18} />
            </button>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = Icons[item.icon];
            const isActive = view === item.view;
            const isRunning = activeViews.includes(item.view);
            const disabled = mobileDisabled.includes(item.view);
            return (
              <button
                key={item.view}
                type="button"
                disabled={isMobile && disabled}
                onClick={() => {
                  if (isMobile && disabled) return;
                  onViewChange(item.view);
                  if (isMobile) onClose?.();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isMobile && disabled
                    ? 'text-fox-3 opacity-40 cursor-not-allowed'
                    : isActive
                      ? 'bg-white/[.05] text-fox'
                      : 'text-fox-2 hover:text-fox hover:bg-white/[.03]'
                }`}
                title={isMobile && disabled ? 'Not available on mobile' : item.label}
              >
                <Icon size={16} className={isActive && !(isMobile && disabled) ? 'text-lime' : ''} />
                <span className="flex-1 text-left">{item.label}</span>
                {isMobile && disabled && <Icons.Box size={12} className="text-fox-3" />}
                {!disabled && isRunning && <StatusDot state="active" />}
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
    </>
  );
}