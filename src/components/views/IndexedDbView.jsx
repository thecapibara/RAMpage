import React from 'react';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import Slider from '../ui/Slider';
import Icons from '../icons';

function Stat({ label, value, unit, accent }) {
  return (
    <div className="rounded-xl p-4 bg-ink-3/60 border border-line">
      <div className="label mb-1.5">{label}</div>
      <div className={`mono text-3xl font-semibold leading-none ${accent ? 'text-lime' : 'text-fox'}`}>
        {value} {unit && <span className="text-base text-fox-3">{unit}</span>}
      </div>
    </div>
  );
}

export default function IndexedDbView({
  idbActive, idbStats,
  idbChunk, idbStores,
  setIdbChunk, setIdbStores,
  startIdbFlood, stopIdbFlood,
}) {
  const running = idbActive;

  return (
    <div className="space-y-4">
      <Panel title="IndexedDB flood" status={running ? 'active' : 'idle'}>
        {/* stat grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Stat label="Stored" value={idbStats.storedMB.toFixed(0)} unit="MB" accent={running} />
          <Stat label="Objects" value={idbStats.objects.toLocaleString()} />
          <Stat label="Speed" value={idbStats.speed.toFixed(0)} unit="MB/s" accent={running} />
          <Stat label="Stores" value={idbStats.openStores} unit={`/ ${idbStores}`} />
        </div>

        {/* chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="chip mono">{idbChunk} MB blobs</span>
          <span className="chip mono">{idbStores} object stores</span>
          <span className="chip mono">structured-clone on every put</span>
          <span className="chip mono">
            {running ? <span className="text-red">quota-grind</span> : 'read-write'}
          </span>
        </div>

        {/* controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <Slider
            label="Blob size"
            value={idbChunk}
            min={1} max={64} step={1}
            suffix=" MB"
            onChange={setIdbChunk}
            disabled={running}
          />
          <Slider
            label="Stores in parallel"
            value={idbStores}
            min={1} max={20} step={1}
            onChange={setIdbStores}
            disabled={running}
          />
        </div>

        {!idbActive ? (
          <Button variant="primary" icon="Database" onClick={startIdbFlood}>
            Start flooding
          </Button>
        ) : (
          <Button variant="destructive" icon="Square" onClick={stopIdbFlood}>
            Stop · {idbStats.storedMB.toFixed(0)} MB stored
          </Button>
        )}
      </Panel>

      <div className="glass rounded-xl p-4 flex items-start gap-3">
        <Icons.ShieldAlert size={16} className="text-amber shrink-0 mt-0.5" />
        <p className="text-xs text-fox-2 leading-relaxed">
          Stores <span className="mono text-fox">{idbChunk} MB</span> Blob objects across
          <span className="mono text-fox"> {idbStores}</span> parallel IndexedDB stores.
          Each <span className="mono text-fox">put()</span> triggers a structured clone of the blob
          payload — distinct from OPFS bypass path — hammering the serialization layer, quota enforcer
          and transient storage allocator until the browser raises <span className="mono text-fox">QuotaExceededError</span>.
          Stop clears the database (deletes the rampage_idb database). Keep an eye on the browser's site
          data panel: storage quota is reported against the origin, not the device.
        </p>
      </div>
    </div>
  );
}