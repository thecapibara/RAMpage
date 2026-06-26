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

export default function WebRtcView({
  rtcActive, rtcStats,
  rtcPeers, rtcPayload, rtcInterval, rtcMedia, isMobile,
  setRtcPeers, setRtcPayload, setRtcInterval, setRtcMedia,
  startRtcStorm, stopRtcStorm,
}) {
  const running = rtcActive;
  return (
    <div className="space-y-4">
      <Panel title="WebRTC mesh storm" status={running ? 'active' : 'idle'}>
        {/* stat grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Stat label="Connections" value={rtcStats.open} unit={`/ ${rtcPeers * 2}`} accent={running} />
          <Stat label="Channels" value={rtcStats.channels} unit={`/ ${rtcPeers}`} accent={running} />
          <Stat label="Throughput" value={rtcStats.mbps.toFixed(1)} unit="Mbps" accent={running} />
          <Stat label="Data burned" value={rtcStats.totalMB.toFixed(1)} unit="MB" />
        </div>

        {/* topology chip strip */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="chip mono">{rtcPeers} peer-pairs</span>
          <span className="chip mono">{rtcPeers * 2} RTCPeerConnections</span>
          <span className="chip mono">loopback ICE</span>
          <span className="chip mono">
            {rtcMedia ? <span className="text-lime">media + data</span> : 'data only'}
          </span>
        </div>

        {/* controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">
          <Slider label="Peer pairs" value={rtcPeers} min={1} max={40} step={1} onChange={setRtcPeers} disabled={running} />
          <Slider label="Payload size" value={rtcPayload} min={1} max={256} step={1} suffix=" KB" onChange={setRtcPayload} disabled={running} />
          <Slider label="Send interval" value={rtcInterval} min={1} max={50} step={1} suffix=" ms" onChange={setRtcInterval} disabled={running} />
        </div>

        <label
          className={`flex items-center gap-2 ${isMobile ? 'cursor-not-allowed opacity-40' : 'cursor-pointer select-none'} p-2.5 rounded-lg border border-line ${isMobile ? '' : 'hover:border-line-strong'} transition-colors mb-7 w-fit`}
          style={{ background: 'rgba(255,255,255,.025)' }}
          title={isMobile ? 'Camera decode while stressing is unstable on mobile' : ''}
        >
          <input
            type="checkbox"
            checked={rtcMedia && !isMobile}
            onChange={(e) => setRtcMedia(e.target.checked)}
            disabled={running || isMobile}
            className="w-4 h-4"
            style={{ accentColor: '#34D399' }}
          />
          <span className="text-xs text-fox-2 flex items-center gap-1.5">
            <Icons.Monitor size={12} />
            {isMobile
              ? 'getUserMedia video tracks (desktop only)'
              : 'Add getUserMedia video tracks (heavy encode load)'}
          </span>
        </label>

        {!running ? (
          <Button variant="primary" icon="Wifi" onClick={startRtcStorm}>
            Start mesh storm
          </Button>
        ) : (
          <Button variant="destructive" icon="Square" onClick={stopRtcStorm}>
            Stop storm · {(rtcStats.totalMB).toFixed(1)} MB burned
          </Button>
        )}
      </Panel>

      <div
        className="glass rounded-xl p-4 flex items-start gap-3"
      >
        <Icons.ShieldAlert size={16} className="text-amber shrink-0 mt-0.5" />
        <p className="text-xs text-fox-2 leading-relaxed">
          Spawns <span className="mono text-fox">N×2</span> RTCPeerConnections connected via local ICE loopback.
          Each pair runs a DataChannel pushing <span className="mono text-fox">{rtcPayload} KB</span> junk every{' '}
          <span className="mono text-fox">{rtcInterval} ms</span>. Enabling media additionally forces
          simultaneous video encode/decode across every sender. Burns CPU (DTLS/SRTP), memory (buffers), and
          network stack simultaneously — distinct from the basic Network worker.
        </p>
      </div>
    </div>
  );
}