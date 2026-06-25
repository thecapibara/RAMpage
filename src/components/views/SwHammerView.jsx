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

const MODES = [
  { v: 'fib',  label: 'Fibonacci' },
  { v: 'sha',  label: 'SHA-256' },
  { v: 'blob', label: 'Buffer XOR' },
  { v: 'json', label: 'JSON churn' },
];

export default function SwHammerView({
  swActive, swStats,
  swMode, swWork, swSize, swRate,
  setSwMode, setSwWork, setSwSize, setSwRate,
  startSw, stopSw, clearSw,
  swRegState,
}) {
  const running = swActive;

  return (
    <div className="space-y-4">
      <Panel title="Service worker hammer" status={running ? 'active' : 'idle'}>
        {/* registration state — only show on actual failure */}
        {swRegState !== 'ok' && swRegState !== 'init' && swRegState !== 'registered-before' && (
          <div
            className="selectable rounded-xl p-4 flex items-start gap-3 mb-6"
            style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.4)' }}
          >
            <Icons.ShieldAlert size={16} className="text-red shrink-0 mt-0.5" />
            <p className="text-xs text-fox-2 leading-relaxed">
              Service worker registration failed: <span className="mono text-fox">{swRegState}</span>.
              SW requires a secure context — open via <span className="mono text-fox">http://localhost</span>
              {' '}or <span className="mono text-fox">https://</span>.
            </p>
          </div>
        )}

        {/* stat grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Stat label="requests" value={swStats.count.toLocaleString()} accent={running} />
          <Stat label="throughput" value={swStats.rps.toFixed(0)} unit="r/s" accent={running} />
          <Stat label="SW cpu" value={swStats.cpuMs.toFixed(1)} unit="ms/req" />
          <Stat label="data back" value={swStats.bytesMB.toFixed(1)} unit="MB" />
        </div>

        {/* chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="chip mono">{swMode} work</span>
          <span className="chip mono">{swWork.toLocaleString()} iter/req</span>
          <span className="chip mono">{(swSize/1024).toFixed(0)} KB body</span>
          <span className="chip mono">{swRate} ms spacing</span>
          {running && <span className="chip mono text-lime">SW active</span>}
        </div>

        {/* mode pick */}
        <div className="mb-5">
          <div className="label mb-2">Worker mode</div>
          <div className="inline-flex flex-wrap gap-0.5 p-1 bg-ink-1 rounded-lg border border-line">
            {MODES.map((m) => (
              <button
                key={m.v}
                type="button"
                disabled={running}
                onClick={() => setSwMode(m.v)}
                className={`flex-1 min-w-max px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  swMode === m.v ? 'bg-lime/15 text-lime' : 'text-fox-2 hover:text-fox'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-fox-3 mt-1.5 leading-snug">
            {swMode === 'fib'  && 'Tight integer loop computing a Fibonacci chain with every step — pure CPU.'}
            {swMode === 'sha'  && 'Repeated SubtleCrypto SHA-256 digests — hot crypto path, both CPU + memory allocation.'}
            {swMode === 'blob' && 'Buffer XOR: fill a 64KB buffer with random and XOR the tail, repeated — allocator + raster.'}
            {swMode === 'json' && 'JSON.stringify giant nested objects + slice — string churn + serialization.'}
          </p>
        </div>

        {/* controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <Slider label="Work iterations" value={swWork} min={1000} max={500000} step={1000} onChange={setSwWork} disabled={running} />
          <Slider label="Response body" value={swSize} min={1024} max={1048576} step={1024} suffix=" B" onChange={setSwSize} disabled={running} />
          <Slider label="Request spacing" value={swRate} min={0} max={100} step={1} suffix=" ms" onChange={setSwRate} disabled={running} />
        </div>

        {/* action */}
        {!running ? (
          <div className="flex gap-3 flex-wrap">
            <Button variant="primary" icon="Bolt" onClick={startSw}>Start hammering</Button>
            {swRegState === 'ok' && (
              <Button variant="secondary" icon="Trash2" onClick={clearSw}>Unregister SW</Button>
            )}
          </div>
        ) : (
          <Button variant="destructive" icon="Square" onClick={stopSw}>Stop · {swStats.count.toLocaleString()} reqs</Button>
        )}
      </Panel>

      <div className="glass rounded-xl p-4 flex items-start gap-3">
        <Icons.ShieldAlert size={16} className="text-amber shrink-0 mt-0.5" />
        <p className="text-xs text-fox-2 leading-relaxed">
          Registers a service worker at <span className="mono text-fox">/sw-hammer.js</span> whose
          <span className="mono text-fox"> fetch</span> handler intercepts request paths under
          <span className="mono text-fox">/sw-hammer/*</span> and performs heavy synchronous work
          (CPU hot loop, SHA-256 digest churn, buffer fills, JSON serialization) before returning a
          synthetic response. The main thread fires fetches at the configured rate, which keeps the
          SW process active even when this tab is backgrounded — Chrome gives SWs up to 5 minutes of
          background life and they keep running.
        </p>
      </div>
    </div>
  );
}