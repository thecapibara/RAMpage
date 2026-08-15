import React, { useState, useEffect, useRef } from 'react';
import Icons from './icons';

const params = new URLSearchParams(window.location.search);

export default function MinionWindow() {
  const target = parseInt(params.get('target')) || 512;
  const [myId] = useState(() => params.get('id') || `zombie_${Math.random().toString(36).substring(2, 11)}`);
  const useWebRTC = params.get('webrtc') === 'true';

  const [targetMB] = useState(target);
  const [allocatedMB, setAllocatedMB] = useState(0);
  const [workers, setWorkers] = useState([]);
  const workersRef = useRef([]);

  // Keep workers ref updated for cleanup
  useEffect(() => {
    workersRef.current = workers;
  }, [workers]);

  // Clean up workers on unmount
  useEffect(() => {
    return () => {
      workersRef.current.forEach(w => w.terminate());
    };
  }, []);

  // Allocate memory on startup. No startedRef guard: under React.StrictMode
  // the effect mounts→unmounts→remounts, and the cleanup below clears the
  // pending timer on the simulated unmount — a persisted ref would skip the
  // re-run and the minion would never allocate. The timeout+cleanup pattern
  // is already idempotent.
  useEffect(() => {
    const allocateMemory = (targetVal) => {
      const WORKER_CAP = 1500;
      const workerTotal = targetVal;
      const numWorkers = Math.ceil(workerTotal / WORKER_CAP);
      const newWorkers = [];
      const workerUrl = new URL('../workers/ramWorker.js', import.meta.url);

      for (let i = 0; i < numWorkers; i++) {
        const w = new Worker(workerUrl, { type: 'module' });
        const amount = Math.min(WORKER_CAP, workerTotal - (i * WORKER_CAP));
        
        w.onmessage = (e) => {
          if (e.data.type === 'PROGRESS') {
            setAllocatedMB(p => p + e.data.addedMB);
          }
        };
        
        w.postMessage({ 
          action: 'ALLOCATE', 
          targetMB: amount, 
          id: i, 
          cpuLoad: 0, 
          mode: 'STANDARD', 
          ramMode: 'LINEAR' 
        });
        
        newWorkers.push(w);
      }
      setWorkers(newWorkers);
    };

    const timer = setTimeout(() => {
      allocateMemory(targetMB);
    }, 500);

    return () => clearTimeout(timer);
  }, [targetMB]);

  // Broadcast channel coordination
  useEffect(() => {
    const bc = new BroadcastChannel('rampage_channel');
    
    bc.onmessage = (event) => {
      if (event.data === 'KILL_ALL') {
        window.close();
      }
      if (event.data === 'PING') {
        bc.postMessage({ type: 'PONG', id: myId });
      }
    };

    bc.postMessage({ type: 'PONG', id: myId });
    
    return () => bc.close();
  }, [myId]);

  // WebRTC Storm
  useEffect(() => {
    if (!useWebRTC) return;

    const activeConnections = [];
    const activeIntervals = [];
    const STORM_INTENSITY = 5;

    const startConnection = () => {
      const pc1 = new RTCPeerConnection();
      const pc2 = new RTCPeerConnection();
      activeConnections.push(pc1, pc2);

      pc1.onicecandidate = e => e.candidate && pc2.addIceCandidate(e.candidate).catch(() => {});
      pc2.onicecandidate = e => e.candidate && pc1.addIceCandidate(e.candidate).catch(() => {});

      const dc = pc1.createDataChannel("storm");
      
      dc.onopen = () => {
        const interval = setInterval(() => {
          if (dc.readyState === 'open') {
            const junk = new Uint8Array(16 * 1024).fill(Math.random() * 255);
            try { dc.send(junk); } catch { /* channel closed */ }
          }
        }, 5); 
        activeIntervals.push(interval);
      };

      pc1.createOffer().then(offer => {
        pc1.setLocalDescription(offer);
        pc2.setRemoteDescription(offer);
        return pc2.createAnswer();
      }).then(answer => {
        pc2.setLocalDescription(answer);
        pc1.setRemoteDescription(answer);
      });
    };

    for (let i = 0; i < STORM_INTENSITY; i++) {
      const timer = setTimeout(startConnection, i * 200);
      activeIntervals.push(timer); // reuse same array to clear start timeouts
    }

    return () => {
      activeIntervals.forEach(item => {
        // can be a timer ID or interval ID, both are safe in browser environments for clearInterval/clearTimeout
        clearInterval(item);
        clearTimeout(item);
      });
      activeConnections.forEach(pc => {
        try { pc.close(); } catch { /* already closed */ }
      });
    };
  }, [useWebRTC]);

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#ECECEC] p-4 flex flex-col items-center justify-center font-sans select-none">
      <h1 className="text-xl font-semibold text-[#F87171] tracking-wide">MINION</h1>
      <div className="text-xs text-[#8B8B92] mt-2 font-mono">id: {myId.slice(-4)}</div>

      <div className="flex flex-col items-center gap-2 mt-4">
        <div className="text-xs text-[#5A5A62]">eating {targetMB} MB…</div>
        {useWebRTC && (
          <div className="text-[10px] font-semibold text-[#34D399] border border-[#34D399]/40 px-2 py-1 rounded bg-[#34D399]/10 flex items-center gap-2">
            <Icons.Wifi size={10} /> WEBRTC STORM
          </div>
        )}
      </div>

      <div className="text-4xl font-mono font-semibold mt-4 text-[#34D399]">
        {allocatedMB.toFixed(0)} <span className="text-sm text-[#5A5A62]">MB</span>
      </div>
      <button
        onClick={() => window.close()}
        className="mt-8 bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/40 hover:bg-[#F87171]/25 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
      >
        Self destruct
      </button>
    </div>
  );
}
