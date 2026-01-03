import React, { useState, useRef, useEffect, useCallback } from 'react';

// --- ICONS (Embedded SVGs) ---
const IconBase = ({ size = 24, children, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

const Icons = {
  Trash2: (p) => <IconBase {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></IconBase>,
  Play: (p) => <IconBase {...p}><polygon points="5 3 19 12 5 21 5 3"/></IconBase>,
  Square: (p) => <IconBase {...p}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></IconBase>,
  Activity: (p) => <IconBase {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></IconBase>,
  Database: (p) => <IconBase {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></IconBase>,
  Cpu: (p) => <IconBase {...p}><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 14h3"/><path d="M1 9h3"/><path d="M1 14h3"/></IconBase>,
  Layers: (p) => <IconBase {...p}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></IconBase>,
  Terminal: (p) => <IconBase {...p}><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></IconBase>,
  Zap: (p) => <IconBase {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></IconBase>,
  ShieldAlert: (p) => <IconBase {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4"/><path d="M12 16h.01"/></IconBase>,
  HardDrive: (p) => <IconBase {...p}><line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/></IconBase>,
  Monitor: (p) => <IconBase {...p}><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></IconBase>,
  Trophy: (p) => <IconBase {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></IconBase>,
  X: (p) => <IconBase {...p}><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></IconBase>,
  Maximize: (p) => <IconBase {...p}><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></IconBase>,
  Box: (p) => <IconBase {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></IconBase>,
  Aperture: (p) => <IconBase {...p}><circle cx="12" cy="12" r="10"/><line x1="14.31" x2="20.05" y1="8" y2="17.94"/><line x1="9.69" x2="21.17" y1="8" y2="8"/><line x1="7.38" x2="13.12" y1="12" y2="2.06"/><line x1="9.69" x2="3.95" y1="16" y2="6.06"/><line x1="14.31" x2="2.83" y1="16" y2="16"/><line x1="16.62" x2="10.88" y1="12" y2="21.94"/></IconBase>,
  Flame: (p) => <IconBase {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3.3.9.8 1.8 1.9 2.8z"/></IconBase>,
  Award: (p) => <IconBase {...p}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></IconBase>,
  Wifi: (p) => <IconBase {...p}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></IconBase>,
  DownloadCloud: (p) => <IconBase {...p}><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></IconBase>,
};

// --- WEBGL SHADERS ---

const FRAG_FRACTAL = `precision mediump float;
uniform vec2 u_resolution; uniform float u_time; uniform float u_intensity;
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 col = vec3(0.0);
    float max_iter = 50.0 + (u_intensity * 150.0); 
    vec2 z = vec2(0.0); vec2 c = uv * 3.0 - vec2(0.5, 0.0);
    float i_val = 0.0;
    for(int n=0; n < 200; n++) {
        if (float(n) > max_iter) break;
        float heavy = sin(float(n) * 0.2 + u_time) * 0.001;
        z = vec2(z.x*z.x - z.y*z.y + heavy, 2.0*z.x*z.y) + c;
        if(dot(z, z) > 16.0) { i_val = float(n); break; }
    }
    col = vec3(i_val/max_iter * 2.0, i_val/max_iter * 0.5, i_val/max_iter * 0.2);
    gl_FragColor = vec4(col, 1.0);
}`;

const FRAG_3D = `precision mediump float;
uniform vec2 u_resolution; uniform float u_time; uniform float u_intensity;
mat2 rot(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }
float map(vec3 p) {
    vec3 q = p; q.xz *= rot(u_time * 0.4); q.xy *= rot(u_time * 0.3);
    float s = 1.0;
    for(int i=0; i<4; i++) {
        q = abs(q) - vec3(0.4); q.xy *= rot(0.5); q.xz *= rot(0.5);
        s *= 1.5; q *= 1.5;
    }
    return length(max(abs(q) - vec3(0.1), 0.0)) / s;
}
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 ro = vec3(0.0, 0.0, -2.5); vec3 rd = normalize(vec3(uv, 1.2));
    float t = 0.0; float fMaxSteps = 30.0 + u_intensity * 100.0;
    float hit = 0.0; vec3 p = vec3(0.0);
    for(int i=0; i<100; i++) {
        if(float(i) > fMaxSteps) break;
        p = ro + rd * t; float d = map(p);
        if(d < 0.001) { hit = 1.0; break; }
        t += d; if(t > 10.0) break;
    }
    vec3 col = vec3(0.02, 0.02, 0.05);
    if(hit > 0.5) {
        vec3 lig = normalize(vec3(1.0, 1.0, -1.0));
        float d = map(p); vec2 e = vec2(0.01, 0.0);
        vec3 n = normalize(vec3(d - map(p-e.xyy), d - map(p-e.yxy), d - map(p-e.yyx)));
        float diff = max(dot(n, lig), 0.0); col = vec3(0.0, 0.6, 1.0) * diff;
    }
    gl_FragColor = vec4(col, 1.0);
}`;

const FRAG_FIRE = `precision mediump float;
uniform vec2 u_resolution; uniform float u_time; uniform float u_intensity;
float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }
float noise(vec2 p){
    vec2 ip = floor(p); vec2 u = fract(p); u = u*u*(3.0-2.0*u);
    float res = mix(mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x), mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
    return res;
}
float fbm(vec2 p) {
    float f = 0.0; float amp = 0.5;
    for(int i=0; i<4; i++) { f += amp * noise(p); p = p * 2.02; amp *= 0.5; }
    return f;
}
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy; vec2 p = uv * 2.0 - 1.0; p.x *= u_resolution.x / u_resolution.y;
    float speed = u_time * (1.5 + u_intensity);
    vec2 distortion = vec2(fbm(p + vec2(0.0, speed * 0.2)), fbm(p + vec2(43.0, speed * 0.3)));
    p += distortion * 0.1 * u_intensity;
    float q = fbm(p * 3.0 - vec2(0.0, speed)); float r = fbm(p * 5.0 + vec2(q)); 
    float mask = 1.0 - length(p * vec2(0.8, 1.5) + vec2(0.0, -0.8)); mask = clamp(mask, 0.0, 1.0);
    float fire = (q + r) * mask * 2.0; fire = pow(fire, 1.5); 
    vec3 color = mix(vec3(0.1, 0.0, 0.0), vec3(1.0, 0.5, 0.1), fire); color = mix(color, vec3(1.0, 1.0, 0.8), pow(fire, 3.0)); 
    float pd = u_intensity * 2.0;
    if (pd > 0.1) {
        vec2 sparkUV = p * (10.0 + pd * 10.0); sparkUV.y += speed * 2.0;
        float sparks = noise(sparkUV); sparks = pow(sparks, 15.0); 
        color += vec3(1.0, 0.8, 0.2) * sparks * pd;
    }
    gl_FragColor = vec4(color, 1.0);
}`;

const VERT_SHADER = `precision mediump float; attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

// --- WORKER (CPU/RAM) ---
const WORKER_CODE = `
  let memoryStore = [];
  let cpuIntensity = 0;
  const burnCpuChunk = (intensity) => {
    if (intensity <= 0) return;
    const msToBurn = (intensity / 100) * 80; 
    const start = performance.now();
    while (performance.now() - start < msToBurn) { Math.sqrt(Math.random() * Math.random()); }
  };
  self.onmessage = async (e) => {
    const { action, targetMB, id, type, cpuLoad } = e.data;
    if (action === 'ALLOCATE') {
      cpuIntensity = cpuLoad || 0;
      const CHUNK_SIZE = 10; const BYTES_PER_MB = 1024 * 1024;
      const steps = Math.ceil(targetMB / CHUNK_SIZE);
      try {
        for (let i = 0; i < steps; i++) {
          if (type === 'STRING') {
             const strLength = (CHUNK_SIZE * BYTES_PER_MB) / 2; const chunk = "X".repeat(strLength); memoryStore.push(chunk);
          } else {
             const chunkBytes = CHUNK_SIZE * BYTES_PER_MB; const buffer = new Uint8Array(chunkBytes);
             for (let j = 0; j < chunkBytes; j += 4096) buffer[j] = (Math.random() * 255) | 0;
             buffer[chunkBytes - 1] = 1; memoryStore.push(buffer);
          }
          if (cpuIntensity > 0) burnCpuChunk(cpuIntensity);
          self.postMessage({ type: 'PROGRESS', addedMB: CHUNK_SIZE, id });
          await new Promise(r => setTimeout(r, 20)); 
        }
        self.postMessage({ type: 'DONE', id });
      } catch (err) { self.postMessage({ type: 'ERROR', error: err.message, id }); }
    } else if (action === 'CLEAR') {
      memoryStore = []; try { new Array(10000).fill(0); } catch(e){}
      self.postMessage({ type: 'CLEARED', id });
    }
  };
`;

// --- GpuCanvas ---
const GpuCanvas = ({ active, intensity, resolution, onClick, mode, isPopup, overdrive, onFpsUpdate }) => {
    const canvasRef = useRef(null);
    const [fps, setFps] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return;
        canvas.width = resolution; 
        canvas.height = resolution;
        const gl = canvas.getContext('webgl');
        if(!gl) return;

        const createShader = (gl, type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src); gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
            return s;
        };

        const prog = gl.createProgram();
        let fs = FRAG_FRACTAL;
        if (mode === '3D') fs = FRAG_3D;
        if (mode === 'FIRE') fs = FRAG_FIRE;
        
        const vs = createShader(gl, gl.VERTEX_SHADER, VERT_SHADER);
        const fsO = createShader(gl, gl.FRAGMENT_SHADER, fs);
        if (!vs || !fsO) return;

        gl.attachShader(prog, vs); gl.attachShader(prog, fsO);
        gl.linkProgram(prog); gl.useProgram(prog);

        const pb = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pb);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
        const pl = gl.getAttribLocation(prog, "position");
        gl.enableVertexAttribArray(pl);
        gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);

        const resL = gl.getUniformLocation(prog, "u_resolution");
        const timeL = gl.getUniformLocation(prog, "u_time");
        const intL = gl.getUniformLocation(prog, "u_intensity");

        // Initial Draw (Static Preview)
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(resL, canvas.width, canvas.height);
        gl.uniform1f(timeL, 10.0);
        gl.uniform1f(intL, intensity / 100);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        let frameId;
        let frameCount = 0;
        let lastTime = performance.now();

        const render = (time) => {
            frameCount++;
            const now = performance.now();
            if (now - lastTime >= 250) { 
                const currentFps = Math.round((frameCount * 1000) / (now - lastTime));
                setFps(currentFps);
                if (onFpsUpdate) onFpsUpdate(currentFps); 
                frameCount = 0;
                lastTime = now;
            }

            if (active) {
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.uniform2f(resL, canvas.width, canvas.height);
                gl.uniform1f(timeL, time * 0.001);
                gl.uniform1f(intL, intensity / 100); 
                const passes = overdrive || 1;
                for(let i=0; i<passes; i++) { gl.drawArrays(gl.TRIANGLES, 0, 6); }
                frameId = requestAnimationFrame(render);
            }
        };

        if (active) render(0);

        return () => {
            cancelAnimationFrame(frameId);
            if(gl && prog) { gl.deleteProgram(prog); gl.deleteShader(vs); gl.deleteShader(fsO); }
        };
    }, [active, intensity, resolution, mode, overdrive, onFpsUpdate]);

    return (
        <div className="relative w-full h-full group/canvas">
            <canvas ref={canvasRef} className="w-full h-full object-cover opacity-80 cursor-pointer" onDoubleClick={onClick}/>
            {/* Show FPS if active (animated) */}
            {active && !isPopup && (
                <div className="absolute top-2 right-2 z-10 bg-black/70 text-green-400 text-[10px] font-mono font-bold px-2 py-1 rounded backdrop-blur-md border border-green-500/30 pointer-events-none select-none">
                    {fps} FPS {overdrive > 1 ? `(x${overdrive})` : ''}
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
             <div className="absolute top-1 right-2 text-[10px] font-mono font-bold" style={{color}}>{displayVal} {unit}</div>
             <div className="absolute top-1 left-2 text-[10px] font-bold text-slate-500 uppercase">{label}</div>
        </div>
    );
};

// --- SUITES ---
const LIGHT_SUITE = [ // For iGPU / Safe
    { mode: 'FRACTAL', res: 1024, od: 1 }, { mode: 'FRACTAL', res: 1024, od: 2 }, { mode: 'FRACTAL', res: 2048, od: 1 },
    { mode: '3D', res: 1024, od: 1 }, { mode: '3D', res: 1024, od: 2 }, { mode: '3D', res: 2048, od: 1 },
    { mode: 'FIRE', res: 1024, od: 1 }, { mode: 'FIRE', res: 1024, od: 2 }, { mode: 'FIRE', res: 2048, od: 1 },
];

const NORMAL_SUITE = [ // Standard
    { mode: 'FRACTAL', res: 1024, od: 1 }, { mode: 'FRACTAL', res: 2048, od: 1 }, { mode: 'FRACTAL', res: 4096, od: 1 },
    { mode: 'FRACTAL', res: 1024, od: 5 }, { mode: 'FRACTAL', res: 2048, od: 5 }, { mode: 'FRACTAL', res: 4096, od: 5 },
    { mode: '3D', res: 1024, od: 1 }, { mode: '3D', res: 2048, od: 1 }, { mode: '3D', res: 4096, od: 1 },
    { mode: '3D', res: 1024, od: 5 }, { mode: '3D', res: 2048, od: 5 }, { mode: '3D', res: 4096, od: 5 },
    { mode: 'FIRE', res: 1024, od: 1 }, { mode: 'FIRE', res: 2048, od: 1 }, { mode: 'FIRE', res: 4096, od: 1 },
    { mode: 'FIRE', res: 1024, od: 5 }, { mode: 'FIRE', res: 2048, od: 5 }, { mode: 'FIRE', res: 4096, od: 5 },
];

const BURNER_SUITE = [ // Extreme
    { mode: 'FRACTAL', res: 4096, od: 1 }, { mode: 'FRACTAL', res: 4096, od: 5 }, { mode: 'FRACTAL', res: 4096, od: 10 }, { mode: 'FRACTAL', res: 4096, od: 15 },
    { mode: 'FRACTAL', res: 8192, od: 1 }, { mode: 'FRACTAL', res: 8192, od: 5 }, { mode: 'FRACTAL', res: 8192, od: 10 }, { mode: 'FRACTAL', res: 8192, od: 15 },
    { mode: '3D', res: 4096, od: 1 }, { mode: '3D', res: 4096, od: 5 }, { mode: '3D', res: 4096, od: 10 }, { mode: '3D', res: 4096, od: 15 },
    { mode: '3D', res: 8192, od: 1 }, { mode: '3D', res: 8192, od: 5 }, { mode: '3D', res: 8192, od: 10 }, { mode: '3D', res: 8192, od: 15 },
    { mode: 'FIRE', res: 4096, od: 1 }, { mode: 'FIRE', res: 4096, od: 5 }, { mode: 'FIRE', res: 4096, od: 10 }, { mode: 'FIRE', res: 4096, od: 15 },
    { mode: 'FIRE', res: 8192, od: 1 }, { mode: 'FIRE', res: 8192, od: 5 }, { mode: 'FIRE', res: 8192, od: 10 }, { mode: 'FIRE', res: 8192, od: 15 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('RAM'); 
  const [targetMB, setTargetMB] = useState(4096);
  const [cpuLoad, setCpuLoad] = useState(0); 
  const [allocatedMB, setAllocatedMB] = useState(0);
  const [isAllocating, setIsAllocating] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [chartDataRAM, setChartDataRAM] = useState([]);
  
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageCount, setStorageCount] = useState(0); 
  const [isFillingStorage, setIsFillingStorage] = useState(false);
  const [chartDataStorage, setChartDataStorage] = useState([]);
  const isFillingStorageRef = useRef(false);
  const dbRef = useRef(null);
  
  const [forceUpdateStorage, setForceUpdateStorage] = useState(0);
  
  const [gpuActive, setGpuActive] = useState(false);
  const [gpuIntensity, setGpuIntensity] = useState(50);
  const [gpuResolution, setGpuResolution] = useState(2048);
  const [gpuOverdrive, setGpuOverdrive] = useState(1); 
  const [gpuMode, setGpuMode] = useState('FRACTAL'); 
  const [showGpuPopup, setShowGpuPopup] = useState(false);

  // Network Stress State
  const [netActive, setNetActive] = useState(false);
  const [netStats, setNetStats] = useState({ speed: 0, total: 0 }); // speed: Mbps, total: MB
  const netAbortController = useRef(null);
  const netBytesRef = useRef(0);
  const netInterval = useRef(null);

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
  
  const gpuBenchInterval = useRef(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  
  const MAX_LIMIT = 16384; 
  const benchmarkInterval = useRef(null);

  const addLog = useCallback((msg, type = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const safeMsg = String(msg);
    setLogs(prev => [`[${time}] ${safeMsg}`, ...prev].slice(0, 50)); 
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

  // --- NETWORK STORM LOGIC ---
  const runNetworkStress = () => {
    if (netActive) return;
    setNetActive(true);
    setNetStats({ speed: 0, total: 0 });
    netBytesRef.current = 0;
    netAbortController.current = new AbortController();
    
    addLog("NETWORK STORM: Starting Download Burner & Flood...");

    let lastBytes = 0;
    netInterval.current = setInterval(() => {
        const currentBytes = netBytesRef.current;
        const diff = currentBytes - lastBytes;
        const mbps = (diff * 8) / (1024 * 1024); 
        lastBytes = currentBytes;
        setNetStats(prev => ({ speed: mbps, total: currentBytes / (1024 * 1024) }));
    }, 1000);

    // Optimized High-Speed Downloader
    const downloadWorker = async (id) => {
        const targetUrl = 'https://speed.cloudflare.com/__down?bytes=52428800'; // 50MB
        while (!netAbortController.current.signal.aborted) {
            try {
                const response = await fetch(`${targetUrl}&r=${Math.random()}`, {
                    signal: netAbortController.current.signal,
                    cache: 'no-store',
                    mode: 'cors'
                });
                
                if (!response.ok) throw new Error(response.statusText);

                const reader = response.body.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    if (value) {
                        netBytesRef.current += value.length;
                    }
                }
            } catch (e) {
                if (netAbortController.current.signal.aborted) break;
                // Silent retry for speed
            }
        }
    };

    // Spawn 12 concurrent workers
    for (let i = 0; i < 12; i++) downloadWorker(i);
  };

  const stopNetworkStress = () => {
      if (netAbortController.current) netAbortController.current.abort();
      if (netInterval.current) clearInterval(netInterval.current);
      setNetActive(false);
      addLog(`Network Stress Stopped. Burned: ${netStats.total.toFixed(0)} MB`);
  };

  // --- GPU BENCHMARK ---
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

  const setupGpuStage = (mode, stageIdx, currentResults) => {
      const suite = mode === 'LIGHT' ? LIGHT_SUITE : (mode === 'NORMAL' ? NORMAL_SUITE : BURNER_SUITE);
      if (stageIdx >= suite.length) {
          finishGpuBenchmark(currentResults, mode);
          return;
      }
      
      const config = suite[stageIdx];
      setGpuMode(config.mode);
      setGpuResolution(config.res);
      setGpuOverdrive(config.od);
      setGpuIntensity(100); 
      setGpuBenchTimeLeft(20); 
      setGpuBenchAvgBuffer([]); 
      gpuBenchAvgBufferRef.current = []; // Reset ref
      
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
  };

  const recordGpuResult = (mode, stageIdx, currentResults) => {
      const suite = mode === 'LIGHT' ? LIGHT_SUITE : (mode === 'NORMAL' ? NORMAL_SUITE : BURNER_SUITE);
      const config = suite[stageIdx];
      // Skip first 2 seconds (warmup)
      const validSamples = gpuBenchAvgBufferRef.current.slice(8); 
      const avg = validSamples.length > 0 
          ? validSamples.reduce((a,b) => a+b, 0) / validSamples.length 
          : gpuBenchCurrentFps; 

      const newResult = { ...config, avgFps: avg };
      const newResults = [...currentResults, newResult];
      setGpuBenchResults(newResults);
      setGpuBenchStage(stageIdx + 1);
      setupGpuStage(mode, stageIdx + 1, newResults);
  };

  const handleGpuFpsUpdate = (fps) => {
      setGpuBenchCurrentFps(fps);
      if (gpuBenchMode !== 'NONE') {
          // Update both state (for UI) and Ref (for reliable calculation)
          setGpuBenchAvgBuffer(prev => [...prev, fps]);
          gpuBenchAvgBufferRef.current.push(fps);
      }
  };

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

  // --- WORKERS & STORAGE ---
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
    setAllocatedMB(0);
    const WORKER_CAP = 1500;
    const mainThreadCap = 1000;
    const workerTotal = Math.max(0, target - mainThreadCap);
    const numWorkers = Math.ceil(workerTotal / WORKER_CAP);
    const newWorkers = [];
    const url = createWorkerBlob();
    addLog(`Spawning ${numWorkers} workers for ${target}MB...`);
    for(let i=0; i<numWorkers; i++) {
        const w = new Worker(url);
        const amount = Math.min(WORKER_CAP, workerTotal - (i*WORKER_CAP));
        w.onmessage = (e) => {
            if(e.data.type === 'PROGRESS') setAllocatedMB(p => p + e.data.addedMB);
            if(e.data.type === 'ERROR') addLog(`Worker #${i} Error`, 'error');
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
      addLog("Storage: Starting flood...");
      const DB_NAME = 'DiskKillerDB';
      const STORE_NAME = 'blobs';
      try {
          const request = indexedDB.open(DB_NAME, 1);
          request.onupgradeneeded = (e) => { e.target.result.createObjectStore(STORE_NAME, {autoIncrement: true}); };
          request.onsuccess = async (e) => {
              const db = e.target.result;
              dbRef.current = db; 
              const CHUNK_SIZE = 10 * 1024 * 1024; 
              const writeChunk = () => {
                  if(!isFillingStorageRef.current) return; 
                  try {
                      const trans = db.transaction([STORE_NAME], 'readwrite');
                      const store = trans.objectStore(STORE_NAME);
                      const data = new Uint8Array(CHUNK_SIZE).fill(1);
                      const blob = new Blob([data]);
                      const req = store.add(blob);
                      req.onsuccess = () => {
                          const addedMB = CHUNK_SIZE / (1024 * 1024);
                          setStorageUsed(prev => prev + addedMB);
                          setStorageCount(prev => prev + 1); 
                          if(isFillingStorageRef.current) setTimeout(writeChunk, 5);
                      };
                      req.onerror = () => stopStorage();
                  } catch (e) { stopStorage(); }
              };
              writeChunk();
          };
      } catch (e) { stopStorage(); }
  };

  const stopStorage = () => {
      setIsFillingStorage(false);
      isFillingStorageRef.current = false;
  };

  const clearStorage = () => {
      stopStorage();
      if (dbRef.current) { dbRef.current.close(); dbRef.current = null; }
      setTimeout(() => {
          const req = indexedDB.deleteDatabase('DiskKillerDB');
          req.onsuccess = () => { setStorageUsed(0); setStorageCount(0); addLog("Storage Cleaned."); };
      }, 100);
  };

  const clearAll = () => {
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
      cancelGpuBenchmark();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-mono flex flex-col gap-4 overflow-hidden">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');.font-graffiti { font-family: 'Permanent Marker', cursive; text-shadow: 2px 2px 0px #4f46e5;}`}</style>
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 bg-slate-900 border border-slate-800 p-5 rounded-xl flex justify-between items-center">
             <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 transform rotate-3"><Icons.Layers className="text-indigo-400 w-8 h-8" /></div>
                 <div>
                     <h1 className="text-4xl text-white font-graffiti tracking-wider transform -skew-x-6">
                       <span className="text-indigo-400">RAM</span>PAGE!
                     </h1>
                     <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-1">
                        v4.0 • Full Stress Suite • <span className="text-indigo-400 font-bold">JustGL & Gemini</span>
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
                  {activeTab === 'RAM' && <SimpleChart data={chartDataRAM} max={MAX_LIMIT} color="#6366f1" label="RAM Usage" unit="MB" />}
                  {activeTab === 'STORAGE' && <SimpleChart data={chartDataStorage} max={Math.max(2000, storageUsed * 1.2)} color="#f59e0b" label="Disk Usage" unit="MB" />}
                  {activeTab === 'GPU' && (
                      <div className="w-full h-full bg-black rounded overflow-hidden relative group">
                          {/* Main Chart Canvas: Show only if running, otherwise show "IDLE" text */}
                          {gpuActive ? (
                            <GpuCanvas 
                              active={!showGpuPopup} 
                              intensity={gpuIntensity} 
                              resolution={gpuResolution} 
                              mode={gpuMode} 
                              overdrive={gpuOverdrive}
                              onClick={() => setShowGpuPopup(true)} 
                            />
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
                  {/* HUD */}
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

                  {/* FPS Counter in Popup (Positioned left of close button) */}
                  <div className="absolute top-4 right-20 z-20 bg-black/70 text-green-400 text-xs font-mono font-bold px-3 py-1.5 rounded backdrop-blur-md border border-green-500/30">
                      FPS: {gpuBenchTimeLeft > 18 && gpuBenchMode !== 'NONE' ? 'WARMING UP...' : gpuBenchCurrentFps}
                  </div>

                  <button 
                    onClick={() => gpuBenchMode !== 'NONE' ? cancelGpuBenchmark() : setShowGpuPopup(false)}
                    className="absolute top-4 right-4 bg-slate-800/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-md transition-all z-20 border border-white/10"
                  >
                      <Icons.X size={20} />
                  </button>

                  <div className="flex-1 relative">
                      <GpuCanvas 
                        active={true} // Always render in popup
                        intensity={gpuIntensity} 
                        resolution={gpuResolution} 
                        mode={gpuMode} 
                        overdrive={gpuOverdrive}
                        onFpsUpdate={handleGpuFpsUpdate}
                        isPopup={true} 
                      />
                  </div>
              </div>
          </div>
      )}

      {showBenchResults && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
              <div className="bg-slate-900 border border-indigo-500 rounded-2xl max-w-lg w-full p-6">
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
                  <button onClick={() => setShowBenchResults(false)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg">CLOSE</button>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
          {/* COL 1: RAM/CPU */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase border-b border-slate-800 pb-2">
                  <Icons.Cpu size={14} /> RAM / CPU Burner
              </div>
              <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span>RAM Target</span><span>{targetMB} MB</span></div>
                  <input type="range" min="500" max={MAX_LIMIT} step="100" value={targetMB} onChange={e=>setTargetMB(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-indigo-500" disabled={isBenchmarking || gpuBenchMode!=='NONE'} />
              </div>
              <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span>CPU Load</span><span>{cpuLoad}%</span></div>
                  <input type="range" min="0" max="100" step="10" value={cpuLoad} onChange={e=>setCpuLoad(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-orange-500" disabled={isBenchmarking || gpuBenchMode!=='NONE'} />
              </div>
              {!isAllocating ? (
                   <button onClick={() => allocateMemory()} disabled={isBenchmarking || gpuBenchMode!=='NONE'} className="mt-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50">
                       <Icons.Play size={14} /> START LOAD
                   </button>
              ) : (
                   <button onClick={stopRAM} className="mt-auto bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 text-sm transition-all">
                       <Icons.Square size={14} /> STOP RAM
                   </button>
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
              <p className="text-[10px] text-slate-500 leading-tight">Writes 10MB blobs to IndexedDB until browser throws QuotaExceededError.</p>
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
                  {gpuActive ? 'MANUAL STOP' : 'MANUAL START'}
              </button>
          </div>

          {/* COL 4: BENCHMARKS */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4 relative overflow-hidden">
               {/* Mode Switcher */}
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
                <button onClick={clearAll} className="w-full h-full bg-slate-800 border border-slate-700 hover:bg-red-900/50 hover:text-white text-slate-400 font-bold py-3 rounded transition-colors flex flex-col items-center justify-center gap-2">
                    <Icons.Trash2 size={24} /> 
                    <span>EMERGENCY RESET</span>
                </button>
                {error && <div className="text-[10px] text-red-400 font-bold text-center border border-red-900/50 bg-red-900/20 p-2 rounded">{error}</div>}
           </div>
      </div>
    </div>
  );
}
