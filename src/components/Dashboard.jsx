import React, { useState, useRef, useEffect, useCallback } from 'react';
import Icons from './icons';
import SimpleChart from './SimpleChart';
import GpuCanvas from './GpuCanvas';
import ConfirmModal from './ConfirmModal';
import ErrorBoundary from './ErrorBoundary';
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

  const clearAll = useCallback(() => {
      stopRAM();
      clearStorage();
      stopNetworkStress(); 
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-mono flex flex-col gap-4 overflow-hidden select-none">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');.font-graffiti { font-family: 'Permanent Marker', cursive; text-shadow: 2px 2px 0px #4f46e5;}`}</style>
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 bg-slate-900 border border-slate-800 p-5 rounded-xl flex justify-between items-center">
             <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 transform rotate-3">
                     <Icons.Layers className="text-indigo-400 w-8 h-8" />
                 </div>
                 <div>
                     <h1 className="text-4xl text-white font-graffiti tracking-wider transform -skew-x-6">
                        <span className="text-indigo-400">RAM</span>PAGE!
                     </h1>
                     <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-1">
                        v4.4 • Full Stress Suite • <span className="text-indigo-400 font-bold">JustGL & Gemini</span>
                     </div>
                 </div>
             </div>
          </div>
          
          <div className="flex-[2] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
              <div className="flex border-b border-slate-800">
                  <button onClick={() => setActiveTab('RAM')} className={`flex-1 py-2 text-xs font-bold uppercase flex items-center justify-center gap-2 ${activeTab === 'RAM' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-800/50'}`}>
                      <Icons.Cpu size={14}/> RAM & CPU
                  </button>
                  <button onClick={() => setActiveTab('STORAGE')} className={`flex-1 py-2 text-xs font-bold uppercase flex items-center justify-center gap-2 ${activeTab === 'STORAGE' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-800/50'}`}>
                      <Icons.HardDrive size={14}/> Storage
                  </button>
                  <button onClick={() => setActiveTab('GPU')} className={`flex-1 py-2 text-xs font-bold uppercase flex items-center justify-center gap-2 ${activeTab === 'GPU' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-800/50'}`}>
                      <Icons.Monitor size={14}/> GPU Stress
                  </button>
              </div>
              <div className="h-32 p-4 relative">
                  {activeTab === 'RAM' && (
                    <ErrorBoundary>
                      <SimpleChart data={chartDataRAM} max={MAX_LIMIT} color="#6366f1" label="RAM Usage" unit="MB" />
                    </ErrorBoundary>
                  )}
                  {activeTab === 'STORAGE' && (
                    <ErrorBoundary>
                      <SimpleChart data={chartDataStorage} max={Math.max(2000, storageUsed * 1.2)} color="#f59e0b" label="Disk Usage" unit="MB" />
                    </ErrorBoundary>
                  )}
                  {activeTab === 'GPU' && (
                      <div className="w-full h-full bg-black rounded overflow-hidden relative group">
                          {gpuActive ? (
                            <ErrorBoundary>
                              <GpuCanvas 
                                active={!showGpuPopup} 
                                intensity={gpuIntensity} 
                                resolution={gpuResolution} 
                                mode={gpuMode} 
                                overdrive={gpuOverdrive}
                                onClick={() => setShowGpuPopup(true)}
                                onError={handleGpuCrash}
                              />
                            </ErrorBoundary>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-white/30 font-black text-xl tracking-widest drop-shadow-md">READY TO BURN</span>
                            </div>
                          )}
                          {gpuActive && !showGpuPopup && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <span className="text-white text-xs font-bold flex items-center gap-2"><Icons.Maximize size={16}/> Double click</span>
                              </div>
                          )}
                      </div>
                  )}
              </div>
          </div>
      </div>

      {showGpuPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="relative w-full max-w-5xl h-[80vh] bg-black border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                  {gpuBenchMode !== 'NONE' && (
                      <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-md border border-indigo-500/50 p-4 rounded-xl text-white shadow-2xl min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                              <Icons.Trophy size={16} className="text-indigo-400"/>
                              <span className="font-bold text-sm">{gpuBenchMode} TEST</span>
                          </div>
                          <div className="text-xs font-mono space-y-1 text-slate-300">
                              <div>Scene: {gpuMode}</div>
                              <div>Res: {gpuResolution}px</div>
                              <div>Overdrive: <span className="text-red-400">x{gpuOverdrive}</span></div>
                              <div className="text-indigo-400">Stage {gpuBenchStage + 1}/{gpuBenchMode === 'LIGHT' ? LIGHT_SUITE.length : (gpuBenchMode === 'NORMAL' ? NORMAL_SUITE.length : BURNER_SUITE.length)}</div>
                          </div>
                          <div className="mt-3 bg-white/5 rounded-lg p-2 flex justify-between items-end">
                              <div>
                                  <div className="text-[10px] text-slate-500">AVG FPS</div>
                                  <div className="text-xl font-bold">
                                      {gpuBenchTimeLeft > 18 ? '...' : 
                                      (gpuBenchAvgBuffer.slice(4).reduce((a,b) => a+b, 0) / (gpuBenchAvgBuffer.length - 4 || 1)).toFixed(0)}
                                  </div>
                              </div>
                              <div className="text-3xl font-black">{gpuBenchTimeLeft}</div>
                          </div>
                      </div>
                  )}

                  <div className="absolute top-4 right-20 z-20 bg-black/70 text-green-400 text-xs font-mono font-bold px-3 py-1.5 rounded backdrop-blur-md border border-green-500/30">
                      FPS: {gpuBenchTimeLeft > 18 && gpuBenchMode !== 'NONE' ? 'WARMING UP...' : gpuBenchCurrentFps}
                  </div>

                  <button 
                    onClick={() => gpuBenchMode !== 'NONE' ? cancelGpuBenchmark() : setShowGpuPopup(false)}
                    className="absolute top-4 right-4 bg-slate-800/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-md transition-all z-50 border border-white/10"
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

      {showBenchResults && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
              <div className="bg-slate-900 border border-indigo-500 rounded-2xl max-w-lg w-full p-6 font-mono">
                  <div className="text-center mb-4">
                      <h2 className="text-2xl font-black text-white">{showBenchResults} RESULTS</h2>
                      <div className="text-4xl text-indigo-400 font-bold mt-2">
                          {gpuBenchResults.reduce((acc, r) => acc + Math.round(r.avgFps * (r.res/1024) * r.od), 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 uppercase mt-1">Total Score</div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto space-y-1 mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                      {gpuBenchResults.map((r, i) => {
                          const score = Math.round(r.avgFps * (r.res/1024) * r.od);
                          return (
                              <div key={i} className="flex justify-between items-center bg-slate-800 p-2 rounded text-xs">
                                  <div className="flex flex-col">
                                      <span className="text-slate-300 font-bold">{r.mode}</span>
                                      <span className="text-slate-500 text-[10px]">{r.res}px • x{r.od} OD</span>
                                  </div>
                                  <div className="text-right">
                                      <div className="text-indigo-400 font-bold">{score} pts</div>
                                      <div className="text-white font-mono text-[10px] opacity-70">{r.avgFps.toFixed(0)} FPS</div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
                  <button onClick={() => setShowBenchResults(false)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors">CLOSE</button>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
          {/* COL 1: RAM/CPU */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase border-b border-slate-800 pb-2">
                  <Icons.Cpu size={14} /> RAM / CPU Burner
              </div>

              {/* --- MODE SWITCHER --- */}
              <div className="flex bg-slate-950 rounded p-1 mb-2">
                   <button onClick={() => setCpuMode('STANDARD')} className={`flex-1 py-1 text-[10px] font-bold rounded transition-colors ${cpuMode==='STANDARD' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-indigo-400'}`}>STANDARD</button>
                   <button 
                         onClick={() => setCpuMode('HASH')} 
                         className={`flex-1 py-1 text-[10px] font-bold rounded transition-colors ${cpuMode==='HASH' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-amber-400'}`}
                     >
                         HASH STRESS
                     </button>
                   <button 
                       onClick={() => !isMobile && setCpuMode('MINIONS')} 
                       disabled={isMobile}
                       className={`flex-1 py-1 text-[10px] font-bold rounded transition-colors 
                           ${isMobile 
                               ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                               : (cpuMode === 'MINIONS' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-rose-400') 
                           }`}
                   >
                       {isMobile ? 'MINIONS (PC ONLY)' : 'MINIONS'}
                   </button>
               </div>

              {/* --- CONTROL PANELS --- */}
              {cpuMode !== 'MINIONS' ? (
                  <>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1"><span>ALLOCATION PATTERN</span></div>
                      <div className="flex bg-slate-950 rounded p-1 mb-4">
                          <button onClick={() => setRamMode('LINEAR')} disabled={isAllocating} className={`flex-1 py-1 text-[10px] font-bold rounded transition-colors ${ramMode==='LINEAR' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-indigo-400'}`}>LINEAR</button>
                          <button onClick={() => setRamMode('CHAOS')} disabled={isAllocating} className={`flex-1 py-1 text-[10px] font-bold rounded transition-colors ${ramMode==='CHAOS' ? 'bg-fuchsia-600 text-white' : 'text-slate-500 hover:text-fuchsia-400'}`}>CHAOS</button>
                          <button onClick={() => setRamMode('WASM')} disabled={isAllocating} className={`flex-1 py-1 text-[10px] font-bold rounded transition-colors ${ramMode==='WASM' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-cyan-400'}`}>WASM</button>
                      </div>

                      <div className="space-y-1">
                          <div className="flex justify-between text-xs"><span>RAM Target</span><span>{targetMB} MB</span></div>
                          <input type="range" min="500" max={MAX_LIMIT} step="100" value={targetMB} onChange={e=>setTargetMB(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-indigo-500" disabled={isBenchmarking || gpuBenchMode!=='NONE'} />
                      </div>

                      {cpuMode === 'HASH' ? (
                          <div className="space-y-1 opacity-80">
                              <div className="flex justify-between text-xs"><span>Hash Intensity</span><span className="text-amber-400 font-bold">MAX (LOCKED)</span></div>
                              <div className="w-full h-1 bg-slate-800 rounded-lg overflow-hidden relative">
                                  <div className="absolute inset-0 bg-amber-600 w-full animate-pulse"></div>
                              </div>
                          </div>
                      ) : (
                          <div className="space-y-1">
                              <div className="flex justify-between text-xs"><span>CPU Load</span><span>{cpuLoad}%</span></div>
                              <input type="range" min="0" max="100" step="10" value={cpuLoad} onChange={e=>setCpuLoad(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-orange-500" disabled={isBenchmarking || gpuBenchMode!=='NONE'} />
                          </div>
                      )}
                      
                      {!isAllocating ? (
                           <button 
                               onClick={() => allocateMemory()} 
                               disabled={isBenchmarking || gpuBenchMode!=='NONE'} 
                               className={`mt-auto font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 ${cpuMode === 'HASH' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                           >
                               <Icons.Play size={14} /> 
                               {cpuMode === 'HASH' ? 'START HASHING' : 'START LOAD'}
                           </button>
                      ) : (
                           <button onClick={stopRAM} className="mt-auto bg-slate-700 hover:bg-red-600 text-white font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all">
                               <Icons.Square size={14} /> STOP PROCESS
                           </button>
                      )}
                  </>
              ) : (
                  // --- MINIONS UI ---
                  <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                      <div className="p-2 bg-rose-900/20 border border-rose-500/30 rounded text-[10px] text-rose-200 leading-tight">
                          <strong className="text-rose-400">WARNING:</strong> Spawns separate windows to bypass browser memory limits. Only for desktop browsers. 
                          <br/>Allow popups if blocked.
                      </div>
                      
                      <div className="space-y-1">
                          <div className="flex justify-between text-xs"><span>Window Size</span><span>{minionSize} MB</span></div>
                          <input 
                              type="range" 
                              min="256" max="2048" step="128" 
                              value={minionSize} 
                              onChange={e=>setMinionSize(Number(e.target.value))} 
                              className="w-full h-1 bg-slate-700 rounded-lg accent-rose-500" 
                          />
                      </div>
                      
                      <div className="space-y-1">
                          <div className="flex justify-between text-xs"><span>Count</span><span>{minionCount} Wins</span></div>
                          <input 
                              type="range" 
                              min="1" max="20" step="1" 
                              value={minionCount} 
                              onChange={e=>setMinionCount(Number(e.target.value))} 
                              className="w-full h-1 bg-slate-700 rounded-lg accent-rose-500" 
                          />
                          <div className="text-right text-[10px] text-slate-500">Total: {(minionSize * minionCount / 1024).toFixed(1)} GB</div>
                      </div>
                        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-800">
                          <input 
                              type="checkbox" 
                              id="webrtcCheck" 
                              checked={minionWebRTC} 
                              onChange={(e) => setMinionWebRTC(e.target.checked)}
                              className="w-4 h-4 accent-rose-600 bg-slate-800 border-slate-600 rounded cursor-pointer"
                          />
                          <label htmlFor="webrtcCheck" className="text-xs text-slate-400 font-bold cursor-pointer select-none flex items-center gap-1">
                              <Icons.Wifi size={12} className="text-rose-500"/> 
                              ENABLE WEBRTC STORM
                          </label>
                      </div>
                      {minions.length === 0 ? (
                          <button onClick={spawnMinions} className="mt-auto bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all shadow-lg shadow-rose-900/20">
                              <Icons.Layers size={14} /> SPAWN MINIONS
                          </button>
                      ) : (
                          <button onClick={handleKillMinionsConfirm} className="mt-auto bg-slate-700 hover:bg-red-600 text-white font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all">
                              <Icons.Trash2 size={14} /> KILL ALL ({minions.length})
                          </button>
                      )}
                  </div>
              )}
          </div>

          {/* COL 2: STORAGE */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase border-b border-slate-800 pb-2">
                  <Icons.HardDrive size={14} /> Storage Killer
              </div>
              <div className="text-center py-2">
                  <div className="text-3xl font-mono font-bold text-amber-400">{storageUsed.toFixed(0)}</div>
                  <div className="flex justify-between px-8 text-[10px] text-slate-500 uppercase">
                      <span>MB Written</span>
                      <span>{storageCount} Files</span>
                  </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                    Writes raw 10MB chunks directly to disk via OPFS (Sync Access Handle) until quota limit.
              </p>
              {!isFillingStorage ? (
                  <div className="mt-auto flex gap-2">
                      <button onClick={fillStorage} disabled={isBenchmarking || gpuBenchMode!=='NONE'} className="flex-1 bg-amber-700 hover:bg-amber-600 text-white font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50">
                          <Icons.Database size={14} /> FILL
                      </button>
                      <button onClick={clearStorage} disabled={isBenchmarking || gpuBenchMode!=='NONE' || storageUsed === 0} className="flex-1 bg-slate-700 hover:bg-red-600 text-white font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50">
                          <Icons.Trash2 size={14} /> CLEAN
                      </button>
                  </div>
              ) : (
                  <button onClick={stopStorage} className="mt-auto bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all">
                      <Icons.Square size={14} /> STOP FILL
                  </button>
              )}
          </div>

          {/* COL 3: GPU STRESS */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase border-b border-slate-800 pb-2">
                  <Icons.Monitor size={14} /> GPU Stress
              </div>
              <div className="flex gap-1">
                  <button onClick={() => setGpuMode('FRACTAL')} disabled={isBenchmarking || gpuBenchMode!=='NONE'} className={`flex-1 py-1 text-[8px] font-bold rounded border ${gpuMode === 'FRACTAL' ? 'bg-teal-600 border-teal-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>FRACTAL</button>
                  <button onClick={() => setGpuMode('3D')} disabled={isBenchmarking || gpuBenchMode!=='NONE'} className={`flex-1 py-1 text-[8px] font-bold rounded border ${gpuMode === '3D' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>3D</button>
                  <button onClick={() => setGpuMode('FIRE')} disabled={isBenchmarking || gpuBenchMode!=='NONE'} className={`flex-1 py-1 text-[8px] font-bold rounded border ${gpuMode === 'FIRE' ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>FIRE</button>
              </div>
              <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                      <span>{gpuMode === 'FIRE' ? 'Particle Density' : 'Shader Complexity'}</span>
                      <span>{gpuIntensity}%</span>
                  </div>
                  <input type="range" min="1" max="100" value={gpuIntensity} onChange={e=>setGpuIntensity(Number(e.target.value))} className="w-full h-1 bg-slate-700 accent-emerald-500" disabled={isBenchmarking || gpuBenchMode!=='NONE'} />
              </div>
              <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span>Resolution</span><span>{gpuResolution}x{gpuResolution}</span></div>
                  <input type="range" min="0" max="3" step="1" value={Math.log2(gpuResolution/1024)} onChange={e=>setGpuResolution(1024 * Math.pow(2, parseInt(e.target.value)))} className="w-full h-1 bg-slate-700 accent-teal-500" disabled={isBenchmarking || gpuBenchMode!=='NONE'} />
                  <div className="flex justify-between text-[8px] text-slate-600"><span>1K</span><span>2K</span><span>4K</span><span>8K</span></div>
              </div>
              <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span>Overdrive (Passes)</span><span>x{gpuOverdrive}</span></div>
                  <input type="range" min="1" max="20" step="1" value={gpuOverdrive} onChange={e=>setGpuOverdrive(Number(e.target.value))} className="w-full h-1 bg-slate-700 accent-red-500" disabled={isBenchmarking || gpuBenchMode!=='NONE'} />
              </div>
              <button onClick={() => { setGpuActive(!gpuActive); setActiveTab('GPU'); }} disabled={isBenchmarking || gpuBenchMode!=='NONE'} className={`mt-auto font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 ${gpuActive ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  {gpuActive ? 'MANUAL STOP' : 'SHADER TEST'}
              </button>
              
              {/* --- VRAM BURNER --- */}
              <div className="pt-2 border-t border-slate-800 mt-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span className="flex items-center gap-1 font-bold text-slate-400">
                          <Icons.Zap size={10} className="text-amber-500"/> VRAM EATER
                      </span>
                      <span className="text-amber-500 font-mono font-bold">{(vramCount * 64).toLocaleString()} MB</span>
                  </div>
                  
                  {!vramActive ? (
                      <button 
                          onClick={runVramBurner} 
                          disabled={isBenchmarking || gpuBenchMode!=='NONE'} 
                          className="w-full bg-slate-950 border border-slate-700 hover:bg-amber-900/40 hover:text-amber-400 hover:border-amber-700 text-slate-400 font-bold py-1.5 rounded text-xs transition-all flex items-center justify-center gap-2"
                      >
                          <Icons.Layers size={12} /> EAT VRAM
                      </button>
                  ) : (
                      <button 
                          onClick={stopVramBurner} 
                          className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-1.5 rounded text-xs transition-all animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      >
                          STOP EATING ({vramCount})
                      </button>
                  )}
                  <div className="text-[8px] text-slate-600 text-center mt-1">Allocates 64MB uncompressed textures</div>
              </div>
          </div>

          {/* COL 4: BENCHMARKS */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase border-b border-slate-800 pb-2">
                  <Icons.Trophy size={14} /> Benchmarks
               </div>
            
               <div className="flex bg-slate-950 rounded p-1">
                   <button onClick={() => setBenchType('CPU')} className={`flex-1 py-1 text-[10px] font-bold rounded ${benchType==='CPU' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>CPU/RAM</button>
                   <button onClick={() => setBenchType('GPU')} className={`flex-1 py-1 text-[10px] font-bold rounded ${benchType==='GPU' ? 'bg-rose-600 text-white' : 'text-slate-500'}`}>GPU</button>
               </div>
            
               {benchType === 'CPU' ? (
                   <>
                       <div className="text-center mt-2">
                           <div className="text-[10px] text-slate-500">CPU High Score</div>
                           <div className="text-2xl font-black text-indigo-400">{cpuHighScore}</div>
                           {isBenchmarking && <div className="text-sm text-white mt-1">Current: {cpuBenchScore}</div>}
                       </div>
                       {!isBenchmarking ? (
                           <button onClick={startCpuBenchmark} disabled={gpuBenchMode!=='NONE'} className="mt-auto bg-slate-100 hover:bg-white text-slate-900 font-bold py-2 rounded flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                               <Icons.Play size={14} /> RUN SURVIVAL
                           </button>
                       ) : (
                           <button onClick={stopCpuBenchmark} className="mt-auto bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 text-sm">
                               <Icons.Square size={14} /> STOP
                           </button>
                       )}
                   </>
               ) : (
                   <>
                        <div className="mt-2 flex flex-col gap-3 px-2">
                           <div className="flex justify-between items-center border-b border-teal-500/20 pb-1">
                               <span className="text-xs font-bold text-teal-400 uppercase">Light</span>
                               <span className="text-xl font-black text-white font-mono">{gpuHighScores.LIGHT}</span>
                           </div>
                           <div className="flex justify-between items-center border-b border-indigo-500/20 pb-1">
                               <span className="text-xs font-bold text-indigo-400 uppercase">Normal</span>
                               <span className="text-xl font-black text-white font-mono">{gpuHighScores.NORMAL}</span>
                           </div>
                           <div className="flex justify-between items-center border-b border-rose-500/20 pb-1">
                               <span className="text-xs font-bold text-rose-400 uppercase">Burner</span>
                               <span className="text-xl font-black text-white font-mono">{gpuHighScores.BURNER}</span>
                           </div>
                       </div>
                       <div className="mt-auto flex flex-col gap-1">
                           <button onClick={() => runGpuBenchmark('LIGHT')} disabled={isBenchmarking || gpuBenchMode!=='NONE'} className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-1.5 rounded text-xs disabled:opacity-50">
                               LIGHT
                           </button>
                           <button onClick={() => runGpuBenchmark('NORMAL')} disabled={isBenchmarking || gpuBenchMode!=='NONE'} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded text-xs disabled:opacity-50">
                               NORMAL
                           </button>
                           <button onClick={() => runGpuBenchmark('BURNER')} disabled={isBenchmarking || gpuBenchMode!=='NONE'} className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 rounded text-xs disabled:opacity-50">
                               BURNER
                           </button>
                       </div>
                   </>
               )}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-auto lg:h-48">
            {/* NETWORK STORM MODULE */}
            <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase border-b border-slate-800 pb-2 mb-2">
                   <Icons.Wifi size={14} /> Network Storm (Internet Stress)
                </div>
                <div className="flex-1 flex gap-4">
                    <div className="flex-1 flex flex-col justify-center items-center bg-black/30 rounded border border-white/5 p-2">
                        <div className="text-[10px] text-slate-500 uppercase">Download Speed</div>
                        <div className="text-3xl font-black text-cyan-400">
                            {netStats.speed.toFixed(1)} <span className="text-sm font-normal text-slate-400">Mbps</span>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center bg-black/30 rounded border border-white/5 p-2">
                        <div className="text-[10px] text-slate-500 uppercase">Traffic Burned</div>
                        <div className="text-3xl font-black text-fuchsia-400">
                            {netStats.total.toFixed(0)} <span className="text-sm font-normal text-slate-400">MB</span>
                        </div>
                    </div>
                </div>
                {!netActive ? (
                    <button onClick={runNetworkStress} className="mt-3 bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-3 rounded flex items-center justify-center gap-2 text-sm transition-all shadow-lg shadow-cyan-900/20">
                        <Icons.DownloadCloud size={16} /> BURN TRAFFIC
                    </button>
                ) : (
                    <button onClick={stopNetworkStress} className="mt-3 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded flex items-center justify-center gap-2 text-sm transition-all shadow-lg shadow-red-900/20">
                        <Icons.Square size={16} /> STOP NETWORK
                    </button>
                )}
            </div>

            {/* LOGS */}
            <div className="col-span-1 bg-black/50 border border-slate-800 rounded-xl p-3 font-mono text-xs overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                 {logs.length === 0 && <span className="text-slate-600">System Ready...</span>}
                 {logs.map((l, i) => <div key={i} className={l.includes('Error') ? 'text-red-400' : 'text-slate-300'}>{l}</div>)}
            </div>

            {/* EMERGENCY RESET */}
            <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-center gap-2">
                 <button onClick={handleEmergencyResetConfirm} className="w-full h-full bg-slate-800 border border-slate-700 hover:bg-red-900/50 hover:text-white text-slate-400 font-bold py-3 rounded transition-colors flex flex-col items-center justify-center gap-2">
                     <Icons.Trash2 size={24} /> 
                     <span>EMERGENCY RESET</span>
                 </button>
                 {error && <div className="text-[10px] text-red-400 font-bold text-center border border-red-900/50 bg-red-900/20 p-2 rounded">{error}</div>}
            </div>
      </div>

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
