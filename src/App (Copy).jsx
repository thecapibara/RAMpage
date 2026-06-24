import React, { useState, useRef, useEffect, useCallback } from 'react';

// --- Icons (Inlined) ---
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
  HardDrive: (props) => <IconBase {...props}><line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/></IconBase>,
  Monitor: (props) => <IconBase {...props}><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></IconBase>,
  Trophy: (props) => <IconBase {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></IconBase>,
  X: (props) => <IconBase {...props}><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></IconBase>,
  Maximize: (props) => <IconBase {...props}><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></IconBase>,
  Box: (props) => <IconBase {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></IconBase>,
  Aperture: (props) => <IconBase {...props}><circle cx="12" cy="12" r="10"/><line x1="14.31" x2="20.05" y1="8" y2="17.94"/><line x1="9.69" x2="21.17" y1="8" y2="8"/><line x1="7.38" x2="13.12" y1="12" y2="2.06"/><line x1="9.69" x2="3.95" y1="16" y2="6.06"/><line x1="14.31" x2="2.83" y1="16" y2="16"/><line x1="16.62" x2="10.88" y1="12" y2="21.94"/></IconBase>,
};

// --- WebGL Shaders (Robust & Compatible) ---

// 1. 2D FRACTAL (Mandelbrot) - Simplified for high compatibility
const FRAG_SHADER_FRACTAL = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_intensity;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 col = vec3(0.0);
    float max_iter = 50.0 + (u_intensity * 150.0); 
    
    vec2 z = vec2(0.0);
    vec2 c = uv * 3.0 - vec2(0.5, 0.0);
    
    float i_val = 0.0;
    // Lower loop limit for safety
    for(int n=0; n < 200; n++) {
        if (float(n) > max_iter) break;
        
        // Simple Mandelbrot with time warp
        float heavy = sin(float(n) * 0.2 + u_time) * 0.001;
        z = vec2(z.x*z.x - z.y*z.y + heavy, 2.0*z.x*z.y) + c;
        
        // Dot product is faster than length()
        if(dot(z, z) > 16.0) { i_val = float(n); break; }
    }
    
    float t = i_val/max_iter;
    col = vec3(t * 2.0, t * 0.5, t * 0.2);
    gl_FragColor = vec4(col, 1.0);
}
`;

// 2. 3D FIGURE (Raymarching Fractal Crystal) - Simplified
const FRAG_SHADER_3D = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_intensity;

mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

float map(vec3 p) {
    vec3 q = p;
    q.xz *= rot(u_time * 0.4);
    q.xy *= rot(u_time * 0.3);
    
    float s = 1.0;
    // Reduced fold iterations
    for(int i=0; i<4; i++) {
        q = abs(q) - vec3(0.4);
        q.xy *= rot(0.5);
        q.xz *= rot(0.5);
        s *= 1.5;
        q *= 1.5;
    }
    return length(max(abs(q) - vec3(0.1), 0.0)) / s;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 ro = vec3(0.0, 0.0, -2.5);
    vec3 rd = normalize(vec3(uv, 1.2));
    
    float t = 0.0;
    float fMaxSteps = 30.0 + u_intensity * 100.0;
    float hit = 0.0;
    vec3 p = vec3(0.0);
    
    // Reduced ray steps
    for(int i=0; i<100; i++) {
        if(float(i) > fMaxSteps) break;
        p = ro + rd * t;
        float d = map(p);
        if(d < 0.001) { hit = 1.0; break; }
        t += d;
        if(t > 10.0) break;
    }
    
    vec3 col = vec3(0.02, 0.02, 0.05);
    if(hit > 0.5) {
        // Simplified lighting
        vec3 lig = normalize(vec3(1.0, 1.0, -1.0));
        // Approximate normal (cheaper)
        float d = map(p);
        vec2 e = vec2(0.01, 0.0);
        vec3 n = normalize(vec3(d - map(p-e.xyy), d - map(p-e.yxy), d - map(p-e.yyx)));
        
        float diff = max(dot(n, lig), 0.0);
        col = vec3(0.0, 0.6, 1.0) * diff;
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`;

const VERT_SHADER = `
precision mediump float;
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

// --- Worker Code (RAM + CPU) ---
const WORKER_CODE = `
  let memoryStore = [];
  let cpuIntensity = 0;
  
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
    if (action === 'ALLOCATE') {
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
             for (let j = 0; j < chunkBytes; j += 4096) buffer[j] = (Math.random() * 255) | 0;
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
    } else if (action === 'CLEAR') {
      memoryStore = [];
      try { new Array(10000).fill(0); } catch(e){}
      self.postMessage({ type: 'CLEARED', id });
    }
  };
`;

// --- Components ---

const GpuCanvas = ({ active, intensity, resolution, onClick, mode, isPopup }) => {
    const canvasRef = useRef(null);
    const [fps, setFps] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return;
        
        canvas.width = resolution; 
        canvas.height = resolution;
        
        const gl = canvas.getContext('webgl');
        if(!gl) return;

        const createShader = (gl, type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                // Log the actual error
                const info = gl.getShaderInfoLog(shader);
                console.error("Shader Compile Error:", info);
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const prog = gl.createProgram();
        const fragSource = mode === '3D' ? FRAG_SHADER_3D : FRAG_SHADER_FRACTAL;
        
        const vertShader = createShader(gl, gl.VERTEX_SHADER, VERT_SHADER);
        const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragSource);

        if (!vertShader || !fragShader) {
            console.error("Failed to compile shaders.");
            return; // Exit safely
        }

        gl.attachShader(prog, vertShader);
        gl.attachShader(prog, fragShader);
        gl.linkProgram(prog);
        gl.useProgram(prog);

        const posBuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuff);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

        const posLoc = gl.getAttribLocation(prog, "position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const resLoc = gl.getUniformLocation(prog, "u_resolution");
        const timeLoc = gl.getUniformLocation(prog, "u_time");
        const intLoc = gl.getUniformLocation(prog, "u_intensity");

        let frameId;
        let frameCount = 0;
        let lastTime = performance.now();

        const render = (time) => {
            // FPS Calculation
            frameCount++;
            const now = performance.now();
            if (now - lastTime >= 500) { // Update every 500ms
                setFps(Math.round((frameCount * 1000) / (now - lastTime)));
                frameCount = 0;
                lastTime = now;
            }

            if (active) {
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.uniform2f(resLoc, canvas.width, canvas.height);
                gl.uniform1f(timeLoc, time * 0.001);
                gl.uniform1f(intLoc, intensity / 100); 
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            } else {
                gl.clearColor(0,0,0,0);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
            frameId = requestAnimationFrame(render);
        };
        render(0);

        // CLEANUP
        return () => {
            cancelAnimationFrame(frameId);
            if(gl && prog) {
                gl.deleteProgram(prog);
                gl.deleteShader(vertShader);
                gl.deleteShader(fragShader);
            }
        };
    }, [active, intensity, resolution, mode]);

    return (
        <div className="relative w-full h-full group/canvas">
            <canvas 
                ref={canvasRef} 
                className="w-full h-full object-cover opacity-80 cursor-pointer" 
                onDoubleClick={onClick}
            />
            {active && (
                <div className={`absolute top-2 z-10 bg-black/70 text-green-400 text-[10px] font-mono font-bold px-2 py-1 rounded backdrop-blur-md border border-green-500/30 pointer-events-none select-none ${isPopup ? 'right-14' : 'right-2'}`}>
                    {fps} FPS
                </div>
            )}
        </div>
    );
};

const SimpleChart = ({ data, color, max, label, unit }) => {
    if (!data || data.length < 2) return <div className="h-full flex items-center justify-center text-xs text-slate-600">Waiting for data...</div>;
    const h = 100;
    const pts = data.map((d, i) => `${(i/(data.length-1))*100},${h - ((d/max)*h)}`).join(' ');
    
    const lastVal = data[data.length-1];
    const displayVal = (typeof lastVal === 'number' && !isNaN(lastVal)) ? lastVal.toFixed(1) : '0.0';

    return (
        <div className="relative h-full w-full overflow-hidden">
             <svg viewBox={`0 0 100 ${h}`} className="w-full h-full" preserveAspectRatio="none">
                <path d={`M 0 ${h} L ${pts} L 100 ${h} Z`} fill={color} fillOpacity="0.2" />
                <polyline points={pts} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
             </svg>
             <div className="absolute top-1 right-2 text-[10px] font-mono font-bold" style={{color}}>
                {displayVal} {unit}
             </div>
             <div className="absolute top-1 left-2 text-[10px] font-bold text-slate-500 uppercase">{label}</div>
        </div>
    );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('RAM'); 
  const [targetMB, setTargetMB] = useState(4096);
  const [cpuLoad, setCpuLoad] = useState(0); 
  const [allocatedMB, setAllocatedMB] = useState(0);
  const [isAllocating, setIsAllocating] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [chartDataRAM, setChartDataRAM] = useState([]);
  
  const [storageUsed, setStorageUsed] = useState(0);
  const [isFillingStorage, setIsFillingStorage] = useState(false);
  const [chartDataStorage, setChartDataStorage] = useState([]);
  const isFillingStorageRef = useRef(false);
  
  const [gpuActive, setGpuActive] = useState(false);
  const [gpuIntensity, setGpuIntensity] = useState(50);
  const [gpuResolution, setGpuResolution] = useState(2048);
  const [gpuMode, setGpuMode] = useState('FRACTAL'); 
  const [showGpuPopup, setShowGpuPopup] = useState(false);

  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchScore, setBenchScore] = useState(0);
  const [benchStage, setBenchStage] = useState(0);

  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  
  const MAX_LIMIT = 16384; 
  const abortControllerRef = useRef(null);
  const benchmarkInterval = useRef(null);

  const addLog = useCallback((msg, type = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const safeMsg = String(msg);
    setLogs(prev => [`[${time}] ${safeMsg}`, ...prev].slice(0, 50)); 
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartDataRAM(prev => [...prev, allocatedMB].slice(-60));
      if(activeTab === 'STORAGE') {
          setChartDataStorage(prev => [...prev, storageUsed].slice(-60));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [allocatedMB, activeTab, storageUsed]);

  const startBenchmark = () => {
      if (isBenchmarking) return;
      clearAll();
      setIsBenchmarking(true);
      setActiveTab('RAM');
      addLog("BENCHMARK STARTED: Increasing load every 5s...");
      
      let stage = 1;
      let currentRam = 1000;
      let currentCpu = 10;
      
      setTargetMB(currentRam);
      setCpuLoad(currentCpu);
      allocateMemory(currentRam, currentCpu);
      
      benchmarkInterval.current = setInterval(() => {
          stage++;
          setBenchStage(stage);
          currentRam += 1000;
          currentCpu = Math.min(100, currentCpu + 15);
          
          if (currentRam > MAX_LIMIT) currentRam = MAX_LIMIT;
          
          addLog(`BENCHMARK LEVEL ${stage}: ${currentRam}MB RAM + ${currentCpu}% CPU`);
          setTargetMB(currentRam);
          setCpuLoad(currentCpu);
          allocateMemory(currentRam, currentCpu);
          
          const score = Math.floor(currentRam + (currentCpu * 100));
          setBenchScore(score);

          if (currentRam >= MAX_LIMIT && currentCpu >= 100) {
              addLog(`BENCHMARK MAXED OUT! Final Score: ${score}`, 'success');
              clearInterval(benchmarkInterval.current);
              setIsBenchmarking(false);
          }
      }, 5000);
  };

  const stopBenchmark = () => {
      if(benchmarkInterval.current) clearInterval(benchmarkInterval.current);
      setIsBenchmarking(false);
      clearAll();
      addLog("Benchmark stopped by user.");
  };

  const createWorkerBlob = () => URL.createObjectURL(new Blob([WORKER_CODE], { type: 'application/javascript' }));

  const allocateMemory = async (target = targetMB, cpu = cpuLoad) => {
    if (workers.length > 0) {
        const WORKER_CAP = 1500;
        const mainThreadCap = 1000;
        const workerTotal = Math.max(0, target - mainThreadCap);
        
        workers.forEach((w, i) => {
            const amount = Math.min(WORKER_CAP, workerTotal - (i * WORKER_CAP));
            if (amount > 0) w.postMessage({ action: 'ALLOCATE', targetMB: amount, id: i, cpuLoad: cpu });
        });
        return;
    }

    setIsAllocating(true);
    setError(null);
    setAllocatedMB(0);
    
    const WORKER_CAP = 1500;
    const mainThreadCap = 1000;
    const workerTotal = Math.max(0, target - mainThreadCap);
    const numWorkers = Math.ceil(workerTotal / WORKER_CAP);
    const newWorkers = [];
    const url = createWorkerBlob();

    for(let i=0; i<numWorkers; i++) {
        const w = new Worker(url);
        const amount = Math.min(WORKER_CAP, workerTotal - (i*WORKER_CAP));
        w.onmessage = (e) => {
            if(e.data.type === 'PROGRESS') setAllocatedMB(p => p + e.data.addedMB);
            if(e.data.type === 'ERROR') addLog(`Worker Error: ${e.data.error}`, 'error');
        };
        w.postMessage({ action: 'ALLOCATE', targetMB: amount, id: i, cpuLoad: cpu });
        newWorkers.push(w);
    }
    setWorkers(newWorkers);
  };

  const stopRAM = () => {
      workers.forEach(w => w.terminate());
      setWorkers([]);
      setIsAllocating(false);
  };

  const fillStorage = async () => {
      if (isFillingStorage) return;
      setIsFillingStorage(true);
      isFillingStorageRef.current = true; 
      addLog("Storage Eater: Starting disk flood...");
      
      const DB_NAME = 'DiskKillerDB';
      const STORE_NAME = 'blobs';
      
      try {
          const request = indexedDB.open(DB_NAME, 1);
          request.onupgradeneeded = (e) => {
              e.target.result.createObjectStore(STORE_NAME, {autoIncrement: true});
          };
          
          request.onsuccess = async (e) => {
              const db = e.target.result;
              const CHUNK_SIZE = 10 * 1024 * 1024; 
              
              const writeChunk = () => {
                  if(!isFillingStorageRef.current) return; 
                  
                  const trans = db.transaction([STORE_NAME], 'readwrite');
                  const store = trans.objectStore(STORE_NAME);
                  const data = new Uint8Array(CHUNK_SIZE).fill(1);
                  const blob = new Blob([data]);
                  
                  const req = store.add(blob);
                  
                  req.onsuccess = () => {
                      const addedMB = CHUNK_SIZE / (1024 * 1024);
                      setStorageUsed(prev => prev + addedMB);
                      if(isFillingStorageRef.current) setTimeout(writeChunk, 5);
                  };
                  
                  req.onerror = (err) => {
                      if (err.target.error.name === 'QuotaExceededError') {
                          addLog("DISK FULL! Quota Exceeded.", 'error');
                          setError("Disk Quota Exceeded! Browser refused to write more.");
                          stopStorage();
                      } else {
                          addLog(`Disk Error: ${err.target.error.name}`);
                          stopStorage();
                      }
                  };
              };
              writeChunk();
          };
      } catch (e) {
          addLog(`DB Error: ${e.message}`);
          stopStorage();
      }
  };

  const stopStorage = () => {
      setIsFillingStorage(false);
      isFillingStorageRef.current = false;
  };

  const clearStorage = () => {
      stopStorage();
      const req = indexedDB.deleteDatabase('DiskKillerDB');
      req.onsuccess = () => {
          setStorageUsed(0);
          addLog("Storage Cleaned.");
      };
  };

  const clearAll = () => {
      stopRAM();
      clearStorage();
      setGpuActive(false);
      setAllocatedMB(0);
      setStorageUsed(0);
      setError(null);
      setChartDataRAM([]);
      setChartDataStorage([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-mono flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 bg-slate-900 border border-slate-800 p-5 rounded-xl flex justify-between items-center">
             <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-500/20 rounded-lg"><Icons.Layers className="text-indigo-400" /></div>
                 <div>
                     <h1 className="text-2xl font-bold">RAM Eater <span className="text-indigo-400">v4.0</span></h1>
                     <div className="text-[10px] text-slate-500 uppercase tracking-widest">
                        Full Stress Suite • <span className="text-indigo-400 font-bold">Made by JustGL with Gemini</span>
                     </div>
                 </div>
             </div>
             {isBenchmarking && (
                 <div className="text-right">
                     <div className="text-xs text-slate-500 uppercase">Score</div>
                     <div className="text-2xl font-bold text-amber-400">{benchScore}</div>
                 </div>
             )}
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
                  {activeTab === 'RAM' && <SimpleChart data={chartDataRAM} max={MAX_LIMIT} color="#6366f1" label="RAM Usage" unit="MB" />}
                  {activeTab === 'STORAGE' && <SimpleChart data={chartDataStorage} max={Math.max(2000, storageUsed * 1.2)} color="#f59e0b" label="Disk Usage" unit="MB" />}
                  {activeTab === 'GPU' && (
                      <div className="w-full h-full bg-black rounded overflow-hidden relative group">
                          <GpuCanvas active={gpuActive && !showGpuPopup} intensity={gpuIntensity} resolution={gpuResolution} mode={gpuMode} onClick={() => setShowGpuPopup(true)} />
                          <div className="absolute top-2 left-2 text-xs font-bold text-white shadow-black drop-shadow-md pointer-events-none">
                              {gpuMode === 'FRACTAL' ? 'Mandelbrot Burner' : '3D Raymarching Crystal'}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <span className="text-white text-xs font-bold flex items-center gap-2"><Icons.Maximize size={16}/> Double click to expand</span>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {showGpuPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-black border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                  <GpuCanvas active={gpuActive} intensity={gpuIntensity} resolution={gpuResolution} mode={gpuMode} isPopup={true} />
                  <button 
                    onClick={() => setShowGpuPopup(false)}
                    className="absolute top-2 right-2 bg-slate-800/50 hover:bg-red-600/80 text-white p-2 rounded-full backdrop-blur-md transition-all z-20"
                  >
                      <Icons.X size={24} />
                  </button>
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded text-white text-xs font-mono">
                      Mode: {gpuMode} | Resolution: {gpuResolution}x{gpuResolution} | Shader Load: {gpuIntensity}%
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase border-b border-slate-800 pb-2">
                  <Icons.Cpu size={14} /> RAM / CPU Burner
              </div>
              
              <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span>RAM Target</span><span>{targetMB} MB</span></div>
                  <input type="range" min="500" max={MAX_LIMIT} step="100" value={targetMB} onChange={e=>setTargetMB(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-indigo-500" disabled={isBenchmarking} />
              </div>
              <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span>CPU Load</span><span>{cpuLoad}%</span></div>
                  <input type="range" min="0" max="100" step="10" value={cpuLoad} onChange={e=>setCpuLoad(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-orange-500" disabled={isBenchmarking} />
              </div>

              {!isAllocating ? (
                   <button onClick={() => allocateMemory()} disabled={isBenchmarking} className="mt-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50">
                       <Icons.Play size={14} /> START LOAD
                   </button>
              ) : (
                   <button onClick={stopRAM} className="mt-auto bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all">
                       <Icons.Square size={14} /> STOP RAM
                   </button>
              )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase border-b border-slate-800 pb-2">
                  <Icons.HardDrive size={14} /> Storage Killer
              </div>
              <div className="text-center py-2">
                  <div className="text-3xl font-mono font-bold text-amber-400">{storageUsed.toFixed(0)}</div>
                  <div className="text-[10px] text-slate-500 uppercase">MB Written to Disk</div>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">Writes 10MB blobs to IndexedDB until browser throws QuotaExceededError.</p>
              
              {!isFillingStorage ? (
                  <div className="mt-auto flex gap-2">
                      <button onClick={fillStorage} disabled={isBenchmarking} className="flex-1 bg-amber-700 hover:bg-amber-600 text-white font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50">
                          <Icons.Database size={14} /> FILL
                      </button>
                      <button onClick={clearStorage} disabled={isBenchmarking || storageUsed === 0} className="flex-1 bg-slate-700 hover:bg-red-600 text-white font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50">
                          <Icons.Trash2 size={14} /> CLEAN
                      </button>
                  </div>
              ) : (
                  <button onClick={stopStorage} className="mt-auto bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all">
                      <Icons.Square size={14} /> STOP FILL
                  </button>
              )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase border-b border-slate-800 pb-2">
                  <Icons.Monitor size={14} /> GPU Stress
              </div>
              
              <div className="flex gap-1">
                  <button onClick={() => setGpuMode('FRACTAL')} disabled={isBenchmarking} className={`flex-1 py-1 text-[10px] font-bold rounded border transition-colors flex items-center justify-center gap-1 ${gpuMode === 'FRACTAL' ? 'bg-teal-600 border-teal-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                      <Icons.Aperture size={10} /> FRACTAL
                  </button>
                  <button onClick={() => setGpuMode('3D')} disabled={isBenchmarking} className={`flex-1 py-1 text-[10px] font-bold rounded border transition-colors flex items-center justify-center gap-1 ${gpuMode === '3D' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                      <Icons.Box size={10} /> 3D CRYSTAL
                  </button>
              </div>

              <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span>Shader Complexity</span><span>{gpuIntensity}%</span></div>
                  <input type="range" min="1" max="100" value={gpuIntensity} onChange={e=>setGpuIntensity(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-emerald-500" disabled={isBenchmarking} />
              </div>
              <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span>Resolution</span><span>{gpuResolution}x{gpuResolution}</span></div>
                  <input type="range" min="0" max="3" step="1" value={Math.log2(gpuResolution/1024)} onChange={e=>setGpuResolution(1024 * Math.pow(2, parseInt(e.target.value)))} className="w-full h-1 bg-slate-700 rounded-lg accent-teal-500" disabled={isBenchmarking} />
                  <div className="flex justify-between text-[8px] text-slate-600"><span>1K</span><span>2K</span><span>4K</span><span>8K</span></div>
              </div>
              
              <button onClick={() => { setGpuActive(!gpuActive); setActiveTab('GPU'); }} disabled={isBenchmarking} className={`mt-auto font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 ${gpuActive ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-emerald-700 hover:bg-emerald-600 text-white'}`}>
                  <Icons.Zap size={14} /> {gpuActive ? 'STOP GPU' : 'IGNITE GPU'}
              </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4 relative overflow-hidden">
               {isBenchmarking && <div className="absolute inset-0 bg-indigo-500/10 animate-pulse pointer-events-none"></div>}
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase border-b border-slate-800 pb-2">
                  <Icons.Trophy size={14} /> Benchmark
              </div>
              <div className="text-center">
                   <div className="text-sm text-slate-400">Current Score</div>
                   <div className="text-4xl font-black text-white">{benchScore}</div>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">Auto-increments RAM & CPU load every 5s until crash.</p>
              
              {!isBenchmarking ? (
                   <button onClick={startBenchmark} className="mt-auto bg-slate-100 hover:bg-white text-slate-900 font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all shadow-lg shadow-white/10">
                       <Icons.Play size={14} /> RUN BENCHMARK
                   </button>
              ) : (
                   <button onClick={stopBenchmark} className="mt-auto bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all">
                       <Icons.Square size={14} /> ABORT
                   </button>
              )}
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-40">
           <div className="md:col-span-2 bg-black/50 border border-slate-800 rounded-xl p-3 font-mono text-xs overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                {logs.length === 0 && <span className="text-slate-600">System Ready...</span>}
                {logs.map((l, i) => <div key={i} className={l.includes('Error') ? 'text-red-400' : 'text-slate-300'}>{l}</div>)}
           </div>
           <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-center gap-2">
                <button onClick={clearAll} className="w-full bg-slate-800 border border-slate-700 hover:bg-red-900/50 hover:text-white text-slate-400 font-bold py-3 rounded transition-colors flex items-center justify-center gap-2">
                    <Icons.Trash2 size={16} /> EMERGENCY RESET
                </button>
                {error && <div className="text-[10px] text-red-400 font-bold text-center border border-red-900/50 bg-red-900/20 p-2 rounded">{error}</div>}
           </div>
      </div>
    </div>
  );
}
