import React, { useState, useRef, useEffect } from 'react';
import Icons from './icons';
import { VERT_SHADER, FRAG_FRACTAL, FRAG_3D, FRAG_FIRE } from '../constants';

const GpuCanvas = React.memo(({ active, intensity, resolution, onClick, mode, isPopup, overdrive, onFpsUpdate, onError }) => {
    const canvasRef = useRef(null);
    const [fps, setFps] = useState(0);
    const [contextLost, setContextLost] = useState(false);

    // Keep volatile props in refs so the WebGL setup effect does not get
    // torn down and recreated on every benchmark stage / slider tick
    // (callback identities change per render while the benchmark runs).
    const intensityRef = useRef(intensity);
    intensityRef.current = intensity;
    const overdriveRef = useRef(overdrive);
    overdriveRef.current = overdrive;
    const onFpsUpdateRef = useRef(onFpsUpdate);
    onFpsUpdateRef.current = onFpsUpdate;
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return;

        // 1. Обробники подій втрати/відновлення контексту
        const handleContextLost = (e) => {
            e.preventDefault(); // Це обов'язково, щоб мати шанс на відновлення
            console.warn("WebGL Context Lost! GPU crashed.");
            setContextLost(true);
            if (onFpsUpdateRef.current) onFpsUpdateRef.current(0);
            
            // Повідомляємо батьківський компонент (для бенчмарку), що стався краш
            if (onErrorRef.current) onErrorRef.current();
        };

        const handleContextRestored = () => {
            console.log("WebGL Context Restored.");
            setContextLost(false);
        };

        canvas.addEventListener('webglcontextlost', handleContextLost, false);
        canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

        // Якщо контекст втрачено, не намагаємося ініціалізувати WebGL
        if (contextLost) return;

        canvas.width = resolution; 
        canvas.height = resolution;
        
        // powerPreference: "high-performance" просить систему використати дискретну відеокарту
        const gl = canvas.getContext('webgl', { powerPreference: "high-performance" });
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
        
        // Додаткова перевірка, бо після крашу шейдери можуть не створитись
        if (!vs || !fsO) {
            if(gl && !gl.isContextLost()) gl.deleteProgram(prog);
            return;
        }

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
        if (!gl.isContextLost()) {
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(resL, canvas.width, canvas.height);
            gl.uniform1f(timeL, 10.0);
            gl.uniform1f(intL, intensityRef.current / 100);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        let frameId;
        let frameCount = 0;
        let lastTime = performance.now();

        const render = (time) => {
            if (contextLost || (gl && gl.isContextLost())) {
                cancelAnimationFrame(frameId);
                return;
            }

            frameCount++;
            const now = performance.now();
            if (now - lastTime >= 250) { 
                const currentFps = Math.round((frameCount * 1000) / (now - lastTime));
                setFps(currentFps);
                if (onFpsUpdateRef.current) onFpsUpdateRef.current(currentFps); 
                frameCount = 0;
                lastTime = now;
            }

            if (active) {
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.uniform2f(resL, canvas.width, canvas.height);
                gl.uniform1f(timeL, time * 0.001);
                gl.uniform1f(intL, intensityRef.current / 100); 
                const passes = overdriveRef.current || 1;
                for(let i=0; i<passes; i++) { gl.drawArrays(gl.TRIANGLES, 0, 6); }
                frameId = requestAnimationFrame(render);
            }
        };

        if (active && !contextLost) render(0);

        return () => {
            cancelAnimationFrame(frameId);
            canvas.removeEventListener('webglcontextlost', handleContextLost);
            canvas.removeEventListener('webglcontextrestored', handleContextRestored);
            if(gl && !gl.isContextLost() && prog) { 
                gl.deleteProgram(prog); gl.deleteShader(vs); gl.deleteShader(fsO); 
            }
        };
    }, [active, resolution, mode, contextLost]);

    return (
        <div className="relative w-full h-full group/canvas">
            {/* UI для Крашу */}
            {contextLost && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 text-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
                    <Icons.ShieldAlert size={48} className="text-red-500 mb-2 animate-pulse"/>
                    <h3 className="text-xl font-bold text-red-500 font-graffiti tracking-widest animate-pulse">GPU CRASHED!</h3>
                    <p className="text-xs text-slate-300 mb-4 font-mono">Browser killed WebGL context.<br/>Limits exceeded.</p>
                    {isPopup && (
                       <button 
                          onClick={() => window.location.reload()} 
                          className="mt-4 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold py-2 px-6 rounded text-xs transition-colors"
                      >
                          FORCE RELOAD PAGE
                      </button>
                  )}
                </div>
            )}

            <canvas ref={canvasRef} className="w-full h-full object-cover opacity-80 cursor-pointer" onDoubleClick={onClick}/>
            
            {/* FPS Counter */}
            {active && !isPopup && !contextLost && (
                <div className="absolute top-2 right-2 z-10 bg-black/70 text-green-400 text-[10px] font-mono font-bold px-2 py-1 rounded backdrop-blur-md border border-green-500/30 pointer-events-none select-none">
                    {fps} FPS {overdrive > 1 ? `(x${overdrive})` : ''}
                </div>
            )}
        </div>
    );
});

GpuCanvas.displayName = 'GpuCanvas';

export default GpuCanvas;
