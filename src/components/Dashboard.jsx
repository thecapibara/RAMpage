import React, { useState, useRef, useEffect, useCallback } from 'react';
import Icons from './icons';
import SimpleChart from './SimpleChart';
import GpuCanvas from './GpuCanvas';
import ConfirmModal from './ConfirmModal';
import ErrorBoundary from './ErrorBoundary';
import Sidebar from './Sidebar';
import LogsPanel from './LogsPanel';
import RamCpuView from './views/RamCpuView';
import StorageView from './views/StorageView';
import GpuView from './views/GpuView';
import NetworkView from './views/NetworkView';
import BenchmarksView from './views/BenchmarksView';
import WebRtcView from './views/WebRtcView';
import IndexedDbView from './views/IndexedDbView';
import SwHammerView from './views/SwHammerView';
import AudioView from './views/AudioView';
import {
  MAX_LIMIT,
  WORKER_CAP,
  LIGHT_SUITE,
  NORMAL_SUITE,
  BURNER_SUITE
} from '../constants';

export default function Dashboard() {
  const [cpuMode, setCpuMode] = useState('STANDARD');
  const [ramMode, setRamMode] = useState('LINEAR');
  const [activeTab, setActiveTab] = useState('RAM');
  const [view, setView] = useState('RAM');
  const [targetMB, setTargetMB] = useState(4096);
  const [cpuLoad, setCpuLoad] = useState(0); 
  const [allocatedMB, setAllocatedMB] = useState(0);
  const [isAllocating, setIsAllocating] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [chartDataRAM, setChartDataRAM] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageCount, setStorageCount] = useState(0); 
  const [isFillingStorage, setIsFillingStorage] = useState(false);
  const [chartDataStorage, setChartDataStorage] = useState([]);
  const isFillingStorageRef = useRef(false);
  const storageWorkerRef = useRef(null);
  
  const [forceUpdateStorage, setForceUpdateStorage] = useState(0);
  
  const [gpuActive, setGpuActive] = useState(false);
  const [gpuIntensity, setGpuIntensity] = useState(50);
  const [gpuResolution, setGpuResolution] = useState(2048);
  const [gpuOverdrive, setGpuOverdrive] = useState(1); 
  const [gpuMode, setGpuMode] = useState('FRACTAL'); 
  const [showGpuPopup, setShowGpuPopup] = useState(false);

  // Network Stress State
  const [netActive, setNetActive] = useState(false);
  const [netStats, setNetStats] = useState({ speed: 0, total: 0 });
  const networkWorkerRef = useRef(null);

  // WebRTC Mesh Storm State
  const [rtcActive, setRtcActive] = useState(false);
  const [rtcStats, setRtcStats] = useState({ open: 0, channels: 0, mbps: 0, totalMB: 0 });
  const [rtcPeers, setRtcPeers] = useState(8);
  const [rtcPayload, setRtcPayload] = useState(16);
  const [rtcInterval, setRtcInterval] = useState(5);
  const [rtcMedia, setRtcMedia] = useState(false);
  const rtcRefs = useRef({ pairs: [], intervals: [], stream: null, sentBytes: 0, recvBytes: 0, statsTimer: null });

  // IndexedDB Flood State
  const [idbActive, setIdbActive] = useState(false);
  const [idbStats, setIdbStats] = useState({ storedMB: 0, objects: 0, speed: 0, openStores: 0 });
  const [idbChunk, setIdbChunk] = useState(8);
  const [idbStores, setIdbStores] = useState(5);
  const idbRefs = useRef({ db: null, loop: null, cancel: false, bytes: 0, objects: 0, lastBytes: 0, lastTime: 0, statsTimer: null });

  // Service Worker Hammer State
  const [swActive, setSwActive] = useState(false);
  const [swStats, setSwStats] = useState({ count: 0, rps: 0, cpuMs: 0, bytesMB: 0 });
  const [swMode, setSwMode] = useState('fib');
  const [swWork, setSwWork] = useState(200000);
  const [swSize, setSwSize] = useState(65536);
  const [swRate, setSwRate] = useState(20);
  const [swRegState, setSwRegState] = useState('init'); // init | ok | registered-before | <error msg>
  const swRefs = useRef({ reg: null, loop: null, cancel: false, count: 0, cpuMsAcc: 0, bytes: 0, lastTime: 0, lastCount: 0, statsTimer: null });

  // AudioContext Abuse State
  const [audioActive, setAudioActive] = useState(false);
  const [audioStats, setAudioStats] = useState({ running: 0, renders: 0, samples: 0, seconds: 0 });
  const [audioVoices, setAudioVoices] = useState(8);
  const [audioLength, setAudioLength] = useState(2);
  const [audioMode, setAudioMode] = useState('conv');
  const audioRefs = useRef({ active: 0, renders: 0, samples: 0, totalSamples: 0, start: 0, cancel: false, statsTimer: null });

  // Benchmarking
  const [benchType, setBenchType] = useState('CPU'); 
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  
  // CPU Bench
  const [cpuBenchScore, setCpuBenchScore] = useState(0);
  const [cpuBenchStage, setCpuBenchStage] = useState(0);
  const cpuBenchScoreRef = useRef(0);
  const [cpuHighScore, setCpuHighScore] = useState(0);

  // GPU Bench
  const [gpuBenchMode, setGpuBenchMode] = useState('NONE'); 
  const [gpuBenchStage, setGpuBenchStage] = useState(0);
  const [gpuBenchResults, setGpuBenchResults] = useState([]);
  const [gpuBenchTimeLeft, setGpuBenchTimeLeft] = useState(0);
  const [gpuBenchCurrentFps, setGpuBenchCurrentFps] = useState(0);
  const gpuBenchAvgBufferRef = useRef([]); 
  const [gpuBenchAvgBuffer, setGpuBenchAvgBuffer] = useState([]); 
  const [gpuHighScores, setGpuHighScores] = useState({ LIGHT: 0, NORMAL: 0, BURNER: 0 });
  const [showBenchResults, setShowBenchResults] = useState(false);
  
  // --- VRAM BURNER STATE ---
  const [vramActive, setVramActive] = useState(false);
  const [vramCount, setVramCount] = useState(0);
  const vramInterval = useRef(null);
  const vramContext = useRef(null);
  const vramStore = useRef([]); 

  const gpuBenchInterval = useRef(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const benchmarkInterval = useRef(null);

  // --- MINIONS LOGIC ---
  const [minionSize, setMinionSize] = useState(512); 
  const [minionCount, setMinionCount] = useState(1); 
  const [minions, setMinions] = useState([]); 
  const [minionWebRTC, setMinionWebRTC] = useState(false);
  const bcRef = useRef(null);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const workersRef = useRef([]);

  const addLog = useCallback((msg, type = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const safeMsg = String(msg);
    setLogs(prev => [`[${time}] ${safeMsg}`, ...prev].slice(0, 50)); 
  }, []);

  // Sync workers ref
  useEffect(() => {
    workersRef.current = workers;
  }, [workers]);

  // Cleanups on component unmount
  useEffect(() => {
    return () => {
      // Cleanup RAM Workers
      workersRef.current.forEach(w => w.terminate());
      
      // Cleanup Storage Worker
      if (storageWorkerRef.current) {
        storageWorkerRef.current.terminate();
      }
      
      // Cleanup Network Worker
      if (networkWorkerRef.current) {
        networkWorkerRef.current.terminate();
      }

      // Cleanup WebRTC storm
      const r = rtcRefs.current;
      r.intervals.forEach((iv) => clearInterval(iv));
      if (r.statsTimer) clearInterval(r.statsTimer);
      r.pairs.forEach((pc) => { try { pc.close(); } catch {} });
      if (r.stream) r.stream.getTracks().forEach((t) => t.stop());

      // Cleanup IndexedDB flood loop
      if (idbRefs.current.statsTimer) clearInterval(idbRefs.current.statsTimer);
      idbRefs.current.cancel = true;

      // Cleanup Service Worker hammer
      const s = swRefs.current;
      s.cancel = true;
      if (s.statsTimer) clearInterval(s.statsTimer);

      // Cleanup AudioContext abuse
      audioRefs.current.cancel = true;
      if (audioRefs.current.statsTimer) clearInterval(audioRefs.current.statsTimer);
      
      // Cleanup VRAM Burner
      if (vramInterval.current) clearInterval(vramInterval.current);
      if (vramContext.current) {
        const gl = vramContext.current;
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
        else if (!gl.isContextLost()) {
          vramStore.current.forEach(t => gl.deleteTexture(t));
        }
      }
      
      // Cleanup Intervals
      if (gpuBenchInterval.current) clearInterval(gpuBenchInterval.current);
      if (benchmarkInterval.current) clearInterval(benchmarkInterval.current);
      if (bcRef.current) bcRef.current.close();
    };
  }, []);

  // Init High Scores
  useEffect(() => {
      const cpu = localStorage.getItem('ramEater_cpuHighScore');
      const l = localStorage.getItem('ramEater_gpuScore_LIGHT');
      const n = localStorage.getItem('ramEater_gpuScore_NORMAL');
      const b = localStorage.getItem('ramEater_gpuScore_BURNER');
      
      if(cpu) setCpuHighScore(Number(cpu));
      setGpuHighScores({
          LIGHT: Number(l || 0),
          NORMAL: Number(n || 0),
          BURNER: Number(b || 0)
      });
  }, []);

  // Mobile check
  useEffect(() => {
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

  // Force Storage UI update loop
  useEffect(() => {
      if(isFillingStorage) {
          const interval = setInterval(() => setForceUpdateStorage(n => n+1), 200);
          return () => clearInterval(interval);
      }
  }, [isFillingStorage]);

  // Chart Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setChartDataRAM(prev => [...prev, allocatedMB].slice(-60));
      if(activeTab === 'STORAGE') {
          setChartDataStorage(prev => [...prev, storageUsed].slice(-60));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [allocatedMB, activeTab, storageUsed]);

  // Broadcast Channel setup for minions
  useEffect(() => {
      bcRef.current = new BroadcastChannel('rampage_channel');
      
      bcRef.current.onmessage = (event) => {
          if (event.data && event.data.type === 'PONG') {
              const incomingId = event.data.id;
              
              setMinions(prev => {
                  if (prev.some(m => m.id === incomingId)) return prev;
                  return [...prev, { id: incomingId, zombie: true }];
              });
          }
      };

      bcRef.current.postMessage('PING');

      return () => { if(bcRef.current) bcRef.current.close(); };
  }, []);

  // --- WORKERS & STORAGE LOGIC ---
  const allocateMemory = async (target = targetMB, cpu = cpuLoad) => {
    const effectiveCpu = cpuMode === 'HASH' ? 100 : cpu; 
    const mainThreadCap = 0; 
    const workerTotal = Math.max(0, target - mainThreadCap);
    
    if (workers.length > 0) {
        workers.forEach((w, i) => {
            const amount = Math.min(WORKER_CAP, workerTotal - (i * WORKER_CAP));
            if (amount > 0) w.postMessage({ 
                action: 'ALLOCATE', 
                targetMB: amount, 
                id: i, 
                cpuLoad: effectiveCpu, 
                mode: cpuMode, 
                ramMode: ramMode 
            });
        });
        return;
    }
    
    setIsAllocating(true);
    setAllocatedMB(0);
    const numWorkers = Math.ceil(workerTotal / WORKER_CAP);
    const newWorkers = [];
    const workerUrl = new URL('../workers/ramWorker.js', import.meta.url);
    
    addLog(`Spawning ${numWorkers} workers for ${target}MB...`);
    for(let i=0; i<numWorkers; i++) {
        const w = new Worker(workerUrl, { type: 'module' });
        const amount = Math.min(WORKER_CAP, workerTotal - (i*WORKER_CAP));
        
        w.onmessage = (e) => {
            if(e.data.type === 'PROGRESS') setAllocatedMB(p => p + e.data.addedMB);
            if(e.data.type === 'ERROR') addLog(`Worker #${i} Error`, 'error');
            else if (e.data.type === 'HASH') {
                if (Math.random() > 0.8) addLog(`⛏️ Hashed: ${e.data.hash}`, 'success');
            }
        };
        
        w.postMessage({ 
          action: 'ALLOCATE', 
          targetMB: amount, 
          id: i, 
          cpuLoad: effectiveCpu, 
          mode: cpuMode, 
          ramMode: ramMode
        });
        
        newWorkers.push(w);
    }
    setWorkers(newWorkers);
  };

  const stopRAM = () => {
      workers.forEach(w => w.terminate());
      setWorkers([]);
      setIsAllocating(false);
  };

  // --- OPFS STORAGE LOGIC ---
  const initStorageWorker = () => {
      if (storageWorkerRef.current) return storageWorkerRef.current;
      
      const workerUrl = new URL('../workers/storageWorker.js', import.meta.url);
      const worker = new Worker(workerUrl, { type: 'module' });
      
      worker.onmessage = (e) => {
          if (e.data.type === 'WRITTEN') {
              setStorageUsed(prev => prev + e.data.mb);
              setStorageCount(prev => prev + 1); 
          } else if (e.data.type === 'ERROR') {
              addLog(`Storage Full/Error: ${e.data.msg}`, 'warning');
              stopStorage();
          } else if (e.data.type === 'CLEARED') {
              setStorageUsed(0);
              setStorageCount(0);
              addLog("Storage Cleaned (OPFS).", 'success');
          }
      };
      
      storageWorkerRef.current = worker;
      return worker;
  };

  const fillStorage = () => {
      if (isFillingStorage) return;
      setIsFillingStorage(true);
      isFillingStorageRef.current = true;
      addLog("Storage: Starting High-Speed OPFS Writer...");
      
      const worker = initStorageWorker();
      worker.postMessage('START');
  };

  const stopStorage = () => {
      setIsFillingStorage(false);
      isFillingStorageRef.current = false;
      
      if (storageWorkerRef.current) {
          storageWorkerRef.current.terminate();
          storageWorkerRef.current = null; 
      }
      addLog("Storage Writer Stopped (Terminated).");
  };

  const clearStorage = () => {
      stopStorage();
      const worker = initStorageWorker(); 
      worker.postMessage('CLEAR');
  };

  // --- NETWORK STORM LOGIC ---
  const runNetworkStress = () => {
    if (netActive) return;
    setNetActive(true);
    setNetStats({ speed: 0, total: 0 });
    addLog("NETWORK STORM: Initializing Background Worker...");

    const workerUrl = new URL('../workers/networkWorker.js', import.meta.url);
    const worker = new Worker(workerUrl, { type: 'module' });
    networkWorkerRef.current = worker;

    let lastBytes = 0;
    let lastTime = performance.now();

    worker.onmessage = (e) => {
        const currentBytes = e.data.total;
        const now = performance.now();
        const timeDiff = (now - lastTime) / 1000; 

        if (timeDiff > 0.5) { 
            const bytesDiff = currentBytes - lastBytes;
            const mbps = (bytesDiff * 8) / (1024 * 1024) / timeDiff;
            
            setNetStats({ 
                speed: mbps, 
                total: currentBytes / (1024 * 1024) 
            });

            lastBytes = currentBytes;
            lastTime = now;
        } else if (lastBytes === 0) {
             setNetStats(prev => ({ ...prev, total: currentBytes / (1024 * 1024) }));
        }
    };

    worker.postMessage('START');
  };

  const stopNetworkStress = () => {
      if (networkWorkerRef.current) {
          networkWorkerRef.current.terminate();
          networkWorkerRef.current = null;
      }
      setNetActive(false);
      setNetStats(prev => ({ ...prev, speed: 0 }));
      addLog(`Network Stress Stopped. Burned: ${netStats.total.toFixed(0)} MB`);
  };

  // --- WEBRTC MESH STORM ---
  const startRtcStorm = async () => {
    if (rtcActive) return;
    const refs = rtcRefs.current;
    refs.pairs = [];
    refs.intervals = [];
    refs.sentBytes = 0;
    refs.recvBytes = 0;
    refs.stream = null;

    setRtcActive(true);
    setRtcStats({ open: 0, channels: 0, mbps: 0, totalMB: 0 });
    addLog(`WebRTC: building ${rtcPeers} peer-pairs…`);

    // optional media
    if (rtcMedia) {
      try {
        refs.stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        addLog(`WebRTC: camera stream acquired for encoding load`, 'success');
      } catch (e) {
        addLog(`WebRTC: getUserMedia denied — running data-only`, 'warning');
      }
    }

    const payload = new Uint8Array(rtcPayload * 1024);
    // fill with pseudo-random to defeat compression inside DTLS
    for (let i = 0; i < payload.length; i++) payload[i] = (Math.random() * 256) | 0;
    let openCount = 0;
    let channelCount = 0;

    for (let i = 0; i < rtcPeers; i++) {
      const pc1 = new RTCPeerConnection();
      const pc2 = new RTCPeerConnection();
      refs.pairs.push(pc1, pc2);

      pc1.onicecandidate = (e) => e.candidate && pc2.addIceCandidate(e.candidate).catch(() => {});
      pc2.onicecandidate = (e) => e.candidate && pc1.addIceCandidate(e.candidate).catch(() => {});

      // media sender
      if (refs.stream) {
        try {
          refs.stream.getTracks().forEach((t) => pc1.addTrack(t, refs.stream));
        } catch {}
        pc2.ontrack = () => { /* receive & discard — still burns decode */ };
      }

      const dc = pc1.createDataChannel('storm', { ordered: false, maxRetransmits: 0 });
      dc.binaryType = 'arraybuffer';
      dc.onopen = () => {
        openCount += 2;
        channelCount += 1;
        setRtcStats((s) => ({ ...s, open: openCount, channels: channelCount }));
        const iv = setInterval(() => {
          if (dc.readyState === 'open') {
            try { dc.send(payload); refs.sentBytes += payload.byteLength; } catch {}
          }
        }, rtcInterval);
        refs.intervals.push(iv);
      };
      dc.onmessage = (ev) => { refs.recvBytes += ev.data.byteLength; };

      try {
        const offer = await pc1.createOffer();
        await pc1.setLocalDescription(offer);
        await pc2.setRemoteDescription(offer);
        const answer = await pc2.createAnswer();
        await pc2.setLocalDescription(answer);
        await pc1.setRemoteDescription(answer);
      } catch (e) {
        addLog(`WebRTC: pair ${i} failed: ${e.message}`, 'warning');
      }
    }

    // stats sampler
    let lastSent = 0;
    let lastTime = performance.now();
    refs.statsTimer = setInterval(() => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      const dBytes = refs.sentBytes - lastSent;
      const mbps = dt > 0 ? (dBytes * 8) / (1024 * 1024) / dt : 0;
      lastSent = refs.sentBytes;
      lastTime = now;
      const totalMB = (refs.sentBytes + refs.recvBytes) / (1024 * 1024);
      setRtcStats((s) => ({ ...s, mbps, totalMB }));
    }, 500);

    addLog(`WebRTC mesh storm started. Targeting ${rtcPeers} open DCs.`, 'success');
  };

  const stopRtcStorm = () => {
    const refs = rtcRefs.current;
    refs.intervals.forEach((iv) => clearInterval(iv));
    refs.intervals = [];
    if (refs.statsTimer) { clearInterval(refs.statsTimer); refs.statsTimer = null; }
    refs.pairs.forEach((pc) => { try { pc.close(); } catch {} });
    refs.pairs = [];
    if (refs.stream) { refs.stream.getTracks().forEach((t) => t.stop()); refs.stream = null; }
    const burned = (refs.sentBytes + refs.recvBytes) / (1024 * 1024);
    setRtcActive(false);
    setRtcStats((s) => ({ ...s, open: 0, channels: 0, mbps: 0 }));
    addLog(`WebRTC storm stopped. Burned: ${burned.toFixed(1)} MB`);
  };

  // --- INDEXEDDB FLOOD ---
  const startIdbFlood = async () => {
    if (idbActive) return;
    const r = idbRefs.current;
    r.cancel = false;
    r.bytes = 0;
    r.objects = 0;
    r.lastBytes = 0;
    r.lastTime = performance.now();

    // Open / upgrade database with N parallel object stores
    const req = indexedDB.open('rampage_idb', Date.now());
    await new Promise((resolve, reject) => {
      req.onupgradeneeded = () => {
        const db = req.result;
        for (let i = 0; i < idbStores; i++) {
          if (!db.objectStoreNames.contains(`s${i}`)) db.createObjectStore(`s${i}`, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }).then((db) => { r.db = db; }).catch((e) => {
      addLog(`IndexedDB: open failed: ${e.message}`, 'error');
    });

    if (!r.db) return;

    setIdbActive(true);
    setIdbStats({ storedMB: 0, objects: 0, speed: 0, openStores: idbStores });
    addLog(`IndexedDB flood started — ${idbStores} stores × ${idbChunk}MB blobs`, 'success');

    // Build a pseudo-random blob once per chunk (Uint8Array -> Blob)
    const chunkBytes = idbChunk * 1024 * 1024;
    const makeBlob = () => {
      const buf = new Uint8Array(chunkBytes);
      for (let i = 0; i < chunkBytes; i += 4096) buf.fill((Math.random()*256)|0, i, Math.min(i+4096, chunkBytes));
      return new Blob([buf], { type: 'application/octet-stream' });
    };

    let keyCounter = 0;
    let storeIdx = 0;

    // Stats sampler
    if (r.statsTimer) clearInterval(r.statsTimer);
    r.statsTimer = setInterval(() => {
      const now = performance.now();
      const dt = (now - r.lastTime) / 1000;
      const dBytes = r.bytes - r.lastBytes;
      const speed = dt > 0 ? dBytes / (1024 * 1024) / dt : 0;
      r.lastBytes = r.bytes;
      r.lastTime = now;
      setIdbStats((s) => ({
        ...s,
        storedMB: r.bytes / (1024 * 1024),
        objects: r.objects,
        speed,
      }));
    }, 500);

    // sequential async puts across rotating stores
    const loop = async () => {
      while (!r.cancel) {
        const blob = makeBlob();
        const storeName = `s${storeIdx}`;
        storeIdx = (storeIdx + 1) % idbStores;
        const key = keyCounter++;
        try {
          const tx = r.db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          await new Promise((resolve, reject) => {
            const q = store.put({ id: key, blob, ts: Date.now() });
            q.onsuccess = () => resolve();
            q.onerror = () => reject(q.error);
          });
          r.bytes += chunkBytes;
          r.objects += 1;
        } catch (e) {
          if (e && e.name === 'QuotaExceededError') {
            addLog(`IndexedDB: QuotaExceededError — flooded ${r.objects} objects; clearing database`, 'warning');
            r.cancel = true;
            await clearIdbDatabase();
            setIdbStats({ storedMB: 0, objects: 0, speed: 0, openStores: 0 });
            setIdbActive(false);
            return;
          } else {
            addLog(`IndexedDB: put error: ${e.message}`, 'error');
            await new Promise((res) => setTimeout(res, 200));
          }
        }
        yieldToUI();
        await new Promise((res) => setTimeout(res, 0));
      }
    };

    const yieldToUI = () => {};
    loop();
  };

  const clearIdbDatabase = async () => {
    const r = idbRefs.current;
    if (r.db) { try { r.db.close(); } catch {} r.db = null; }
    await new Promise((resolve) => {
      const req = indexedDB.deleteDatabase('rampage_idb');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
    addLog(`IndexedDB: database deleted`, 'success');
  };

  const stopIdbFlood = async () => {
    const r = idbRefs.current;
    r.cancel = true;
    if (r.statsTimer) { clearInterval(r.statsTimer); r.statsTimer = null; }
    setIdbActive(false);
    addLog(`IndexedDB flood stopping…`);
    // small delay to let pending tx finish, then wipe
    setTimeout(() => clearIdbDatabase(), 100);
  };

  // --- SERVICE WORKER HAMMER ---
  const ensureSwRegistered = async () => {
    const r = swRefs.current;
    if (r.reg) return r.reg;
    try {
      const reg = await navigator.serviceWorker.register('/sw-hammer.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      r.reg = reg;
      setSwRegState('ok');
      return reg;
    } catch (e) {
      setSwRegState(`register failed: ${e.message}`);
      addLog(`SW: register failed: ${e.message}`, 'error');
      return null;
    }
  };

  const startSw = async () => {
    if (swActive) return;
    const reg = await ensureSwRegistered();
    if (!reg) return;
    const r = swRefs.current;
    r.cancel = false;
    r.count = 0;
    r.cpuMsAcc = 0;
    r.bytes = 0;
    r.lastTime = performance.now();
    r.lastCount = 0;
    setSwActive(true);
    setSwStats({ count: 0, rps: 0, cpuMs: 0, bytesMB: 0 });
    addLog(`SW hammer started — mode=${swMode} work=${swWork} size=${swSize} rate=${swRate}ms`, 'success');

    if (r.statsTimer) clearInterval(r.statsTimer);
    r.statsTimer = setInterval(() => {
      const now = performance.now();
      const dt = (now - r.lastTime) / 1000;
      const dCount = r.count - r.lastCount;
      const rps = dt > 0 ? dCount / dt : 0;
      const avgCpu = r.count > 0 ? r.cpuMsAcc / r.count : 0;
      r.lastTime = now;
      r.lastCount = r.count;
      setSwStats({
        count: r.count,
        rps,
        cpuMs: avgCpu,
        bytesMB: r.bytes / (1024 * 1024),
      });
    }, 500);

    const fetchOne = async () => {
      const url = `/sw-hammer/r?mode=${swMode}&work=${swWork}&sz=${swSize}&_=${Date.now()}`;
      try {
        const res = await fetch(url);
        r.bytes += Number(res.headers.get('Content-Length') || swSize);
        const cpu = parseFloat(res.headers.get('X-Rampage-Cpu-Ms') || '0');
        if (!isNaN(cpu)) r.cpuMsAcc += cpu;
        r.count += 1;
        // drain body so the response isn't hanging
        await res.arrayBuffer();
      } catch (e) {
        // ignore transient network errors
      }
    };

    const loop = async () => {
      while (!r.cancel) {
        // small batch in flight — fire in parallel to keep SW saturated
        const burst = Math.max(1, Math.floor(50 / (swRate + 1)));
        const bag = [];
        for (let i = 0; i < burst; i++) bag.push(fetchOne());
        await Promise.all(bag);
        if (swRate > 0) await new Promise((res) => setTimeout(res, swRate));
      }
    };
    r.loop = loop;
    loop();
  };

  const stopSw = () => {
    const r = swRefs.current;
    r.cancel = true;
    if (r.statsTimer) { clearInterval(r.statsTimer); r.statsTimer = null; }
    setSwActive(false);
    const finalCount = r.count;
    addLog(`SW hammer stopped. ${finalCount.toLocaleString()} requests sent. SW is still active under /sw-hammer/ scope.`);
  };

  const clearSw = async () => {
    const r = swRefs.current;
    stopSw();
    try {
      if (r.reg) {
        await r.reg.unregister();
        r.reg = null;
        addLog(`SW unregistered`, 'success');
        setSwRegState('init');
      }
    } catch (e) {
      addLog(`SW unregister error: ${e.message}`, 'error');
    }
  };

  // --- AUDIOCONTEXT ABUSE ---
  const buildVoiceGraph = (ctx, mode, lengthSec) => {
    const sr = ctx.sampleRate;
    const totalSamples = Math.floor(sr * lengthSec);

    // Convolver with long impulse response: noise tail
    const buildIR = () => {
      const buf = ctx.createBuffer(2, totalSamples, sr);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < d.length; i++) {
          // decaying noise → simulates long cathedral reverb tail
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
        }
      }
      return buf;
    };

    // WaveShaper: monster curve
    const makeCurve = () => {
      const N = 300000;
      const c = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const x = (i / N) * 2 - 1;
        c[i] = Math.tanh(x * 3) + Math.sin(x * 18) * 0.15;
      }
      return c;
    };

    // Compressor at the end as a sink
    const dest = ctx.createDynamicsCompressor();
    dest.threshold.value = -40;
    dest.knee.value = 30;
    dest.ratio.value = 12;
    dest.attack.value = 0.003;
    dest.release.value = 0.25;
    dest.connect(ctx.destination);

    const tail = [dest];
    if (mode === 'conv' || mode === 'chaos') {
      const conv = ctx.createConvolver();
      conv.buffer = buildIR();
      conv.connect(dest);
      tail.unshift(conv);
    }
    if (mode === 'waveshaper' || mode === 'chaos') {
      const ws = ctx.createWaveShaper();
      ws.curve = makeCurve();
      ws.oversample = '4x';
      ws.connect(tail[0]);
      tail.unshift(ws);
    }
    if (mode === 'osc' || mode === 'chaos') {
      // 8 oscillators each, varied type + freq, feeding chain
      const types = ['sine', 'square', 'sawtooth', 'triangle'];
      for (let i = 0; i < 8; i++) {
        const osc = ctx.createOscillator();
        osc.type = types[i % types.length];
        osc.frequency.value = 110 + Math.random() * 1000;
        osc.detune.value = (Math.random() - 0.5) * 60;
        osc.connect(tail[0]);
        osc.start(0);
        osc.stop(lengthSec);
      }
    } else {
      // No oscillator path → feed conv/ws with a noise source bufferSource
      const noise = ctx.createBuffer(2, totalSamples, sr);
      for (let ch = 0; ch < 2; ch++) {
        const d = noise.getChannelData(ch);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const src = ctx.createBufferSource();
      src.buffer = noise;
      src.connect(tail[0]);
      src.start(0);
    }
  };

  const startAudio = async () => {
    if (audioActive) return;
    if (typeof OfflineAudioContext === 'undefined' && typeof webkitOfflineAudioContext === 'undefined') {
      addLog(`Audio: OfflineAudioContext unsupported in this browser`, 'error');
      return;
    }
    const r = audioRefs.current;
    r.cancel = false;
    r.renders = 0;
    r.samples = 0;
    r.totalSamples = 0;
    r.active = 0;
    r.start = performance.now();
    setAudioActive(true);
    setAudioStats({ running: 0, renders: 0, samples: 0, seconds: 0 });
    addLog(`Audio abuse: spawning ${audioVoices}× ${audioLength}s ${audioMode} voices`, 'success');

    // stats sampler
    if (r.statsTimer) clearInterval(r.statsTimer);
    r.statsTimer = setInterval(() => {
      const seconds = (performance.now() - r.start) / 1000;
      setAudioStats({
        running: r.active,
        renders: r.renders,
        samples: r.totalSamples,
        seconds,
      });
    }, 250);

    const oneVoice = async () => {
      while (!r.cancel) {
        const sr = 44100;
        const ctx = new OfflineAudioContext(2, Math.ceil(sr * audioLength), sr);
        r.active += 1;
        try {
          buildVoiceGraph(ctx, audioMode, audioLength);
          const buf = await ctx.startRendering();
          r.renders += 1;
          r.totalSamples += buf.length;
        } catch (e) {
          addLog(`Audio: render error: ${e.message}`, 'warning');
        } finally {
          r.active -= 1;
        }
        // yield
        await new Promise((res) => setTimeout(res, 0));
      }
    };

    // launch N concurrent voices; they loop until cancelled
    for (let i = 0; i < audioVoices; i++) {
      oneVoice().catch(() => { r.active = Math.max(0, r.active - 1); });
    }
  };

  const stopAudio = () => {
    const r = audioRefs.current;
    r.cancel = true;
    if (r.statsTimer) { clearInterval(r.statsTimer); r.statsTimer = null; }
    setAudioActive(false);
    addLog(`Audio abuse stopped. Voices: ${r.renders} renders, ${r.totalSamples.toLocaleString()} samples.`);
  };

  const clearAll = useCallback(() => {
      stopRAM();
      clearStorage();
      stopNetworkStress();
      stopRtcStorm();
      stopIdbFlood();
      stopSw();
      stopAudio();
      setGpuActive(false);
      setAllocatedMB(0);
      setStorageUsed(0);
      setStorageCount(0);
      setError(null);
      setChartDataRAM([]);
      setChartDataStorage([]);
      // GPU benchmark cancellation inline
      setGpuBenchMode('NONE');
      setShowGpuPopup(false);
      setGpuActive(false);
      if (gpuBenchInterval.current) clearInterval(gpuBenchInterval.current);
      addLog("System reset completed.");
  }, [workers]);

  const handleEmergencyResetConfirm = () => {
    setConfirmModal({
      isOpen: true,
      title: 'EMERGENCY RESET',
      message: 'Are you sure you want to stop all processes, clean OPFS storage, clear memory, and cancel all benchmarks?',
      onConfirm: () => {
        clearAll();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // --- GPU BENCHMARK LOGIC ---
  const finishGpuBenchmark = (results, modeName) => {
      const totalScore = results.reduce((acc, r) => acc + Math.round(r.avgFps * (r.res/1024) * r.od), 0);
      setGpuBenchMode('NONE');
      setShowGpuPopup(false);
      setGpuActive(false);
      if (gpuBenchInterval.current) clearInterval(gpuBenchInterval.current);
      
      const key = `ramEater_gpuScore_${modeName}`;
      const currentHigh = Number(localStorage.getItem(key) || 0);
      
      if(totalScore > currentHigh) {
          localStorage.setItem(key, totalScore);
          setGpuHighScores(prev => ({ ...prev, [modeName]: totalScore }));
      }
      
      setShowBenchResults(modeName); 
      addLog(`${modeName} GPU Benchmark Complete. Score: ${totalScore}`);
  };

  const cancelGpuBenchmark = () => {
      setGpuBenchMode('NONE');
      setShowGpuPopup(false);
      setGpuActive(false);
      if (gpuBenchInterval.current) clearInterval(gpuBenchInterval.current);
      addLog("GPU Benchmark Cancelled.", 'error');
  };

  const recordGpuResult = useCallback((mode, stageIdx, currentResults) => {
      const suite = mode === 'LIGHT' ? LIGHT_SUITE : (mode === 'NORMAL' ? NORMAL_SUITE : BURNER_SUITE);
      const config = suite[stageIdx];
      
      const validSamples = gpuBenchAvgBufferRef.current.slice(8); 
      const avg = validSamples.length > 0 
          ? validSamples.reduce((a,b) => a+b, 0) / validSamples.length 
          : gpuBenchCurrentFps; 

      const newResult = { ...config, avgFps: avg };
      const newResults = [...currentResults, newResult];
      setGpuBenchResults(newResults);
      setGpuBenchStage(stageIdx + 1);
      setupGpuStage(mode, stageIdx + 1, newResults);
  }, [gpuBenchCurrentFps]);

  const setupGpuStage = useCallback((mode, stageIdx, currentResults) => {
      const suite = mode === 'LIGHT' ? LIGHT_SUITE : (mode === 'NORMAL' ? NORMAL_SUITE : BURNER_SUITE);
      if (stageIdx >= suite.length) {
          finishGpuBenchmark(currentResults, mode);
          return;
      }
      
      const config = suite[stageIdx];
      setGpuMode(config.mode);
      setGpuBenchCurrentFps(0);
      setGpuResolution(config.res);
      setGpuOverdrive(config.od);
      setGpuIntensity(100); 
      setGpuBenchTimeLeft(20); 
      setGpuBenchAvgBuffer([]); 
      gpuBenchAvgBufferRef.current = []; 
      
      if (gpuBenchInterval.current) clearInterval(gpuBenchInterval.current);
      
      gpuBenchInterval.current = setInterval(() => {
          setGpuBenchTimeLeft(prev => {
              if (prev <= 1) {
                  clearInterval(gpuBenchInterval.current);
                  recordGpuResult(mode, stageIdx, currentResults);
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);
  }, [recordGpuResult]);

  const runGpuBenchmark = (mode) => {
      if (gpuBenchMode !== 'NONE') return;
      clearAll();
      setGpuBenchMode(mode);
      setGpuBenchStage(0);
      setGpuBenchResults([]);
      setShowGpuPopup(true);
      setGpuActive(true);
      setupGpuStage(mode, 0, []);
  };

  const handleGpuFpsUpdate = useCallback((fps) => {
      setGpuBenchCurrentFps(fps);
      if (gpuBenchMode !== 'NONE') {
          setGpuBenchAvgBuffer(prev => [...prev, fps]);
          gpuBenchAvgBufferRef.current.push(fps);
      }
  }, [gpuBenchMode]);

  const handleGpuCrash = useCallback(() => {
      if (gpuBenchMode === 'NONE') return;
      
      if (gpuBenchInterval.current) clearInterval(gpuBenchInterval.current);

      const suite = gpuBenchMode === 'LIGHT' ? LIGHT_SUITE : (gpuBenchMode === 'NORMAL' ? NORMAL_SUITE : BURNER_SUITE);
      const currentConfig = suite[gpuBenchStage];
      
      const newResult = { ...currentConfig, avgFps: 0, crashed: true }; 
      const newResults = [...gpuBenchResults, newResult];
      
      setGpuBenchResults(newResults);

      setTimeout(() => {
           const nextStage = gpuBenchStage + 1;
           setGpuBenchStage(nextStage);
           setupGpuStage(gpuBenchMode, nextStage, newResults);
      }, 4000);
  }, [gpuBenchMode, gpuBenchStage, gpuBenchResults, setupGpuStage]);

  // --- CPU BENCHMARK ---
  const startCpuBenchmark = () => {
      if (isBenchmarking) return;
      clearAll();
      setIsBenchmarking(true);
      setActiveTab('RAM');
      setCpuBenchScore(0);
      cpuBenchScoreRef.current = 0;
      
      let stage = 0;
      const stages = [
          { ram: 1024, cpu: 20, time: 5 }, { ram: 2048, cpu: 50, time: 5 }, { ram: 4096, cpu: 80, time: 8 }, 
          { ram: 8192, cpu: 100, time: 10 }, { ram: 12288, cpu: 100, time: 10 } 
      ];
      
      const runStage = () => {
          if (stage >= stages.length) {
              const finalScore = cpuBenchScoreRef.current + 5000;
              const currentHigh = Number(localStorage.getItem('ramEater_cpuHighScore') || 0);
              if (finalScore > currentHigh) {
                  setCpuHighScore(finalScore);
                  localStorage.setItem('ramEater_cpuHighScore', finalScore);
              }
              addLog(`CPU Benchmark Complete. Score: ${finalScore}`, 'success');
              stopCpuBenchmark();
              return;
          }
          const current = stages[stage];
          setCpuBenchStage(stage + 1);
          setTargetMB(current.ram);
          setCpuLoad(current.cpu);
          allocateMemory(current.ram, current.cpu);
          
          let timeLeft = current.time;
          benchmarkInterval.current = setInterval(() => {
              timeLeft--;
              const pts = Math.floor((current.ram / 100) + current.cpu);
              cpuBenchScoreRef.current += pts;
              setCpuBenchScore(cpuBenchScoreRef.current);
              if (timeLeft <= 0) {
                  clearInterval(benchmarkInterval.current);
                  stage++;
                  runStage();
              }
          }, 1000);
      };
      runStage();
  };

  const stopCpuBenchmark = () => {
      if(benchmarkInterval.current) clearInterval(benchmarkInterval.current);
      setIsBenchmarking(false);
      stopRAM();
      setTargetMB(4096);
      setCpuLoad(0);
  };

  // --- MINIONS CONTROLS ---
  const spawnMinions = () => {
      const newMinions = [];
      for(let i=0; i<minionCount; i++) {
          const id = `minion_${Date.now()}_${i}`;
          
          const win = window.open(
              `?minion=true&target=${minionSize}&id=${id}&webrtc=${minionWebRTC}`, 
              id, 
              `width=300,height=200,left=${i*20},top=${i*20}`
          );
          
          if (win) {
              newMinions.push({ id, window: win });
          } else {
              addLog("Popup blocked!", 'error');
              break;
          }
      }
      
      setMinions(prev => {
          const exists = new Set(prev.map(m => m.id));
          const cleanNew = newMinions.filter(m => !exists.has(m.id));
          return [...prev, ...cleanNew];
      });
      addLog(`Spawned ${newMinions.length} minions.`, 'success');
  };

  const killMinions = () => {
      minions.forEach(m => {
          const win = m.window; 
          if(win && !win.closed) win.close();
      });
      
      if (bcRef.current) {
          bcRef.current.postMessage('KILL_ALL');
      }

      setMinions([]); 
      addLog("All minions killed.", 'info');
  };

  const handleKillMinionsConfirm = () => {
    if (minions.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'KILL ALL MINIONS',
      message: `Are you sure you want to terminate all ${minions.length} active minions?`,
      onConfirm: () => {
        killMinions();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // --- VRAM BURNER ---
  const runVramBurner = () => {
      if(vramActive) return;
      setVramActive(true);
      setVramCount(0);
      addLog("VRAM Burner: Initializing (Eating 64MB chunks)...", "warning");

      const canvas = document.createElement('canvas');
      canvas.width = 1; canvas.height = 1; 
      
      const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
      
      if(!gl) {
          addLog("VRAM Error: WebGL not supported", "error");
          setVramActive(false);
          return;
      }
      
      vramContext.current = gl;
      vramStore.current = [];

      const TEX_SIZE = 4096;
      const BUFFER = new Uint8Array(TEX_SIZE * TEX_SIZE * 4).fill(255); 

      vramInterval.current = setInterval(() => {
          try {
              if (gl.isContextLost()) {
                  throw new Error("Context Lost (VRAM Full)");
              }
              
              const texture = gl.createTexture();
              gl.bindTexture(gl.TEXTURE_2D, texture);
              
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TEX_SIZE, TEX_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, BUFFER);
              
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

              vramStore.current.push(texture);
              setVramCount(prev => prev + 1);
              
          } catch (e) {
              addLog(`VRAM Limit Hit: ${e.message}`, "error");
              stopVramBurner();
          }
      }, 200);
  };

  const stopVramBurner = () => {
      if(vramInterval.current) clearInterval(vramInterval.current);
      
      const gl = vramContext.current;
      if (gl) {
          const ext = gl.getExtension('WEBGL_lose_context');
          if(ext) ext.loseContext();
          
          if(!gl.isContextLost()) {
              vramStore.current.forEach(t => gl.deleteTexture(t));
          }
      }
      
      vramStore.current = [];
      vramContext.current = null;
      setVramActive(false);
      addLog(`VRAM Burner Stopped. Freed memory.`, "info");
  };

  const anyActive = isAllocating || isFillingStorage || gpuActive || netActive ||
                    vramActive || isBenchmarking || gpuBenchMode !== 'NONE' || rtcActive || idbActive || swActive || audioActive;
  const status = error ? 'error' : anyActive ? 'active' : 'idle';
  const activeViews = [
    isAllocating && 'RAM',
    isFillingStorage && 'STORAGE',
    (gpuActive || vramActive) && 'GPU',
    netActive && 'NETWORK',
    rtcActive && 'WEBRTC',
    idbActive && 'IDB',
    swActive && 'SW',
    audioActive && 'AUDIO',
    (isBenchmarking || gpuBenchMode !== 'NONE') && 'BENCH',
  ].filter(Boolean);

  const toggleGpu = () => {
    setGpuActive(!gpuActive);
    setActiveTab('GPU');
  };

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans text-fox relative">
      <Sidebar
        view={view}
        onViewChange={setView}
        status={status}
        activeViews={activeViews}
        onReset={handleEmergencyResetConfirm}
      />

      <main className="flex-1 overflow-y-auto p-3">
        {/* topbar */}
        <div className="glass rounded-2xl px-5 py-3 mb-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold">
              {view === 'RAM' && 'RAM & CPU'}
              {view === 'STORAGE' && 'Storage'}
              {view === 'GPU' && 'GPU'}
              {view === 'NETWORK' && 'Network'}
              {view === 'WEBRTC' && 'WebRTC'}
              {view === 'IDB' && 'IndexedDB'}
              {view === 'SW' && 'SW hammer'}
              {view === 'AUDIO' && 'Audio'}
              {view === 'BENCH' && 'Benchmarks'}
            </h2>
            <span className="chip flex items-center gap-1.5">
              {status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-lime shadow-[0_0_8px_#34D399]" />}
              {status === 'error' && <span className="w-1.5 h-1.5 rounded-full bg-red" />}
              {status === 'idle' && <span className="w-1.5 h-1.5 rounded-full bg-fox-3" />}
              <span className="uppercase tracking-wide">{status}</span>
            </span>
          </div>
          <div className="flex items-center gap-2" />
        </div>

        <div className="pb-6">
          {view === 'RAM' && (
            <RamCpuView
              allocatedMB={allocatedMB}
              chartDataRAM={chartDataRAM}
              cpuMode={cpuMode}
              ramMode={ramMode}
              targetMB={targetMB}
              cpuLoad={cpuLoad}
              isAllocating={isAllocating}
              isBenchmarking={isBenchmarking}
              gpuBenchMode={gpuBenchMode}
              isMobile={isMobile}
              minionSize={minionSize}
              minionCount={minionCount}
              minions={minions}
              minionWebRTC={minionWebRTC}
              setCpuMode={setCpuMode}
              setRamMode={setRamMode}
              setTargetMB={setTargetMB}
              setCpuLoad={setCpuLoad}
              setMinionSize={setMinionSize}
              setMinionCount={setMinionCount}
              setMinionWebRTC={setMinionWebRTC}
              allocateMemory={allocateMemory}
              stopRAM={stopRAM}
              spawnMinions={spawnMinions}
              handleKillMinionsConfirm={handleKillMinionsConfirm}
            />
          )}

          {view === 'STORAGE' && (
            <StorageView
              storageUsed={storageUsed}
              storageCount={storageCount}
              chartDataStorage={chartDataStorage}
              isFillingStorage={isFillingStorage}
              isBenchmarking={isBenchmarking}
              gpuBenchMode={gpuBenchMode}
              fillStorage={fillStorage}
              stopStorage={stopStorage}
              clearStorage={clearStorage}
            />
          )}

          {view === 'GPU' && (
            <GpuView
              gpuActive={gpuActive}
              gpuMode={gpuMode}
              gpuIntensity={gpuIntensity}
              gpuResolution={gpuResolution}
              gpuOverdrive={gpuOverdrive}
              showGpuPopup={showGpuPopup}
              isBenchmarking={isBenchmarking}
              gpuBenchMode={gpuBenchMode}
              vramActive={vramActive}
              vramCount={vramCount}
              setGpuMode={setGpuMode}
              setGpuIntensity={setGpuIntensity}
              setGpuResolution={setGpuResolution}
              setGpuOverdrive={setGpuOverdrive}
              toggleGpu={toggleGpu}
              openGpuPopup={() => setShowGpuPopup(true)}
              handleGpuCrash={handleGpuCrash}
              runVramBurner={runVramBurner}
              stopVramBurner={stopVramBurner}
            />
          )}

          {view === 'NETWORK' && (
            <NetworkView
              netActive={netActive}
              netStats={netStats}
              runNetworkStress={runNetworkStress}
              stopNetworkStress={stopNetworkStress}
            />
          )}

          {view === 'WEBRTC' && (
            <WebRtcView
              rtcActive={rtcActive}
              rtcStats={rtcStats}
              rtcPeers={rtcPeers}
              rtcPayload={rtcPayload}
              rtcInterval={rtcInterval}
              rtcMedia={rtcMedia}
              setRtcPeers={setRtcPeers}
              setRtcPayload={setRtcPayload}
              setRtcInterval={setRtcInterval}
              setRtcMedia={setRtcMedia}
              startRtcStorm={startRtcStorm}
              stopRtcStorm={stopRtcStorm}
            />
          )}

          {view === 'IDB' && (
            <IndexedDbView
              idbActive={idbActive}
              idbStats={idbStats}
              idbChunk={idbChunk}
              idbStores={idbStores}
              setIdbChunk={setIdbChunk}
              setIdbStores={setIdbStores}
              startIdbFlood={startIdbFlood}
              stopIdbFlood={stopIdbFlood}
            />
          )}

          {view === 'SW' && (
            <SwHammerView
              swActive={swActive}
              swStats={swStats}
              swMode={swMode}
              swWork={swWork}
              swSize={swSize}
              swRate={swRate}
              swRegState={swRegState}
              setSwMode={setSwMode}
              setSwWork={setSwWork}
              setSwSize={setSwSize}
              setSwRate={setSwRate}
              startSw={startSw}
              stopSw={stopSw}
              clearSw={clearSw}
            />
          )}

          {view === 'AUDIO' && (
            <AudioView
              audioActive={audioActive}
              audioStats={audioStats}
              audioVoices={audioVoices}
              audioLength={audioLength}
              audioMode={audioMode}
              setAudioVoices={setAudioVoices}
              setAudioLength={setAudioLength}
              setAudioMode={setAudioMode}
              startAudio={startAudio}
              stopAudio={stopAudio}
            />
          )}

          {view === 'BENCH' && (
            <BenchmarksView
              benchType={benchType}
              setBenchType={setBenchType}
              cpuHighScore={cpuHighScore}
              isBenchmarking={isBenchmarking}
              cpuBenchScore={cpuBenchScore}
              startCpuBenchmark={startCpuBenchmark}
              stopCpuBenchmark={stopCpuBenchmark}
              gpuHighScores={gpuHighScores}
              gpuBenchMode={gpuBenchMode}
              runGpuBenchmark={runGpuBenchmark}
            />
          )}

          <LogsPanel logs={logs} />
        </div>
      </main>

      {/* GPU fullscreen popup (kept inline — tightly coupled to bench state) */}
      {showGpuPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-0/90 p-4">
          <div className="glass relative w-full max-w-5xl h-[80vh] rounded-xl overflow-hidden flex flex-col">
            {gpuBenchMode !== 'NONE' && (
              <div className="absolute top-4 left-4 z-20 glass p-4 rounded-xl min-w-[200px]">
                <div className="flex items-center gap-2 mb-2 border-b border-line pb-2">
                  <Icons.Trophy size={16} className="text-lime" />
                  <span className="font-semibold text-sm">{gpuBenchMode} test</span>
                </div>
                <div className="text-xs mono space-y-1 text-fox-2">
                  <div>scene: {gpuMode}</div>
                  <div>res: {gpuResolution}px</div>
                  <div>overdrive: <span className="text-red">x{gpuOverdrive}</span></div>
                  <div className="text-lime">stage {gpuBenchStage + 1}/{gpuBenchMode === 'LIGHT' ? LIGHT_SUITE.length : (gpuBenchMode === 'NORMAL' ? NORMAL_SUITE.length : BURNER_SUITE.length)}</div>
                </div>
                <div className="mt-3 bg-white/5 rounded-lg p-2 flex justify-between items-end">
                  <div>
                    <div className="text-[10px] text-fox-2">avg fps</div>
                    <div className="text-xl font-semibold">
                      {gpuBenchTimeLeft > 18 ? '…' : (gpuBenchAvgBuffer.slice(4).reduce((a, b) => a + b, 0) / (gpuBenchAvgBuffer.length - 4 || 1)).toFixed(0)}
                    </div>
                  </div>
                  <div className="text-3xl font-bold grad-text">{gpuBenchTimeLeft}</div>
                </div>
              </div>
            )}
            <div className="absolute top-4 right-20 z-20 glass text-lime text-xs mono font-semibold px-3 py-1.5 rounded">
              fps: {gpuBenchTimeLeft > 18 && gpuBenchMode !== 'NONE' ? 'warming…' : gpuBenchCurrentFps}
            </div>
            <button
              onClick={() => gpuBenchMode !== 'NONE' ? cancelGpuBenchmark() : setShowGpuPopup(false)}
              className="absolute top-4 right-4 z-50 glass hover:!bg-red/25 text-fox p-2 rounded-full transition-colors"
            >
              <Icons.X size={20} />
            </button>
            <div className="flex-1 relative">
              <ErrorBoundary>
                <GpuCanvas
                  active={true}
                  key={gpuBenchStage}
                  intensity={gpuIntensity}
                  resolution={gpuResolution}
                  mode={gpuMode}
                  overdrive={gpuOverdrive}
                  onFpsUpdate={handleGpuFpsUpdate}
                  isPopup={true}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}

      {/* Bench results modal */}
      {showBenchResults && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-0/90 p-4">
          <div className="glass rounded-xl max-w-lg w-full p-6" style={{ borderColor: 'rgba(52,211,153,.6)' }}>
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-fox">{showBenchResults} results</h2>
              <div className="metric on text-4xl mt-2">
                {gpuBenchResults.reduce((acc, r) => acc + Math.round(r.avgFps * (r.res / 1024) * r.od), 0).toLocaleString()}
              </div>
              <div className="label mt-1">total score</div>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-1 mb-4 pr-2">
              {gpuBenchResults.map((r, i) => {
                const score = Math.round(r.avgFps * (r.res / 1024) * r.od);
                return (
                  <div key={i} className="flex justify-between items-center glass-2 p-2 rounded text-xs">
                    <div className="flex flex-col">
                      <span className="text-fox font-semibold">{r.mode}</span>
                      <span className="text-fox-3 text-[10px]">{r.res}px • x{r.od} od</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lime font-semibold">{score} pts</div>
                      <div className="text-fox-3 text-[10px]">{r.avgFps.toFixed(0)} fps</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowBenchResults(false)}
              className="w-full bg-grad-accent text-ink-1 font-semibold py-3 rounded-lg hover:brightness-110 transition-filter"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
