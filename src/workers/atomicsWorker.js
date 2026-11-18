let running = false;
let yieldTimer = null;

self.onmessage = (e) => {
  const data = e.data || {};

  if (data.type === 'STOP') {
    running = false;
    if (yieldTimer !== null) {
      clearTimeout(yieldTimer);
      yieldTimer = null;
    }
    return;
  }

  if (data.type === 'START') {
    const { sab } = data;
    if (typeof SharedArrayBuffer === 'undefined' || !(sab instanceof SharedArrayBuffer) || sab.byteLength < 256) {
      self.postMessage({ type: 'ERROR', error: 'SharedArrayBuffer (>= 256 bytes) is required' });
      return;
    }

    if (yieldTimer !== null) {
      clearTimeout(yieldTimer);
      yieldTimer = null;
    }

    const arr = new Int32Array(sab);
    running = true;
    let opsSinceReport = 0;
    let lastReport = performance.now();
    let expected = Atomics.load(arr, 1);

    const step = () => {
      if (!running) return;
      const sliceStart = performance.now();

      while (running && performance.now() - sliceStart < 40) {
        for (let i = 0; i < 256; i++) {
          Atomics.add(arr, 0, 1);
          expected = Atomics.compareExchange(arr, 1, expected, (expected + 1) | 0);
        }
        opsSinceReport += 512;
      }

      const now = performance.now();
      if (now - lastReport >= 300) {
        self.postMessage({ type: 'STATS', opsDelta: opsSinceReport });
        opsSinceReport = 0;
        lastReport = now;
      }

      if (running) {
        yieldTimer = setTimeout(step, 0);
      }
    };

    step();
  }
};
