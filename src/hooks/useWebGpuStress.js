import { useCallback, useEffect, useRef, useState } from 'react';

const WGSL_COMPUTE_SHADER = /* wgsl */ `
struct Params {
  iters: u32,
  seed: f32,
  _pad0: f32,
  _pad1: f32,
};

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read_write> data: array<f32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = gid.x;
  let len = arrayLength(&data);
  if (idx >= len) {
    return;
  }
  var x: f32 = data[idx] + params.seed + f32(idx) * 0.0001;
  var y: f32 = 1.0001 + f32(idx & 255u) * 0.001;
  for (var i: u32 = 0u; i < params.iters; i = i + 1u) {
    x = fma(x, 0.9997, sin(y) * 0.0013 + cos(x) * 0.0007);
    y = fma(y, 0.9993, fma(x, x, 0.00031));
    x = fma(x, 1.0001, y * 0.00017);
  }
  data[idx] = x + y;
}
`;

const WORKGROUP_SIZE = 64;
const FLOPS_PER_ITER = 28;
const CHUNK_MB = 64;
const CHUNK_BYTES = CHUNK_MB * 1024 * 1024;
const STRIPE_BYTES = 4 * 1024 * 1024;
const VRAM_INTERVAL_MS = 150;

const INITIAL_STATS = {
  dispatches: 0,
  dispatchesPerSec: 0,
  gflops: 0,
  vramAllocatedMB: 0,
  elapsedSec: 0,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveAdapterName(adapter) {
  let info = adapter?.info;
  if (!info && typeof adapter?.requestAdapterInfo === 'function') {
    try {
      info = await adapter.requestAdapterInfo();
    } catch {
      info = null;
    }
  }
  if (!info) return 'WebGPU Adapter';
  if (info.description) return info.description;
  const parts = [info.vendor, info.architecture, info.device].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : 'WebGPU Adapter';
}

export default function useWebGpuStress({ onLog, onError } = {}) {
  const supported = typeof navigator !== 'undefined' && Boolean(navigator.gpu);

  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState('COMPUTE');
  const [workgroups, setWorkgroups] = useState(512);
  const [iters, setIters] = useState(512);
  const [targetVramMB, setTargetVramMB] = useState(1024);
  const [adapterName, setAdapterName] = useState(null);
  const [stats, setStats] = useState(INITIAL_STATS);

  const runIdRef = useRef(0);
  const stoppingRef = useRef(false);
  const deviceRef = useRef(null);
  const buffersRef = useRef([]);
  const onLogRef = useRef(onLog);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onLogRef.current = onLog;
    onErrorRef.current = onError;
  }, [onLog, onError]);

  const destroyGpuResources = useCallback(() => {
    const bufs = buffersRef.current;
    buffersRef.current = [];
    for (const buf of bufs) {
      try {
        buf.destroy();
      } catch {
        /* already destroyed */
      }
    }
    const dev = deviceRef.current;
    deviceRef.current = null;
    if (dev) {
      try {
        dev.destroy();
      } catch {
        /* already destroyed */
      }
    }
  }, []);

  const stop = useCallback(() => {
    const wasRunning = runIdRef.current > 0 && (deviceRef.current !== null || buffersRef.current.length > 0);
    runIdRef.current += 1;
    stoppingRef.current = true;
    destroyGpuResources();
    setRunning((prev) => {
      if (prev || wasRunning) {
        onLogRef.current?.('WebGPU stress stopped and device resources released.');
      }
      return false;
    });
    setStats((prev) => ({
      ...prev,
      dispatchesPerSec: 0,
      gflops: 0,
      vramAllocatedMB: 0,
    }));
  }, [destroyGpuResources]);

  useEffect(() => {
    return () => {
      runIdRef.current += 1;
      stoppingRef.current = true;
      destroyGpuResources();
    };
  }, [destroyGpuResources]);

  const start = useCallback(async () => {
    if (!supported) {
      const msg = 'WebGPU is not supported in this browser or context.';
      onErrorRef.current?.(msg);
      onLogRef.current?.(msg, 'error');
      return;
    }

    // Ensure any previous run is torn down cleanly
    runIdRef.current += 1;
    const myRunId = runIdRef.current;
    stoppingRef.current = true;
    destroyGpuResources();
    stoppingRef.current = false;

    setStats(INITIAL_STATS);
    setRunning(true);

    let device = null;
    try {
      const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
      if (runIdRef.current !== myRunId) return;
      if (!adapter) {
        throw new Error('No compatible WebGPU adapter available');
      }

      const name = await resolveAdapterName(adapter);
      if (runIdRef.current !== myRunId) return;
      setAdapterName(name);

      device = await adapter.requestDevice();
      if (runIdRef.current !== myRunId) {
        try { device.destroy(); } catch { /* ignore */ }
        return;
      }
      deviceRef.current = device;

      device.lost.then((lostInfo) => {
        if (stoppingRef.current || runIdRef.current !== myRunId) return;
        const msg = `WebGPU device lost: ${lostInfo?.message || lostInfo?.reason || 'unknown'}`;
        onLogRef.current?.(msg, 'error');
        onErrorRef.current?.(msg);
        runIdRef.current += 1;
        destroyGpuResources();
        setRunning(false);
        setStats((prev) => ({ ...prev, dispatchesPerSec: 0, gflops: 0, vramAllocatedMB: 0 }));
      });

      const startTime = performance.now();

      if (mode === 'COMPUTE') {
        const wg = Math.max(64, Math.min(4096, workgroups));
        const iterCount = Math.max(64, Math.min(2048, iters));
        const elementCount = wg * WORKGROUP_SIZE;
        const storageBytes = elementCount * 4;

        const shaderModule = device.createShaderModule({ code: WGSL_COMPUTE_SHADER });
        const pipeline = device.createComputePipeline({
          layout: 'auto',
          compute: { module: shaderModule, entryPoint: 'main' },
        });

        const uniformBuffer = device.createBuffer({
          size: 16,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const storageBuffer = device.createBuffer({
          size: storageBytes,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
        buffersRef.current.push(uniformBuffer, storageBuffer);

        const bindGroup = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: uniformBuffer } },
            { binding: 1, resource: { buffer: storageBuffer } },
          ],
        });

        const uniformData = new ArrayBuffer(16);
        const uniformU32 = new Uint32Array(uniformData);
        const uniformF32 = new Float32Array(uniformData);
        uniformU32[0] = iterCount;

        onLogRef.current?.(
          `WebGPU compute started on ${name} (${wg} workgroups × ${iterCount} iters)`,
          'success'
        );

        let totalDispatches = 0;
        let windowDispatches = 0;
        let windowStart = performance.now();

        while (runIdRef.current === myRunId) {
          uniformF32[1] = (totalDispatches % 1024) * 0.001;
          device.queue.writeBuffer(uniformBuffer, 0, uniformData);

          const encoder = device.createCommandEncoder();
          const pass = encoder.beginComputePass();
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, bindGroup);
          pass.dispatchWorkgroups(wg);
          pass.end();
          device.queue.submit([encoder.finish()]);

          await device.queue.onSubmittedWorkDone();
          if (runIdRef.current !== myRunId) break;

          totalDispatches += 1;
          windowDispatches += 1;

          const now = performance.now();
          const windowDt = (now - windowStart) / 1000;
          if (windowDt >= 0.25) {
            const dps = windowDispatches / windowDt;
            const totalOpsPerDispatch = wg * WORKGROUP_SIZE * iterCount * FLOPS_PER_ITER;
            const gflops = (dps * totalOpsPerDispatch) / 1e9;
            setStats({
              dispatches: totalDispatches,
              dispatchesPerSec: dps,
              gflops,
              vramAllocatedMB: 0,
              elapsedSec: (now - startTime) / 1000,
            });
            windowDispatches = 0;
            windowStart = now;
          }
        }
      } else {
        // VRAM mode
        const stripe = new Uint8Array(STRIPE_BYTES);
        stripe.fill(0xa5);

        let allocatedMB = 0;
        onLogRef.current?.(
          `WebGPU VRAM allocator started on ${name} (target ${targetVramMB} MB in ${CHUNK_MB} MB chunks)`,
          'warning'
        );

        while (runIdRef.current === myRunId && allocatedMB < targetVramMB) {
          device.pushErrorScope('out-of-memory');
          let buf = null;
          try {
            buf = device.createBuffer({
              size: CHUNK_BYTES,
              usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            });
            for (let offset = 0; offset < CHUNK_BYTES; offset += STRIPE_BYTES) {
              if (runIdRef.current !== myRunId) break;
              device.queue.writeBuffer(buf, offset, stripe);
            }
            await device.queue.onSubmittedWorkDone();
          } catch (allocErr) {
            if (buf) {
              try { buf.destroy(); } catch { /* ignore */ }
            }
            await device.popErrorScope().catch(() => null);
            throw allocErr;
          }

          const oomError = await device.popErrorScope();
          if (runIdRef.current !== myRunId) {
            try { buf.destroy(); } catch { /* ignore */ }
            break;
          }
          if (oomError) {
            try { buf.destroy(); } catch { /* ignore */ }
            const msg = `WebGPU VRAM OOM at ${allocatedMB} MB: ${oomError.message}`;
            onLogRef.current?.(msg, 'warning');
            onErrorRef.current?.(msg);
            break;
          }

          buffersRef.current.push(buf);
          allocatedMB += CHUNK_MB;
          setStats({
            dispatches: 0,
            dispatchesPerSec: 0,
            gflops: 0,
            vramAllocatedMB: allocatedMB,
            elapsedSec: (performance.now() - startTime) / 1000,
          });

          if (allocatedMB < targetVramMB) {
            await sleep(VRAM_INTERVAL_MS);
          }
        }

        if (runIdRef.current === myRunId && allocatedMB >= targetVramMB) {
          onLogRef.current?.(
            `WebGPU VRAM target reached (${allocatedMB} MB committed) — holding buffers`,
            'success'
          );
        }

        // Hold allocated VRAM buffers and update elapsed time until stopped
        while (runIdRef.current === myRunId) {
          await sleep(500);
          if (runIdRef.current !== myRunId) break;
          setStats((prev) => ({
            ...prev,
            elapsedSec: (performance.now() - startTime) / 1000,
          }));
        }
      }
    } catch (err) {
      if (runIdRef.current === myRunId && !stoppingRef.current) {
        const msg = `WebGPU error: ${err?.message || String(err)}`;
        onLogRef.current?.(msg, 'error');
        onErrorRef.current?.(msg);
        runIdRef.current += 1;
        destroyGpuResources();
        setRunning(false);
      }
    }
  }, [supported, mode, workgroups, iters, targetVramMB, destroyGpuResources]);

  return {
    supported,
    running,
    mode,
    setMode,
    workgroups,
    setWorkgroups,
    iters,
    setIters,
    targetVramMB,
    setTargetVramMB,
    stats,
    adapterName,
    start,
    stop,
  };
}
