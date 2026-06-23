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
      {/* Headline + chart */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-1">Allocated</div>
          <div className={`text-4xl font-mono font-semibold ${running ? 'text-[#34D399]' : 'text-[#ECECEC]'}`}>
            {allocatedMB.toLocaleString()} <span className="text-base text-[#5A5A62]">MB</span>
          </div>
        </div>
      </div>
      <div className="h-40 mb-6">
        <ErrorBoundary>
          <SimpleChart data={chartDataRAM} max={MAX_LIMIT} color="#34D399" label="RAM Usage" unit="MB" />
        </ErrorBoundary>
      </div>

      {/* Mode switch */}
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-2">Mode</div>
        <Segmented
          options={[
            { value: 'STANDARD', label: 'Standard' },
            { value: 'HASH', label: 'Hash stress' },
            { value: 'MINIONS', label: isMobile ? 'Minions (PC only)' : 'Minions' },
          ]}
          value={cpuMode}
          onChange={setCpuMode}
        />
      </div>

      {cpuMode !== 'MINIONS' ? (
        <>
          <div className="mb-6">
            <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-2">Allocation pattern</div>
            <Segmented
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

          <div className="space-y-4 mb-8">
            <Slider label="RAM target" value={targetMB} min={500} max={MAX_LIMIT} step={100} suffix=" MB" onChange={setTargetMB} disabled={busy} />
            {cpuMode === 'HASH' ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B8B92]">Hash intensity</span>
                  <span className="font-mono text-[#34D399]">MAX</span>
                </div>
                <div className="w-full h-1 bg-[#232327] rounded-lg overflow-hidden">
                  <div className="h-full w-full bg-[#34D399] animate-pulse" />
                </div>
              </div>
            ) : (
              <Slider label="CPU load" value={cpuLoad} min={0} max={100} step={10} suffix="%" onChange={setCpuLoad} disabled={busy} />
            )}
          </div>

          {!isAllocating ? (
            <Button variant="primary" icon="Play" onClick={allocateMemory} disabled={busy}>
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
          isMobile={isMobile}
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
      <div className="p-3 mb-6 rounded-lg bg-[#F87171]/10 border border-[#F87171]/30 text-xs text-[#ECECEC] leading-relaxed">
        <strong className="text-[#F87171]">Warning:</strong> Spawns separate windows to bypass browser memory limits. Desktop only. Allow popups if blocked.
      </div>
      <div className="space-y-4 mb-6">
        <Slider label="Window size" value={minionSize} min={256} max={2048} step={128} suffix=" MB" onChange={setMinionSize} />
        <div>
          <Slider label="Count" value={minionCount} min={1} max={20} step={1} suffix=" wins" onChange={setMinionCount} />
          <div className="text-right text-[10px] text-[#5A5A62] mt-1">Total: {(minionSize * minionCount / 1024).toFixed(1)} GB</div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={minionWebRTC}
            onChange={(e) => setMinionWebRTC(e.target.checked)}
            className="w-4 h-4 accent-[#34D399] bg-[#1A1A1E] border-[#232327] rounded"
          />
          <span className="text-xs text-[#8B8B92] flex items-center gap-1">
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
