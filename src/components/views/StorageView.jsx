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
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-1">Written</div>
        <div className={`text-4xl font-mono font-semibold ${running ? 'text-[#34D399]' : 'text-[#ECECEC]'}`}>
          {storageUsed.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-base text-[#5A5A62]">MB</span>
        </div>
        <div className="text-xs text-[#5A5A62] mt-1">{storageCount} files</div>
      </div>
      <div className="h-40 mb-6">
        <ErrorBoundary>
          <SimpleChart data={chartDataStorage} max={Math.max(2000, storageUsed * 1.2)} color="#34D399" label="Disk Usage" unit="MB" />
        </ErrorBoundary>
      </div>
      <p className="text-xs text-[#5A5A62] leading-relaxed mb-6">
        Writes raw 10MB chunks directly to disk via OPFS (Sync Access Handle) until quota limit.
      </p>
      {!isFillingStorage ? (
        <div className="flex gap-3">
          <Button variant="primary" icon="Database" onClick={fillStorage} disabled={busy}>Fill</Button>
          <Button variant="destructive" icon="Trash2" onClick={clearStorage} disabled={busy || storageUsed === 0}>Clean</Button>
        </div>
      ) : (
        <Button variant="destructive" icon="Square" onClick={stopStorage}>Stop fill</Button>
      )}
    </Panel>
  );
}
