// RAMPAGE! Service Worker Hammer
// Registered at scope '/sw-hammer/'. Intercepts fetches under that scope and
// transforms each request into a heavy compute task that runs in the SW background.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Online/offline is irrelevant — we synthesise responses entirely in the SW.

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.indexOf('/sw-hammer/') === -1) return; // do not touch other traffic

  event.respondWith((async () => {
    const params = new URLSearchParams(url.search);
    const mode = params.get('mode') || 'fib';
    const rawWork = parseInt(params.get('work') || '200000', 10);
    const work = Math.max(1, Number.isFinite(rawWork) ? rawWork : 200000);
    const rawBlobBytes = parseInt(params.get('sz') || '65536', 10);
    const blobBytes = Math.max(0, Number.isFinite(rawBlobBytes) ? rawBlobBytes : 65536);

    let cpuMs = 0;
    const t0 = performance.now();

    // Heavy work branches — runs in the SW thread.
    let out = 0;
    if (mode === 'fib') {
      // Naive longish integer chain (deopt-safe)
      let a = 1, b = 1;
      for (let i = 0; i < work; i++) {
        const c = (a + b) | 0;
        a = b; b = c;
        out ^= c;
      }
    } else if (mode === 'sha') {
      // Sub-crypto SHA-256 via SubtleCrypto in a tight loop (very expensive)
      const enc = new TextEncoder();
      let msg = 'rampage_' + Math.random();
      for (let i = 0; i < work; i++) {
        const buf = await crypto.subtle.digest('SHA-256', enc.encode(msg));
        const arr = new Uint8Array(buf);
        out ^= arr[0];
        msg = arr.join('');
      }
    } else if (mode === 'blob') {
      // Allocate and XOR a large buffer repeatedly
      const buf = new Uint8Array(Math.max(1, blobBytes));
      for (let i = 0; i < work; i++) {
        buf.fill((Math.random() * 256) | 0);
        out ^= buf[buf.length - 1];
      }
    } else if (mode === 'json') {
      // Serialize + parse a bounded JSON payload to stress SW CPU & GC safely without OOM
      const payloadSize = Math.min(Math.max(64, blobBytes), 8192);
      const iterations = Math.min(Math.max(1, Math.floor(work / 1000)), 500);
      const payload = {
        mode: 'json',
        ts: Date.now(),
        pad: 'x'.repeat(payloadSize),
        items: Array.from({ length: 32 }, (_, idx) => ({
          id: idx,
          v: (idx * 31337) | 0,
          ok: (idx & 1) === 0,
        })),
      };
      for (let i = 0; i < iterations; i++) {
        payload.iter = i;
        const parsed = JSON.parse(JSON.stringify(payload));
        out ^= parsed.items[i % parsed.items.length].v ^ parsed.pad.length;
      }
    }

    cpuMs = performance.now() - t0;

    // Build a synthetic response. The body's size is configurable so the network
    // stack also churns transferring bytes back to the main thread.
    const body = new Uint8Array(blobBytes);
    for (let i = 0; i < body.length; i += 4096) body.fill((Math.random() * 256) | 0, i, Math.min(i + 4096, body.length));

    const headers = {
      'Content-Type': 'application/octet-stream',
      'X-Rampage-Cpu-Ms': cpuMs.toFixed(2),
      'X-Rampage-Out': String(out),
      'X-Rampage-Mode': mode,
      'Cache-Control': 'no-store',
    };
    return new Response(body, { status: 200, headers });
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'rampage-ping') {
    event.source.postMessage({ type: 'rampage-pong', t: Date.now() });
  }
});