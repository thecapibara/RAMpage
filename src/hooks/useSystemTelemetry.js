import { useEffect, useState } from 'react';

const MB = 1024 * 1024;
const POLL_MS = 1000;

function readCapabilities() {
  const hasNav = typeof navigator !== 'undefined';
  return {
    cores: hasNav ? (navigator.hardwareConcurrency ?? null) : null,
    deviceMemoryGB: hasNav ? (navigator.deviceMemory ?? null) : null,
    crossOriginIsolated: typeof self !== 'undefined' ? Boolean(self.crossOriginIsolated) : false,
    hasWebGPU: hasNav ? Boolean(navigator.gpu) : false,
    hasSharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
  };
}

function readJsHeap() {
  const mem = typeof performance !== 'undefined' ? performance.memory : null;
  if (!mem) return { jsHeapUsedMB: null, jsHeapLimitMB: null };
  return {
    jsHeapUsedMB: typeof mem.usedJSHeapSize === 'number' ? mem.usedJSHeapSize / MB : null,
    jsHeapLimitMB: typeof mem.jsHeapSizeLimit === 'number' ? mem.jsHeapSizeLimit / MB : null,
  };
}

/**
 * Polls live browser telemetry (event-loop lag, JS/UA heap, storage quota)
 * and exposes static hardware/isolation capabilities.
 */
export default function useSystemTelemetry() {
  const [capabilities] = useState(readCapabilities);
  const [live, setLive] = useState(() => ({
    lagMs: 0,
    ...readJsHeap(),
    storageUsageMB: null,
    storageQuotaMB: null,
    uaMemoryMB: null,
  }));

  useEffect(() => {
    let cancelled = false;
    let tick = 0;
    let lagEma = null;
    let lastTick = performance.now();
    let storageInFlight = false;
    let uaInFlight = false;

    const pollStorage = () => {
      if (storageInFlight || typeof navigator === 'undefined' || !navigator.storage?.estimate) {
        return;
      }
      storageInFlight = true;
      navigator.storage
        .estimate()
        .then((est) => {
          if (cancelled) return;
          setLive((prev) => ({
            ...prev,
            storageUsageMB: typeof est.usage === 'number' ? est.usage / MB : prev.storageUsageMB,
            storageQuotaMB: typeof est.quota === 'number' ? est.quota / MB : prev.storageQuotaMB,
          }));
        })
        .catch(() => {})
        .finally(() => {
          storageInFlight = false;
        });
    };

    const pollUaMemory = () => {
      if (
        uaInFlight ||
        typeof self === 'undefined' ||
        !self.crossOriginIsolated ||
        typeof performance === 'undefined' ||
        typeof performance.measureUserAgentSpecificMemory !== 'function'
      ) {
        return;
      }
      uaInFlight = true;
      performance
        .measureUserAgentSpecificMemory()
        .then((res) => {
          if (cancelled) return;
          if (typeof res?.bytes === 'number') {
            setLive((prev) => ({ ...prev, uaMemoryMB: res.bytes / MB }));
          }
        })
        .catch(() => {})
        .finally(() => {
          uaInFlight = false;
        });
    };

    pollStorage();
    pollUaMemory();

    const id = setInterval(() => {
      const now = performance.now();
      const rawLag = Math.max(0, now - lastTick - POLL_MS);
      lastTick = now;
      lagEma = lagEma === null ? rawLag : lagEma * 0.7 + rawLag * 0.3;

      const heap = readJsHeap();
      setLive((prev) => ({
        ...prev,
        lagMs: Math.round(lagEma * 10) / 10,
        jsHeapUsedMB: heap.jsHeapUsedMB,
        jsHeapLimitMB: heap.jsHeapLimitMB,
      }));

      tick += 1;
      if (tick % 3 === 0) pollStorage();
      if (tick % 5 === 0) pollUaMemory();
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { ...capabilities, ...live };
}
