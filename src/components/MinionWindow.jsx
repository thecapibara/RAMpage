import React, { useState, useEffect, useRef } from 'react';
import Icons from './icons';

export default function MinionWindow() {
  const params = new URLSearchParams(window.location.search);
  const target = parseInt(params.get('target')) || 512;
  const myId = params.get('id') || `zombie_${Math.random().toString(36).substring(2, 11)}`;
  const useWebRTC = params.get('webrtc') === 'true';

  const [targetMB, setTargetMB] = useState(target);
  const [allocatedMB, setAllocatedMB] = useState(0);
  const [workers, setWorkers] = useState([]);
  
  const workersRef = useRef([]);
  const startedRef = useRef(false);

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

  // Allocate memory on startup
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

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
            try { dc.send(junk); } catch (e) {}
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
        try { pc.close(); } catch (e) {}
      });
    };
  }, [useWebRTC]);

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center font-mono select-none">
      <h1 className="text-2xl font-black text-rose-500 animate-pulse">MINION</h1>
      <div className="text-xs text-slate-400 mt-2">ID: {myId.slice(-4)}</div>
      
      <div className="flex flex-col items-center gap-2 mt-4">
        <div className="text-xs text-slate-500">Eating {targetMB} MB...</div>
        {useWebRTC && (
          <div className="text-[10px] font-bold text-amber-500 border border-amber-500/50 px-2 py-1 rounded bg-amber-900/20 animate-pulse flex items-center gap-2">
            <Icons.Wifi size={10}/> WEBRTC STORM ACTIVE
          </div>
        )}
      </div>

      <div className="text-4xl font-bold mt-4 text-indigo-400">
        {allocatedMB.toFixed(0)} <span className="text-sm">MB</span>
      </div>
      <button 
        onClick={() => window.close()} 
        className="mt-8 bg-red-900/50 text-red-500 border border-red-900 px-4 py-1 rounded text-xs hover:bg-red-900 hover:text-white transition-colors"
      >
        SELF DESTRUCT
      </button>
    </div>
  );
}
