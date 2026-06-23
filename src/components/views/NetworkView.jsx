import React from 'react';
import Panel from '../ui/Panel';
import Button from '../ui/Button';

export default function NetworkView({ netActive, netStats, runNetworkStress, stopNetworkStress }) {
  const running = netActive;
  return (
    <Panel title="Network storm" status={running ? 'active' : 'idle'}>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-[#1A1A1E] border border-[#232327]">
          <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-1">Speed</div>
          <div className={`text-3xl font-mono font-semibold ${running ? 'text-[#34D399]' : 'text-[#ECECEC]'}`}>
            {netStats.speed.toFixed(1)}
            <span className="text-sm text-[#5A5A62] ml-1">Mbps</span>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-[#1A1A1E] border border-[#232327]">
          <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-1">Burned</div>
          <div className={`text-3xl font-mono font-semibold ${running ? 'text-[#34D399]' : 'text-[#ECECEC]'}`}>
            {netStats.total.toFixed(0)}
            <span className="text-sm text-[#5A5A62] ml-1">MB</span>
          </div>
        </div>
      </div>
      {!netActive ? (
        <Button variant="primary" icon="DownloadCloud" onClick={runNetworkStress}>Burn traffic</Button>
      ) : (
        <Button variant="destructive" icon="Square" onClick={stopNetworkStress}>Stop network</Button>
      )}
    </Panel>
  );
}
