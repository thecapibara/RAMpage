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

const RES_OPTIONS = [
  { v: 1280, l: '720p' },
  { v: 2560, l: '1440p' },
  { v: 4096, l: '4K' },
  { v: 7680, l: '8K' },
];

export default function Canvas2dView({
  c2dActive, c2dStats,
  c2dRes, c2dPasses, c2dMode,
  setC2dRes, setC2dPasses, setC2dMode,
  startC2d, stopC2d,
}) {
  const running = c2dActive;

  return (
    <div className="space-y-4">
      <Panel title="Canvas 2D pixel storm" status={running ? 'active' : 'idle'}>
        {/* stat grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Stat label="Frames" value={c2dStats.frames.toLocaleString()} accent={running} />
          <Stat label="Pixels/frame" value={c2dStats.pxPerFrame.toLocaleString()} />
          <Stat label="Throughput" value={(c2dStats.mpps).toFixed(1)} unit="Mpx/s" accent={running} />
          <Stat label="Passes" value={c2dPasses} unit="×" />
        </div>

        {/* chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="chip mono">{c2dRes}×{(c2dRes*9/16|0)}</span>
          <span className="chip mono">{c2dMode}</span>
          <span className="chip mono">{c2dPasses} passes/frame</span>
          <span className="chip mono">putImageData</span>
          {running && <span className="chip mono text-lime">raster busy</span>}
        </div>

        {/* mode pick */}
        <div className="mb-5">
          <div className="label mb-2">Pixel work mode</div>
          <div className="inline-flex flex-wrap gap-0.5 p-1 bg-ink-1 rounded-lg border border-line">
            {[
              { v: 'xor',  l: 'XOR' },
              { v: 'noise', l: 'Noise' },
              { v: 'blend', l: 'Blend' },
            ].map((m) => (
              <button
                key={m.v}
                type="button"
                disabled={running}
                onClick={() => setC2dMode(m.v)}
                className={`flex-1 min-w-max px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  c2dMode === m.v ? 'bg-lime/15 text-lime' : 'text-fox-2 hover:text-fox'
                }`}
              >
                {m.l}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-fox-3 mt-1.5 leading-snug">
            {c2dMode === 'xor'   && 'Bitwise XOR each pixel against a per-frame pseudo-random mask — pure ALU.'}
            {c2dMode === 'noise'  && 'Overwrite every byte with a fresh random value — ping stress on the cache path.'}
            {c2dMode === 'blend'   && 'Blend with a moving gradient: read-modify-write every pixel — also hits the sampler.'}
          </p>
        </div>

        {/* resolution pick */}
        <div className="mb-5">
          <div className="label mb-2">Canvas resolution</div>
          <div className="inline-flex flex-wrap gap-0.5 p-1 bg-ink-1 rounded-lg border border-line">
            {RES_OPTIONS.map((m) => (
              <button
                key={m.v}
                type="button"
                disabled={running}
                onClick={() => setC2dRes(m.v)}
                className={`flex-1 min-w-max px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  c2dRes === m.v ? 'bg-lime/15 text-lime' : 'text-fox-2 hover:text-fox'
                }`}
              >
                {m.l}
              </button>
            ))}
          </div>
        </div>

        {/* passes slider */}
        <div className="mb-7">
          <Slider
            label="Passes per frame"
            value={c2dPasses}
            min={1} max={50} step={1}
            onChange={setC2dPasses}
            disabled={running}
          />
        </div>

        {!running ? (
          <Button variant="primary" icon="Aperture" onClick={startC2d}>Start pixel storm</Button>
        ) : (
          <Button variant="destructive" icon="Square" onClick={stopC2d}>
            Stop · {c2dStats.frames.toLocaleString()} frames
          </Button>
        )}
      </Panel>

      <div className="glass rounded-xl p-4 flex items-start gap-3">
        <Icons.ShieldAlert size={16} className="text-amber shrink-0 mt-0.5" />
        <p className="text-xs text-fox-2 leading-relaxed">
          Spawns a hidden <span className="mono text-fox">{c2dRes}×{(c2dRes*9/16)|0}</span>
          {' '}2D canvas and burns it in a tight loop with{' '}
          <span className="mono text-fox">getImageData</span> / per-pixel mutation /{' '}
          <span className="mono text-fox">putImageData</span>{' '}{c2dPasses}× per frame.
          Unlike the GPU view, this hammers the browser's 2D rasterizer path (CPU + memory bus),
          which on most browsers is a separate software pipeline from WebGL compute.
          Works in any browser with Canvas2D support, no special permissions required.
        </p>
      </div>
    </div>
  );
}