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

function Banner({ children, variant = 'amber' }) {
  const color = variant === 'amber' ? '#F59E0B' : variant === 'red' ? '#F87171' : '#34D399';
  return (
    <div
      className="rounded-xl p-4 flex items-start gap-3 mb-6"
      style={{ background: `${color}14`, border: `1px solid ${color}40` }}
    >
      <Icons.ShieldAlert size={16} style={{ color }} className="shrink-0 mt-0.5" />
      <div className="text-xs text-fox-2 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

const REASON_TEXT = {
  'unsupported-browser': () => (
    <>
      <p>
        This browser does not implement the <span className="mono text-fox">File System Access API</span>
        {' '}(<span className="mono text-fox">showSaveFilePicker</span>). This feature requires a
        Chromium-based engine.
      </p>
      <p className="mono text-[10px] text-fox-3">
        Switch to Chrome / Edge / Brave / Arc / Vivaldi to target a real file on disk.
      </p>
    </>
  ),
  'insecure-context': () => (
    <>
      <p>The page is not in a <span className="mono text-fox">secure context</span>.</p>
      <p className="mono text-[10px] text-fox-3">
        Open via <span className="text-fox">http://localhost</span> or <span className="text-fox">https://</span>.
        LAN IPs (http://192.168.x.x) are rejected by the browser.
      </p>
    </>
  ),
  'brave-shields': () => (
    <>
      <p>
        Brave supports this API but blocks per-site. To enable on this page:
      </p>
      <ol className="mono text-[10px] text-fox-3 list-decimal pl-4 space-y-0.5">
        <li>Click the Brave lion icon in the address bar</li>
        <li>Lower shields for this site, or</li>
        <li>Open <span className="text-fox">brave://settings/content/fileSystemAccess</span> and allow</li>
      </ol>
    </>
  ),
};

export default function FileHailView({
  hailActive, hailStats,
  hailChunk, hailPattern,
  setHailChunk, setHailPattern,
  startHailMary, stopHailMary,
  hailUnsupported, hailReason,
  gotoStorage,
}) {
  const running = hailActive;
  const showBanner = hailUnsupported || hailReason === 'brave-shields';

  return (
    <div className="space-y-4">
      <Panel title="Filesystem hail mary" status={running ? 'active' : 'idle'}>
        {showBanner && hailReason && (
          <Banner variant={hailUnsupported ? 'amber' : 'amber'}>
            {REASON_TEXT[hailReason]?.() ?? null}
            {hailUnsupported && (
              <div className="pt-2">
                <Button variant="secondary" icon="HardDrive" onClick={gotoStorage}>
                  Use in-browser OPFS storage instead
                </Button>
              </div>
            )}
          </Banner>
        )}

        {!hailUnsupported && (
          <>
            {/* stat grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Stat label="Written" value={hailStats.writtenMB.toFixed(0)} unit="MB" accent={running} />
              <Stat label="Speed" value={hailStats.speed.toFixed(0)} unit="MB/s" accent={running} />
              <Stat label="Writes" value={hailStats.writes.toLocaleString()} />
              <Stat label="Errors" value={hailStats.errors} />
            </div>

            {/* target chip */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="chip mono">
                <Icons.HardDrive size={11} className="text-fox-3" /> user-chosen file
              </span>
              <span className="chip mono">{hailChunk} MB chunks</span>
              <span className="chip mono">{hailPattern}</span>
              <span className="chip mono">writable stream</span>
            </div>

            {/* controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <Slider
                label="Chunk size"
                value={hailChunk}
                min={1} max={256} step={1}
                suffix=" MB"
                onChange={setHailChunk}
                disabled={running}
              />
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="label">Payload pattern</span>
                </div>
                <div className="inline-flex flex-wrap gap-0.5 p-1 bg-ink-1 rounded-lg border border-line">
                  {['ZEROS', 'RANDOM', 'COMPRESS'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      disabled={running}
                      onClick={() => setHailPattern(p)}
                      className={`flex-1 min-w-max px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        hailPattern === p ? 'bg-lime/15 text-lime' : 'text-fox-2 hover:text-fox'
                      }`}
                    >
                      {p === 'ZEROS' ? 'Zeros' : p === 'RANDOM' ? 'Random' : 'Compressible'}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-fox-3 mt-1 leading-snug">
                  {hailPattern === 'ZEROS' && 'Sparse-friendly; some filesystems will not actually allocate blocks.'}
                  {hailPattern === 'RANDOM' && 'Incompressible entropy — forces real block allocation and defeats any inline compression.'}
                  {hailPattern === 'COMPRESS' && 'Long repetitive runs — heavy on CPU if the filesystem transparently compresses (NTFS LZNT1, Btrfs).'}
                </p>
              </div>
            </div>

            {!hailActive ? (
              <Button variant="primary" icon="HardDrive" onClick={startHailMary}>
                Pick file &amp; start writing
              </Button>
            ) : (
              <Button variant="destructive" icon="Square" onClick={stopHailMary}>
                Stop · {hailStats.writtenMB.toFixed(0)} MB written
              </Button>
            )}
          </>
        )}
      </Panel>

      <div className="glass rounded-xl p-4 flex items-start gap-3">
        <Icons.ShieldAlert size={16} className="text-amber shrink-0 mt-0.5" />
        <p className="text-xs text-fox-2 leading-relaxed">
          Opens a real file picker via the <span className="mono text-fox">File System Access API</span> and
          writes to a user-chosen file in a tight loop until the disk runs out — bypassing OPFS quota limits.
          The file is truncated on start; close neighbours of the Explorer/Finder can watch it grow in real time.
          Stop is graceful; the handle is released and the file is flushed.
        </p>
      </div>
    </div>
  );
}