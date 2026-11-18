import React from 'react';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import Segmented from '../ui/Segmented';
import Slider from '../ui/Slider';
import SimpleChart from '../SimpleChart';
import ErrorBoundary from '../ErrorBoundary';
import Icons from '../icons';
import { MAX_LIMIT } from '../../constants';

const PRESETS = [
  {
    id: 'smoke',
    label: 'Smoke',
    meta: '512 MB · 25% · Standard',
    targetMB: 512,
    cpuLoad: 25,
    cpuMode: 'STANDARD',
    ramMode: 'LINEAR',
  },
  {
    id: 'thermal',
    label: 'Thermal',
    meta: '4096 MB · 80% · Hash',
    targetMB: 4096,
    cpuLoad: 80,
    cpuMode: 'HASH',
    ramMode: 'LINEAR',
  },
  {
    id: 'oom',
    label: 'OOM Push',
    meta: '12288 MB · 100% · Standard',
    targetMB: 12288,
    cpuLoad: 100,
    cpuMode: 'STANDARD',
    ramMode: 'LINEAR',
  },
];

export default function RamCpuView({
  allocatedMB, chartDataRAM, cpuMode, ramMode, targetMB, cpuLoad,
  isAllocating, ramHolding, isBenchmarking, gpuBenchMode, isMobile,
  minionSize, minionCount, minions, minionWebRTC,
  atomicsActive = false, atomicsMops = 0, telemetry,
  setCpuMode, setRamMode, setTargetMB, setCpuLoad,
  setMinionSize, setMinionCount, setMinionWebRTC,
  allocateMemory, stopRAM, spawnMinions, handleKillMinionsConfirm,
  startAtomics, stopAtomics,
}) {
  const busy = isBenchmarking || gpuBenchMode !== 'NONE';
  const running = isAllocating || atomicsActive;
  const hasSab = Boolean(telemetry?.hasSharedArrayBuffer);
  const atomicsThreads = Math.min(telemetry?.cores || 4, 16);

  const applyPreset = (preset) => {
    setTargetMB(preset.targetMB);
    setCpuLoad(preset.cpuLoad);
    setCpuMode(preset.cpuMode);
    setRamMode(preset.ramMode);
  };

  return (
    <Panel title="RAM & CPU" status={running ? 'active' : 'idle'}>
      {/* headline */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          {cpuMode === 'ATOMICS' ? (
            <>
              <div className="label mb-2">Atomics Contention</div>
              <div className={`metric ${atomicsActive ? 'on' : ''} text-6xl leading-none`}>
                {atomicsMops.toFixed(2)}{' '}
                <span style={{ fontSize: '1.1rem', WebkitTextFillColor: '#5E5E78', background: 'none', color: '#5E5E78' }}>
                  M ops/s
                </span>
              </div>
              <div className="flex gap-3 mt-3 text-xs text-fox-3">
                <span>threads: <span className="font-mono text-fox-2">{atomicsThreads}</span></span>
                <span>buffer: <span className="font-mono text-fox-2">1024 B SAB</span></span>
              </div>
            </>
          ) : (
            <>
              <div className="label mb-2">Allocated</div>
              <div className={`metric ${isAllocating ? 'on' : ''} text-6xl leading-none`}>
                {allocatedMB.toLocaleString()}{' '}
                <span style={{ fontSize: '1.1rem', WebkitTextFillColor: '#5E5E78', background: 'none', color: '#5E5E78' }}>
                  MB
                </span>
              </div>
              <div className="flex gap-3 mt-3 text-xs text-fox-3">
                <span>target: <span className="font-mono text-fox-2">{targetMB}</span></span>
                {cpuMode !== 'HASH' && (
                  <span>
                    cpu: <span className={`font-mono ${ramHolding ? 'text-fox-3' : 'text-lime'}`}>{ramHolding ? 0 : cpuLoad}%</span>
                    {ramHolding && <span className="ml-1.5 text-amber">(holding RAM)</span>}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* chart */}
      <div className="h-36 mb-6">
        <ErrorBoundary>
          <SimpleChart data={chartDataRAM} max={MAX_LIMIT} label="RAM Usage" unit="MB" />
        </ErrorBoundary>
      </div>

      {/* quick stress presets (idle only) */}
      {!running && !busy && (
        <div className="mb-6">
          <div className="label mb-2">Quick presets</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const active =
                targetMB === p.targetMB &&
                cpuLoad === p.cpuLoad &&
                cpuMode === p.cpuMode &&
                ramMode === p.ramMode;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    active
                      ? 'bg-lime/15 text-lime border-lime/40'
                      : 'bg-ink-1/70 text-fox-2 border-line hover:text-fox hover:border-line-strong'
                  }`}
                >
                  <span className="font-semibold">{p.label}</span>
                  <span className="font-mono text-[10px] opacity-75">{p.meta}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* mode + pattern */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="label mb-2">CPU mode</div>
          <Segmented
            className="w-full"
            options={[
              { value: 'STANDARD', label: 'Standard' },
              { value: 'HASH', label: 'Hash stress' },
              {
                value: 'ATOMICS',
                label: 'Atomics',
                disabled: !hasSab,
                title: hasSab
                  ? 'SharedArrayBuffer cache-line contention'
                  : 'Requires SharedArrayBuffer (crossOriginIsolated)',
              },
              ...(isMobile ? [] : [{ value: 'MINIONS', label: 'Minions' }]),
            ]}
            value={cpuMode}
            onChange={setCpuMode}
            disabled={running}
          />
          {!hasSab && (
            <p className="text-[11px] text-amber mt-2 flex items-center gap-1.5">
              <Icons.ShieldAlert size={12} className="shrink-0" />
              <span>
                Atomics requires <span className="font-mono">SharedArrayBuffer</span> (cross-origin isolated context).
              </span>
            </p>
          )}
        </div>
        {cpuMode !== 'MINIONS' && cpuMode !== 'ATOMICS' && (
          <div>
            <div className="label mb-2">Allocation pattern</div>
            <Segmented
              className="w-full"
              options={[
                { value: 'LINEAR', label: 'Linear' },
                { value: 'CHAOS', label: 'Chaos' },
                { value: 'WASM', label: 'WASM' },
              ]}
              value={ramMode}
              onChange={setRamMode}
              disabled={running}
            />
          </div>
        )}
      </div>

      {cpuMode === 'MINIONS' ? (
        <MinionsSub
          minionSize={minionSize}
          minionCount={minionCount}
          minions={minions}
          minionWebRTC={minionWebRTC}
          setMinionSize={setMinionSize}
          setMinionCount={setMinionCount}
          setMinionWebRTC={setMinionWebRTC}
          spawnMinions={spawnMinions}
          handleKillMinionsConfirm={handleKillMinionsConfirm}
        />
      ) : cpuMode === 'ATOMICS' ? (
        <AtomicsSub
          hasSab={hasSab}
          atomicsActive={atomicsActive}
          atomicsMops={atomicsMops}
          atomicsThreads={atomicsThreads}
          busy={busy}
          startAtomics={startAtomics}
          stopAtomics={stopAtomics}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <Slider
              label="RAM target"
              value={targetMB}
              min={256}
              max={MAX_LIMIT}
              step={64}
              suffix=" MB"
              onChange={setTargetMB}
              disabled={busy || isAllocating}
            />
            {cpuMode === 'HASH' ? (
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="label">Hash intensity</span>
                  <span className="font-mono text-sm text-lime">MAX</span>
                </div>
                <div className="w-full h-1.5 rounded-md bg-grad-accent overflow-hidden">
                  <div className="h-full w-full animate-pulse-soft" />
                </div>
              </div>
            ) : (
              <Slider
                label="CPU load"
                value={cpuLoad}
                min={0}
                max={100}
                step={5}
                suffix="%"
                onChange={setCpuLoad}
                disabled={busy || isAllocating}
                valueClassName="text-lime"
              />
            )}
          </div>

          {!isAllocating ? (
            <Button variant="primary" icon="Play" onClick={() => allocateMemory()} disabled={busy}>
              {cpuMode === 'HASH' ? 'Start hashing' : 'Start load'}
            </Button>
          ) : (
            <Button variant="destructive" icon="Square" onClick={stopRAM}>
              Stop process
            </Button>
          )}
        </>
      )}
    </Panel>
  );
}

function AtomicsSub({ hasSab, atomicsActive, atomicsMops, atomicsThreads, busy, startAtomics, stopAtomics }) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl p-3 bg-ink-3/60 border border-line">
          <div className="label mb-1">Workers</div>
          <div className="font-mono text-xl font-semibold text-fox">{atomicsThreads}</div>
        </div>
        <div className="rounded-xl p-3 bg-ink-3/60 border border-line">
          <div className="label mb-1">Throughput</div>
          <div className={`font-mono text-xl font-semibold ${atomicsActive ? 'text-lime' : 'text-fox'}`}>
            {atomicsMops.toFixed(2)} <span className="text-xs text-fox-3">M/s</span>
          </div>
        </div>
        <div className="rounded-xl p-3 bg-ink-3/60 border border-line">
          <div className="label mb-1">Shared Buffer</div>
          <div className="font-mono text-xl font-semibold text-fox">1024 B</div>
        </div>
        <div className="rounded-xl p-3 bg-ink-3/60 border border-line">
          <div className="label mb-1">Contention</div>
          <div className="font-mono text-xl font-semibold text-fox">idx 0, 1</div>
        </div>
      </div>

      <p className="text-xs text-fox-3 leading-relaxed mb-6">
        Spawns {atomicsThreads} Web Workers hammering the same <span className="font-mono text-fox">SharedArrayBuffer</span>{' '}
        cache lines via <span className="font-mono text-fox">Atomics.add</span> and{' '}
        <span className="font-mono text-fox">Atomics.compareExchange</span> to saturate cross-core cache coherency traffic.
      </p>

      {!atomicsActive ? (
        <Button variant="primary" icon="Zap" onClick={startAtomics} disabled={!hasSab || busy}>
          Start atomics
        </Button>
      ) : (
        <Button variant="destructive" icon="Square" onClick={stopAtomics}>
          Stop atomics · {atomicsMops.toFixed(2)} M ops/s
        </Button>
      )}
    </>
  );
}

function MinionsSub({ minionSize, minionCount, minions, minionWebRTC, setMinionSize, setMinionCount, setMinionWebRTC, spawnMinions, handleKillMinionsConfirm }) {
  return (
    <>
      <div
        className="p-3 mb-6 rounded-lg text-xs text-fox leading-relaxed"
        style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)' }}
      >
        <strong className="text-red">Warning:</strong> Spawns separate windows to bypass browser memory limits. Desktop only. Allow popups if blocked.
      </div>
      <div className="space-y-5 mb-6">
        <Slider label="Window size" value={minionSize} min={256} max={2048} step={128} suffix=" MB" onChange={setMinionSize} />
        <div>
          <Slider label="Count" value={minionCount} min={1} max={20} step={1} suffix={minionCount === 1 ? ' window' : ' windows'} onChange={setMinionCount} />
          <div className="text-right text-[10px] text-fox-3 mt-1">Total: {(minionSize * minionCount / 1024).toFixed(1)} GB</div>
        </div>
        <label
          className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-lg border border-line hover:border-line-strong transition-colors"
          style={{ background: 'rgba(255,255,255,.025)' }}
        >
          <input
            type="checkbox"
            checked={minionWebRTC}
            onChange={(e) => setMinionWebRTC(e.target.checked)}
            className="w-4 h-4"
            style={{ accentColor: '#34D399' }}
          />
          <span className="text-xs text-fox-2 flex items-center gap-1.5">
            <Icons.Wifi size={12} /> Enable WebRTC storm
          </span>
        </label>
      </div>
      {minions.length === 0 ? (
        <Button variant="primary" icon="Layers" onClick={spawnMinions}>Spawn minions</Button>
      ) : (
        <Button variant="destructive" icon="Trash2" onClick={handleKillMinionsConfirm}>
          Kill all ({minions.length})
        </Button>
      )}
    </>
  );
}
