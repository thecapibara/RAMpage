import React from 'react';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import SimpleChart from '../SimpleChart';
import ErrorBoundary from '../ErrorBoundary';

function formatStorage(mb) {
  if (mb == null) return '—';
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(0)} MB`;
}

export default function StorageView({
  storageUsed, storageCount, chartDataStorage, isFillingStorage,
  isBenchmarking, gpuBenchMode,
  fillStorage, stopStorage, clearStorage, telemetry,
}) {
  const busy = isBenchmarking || gpuBenchMode !== 'NONE';
  const running = isFillingStorage;
  const usagePct = telemetry?.storageUsageMB != null && telemetry?.storageQuotaMB > 0
    ? ((telemetry.storageUsageMB / telemetry.storageQuotaMB) * 100).toFixed(1)
    : null;

  return (
    <Panel title="Storage" status={running ? 'active' : 'idle'}>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="label mb-2">Written to OPFS</div>
          <div className={`metric ${running ? 'on' : ''} text-6xl leading-none`}>
            {storageUsed.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span style={{ fontSize: '1.1rem', WebkitTextFillColor: '#5E5E78', background: 'none', color: '#5E5E78' }}>MB</span>
          </div>
          <div className="text-xs mt-3 text-fox-3">{storageCount} chunks · 10 MB chunks · sync access handle</div>
        </div>
        {telemetry && (
          <div className="text-right">
            <div className="label mb-1">Browser Storage Estimate</div>
            <div className="font-mono text-lg font-semibold text-fox">
              {formatStorage(telemetry.storageUsageMB)}
              <span className="text-fox-3 font-normal"> / {formatStorage(telemetry.storageQuotaMB)}</span>
            </div>
            <div className="font-mono text-[11px] text-fox-3 mt-1">
              {usagePct != null ? `${usagePct}% of quota` : 'quota unavailable'}
            </div>
          </div>
        )}
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
          <Button variant="destructive" icon="Trash2" onClick={clearStorage} disabled={busy}>Clean OPFS</Button>
        </div>
      ) : (
        <Button variant="destructive" icon="Square" onClick={stopStorage}>Stop fill</Button>
      )}
    </Panel>
  );
}