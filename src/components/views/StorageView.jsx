import React from 'react';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import SimpleChart from '../SimpleChart';
import ErrorBoundary from '../ErrorBoundary';

export default function StorageView({
  storageUsed, storageCount, chartDataStorage, isFillingStorage,
  isBenchmarking, gpuBenchMode,
  fillStorage, stopStorage, clearStorage,
}) {
  const busy = isBenchmarking || gpuBenchMode !== 'NONE';
  const running = isFillingStorage;

  return (
    <Panel title="Storage" status={running ? 'active' : 'idle'}>
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="label mb-2">Written to OPFS</div>
          <div className={`metric ${running ? 'on' : ''} text-6xl leading-none`}>
            {storageUsed.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span style={{ fontSize: '1.1rem', WebkitTextFillColor: '#5E5E78', background: 'none', color: '#5E5E78' }}>MB</span>
          </div>
          <div className="text-xs mt-3 text-fox-3">{storageCount} files · 10 MB chunks · sync access handle</div>
        </div>
      </div>
      <div className="h-36 mb-6">
        <ErrorBoundary>
          <SimpleChart data={chartDataStorage} max={Math.max(2000, storageUsed * 1.2)} label="Disk Usage" unit="MB" />
        </ErrorBoundary>
      </div>
      <p className="text-xs text-fox-3 leading-relaxed mb-6">
        Writes raw 10MB chunks directly to disk via OPFS (Sync Access Handle) until quota limit is reached.
      </p>
      {!isFillingStorage ? (
        <div className="flex gap-3 flex-wrap">
          <Button variant="primary" icon="Database" onClick={fillStorage} disabled={busy}>Fill disk</Button>
          <Button variant="destructive" icon="Trash2" onClick={clearStorage} disabled={busy || storageUsed === 0}>Clean OPFS</Button>
        </div>
      ) : (
        <Button variant="destructive" icon="Square" onClick={stopStorage}>Stop fill</Button>
      )}
    </Panel>
  );
}