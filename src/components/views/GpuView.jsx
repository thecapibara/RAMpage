import React from 'react';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import Segmented from '../ui/Segmented';
import Slider from '../ui/Slider';
import GpuCanvas from '../GpuCanvas';
import ErrorBoundary from '../ErrorBoundary';
import Icons from '../icons';

export default function GpuView({
  gpuActive, gpuMode, gpuIntensity, gpuResolution, gpuOverdrive,
  showGpuPopup, isBenchmarking, gpuBenchMode,
  vramActive, vramCount,
  setGpuMode, setGpuIntensity, setGpuResolution, setGpuOverdrive,
  toggleGpu, openGpuPopup, handleGpuCrash,
  runVramBurner, stopVramBurner,
}) {
  const busy = isBenchmarking || gpuBenchMode !== 'NONE';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <Panel title="GPU stress" status={gpuActive ? 'active' : 'idle'}>
          {/* Live preview */}
          <div className="h-56 mb-6 rounded-xl overflow-hidden bg-black border border-line relative group">
            {gpuActive ? (
              <ErrorBoundary>
                <GpuCanvas
                  active={!showGpuPopup}
                  intensity={gpuIntensity}
                  resolution={gpuResolution}
                  mode={gpuMode}
                  overdrive={gpuOverdrive}
                  onClick={openGpuPopup}
                  onError={handleGpuCrash}
                />
              </ErrorBoundary>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="grad-text mono text-xs tracking-[.3em] uppercase">Ready</span>
              </div>
            )}
            {gpuActive && !showGpuPopup && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-xs text-fox flex items-center gap-2">
                  <Icons.Maximize size={14} /> Double-click to expand
                </span>
              </div>
            )}
          </div>

          {/* shader + sliders */}
          <div className="space-y-5 mb-6">
            <div>
              <div className="label mb-2">Shader</div>
              <Segmented
                className="w-full"
                options={[
                  { value: 'FRACTAL', label: 'Fractal' },
                  { value: '3D', label: '3D' },
                  { value: 'FIRE', label: 'Fire' },
                ]}
                value={gpuMode}
                onChange={setGpuMode}
                disabled={busy}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Slider
                label={gpuMode === 'FIRE' ? 'Particle density' : 'Shader complexity'}
                value={gpuIntensity} min={1} max={100} suffix="%"
                onChange={setGpuIntensity} disabled={busy}
              />
              <div>
                <Slider
                  label="Resolution"
                  value={Math.log2(gpuResolution / 1024)} min={0} max={3} step={1}
                  onChange={(v) => setGpuResolution(1024 * Math.pow(2, v))} disabled={busy}
                />
                <div className="flex justify-between text-[10px] text-fox-3 mt-1.5">
                  <span>1K</span><span>2K</span><span>4K</span><span>8K</span>
                </div>
              </div>
              <Slider
                label="Overdrive (passes)"
                value={gpuOverdrive} min={1} max={20} step={1}
                onChange={setGpuOverdrive} disabled={busy}
              />
            </div>
          </div>

          <Button
variant={gpuActive ? 'destructive' : 'primary'}
          icon={gpuActive ? 'Square' : 'Play'}
            onClick={toggleGpu}
            disabled={busy}
          >
            {gpuActive ? 'Manual stop' : 'Shader test'}
          </Button>
        </Panel>
      </div>

      {/* VRAM burner */}
      <Panel title="VRAM eater" status={vramActive ? 'active' : 'idle'}>
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="label mb-2">Eaten</div>
            <div className={`metric ${vramActive ? 'on' : ''} text-3xl leading-none`}>
              {(vramCount * 64).toLocaleString()} <span style={{ fontSize: '.9rem', WebkitTextFillColor: '#5E5E78', background: 'none', color: '#5E5E78' }}>MB</span>
            </div>
            <div className="text-xs text-fox-3 mt-2">{vramCount} × 64MB textures</div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <span className="chip mono">{vramActive ? 'allocating' : 'idle'}</span>
            {vramActive && <span className="chip mono text-lime">chunks/s pending</span>}
            <span className="chip mono">RGBA8 · 4096²</span>
          </div>
        </div>
        <div className="h-2 rounded-full mb-6 overflow-hidden" style={{ background: 'rgba(255,255,255,.06)' }}>
          <div
            className="h-full bg-grad-accent"
            style={{ width: `${Math.min(100, (vramCount * 64) / 8192 * 100)}%`, boxShadow: '0 0 12px rgba(34,211,238,.6)' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-lg p-3 bg-ink-3/60 border border-line">
            <div className="label mb-1.5">Texture count</div>
            <div className="mono text-xl font-semibold text-fox">{vramCount.toLocaleString()}</div>
          </div>
          <div className="rounded-lg p-3 bg-ink-3/60 border border-line">
            <div className="label mb-1.5">Chunk size</div>
            <div className="mono text-xl font-semibold text-fox">64 MB</div>
          </div>
        </div>

        <p className="text-xs text-fox-3 leading-relaxed mb-5">
          Allocates 64 MB uncompressed RGBA8 textures (4096×4096) every 200 ms until VRAM is exhausted.
          Watch the GPU process memory in the browser's task manager — it climbs fast.
        </p>
        {!vramActive ? (
          <Button variant="primary" icon="Layers" onClick={runVramBurner} disabled={busy}>Eat VRAM</Button>
        ) : (
          <Button variant="destructive" icon="Square" onClick={stopVramBurner} className="animate-pulse-soft">Stop eating ({vramCount})</Button>
        )}
      </Panel>
    </div>
  );
}