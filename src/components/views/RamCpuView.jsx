import React from 'react';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import Segmented from '../ui/Segmented';
import Slider from '../ui/Slider';
import SimpleChart from '../SimpleChart';
import ErrorBoundary from '../ErrorBoundary';
import Icons from '../icons';
import { MAX_LIMIT } from '../../constants';

export default function RamCpuView({
  allocatedMB, chartDataRAM, cpuMode, ramMode, targetMB, cpuLoad,
  isAllocating, isBenchmarking, gpuBenchMode, isMobile,
  minionSize, minionCount, minions, minionWebRTC,
  setCpuMode, setRamMode, setTargetMB, setCpuLoad,
  setMinionSize, setMinionCount, setMinionWebRTC,
  allocateMemory, stopRAM, spawnMinions, handleKillMinionsConfirm,
}) {
  const busy = isBenchmarking || gpuBenchMode !== 'NONE';
  const running = isAllocating;

  return (
    <Panel title="RAM & CPU" status={running ? 'active' : 'idle'}>
      {/* headline */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="label mb-2">Allocated</div>
          <div className={`metric ${running ? 'on' : ''} text-6xl leading-none`}>
            {allocatedMB.toLocaleString()} <span style={{ fontSize: '1.1rem', WebkitTextFillColor: '#5E5E78', background: 'none', color: '#5E5E78' }}>MB</span>
          </div>
          <div className="flex gap-3 mt-3 text-xs text-fox-3">
            <span>target: <span className="mono text-fox-2">{targetMB}</span></span>
            {cpuMode !== 'HASH' && <span>cpu: <span className="mono text-lime">{cpuLoad}%</span></span>}
          </div>
        </div>
      </div>

      {/* chart */}
      <div className="h-36 mb-6">
        <ErrorBoundary>
          <SimpleChart data={chartDataRAM} max={MAX_LIMIT} label="RAM Usage" unit="MB" />
        </ErrorBoundary>
      </div>

      {/* mode + pattern */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="label mb-2">CPU mode</div>
          <Segmented
            className="w-full"
            options={[
              { value: 'STANDARD', label: 'Standard' },
              { value: 'HASH', label: 'Hash stress' },
              ...(isMobile ? [] : [{ value: 'MINIONS', label: 'Minions' }]),
            ]}
            value={cpuMode}
            onChange={setCpuMode}
          />
        </div>
        {cpuMode !== 'MINIONS' && (
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
              disabled={isAllocating}
            />
          </div>
        )}
      </div>

      {cpuMode !== 'MINIONS' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <Slider label="RAM target" value={targetMB} min={500} max={MAX_LIMIT} step={100} suffix=" MB" onChange={setTargetMB} disabled={busy} />
            {cpuMode === 'HASH' ? (
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="label">Hash intensity</span>
                  <span className="mono text-sm text-lime">MAX</span>
                </div>
                <div className="w-full h-1.5 rounded-md bg-grad-accent overflow-hidden">
                  <div className="h-full w-full animate-pulse-soft" />
                </div>
              </div>
            ) : (
              <Slider label="CPU load" value={cpuLoad} min={0} max={100} step={10} suffix="%" onChange={setCpuLoad} disabled={busy} valueClassName="text-lime" />
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
      ) : (
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
      )}
    </Panel>
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
          <Slider label="Count" value={minionCount} min={1} max={20} step={1} suffix=" wins" onChange={setMinionCount} />
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