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

export default function AudioView({
  audioActive, audioStats,
  audioVoices, audioLength, audioMode, isMobile,
  setAudioVoices, setAudioLength, setAudioMode,
  startAudio, stopAudio,
}) {
  const running = audioActive;

  return (
    <div className="space-y-4">
      <Panel title="AudioContext abuse" status={running ? 'active' : 'idle'}>
        {/* stat grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Stat label="Voices" value={audioStats.running} accent={running} />
          <Stat label="Rendered" value={audioStats.renders.toLocaleString()} />
          <Stat label="Samples" value={audioStats.samples.toLocaleString()} />
          <Stat label="Real time" value={audioStats.seconds.toFixed(0)} unit="s" />
        </div>

        {/* chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="chip mono">{audioVoices} concurrent contexts</span>
          <span className="chip mono">{audioLength.toFixed(1)} s render length</span>
          <span className="chip mono">{audioMode}</span>
          <span className="chip mono">OfflineAudioContext</span>
          {running && <span className="chip mono text-lime">DSP busy</span>}
        </div>

        {/* mode pick */}
        <div className="mb-5">
          <div className="label mb-2">Render mode</div>
          <div className="inline-flex flex-wrap gap-0.5 p-1 bg-ink-1 rounded-lg border border-line">
            {[
              { v: 'conv', l: 'Convolution' },
              { v: 'osc',  l: 'Oscillators' },
              { v: 'waveshaper', l: 'WaveShaper' },
              { v: 'chaos', l: 'All-in-one' },
            ].map((m) => (
              <button
                key={m.v}
                type="button"
                disabled={running}
                onClick={() => setAudioMode(m.v)}
                className={`flex-1 min-w-max px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  audioMode === m.v ? 'bg-lime/15 text-lime' : 'text-fox-2 hover:text-fox'
                }`}
              >
                {m.l}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-fox-3 mt-1.5 leading-snug">
            {audioMode === 'conv'  && 'Long ConvolverNode reverb tail — heavy FFT/overlap-add DSP on the audio thread.'}
            {audioMode === 'osc'   && 'Bank of mixed-type OscillatorNodes (sine/square/sawtooth) feeding a per-voice DynamicsCompressor.'}
            {audioMode === 'waveshaper' && 'Custom WaveShaperNode with 300k-point curve, reconfigured every frame.'}
            {audioMode === 'chaos' && 'Stacks convolver + oscillators + waveshaper in each voice — maximum audio-thread pressure.'}
          </p>
        </div>

        {/* controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-7">
          <Slider label="Concurrent voices" value={audioVoices} min={1} max={isMobile ? 16 : 64} step={1} onChange={setAudioVoices} disabled={running} />
          <Slider label="Render length" value={audioLength} min={0.5} max={isMobile ? 10 : 30} step={0.5} suffix=" s" onChange={setAudioLength} disabled={running} />
        </div>

        {!running ? (
          <Button variant="primary" icon="Flame" onClick={startAudio}>Start DSP abuse</Button>
        ) : (
          <Button variant="destructive" icon="Square" onClick={stopAudio}>
            Stop · {audioStats.renders.toLocaleString()} renders
          </Button>
        )}
      </Panel>

      <div className="glass rounded-xl p-4 flex items-start gap-3">
        <Icons.ShieldAlert size={16} className="text-amber shrink-0 mt-0.5" />
        <div className="text-xs text-fox-2 leading-relaxed space-y-1">
          <p>
            Spawns <span className="mono text-fox">{audioVoices}</span> parallel
            <span className="mono text-fox"> OfflineAudioContext</span> render jobs, each
            producing a <span className="mono text-fox">{audioLength.toFixed(1)}s</span> buffer.
            Browsers dispatch this work to the internal audio/render thread — distinct from the main
            thread and ordinary Web Workers. Modes exercise the ConvolverNode FFT path, OscillatorNode
            bank, WaveShaperNode make-tables, or all stacked at once.
          </p>
          <p className="mono text-[10px] text-fox-3">
            Compatible across Chromium, Gecko, and WebKit. Offline contexts produce no sound and need no
            user gesture.
          </p>
        </div>
      </div>
    </div>
  );
}