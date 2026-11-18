const hasRAF = typeof self.requestAnimationFrame === 'function';

let offscreen = null;
let ctx = null;
let isRunning = false;
let width = 1920;
let height = 1080;
let passes = 1;
let mode = 'xor';

let loopHandle = null;
let usedTimeoutLoop = false;
let prngState = (Date.now() ^ 0x9e3779b9) >>> 0 || 0x12345678;

let totalFrames = 0;
let intervalFrames = 0;
let intervalPixels = 0;
let lastStatsTime = 0;

const scheduleNextFrame = (fn) => {
  if (hasRAF) {
    usedTimeoutLoop = false;
    loopHandle = self.requestAnimationFrame(fn);
  } else {
    usedTimeoutLoop = true;
    loopHandle = setTimeout(fn, 0);
  }
};

const cancelScheduledFrame = () => {
  if (loopHandle === null) return;
  if (usedTimeoutLoop) {
    clearTimeout(loopHandle);
  } else {
    self.cancelAnimationFrame(loopHandle);
  }
  loopHandle = null;
};

const seedPattern = () => {
  if (!ctx) return;
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#11111f');
  grad.addColorStop(0.5, '#34d399');
  grad.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
};

const mutatePixels = (u32, passIndex) => {
  const len = u32.length;

  if (mode === 'noise') {
    let x = prngState;
    for (let i = 0; i < len; i++) {
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      u32[i] = x | 0xff000000;
    }
    prngState = (x >>> 0) || 0x12345678;
    return;
  }

  if (mode === 'blend') {
    let prev = len > 0 ? u32[0] : 0xff102030;
    const bias = ((totalFrames * 3 + passIndex * 11) & 0x0f) | 0x010101;
    for (let i = 0; i < len; i++) {
      const cur = u32[i];
      u32[i] = (((cur & 0xfefefe) >>> 1) + ((prev & 0xfefefe) >>> 1) + bias) | 0xff000000;
      prev = cur;
    }
    return;
  }

  // Default: 'xor'
  const mask = (
    ((totalFrames * 17 + passIndex * 31) & 0xff) |
    (((totalFrames * 7 + passIndex * 13) & 0xff) << 8) |
    (((totalFrames * 3 + passIndex * 5) & 0xff) << 16)
  ) >>> 0;
  for (let i = 0; i < len; i++) {
    u32[i] = (u32[i] ^ mask) | 0xff000000;
  }
};

const tick = () => {
  if (!isRunning || !ctx) return;

  const w = width;
  const h = height;
  const currentPasses = passes;

  for (let p = 0; p < currentPasses; p++) {
    const imgData = ctx.getImageData(0, 0, w, h);
    const u32 = new Uint32Array(imgData.data.buffer);
    mutatePixels(u32, p);
    ctx.putImageData(imgData, 0, 0);
  }

  totalFrames += 1;
  intervalFrames += 1;
  intervalPixels += w * h * currentPasses;

  const now = performance.now();
  const elapsedMs = now - lastStatsTime;
  if (elapsedMs >= 250) {
    const elapsedSec = elapsedMs / 1000;
    const fps = Math.round(intervalFrames / elapsedSec);
    const pixelsPerSec = Math.round(intervalPixels / elapsedSec);
    const mbPerSec = Number(((pixelsPerSec * 4) / (1024 * 1024)).toFixed(2));

    self.postMessage({
      type: 'STATS',
      fps,
      frames: totalFrames,
      pixelsPerSec,
      mbPerSec,
    });

    intervalFrames = 0;
    intervalPixels = 0;
    lastStatsTime = now;
  }

  if (isRunning) {
    scheduleNextFrame(tick);
  }
};

const normalizeMode = (raw) => {
  const m = String(raw || 'xor').toLowerCase();
  if (m === 'noise' || m === 'blend' || m === 'xor') return m;
  return 'xor';
};

self.onmessage = (e) => {
  const data = e.data || {};
  const { type } = data;

  if (type === 'START') {
    cancelScheduledFrame();

    width = Math.max(1, (data.width | 0) || 1920);
    height = Math.max(1, (data.height | 0) || 1080);
    passes = Math.max(1, (data.passes | 0) || 1);
    mode = normalizeMode(data.mode);

    if (data.canvas) {
      offscreen = data.canvas;
      ctx = null;
    } else if (!offscreen) {
      offscreen = new OffscreenCanvas(width, height);
      ctx = null;
    }

    if (offscreen.width !== width) offscreen.width = width;
    if (offscreen.height !== height) offscreen.height = height;

    if (!ctx) {
      ctx = offscreen.getContext('2d', { willReadFrequently: true }) || offscreen.getContext('2d');
    }
    if (!ctx) {
      isRunning = false;
      self.postMessage({ type: 'ERROR', error: '2D OffscreenCanvas context unavailable' });
      return;
    }

    seedPattern();
    totalFrames = 0;
    intervalFrames = 0;
    intervalPixels = 0;
    lastStatsTime = performance.now();
    isRunning = true;

    scheduleNextFrame(tick);
  } else if (type === 'UPDATE') {
    const nextW = data.width != null ? Math.max(1, (data.width | 0) || width) : width;
    const nextH = data.height != null ? Math.max(1, (data.height | 0) || height) : height;
    if (data.passes != null) passes = Math.max(1, (data.passes | 0) || 1);
    if (data.mode != null) mode = normalizeMode(data.mode);

    if (offscreen && (nextW !== width || nextH !== height)) {
      width = nextW;
      height = nextH;
      offscreen.width = width;
      offscreen.height = height;
      seedPattern();
    }
  } else if (type === 'STOP') {
    isRunning = false;
    cancelScheduledFrame();
  }
};
