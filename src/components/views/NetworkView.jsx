import React from 'react';
import Panel from '../ui/Panel';
import Button from '../ui/Button';

function Card({ label, value, unit }) {
  return (
    <div className="rounded-xl p-5 bg-ink-3/60 border border-line">
      <div className="label mb-2">{label}</div>
      <div className="metric on text-5xl leading-none">
        {value} <span style={{ fontSize: '1rem', color: '#5E5E78' }}>{unit}</span>
      </div>
    </div>
  );
}

export default function NetworkView({ netActive, netStats, runNetworkStress, stopNetworkStress }) {
  const running = netActive;
  return (
    <Panel title="Network storm" status={running ? 'active' : 'idle'}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
        <Card label="Speed" value={netStats.speed.toFixed(1)} unit="Mbps" />
        <Card label="Burned" value={netStats.total.toFixed(0)} unit="MB" />
      </div>
      {!netActive ? (
        <Button variant="primary" icon="DownloadCloud" onClick={runNetworkStress}>Burn traffic</Button>
      ) : (
        <Button variant="destructive" icon="Square" onClick={stopNetworkStress}>
          Stop network · {netStats.total.toFixed(0)} MB burned
        </Button>
      )}
    </Panel>
  );
}