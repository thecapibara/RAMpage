import React, { useState, useRef, useEffect, useCallback } from 'react';

// --- Icons (Inlined to prevent dependency errors) ---
const IconBase = ({ size = 24, children, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

const Icons = {
  Trash2: (props) => <IconBase {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></IconBase>,
  Play: (props) => <IconBase {...props}><polygon points="5 3 19 12 5 21 5 3"/></IconBase>,
  Square: (props) => <IconBase {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></IconBase>,
  AlertTriangle: (props) => <IconBase {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></IconBase>,
  Info: (props) => <IconBase {...props}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></IconBase>,
  Activity: (props) => <IconBase {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></IconBase>,
  Database: (props) => <IconBase {...props}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></IconBase>,
  Cpu: (props) => <IconBase {...props}><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 14h3"/><path d="M1 9h3"/><path d="M1 14h3"/></IconBase>,
  Layers: (props) => <IconBase {...props}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></IconBase>,
  Terminal: (props) => <IconBase {...props}><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></IconBase>,
  Zap: (props) => <IconBase {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></IconBase>,
  BarChart2: (props) => <IconBase {...props}><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></IconBase>,
  ShieldAlert: (props) => <IconBase {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4"/><path d="M12 16h.01"/></IconBase>,
};

// --- Worker Code ---
// Supports allocation types and CPU stress intensity
const WORKER_CODE = `
  let memoryStore = [];
  let cpuIntensity = 0; // 0 to 100
  
  // CPU Stress Loop helper
  const burnCpuChunk = (intensity) => {
    if (intensity <= 0) return;
    const msToBurn = (intensity / 100) * 80; 
    const start = performance.now();
    while (performance.now() - start < msToBurn) {
       Math.sqrt(Math.random() * Math.random());
    }
  };

  self.onmessage = async (e) => {
    const { action, targetMB, id, type, cpuLoad } = e.data;
    
    if (action === 'UPDATE_CONFIG') {
       cpuIntensity = cpuLoad;
    }
    else if (action === 'ALLOCATE') {
      cpuIntensity = cpuLoad || 0;
      const CHUNK_SIZE = 10; // MB
      const BYTES_PER_MB = 1024 * 1024;
      const steps = Math.ceil(targetMB / CHUNK_SIZE);
      
      try {
        for (let i = 0; i < steps; i++) {
          if (type === 'STRING') {
             const strLength = (CHUNK_SIZE * BYTES_PER_MB) / 2; 
             const chunk = "X".repeat(strLength); 
             memoryStore.push(chunk);
          } else {
             const chunkBytes = CHUNK_SIZE * BYTES_PER_MB;
             const buffer = new Uint8Array(chunkBytes);
             for (let j = 0; j < chunkBytes; j += 4096) {
                buffer[j] = (Math.random() * 255) | 0;
             }
             buffer[chunkBytes - 1] = 1;
             memoryStore.push(buffer);
          }

          if (cpuIntensity > 0) burnCpuChunk(cpuIntensity);
          
          self.postMessage({ type: 'PROGRESS', addedMB: CHUNK_SIZE, id });
          await new Promise(r => setTimeout(r, 20)); 
        }
        self.postMessage({ type: 'DONE', id });
      } catch (err) {
        self.postMessage({ type: 'ERROR', error: err.message, id });
      }
    } 
    else if (action === 'CLEAR') {
      memoryStore = [];
      try { new Array(10000).fill(0); } catch(e){}
      self.postMessage({ type: 'CLEARED', id });
    }
  };
`;

// --- Enhanced Area Chart Component ---
const MemoryChart = ({ data, maxVal }) => {
  if (!data || data.length < 2) return <div className="h-32 flex items-center justify-center text-slate-600 text-xs font-mono">Waiting for data stream...</div>;

  const height = 120;
  const max = Math.max(maxVal, ...data.map(d => d.total));
  
  const y = (val) => height - ((val / max) * height);
  const x = (idx) => (idx / (data.length - 1)) * 100;

  let pathTotal = `M 0 ${height} `;
  data.forEach((d, i) => { pathTotal += `L ${x(i)} ${y(d.total)} `; });
  pathTotal += `L 100 ${height} Z`;

  const pointsUsed = data.map((d, i) => `${x(i)},${y(d.used)}`).join(' ');

  return (
    <div className="relative h-[120px] w-full overflow-hidden rounded-lg bg-slate-950 border border-slate-800 shadow-inner">
       <svg viewBox={`0 0 100 ${height}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
             <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
             </linearGradient>
          </defs>
          
          {[0.25, 0.5, 0.75].map(p => (
             <line key={p} x1="0" y1={height*p} x2="100" y2={height*p} stroke="#1e293b" strokeWidth="0.5" />
          ))}

          <path d={pathTotal} fill="url(#gradTotal)" stroke="none" />
          <path d={pathTotal.replace('Z','').replace(`L 100 ${height}`, '').replace(`M 0 ${height}`, `M 0 ${y(data[0].total)}`)} fill="none" stroke="#818cf8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

          <polyline points={pointsUsed} fill="none" stroke="#10b981" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeDasharray="4 2" strokeOpacity="0.8" />
       </svg>
       
       <div className="absolute top-2 left-2 flex gap-3 pointer-events-none">
          <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
             <span className="text-[10px] text-slate-400 font-mono">Total: {(data[data.length-1].total/1024).toFixed(1)} GB</span>
          </div>
          <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
             <span className="text-[10px] text-slate-400 font-mono">Main: {(data[data.length-1].used/1024).toFixed(2)} GB</span>
          </div>
       </div>
    </div>
  );
};

export default function App() {
  const [targetMB, setTargetMB] = useState(4096);
  const [pattern, setPattern] = useState('LINEAR'); 
  const [dataType, setDataType] = useState('BUFFER');
  const [cpuLoad, setCpuLoad] = useState(0); 
  
  const [allocatedMB, setAllocatedMB] = useState(0);
  const [isAllocating, setIsAllocating] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState([]); 
  const [browserMemory, setBrowserMemory] = useState({ used: 0, total: 0, limit: 0 });
  const [error, setError] = useState(null);
  
  const mainThreadMemoryRef = useRef([]);
  const abortControllerRef = useRef(null);
  const patternIntervalRef = useRef(null);
  const MAX_LIMIT = 16384; 

  const addLog = useCallback((msg, type = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50)); 
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      let used = 0, total = 0, limit = 0;
      if (window.performance && window.performance.memory) {
        used = window.performance.memory.usedJSHeapSize;
        total = window.performance.memory.totalJSHeapSize;
        limit = window.performance.memory.jsHeapSizeLimit;
        setBrowserMemory({ 
            used: (used/1048576).toFixed(0), 
            total: (total/1048576).toFixed(0), 
            limit: (limit/1048576).toFixed(0) 
        });
      }
      
      setAllocatedMB(currentAlloc => {
         setChartData(prev => {
            const newData = [...prev, { total: currentAlloc, used: used / 1048576 }];
            return newData.slice(-100); 
         });
         return currentAlloc;
      });

    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let pressCount = 0;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        pressCount++;
        if (pressCount >= 3) {
           clearMemory();
           addLog("!!! EMERGENCY STOP ACTIVATED !!!", "error");
           pressCount = 0;
        }
        setTimeout(() => pressCount = 0, 1000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const createWorkerBlob = () => {
    const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
  };

  const startPatternLogic = () => {
    if (pattern === 'LINEAR') return; 
    addLog(`Pattern Started: ${pattern}`);
    let phase = 'UP';
    
    patternIntervalRef.current = setInterval(() => {
        setAllocatedMB(current => {
            if (pattern === 'SAWTOOTH') {
                if (phase === 'UP' && current >= targetMB * 0.95) {
                    phase = 'DOWN';
                    addLog("Sawtooth: Peak reached, dropping...");
                    workers.forEach(w => w.postMessage({ action: 'CLEAR' }));
                    mainThreadMemoryRef.current = [];
                    return 0; 
                } else if (phase === 'DOWN' && current < 100) {
                     phase = 'UP';
                     allocateMemory(true); 
                     return 0;
                }
            }
            if (pattern === 'CHAOS') {
                if (Math.random() > 0.85) {
                    addLog("Chaos: Random Dump!", 'warning');
                    workers.forEach(w => {
                        if(Math.random() > 0.5) w.postMessage({ action: 'CLEAR' });
                    });
                } else if (current < targetMB * 0.3) {
                     allocateMemory(true);
                }
            }
            return current;
        });
    }, 1000);
  };

  const allocateMemory = async (isRestart = false) => {
    if (!isRestart) {
        setIsAllocating(true);
        setError(null);
        setAllocatedMB(0);
        addLog(`Started: ${targetMB}MB | CPU: ${cpuLoad}% | Type: ${dataType}`);
    }
    
    abortControllerRef.current = new AbortController();

    const MAIN_THREAD_CAP = 1000;
    let mainThreadTarget = targetMB;
    let workerTargetTotal = 0;

    if (targetMB > 1500) {
      mainThreadTarget = MAIN_THREAD_CAP;
      workerTargetTotal = targetMB - MAIN_THREAD_CAP;
    }

    try {
      if (mainThreadTarget > 0 && !isRestart) { 
        await allocateOnMainThread(mainThreadTarget);
      }

      if (workerTargetTotal > 0) {
        if (workers.length === 0) {
             await allocateOnWorkers(workerTargetTotal);
        } else {
             const WORKER_CAP = 1500;
             workers.forEach((w, i) => {
                 const amount = Math.min(WORKER_CAP, workerTargetTotal - (i * WORKER_CAP));
                 if (amount > 0) {
                    w.postMessage({ 
                        action: 'ALLOCATE', 
                        targetMB: amount, 
                        id: i, 
                        type: dataType, 
                        cpuLoad: cpuLoad 
                    });
                 }
             });
        }
      }

      if (!isRestart && pattern !== 'LINEAR') {
          startPatternLogic();
      }

    } catch (err) {
      setError(err.message);
      addLog(`Error: ${err.message}`, 'error');
    }
  };

  const allocateOnMainThread = async (mbToFill) => {
    const CHUNK_MB = 10;
    const CHUNK_BYTES = CHUNK_MB * 1024 * 1024;
    const steps = Math.ceil(mbToFill / CHUNK_MB);

    for (let i = 0; i < steps; i++) {
      if (abortControllerRef.current?.signal.aborted) break;
      const buffer = new Uint8Array(CHUNK_BYTES);
      for (let j = 0; j < CHUNK_BYTES; j += 4096) buffer[j] = 1;
      buffer[CHUNK_BYTES-1] = 1;
      mainThreadMemoryRef.current.push(buffer);
      setAllocatedMB(prev => prev + CHUNK_MB);
      await new Promise(r => setTimeout(r, 10));
    }
  };

  const allocateOnWorkers = async (totalWorkerMB) => {
    const WORKER_CAP = 1500;
    const numWorkers = Math.ceil(totalWorkerMB / WORKER_CAP);
    const newWorkers = [];
    const workerUrl = createWorkerBlob();

    for (let i = 0; i < numWorkers; i++) {
      const w = new Worker(workerUrl);
      const amount = Math.min(WORKER_CAP, totalWorkerMB - (i * WORKER_CAP));
      
      w.onmessage = (e) => {
        const { type, addedMB, id, error } = e.data;
        if (type === 'PROGRESS') {
           setAllocatedMB(prev => prev + addedMB);
        } else if (type === 'ERROR') {
           addLog(`Worker #${id} Crash: ${error}`, 'error');
        }
      };

      w.postMessage({ 
          action: 'ALLOCATE', 
          targetMB: amount, 
          id: i, 
          type: dataType, 
          cpuLoad: cpuLoad 
      });
      newWorkers.push(w);
      addLog(`Worker #${i+1} init. Task: ${amount}MB + CPU ${cpuLoad}%`);
    }
    setWorkers(newWorkers);
  };

  const stopAllocation = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (patternIntervalRef.current) clearInterval(patternIntervalRef.current);
    setIsAllocating(false);
    addLog("Process STOPPED by user.");
  };

  const clearMemory = () => {
    stopAllocation();
    mainThreadMemoryRef.current = [];
    workers.forEach(w => w.terminate());
    setWorkers([]);
    setAllocatedMB(0);
    setError(null);
    setChartData([]); 
    addLog("--- SYSTEM RESET ---");
  };

  const getProgress = () => Math.min((allocatedMB / targetMB) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-mono relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-900/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-rose-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-5xl mx-auto w-full z-10 flex-1 flex flex-col gap-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                        <Icons.Layers className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">RAM Eater <span className="text-indigo-400">Ultimate</span></h1>
                        <div className="flex gap-2 text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                            <span>v3.1</span> • <span>Multi-Thread</span> • <span>CPU Stress</span> • <span className="text-indigo-400 font-bold">Made by JustGL with Gemini</span>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-4">
                     <div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Main Thread</div>
                        <div className="text-lg font-mono text-emerald-400">{browserMemory.used} <span className="text-xs text-slate-600">MB</span></div>
                     </div>
                     <div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Total Alloc</div>
                        <div className="text-lg font-mono text-indigo-400">{allocatedMB.toFixed(0)} <span className="text-xs text-slate-600">MB</span></div>
                     </div>
                     <div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Workers</div>
                        <div className="text-lg font-mono text-blue-400">{workers.length} <span className="text-xs text-slate-600">Active</span></div>
                     </div>
                </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase">
                        <Icons.BarChart2 size={14} /> Live Memory
                    </div>
                    {isAllocating && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                </div>
                <MemoryChart data={chartData} maxVal={targetMB} />
            </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl flex-1 flex flex-col gap-6">
            
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Target Memory</span>
                    <span className="text-indigo-400 font-bold">{targetMB} MB</span>
                </div>
                <input 
                    type="range" min="500" max={MAX_LIMIT} step="100" 
                    value={targetMB} onChange={(e) => setTargetMB(Number(e.target.value))}
                    disabled={isAllocating}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                
                <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1"><Icons.Activity size={12}/> Pattern</label>
                    <div className="flex gap-1">
                        {['LINEAR', 'SAWTOOTH', 'CHAOS'].map(p => (
                            <button key={p} onClick={() => setPattern(p)} disabled={isAllocating}
                                className={`flex-1 py-1.5 text-[10px] font-bold rounded border transition-colors ${pattern === p ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                     <label className="text-xs text-slate-500 uppercase font-bold flex items-center justify-between">
                        <div className="flex items-center gap-1"><Icons.Cpu size={12}/> CPU Load</div>
                        <span className={cpuLoad > 0 ? "text-orange-400" : "text-slate-600"}>{cpuLoad}%</span>
                     </label>
                     <input 
                        type="range" min="0" max="100" step="10"
                        value={cpuLoad} onChange={(e) => setCpuLoad(Number(e.target.value))}
                        disabled={isAllocating}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                     />
                     <div className="flex justify-between text-[8px] text-slate-600 uppercase">
                        <span>Idle</span>
                        <span>Burn</span>
                     </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1"><Icons.Database size={12}/> Type</label>
                    <div className="flex gap-1">
                        <button onClick={() => setDataType('BUFFER')} disabled={isAllocating}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded border transition-colors ${dataType === 'BUFFER' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                            BUFFER
                        </button>
                        <button onClick={() => setDataType('STRING')} disabled={isAllocating}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded border transition-colors ${dataType === 'STRING' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                            STRING
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
                <div className={`h-full transition-all duration-300 ${error ? 'bg-red-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`} style={{ width: `${getProgress()}%` }}></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {!isAllocating ? (
                    <button onClick={() => allocateMemory(false)} className="col-span-2 md:col-span-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 transition-all">
                        <Icons.Play size={18} fill="currentColor" /> START
                    </button>
                 ) : (
                    <button onClick={stopAllocation} className="col-span-2 md:col-span-3 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 transition-all">
                        <Icons.Square size={18} fill="currentColor" /> STOP
                    </button>
                 )}
                 <button onClick={clearMemory} className="col-span-2 md:col-span-1 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-white border border-slate-700 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
                    <Icons.Trash2 size={18} /> RESET
                 </button>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-slate-600">
                <div className="flex items-center gap-1"><Icons.ShieldAlert size={12}/> HINT: Press <strong>ESC</strong> 3x for Emergency Stop.</div>
                {error && <div className="text-red-400 font-bold">{error}</div>}
            </div>

        </div>

        <div className="h-48 bg-black/80 backdrop-blur border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center gap-2 text-slate-500">
                   <Icons.Terminal size={14} /> <span>System Logs</span>
                </div>
                {cpuLoad > 0 && isAllocating && (
                    <div className="flex items-center gap-1 text-orange-400 animate-pulse">
                        <Icons.Zap size={10} fill="currentColor"/> CPU BURNING: {cpuLoad}%
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-2">
                {logs.length === 0 && <span className="text-slate-700 italic">System ready. Waiting for input...</span>}
                {logs.map((log, i) => (
                    <div key={i} className={`${log.includes('Error') ? 'text-red-400' : log.includes('STOP') ? 'text-amber-400' : 'text-slate-300'}`}>
                        {log}
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}
