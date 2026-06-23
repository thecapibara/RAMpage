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
    <div className="space-y-5">
      <Panel title="GPU stress" status={gpuActive ? 'active' : 'idle'}>
        {/* Live preview */}
        <div className="h-56 mb-6 rounded-lg overflow-hidden bg-black border border-[#232327] relative group">
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
              <span className="text-[#5A5A62] text-sm tracking-widest uppercase">Ready</span>
            </div>
          )}
          {gpuActive && !showGpuPopup && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="text-xs text-[#ECECEC] flex items-center gap-2"><Icons.Maximize size={14} /> Double-click to expand</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-2">Shader</div>
          <Segmented
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

        <div className="space-y-4 mb-8">
          <Slider label={gpuMode === 'FIRE' ? 'Particle density' : 'Shader complexity'} value={gpuIntensity} min={1} max={100} suffix="%" onChange={setGpuIntensity} disabled={busy} />
          <div>
            <Slider label="Resolution" value={Math.log2(gpuResolution / 1024)} min={0} max={3} step={1} onChange={(v) => setGpuResolution(1024 * Math.pow(2, v))} disabled={busy} />
            <div className="flex justify-between text-[10px] text-[#5A5A62] mt-1"><span>1K</span><span>2K</span><span>4K</span><span>8K</span></div>
          </div>
          <Slider label="Overdrive (passes)" value={gpuOverdrive} min={1} max={20} step={1} onChange={setGpuOverdrive} disabled={busy} valueClassName="font-mono text-[#ECECEC]" />
        </div>

        <Button
          variant={gpuActive ? 'destructive' : 'secondary'}
          icon={gpuActive ? 'Square' : 'Play'}
          onClick={toggleGpu}
          disabled={busy}
        >
          {gpuActive ? 'Manual stop' : 'Shader test'}
        </Button>
      </Panel>

      {/* VRAM burner — secondary card */}
      <Panel title="VRAM eater" status={vramActive ? 'active' : 'idle'}>
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-1">Eaten</div>
            <div className={`text-3xl font-mono font-semibold ${vramActive ? 'text-[#34D399]' : 'text-[#ECECEC]'}`}>
              {(vramCount * 64).toLocaleString()} <span className="text-sm text-[#5A5A62]">MB</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-[#5A5A62] mb-6">Allocates 64MB uncompressed textures until VRAM is exhausted.</p>
        {!vramActive ? (
          <Button variant="secondary" icon="Layers" onClick={runVramBurner} disabled={busy}>Eat VRAM</Button>
        ) : (
          <Button variant="destructive" icon="Square" onClick={stopVramBurner} className="animate-pulse">Stop eating ({vramCount})</Button>
        )}
      </Panel>
    </div>
  );
}
