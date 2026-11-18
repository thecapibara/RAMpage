import React from 'react';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import Segmented from '../ui/Segmented';
import Slider from '../ui/Slider';
import Icons from '../icons';

function Stat({ label, value, unit, accent }) {
  return (
    <div className="rounded-xl p-4 bg-ink-3/60 border border-line">
      <div className="label mb-1.5">{label}</div>
      <div className={`font-mono text-3xl font-semibold leading-none ${accent ? 'text-lime' : 'text-fox'}`}>
        {value} {unit && <span className="text-base text-fox-3">{unit}</span>}
      </div>
    </div>
  );
}

export default function WebGpuView({
  supported,
  running,
  mode,
  setMode,
  workgroups,
  setWorkgroups,
  iters,
  setIters,
  targetVramMB,
  setTargetVramMB,
  stats,
  adapterName,
  start,
  stop,
  busy = false,
}) {
  const isCompute = mode === 'COMPUTE';

  return (
    <div className="space-y-4">
      <Panel
        title="WebGPU compute & VRAM"
        status={running ? 'active' : 'idle'}
        action={
          <span className="chip font-mono">
            {!supported ? 'unsupported' : adapterName || 'adapter ready'}
          </span>
        }
      >
        {!supported && (
          <div
            className="p-4 mb-6 rounded-xl flex items-start gap-3 text-xs text-fox leading-relaxed"
            style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)' }}
          >
            <Icons.ShieldAlert size={16} className="text-amber shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber mb-1">WebGPU Unavailable</div>
              <p className="text-fox-2">
                <span className="font-mono text-fox">navigator.gpu</span> is not exposed in this browser or context.
                Use a WebGPU-capable Chromium/Firefox/Safari build over HTTPS or localhost.
              </p>
            </div>
          </div>
        )}

        {/* live stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <Stat
            label="GFLOPS"
            value={isCompute ? stats.gflops.toFixed(1) : '0.0'}
            unit="GF/s"
            accent={running && isCompute}
          />
          <Stat
            label="Dispatches/s"
            value={isCompute ? stats.dispatchesPerSec.toFixed(1) : '0.0'}
            unit="/s"
            accent={running && isCompute}
          />
          <Stat
            label="VRAM Allocated"
            value={stats.vramAllocatedMB.toLocaleString()}
            unit="MB"
            accent={running && !isCompute}
          />
        </div>

        {/* status chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="chip font-mono">{mode}</span>
          {isCompute ? (
            <>
              <span className="chip font-mono">{workgroups} workgroups × 64</span>
              <span className="chip font-mono">{iters} iters/thread</span>
              <span className="chip font-mono">{stats.dispatches.toLocaleString()} dispatches</span>
            </>
          ) : (
            <>
              <span className="chip font-mono">target {targetVramMB} MB</span>
              <span className="chip font-mono">64 MB chunks · 4 MB stripes</span>
            </>
          )}
          <span className="chip font-mono">{stats.elapsedSec.toFixed(1)}s elapsed</span>
          {running && (
            <span className="chip font-mono text-lime">
              {isCompute ? 'shader pipeline hot' : 'committing VRAM'}
            </span>
          )}
        </div>

        {/* mode switcher */}
        <div className="mb-6">
          <div className="label mb-2">WebGPU mode</div>
          <Segmented
            className="w-full sm:w-auto"
            options={[
              { value: 'COMPUTE', label: 'Compute' },
              { value: 'VRAM', label: 'VRAM' },
            ]}
            value={mode}
            onChange={setMode}
            disabled={running || busy}
          />
        </div>

        {/* mode controls */}
        {isCompute ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <Slider
              label="Workgroups"
              value={workgroups}
              min={64}
              max={4096}
              step={64}
              onChange={setWorkgroups}
              disabled={running || busy}
            />
            <Slider
              label="Iterations / thread"
              value={iters}
              min={64}
              max={2048}
              step={64}
              onChange={setIters}
              disabled={running || busy}
              valueClassName="text-lime"
            />
          </div>
        ) : (
          <div className="mb-8">
            <Slider
              label="Target VRAM"
              value={targetVramMB}
              min={256}
              max={4096}
              step={64}
              suffix=" MB"
              onChange={setTargetVramMB}
              disabled={running || busy}
            />
            <div className="h-2 rounded-full mt-4 overflow-hidden" style={{ background: 'rgba(255,255,255,.06)' }}>
              <div
                className="h-full bg-grad-accent transition-all duration-150"
                style={{
                  width: `${Math.min(100, (stats.vramAllocatedMB / Math.max(1, targetVramMB)) * 100)}%`,
                  boxShadow: '0 0 12px rgba(52,211,153,.55)',
                }}
              />
            </div>
          </div>
        )}

        {!running ? (
          <Button
            variant="primary"
            icon="Microchip"
            onClick={start}
            disabled={!supported || busy}
          >
            {isCompute ? 'Start compute stress' : 'Allocate WebGPU VRAM'}
          </Button>
        ) : (
          <Button variant="destructive" icon="Square" onClick={stop}>
            {isCompute
              ? `Stop compute · ${stats.gflops.toFixed(1)} GF/s`
              : `Release VRAM · ${stats.vramAllocatedMB} MB`}
          </Button>
        )}
      </Panel>

      <div className="glass rounded-xl p-4 flex items-start gap-3">
        <Icons.Microchip size={16} className="text-lime shrink-0 mt-0.5" />
        <p className="text-xs text-fox-2 leading-relaxed">
          {isCompute ? (
            <>
              Runs a WGSL compute shader (<span className="font-mono text-fox">@workgroup_size(64)</span>) performing
              dense FMA + trigonometric chains across <span className="font-mono text-fox">{(workgroups * 64).toLocaleString()}</span>{' '}
              GPU threads per dispatch without blocking the UI thread.
            </>
          ) : (
            <>
              Allocates <span className="font-mono text-fox">GPUBuffer</span> chunks of{' '}
              <span className="font-mono text-fox">64 MB</span> every 150ms and writes non-zero{' '}
              <span className="font-mono text-fox">4 MB</span> stripes via{' '}
              <span className="font-mono text-fox">queue.writeBuffer</span> so the driver physically commits GPU VRAM.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
