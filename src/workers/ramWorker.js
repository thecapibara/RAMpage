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

const burnCpuChunk = (intensity, workerId) => {
  if (intensity <= 0) return 0;
  const msToBurn = (intensity / 100) * 80;
  const start = performance.now();
  let ops = 0;

  if (stressMode === 'HASH') {
    let sink = 0;
    while (performance.now() - start < msToBurn) {
      sink ^= heavyHash("block_" + Math.random() + "_" + ops++);
    }
    self.postMessage({
      type: 'HASH',
      hash: "0000" + (sink >>> 0).toString(16).padStart(8, '0') + Math.random().toString(16).slice(2),
      count: ops,
      ops,
      id: workerId,
    });
  } else {
    let acc = 0;
    while (performance.now() - start < msToBurn) {
      for (let k = 0; k < 64; k++) {
        acc += Math.sqrt(Math.random() * Math.random());
      }
      ops += 64;
    }
    if (acc < 0) self.postMessage({ type: 'NOOP' });
  }
  return ops;
};

const touchWasmPages = (mem, prevBytes = 0) => {
  const view = new Uint8Array(mem.buffer);
  for (let i = prevBytes; i < view.length; i += 4096) {
    view[i] = 1;
  }
};

self.onmessage = async (e) => {
  const { action, targetMB, id, cpuLoad, mode, ramMode } = e.data;

  if (action === 'STOP') {
    isRunning = false;
    return;
  }

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
           else if (chaosType < 0.66) { memoryStore.push("\u0100".repeat((CHUNK_SIZE * BYTES_PER_MB) / 2)); } 
           else { memoryStore.push(new Uint8Array(CHUNK_SIZE * BYTES_PER_MB).fill(1)); }
        
        } else if (allocMode === 'WASM') {
            // --- WASM LEAK LOGIC ---
            try {
                if (!currentWasmInstance) {
                    // Створюємо нову пам'ять (початково 10МБ)
                    currentWasmInstance = new WebAssembly.Memory({ initial: PAGES_PER_CHUNK });
                    memoryStore.push(currentWasmInstance);
                    touchWasmPages(currentWasmInstance, 0);
                } else {
                    // Розширюємо існуючу (+10МБ)
                    const prevBytes = currentWasmInstance.buffer.byteLength;
                    currentWasmInstance.grow(PAGES_PER_CHUNK);
                    touchWasmPages(currentWasmInstance, prevBytes);
                }
            } catch {
                // Якщо одна Wasm пам'ять заповнена (ліміт зазвичай 2GB-4GB), створюємо нову
                // Це дозволяє обійти ліміт однієї Wasm інстанції
                try {
                    currentWasmInstance = new WebAssembly.Memory({ initial: PAGES_PER_CHUNK });
                    memoryStore.push(currentWasmInstance);
                    touchWasmPages(currentWasmInstance, 0);
                } catch {
                    throw new Error("Wasm Memory Limit Reached (Global)");
                }
            }

        } else {
            // LINEAR
            memoryStore.push(new Uint8Array(CHUNK_SIZE * BYTES_PER_MB).fill(1));
        }

        const ops = cpuIntensity > 0 ? burnCpuChunk(cpuIntensity, id) : 0;
        
        self.postMessage({ type: 'PROGRESS', addedMB: CHUNK_SIZE, ops, id });
        await new Promise(r => setTimeout(r, 20)); 
      }

      if (stressMode === 'HASH' && isRunning) {
          self.postMessage({ type: 'HASH_LOOP_ENTER', id }); 
          while (isRunning) {
              if (cpuIntensity > 0) burnCpuChunk(cpuIntensity, id);
              await new Promise(r => setTimeout(r, 20)); 
          }
      } else {
          self.postMessage({ type: 'DONE', id });
      }

    } catch (err) { 
        self.postMessage({ type: 'ERROR', error: err.message, id });
    }
  }
};
