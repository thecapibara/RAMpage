let memoryStore = [];
let cpuIntensity = 0;
let stressMode = 'STANDARD'; 
let allocMode = 'LINEAR';
let isRunning = true; 

// Для WASM нам треба тримати посилання на поточний активний блок пам'яті
let currentWasmInstance = null; 

const heavyHash = (str) => {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
        h1 = Math.imul(h1 ^ str.charCodeAt(i), 2654435761);
        h2 = Math.imul(h2 ^ str.charCodeAt(i), 1597334677);
        h1 = ((h1 << 13) | (h1 >>> 19)) ^ h2;
        h2 = ((h2 << 16) | (h2 >>> 16)) ^ h1;
    }
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const burnCpuChunk = (intensity) => {
  if (intensity <= 0) return;
  const msToBurn = (intensity / 100) * 80; 
  const start = performance.now();
  
  if (stressMode === 'HASH') {
      let hashes = 0;
      while (performance.now() - start < msToBurn) { 
          heavyHash("block_" + Math.random() + "_" + hashes++);
      }
      if (Math.random() > 0.8) {
          self.postMessage({ type: 'HASH', hash: "0000" + Math.random().toString(16).slice(2) });
      }
  } else {
      while (performance.now() - start < msToBurn) { Math.sqrt(Math.random() * Math.random()); }
  }
};

self.onmessage = async (e) => {
  const { action, targetMB, id, cpuLoad, mode, ramMode } = e.data;
  
  if (action === 'ALLOCATE') {
    cpuIntensity = cpuLoad || 0;
    stressMode = mode || 'STANDARD';
    allocMode = ramMode || 'LINEAR';
    isRunning = true;

    // Reset previous allocation so re-ALLOCATE targets fresh memory
    // instead of accumulating on top of the old store (benchmark stages).
    memoryStore = [];
    currentWasmInstance = null;

    const CHUNK_SIZE = 10; 
    const BYTES_PER_MB = 1024 * 1024;
    // 1 Wasm Page = 64KB. 10MB = 160 pages.
    const PAGES_PER_CHUNK = 160; 
    const steps = Math.ceil(targetMB / CHUNK_SIZE);
    
    try {
      for (let i = 0; i < steps; i++) {
        if (!isRunning) break; 

        // --- LOGIC FOR MEMORY ---
        if (allocMode === 'CHAOS') {
           const chaosType = Math.random();
           if (chaosType < 0.33) { memoryStore.push(new Float64Array((CHUNK_SIZE * BYTES_PER_MB) / 8).fill(Math.random())); } 
           else if (chaosType < 0.66) { memoryStore.push("X".repeat((CHUNK_SIZE * BYTES_PER_MB)/2)); } 
           else { memoryStore.push(new Uint8Array(CHUNK_SIZE * BYTES_PER_MB).fill(1)); }
        
        } else if (allocMode === 'WASM') {
            // --- WASM LEAK LOGIC ---
            try {
                if (!currentWasmInstance) {
                    // Створюємо нову пам'ять (початково 10МБ)
                    currentWasmInstance = new WebAssembly.Memory({ initial: PAGES_PER_CHUNK });
                    memoryStore.push(currentWasmInstance);
                } else {
                    // Розширюємо існуючу (+10МБ)
                    currentWasmInstance.grow(PAGES_PER_CHUNK);
                }
            } catch {
                // Якщо одна Wasm пам'ять заповнена (ліміт зазвичай 2GB-4GB), створюємо нову
                // Це дозволяє обійти ліміт однієї Wasm інстанції
                try {
                    currentWasmInstance = new WebAssembly.Memory({ initial: PAGES_PER_CHUNK });
                    memoryStore.push(currentWasmInstance);
                } catch {
                    throw new Error("Wasm Memory Limit Reached (Global)");
                }
            }

        } else {
            // LINEAR
            memoryStore.push(new Uint8Array(CHUNK_SIZE * BYTES_PER_MB).fill(1));
        }

        if (cpuIntensity > 0) burnCpuChunk(cpuIntensity);
        
        self.postMessage({ type: 'PROGRESS', addedMB: CHUNK_SIZE, id });
        await new Promise(r => setTimeout(r, 20)); 
      }

      if (stressMode === 'HASH' && isRunning) {
          self.postMessage({ type: 'HASH_LOOP_ENTER', id }); 
          while (isRunning) {
              if (cpuIntensity > 0) burnCpuChunk(cpuIntensity);
              await new Promise(r => setTimeout(r, 20)); 
          }
      } else {
          self.postMessage({ type: 'DONE', id });
      }

    } catch (err) { 
        self.postMessage({ type: 'ERROR', error: err.message, id });
    }

  } else if (action === 'STOP' || action === 'CLEAR') { 
    isRunning = false;
    memoryStore = []; 
    currentWasmInstance = null; // Скидаємо посилання на Wasm
    try { if(globalThis.gc) globalThis.gc(); } catch { /* gc() optional */ }
    if(action === 'CLEAR') self.postMessage({ type: 'CLEARED', id });
  }
};
