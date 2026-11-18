const TARGET_FILENAME = 'rampage_heavy.bin';
const CHUNK_MB = 10;
const CHUNK_SIZE = CHUNK_MB * 1024 * 1024;

let isRunning = false;
let accessHandle = null;
let root = null;
let fileHandle = null;
let prngState = (Date.now() ^ 0x9e3779b9) >>> 0 || 0x12345678;

const closeAccessHandle = () => {
  if (accessHandle) {
    try {
      accessHandle.close();
    } catch {
      /* already closed */
    }
    accessHandle = null;
  }
};

const fillIncompressibleChunk = (u32) => {
  // Fast xorshift32 fill over the entire 10 MB buffer so transparent FS
  // compression (APFS/ZFS/Btrfs/NTFS) cannot compress chunks away.
  let x = prngState;
  for (let i = 0; i < u32.length; i++) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    u32[i] = x;
  }
  prngState = (x >>> 0) || 0x12345678;
};

self.onmessage = async (e) => {
  const cmd = typeof e.data === 'string' ? e.data : e.data?.type;

  if (cmd === 'START') {
    if (isRunning) return;
    isRunning = true;

    try {
      root = await navigator.storage.getDirectory();
      fileHandle = await root.getFileHandle(TARGET_FILENAME, { create: true });
      accessHandle = await fileHandle.createSyncAccessHandle();
      // Truncate any leftover file from previous runs so reported totals match disk usage.
      accessHandle.truncate(0);
      accessHandle.flush();

      const buffer = new Uint8Array(CHUNK_SIZE);
      const u32 = new Uint32Array(buffer.buffer);

      let chunks = 0;
      let offset = 0;
      while (isRunning) {
        try {
          fillIncompressibleChunk(u32);
          accessHandle.write(buffer, { at: offset });
          accessHandle.flush();

          offset += CHUNK_SIZE;
          chunks += 1;
          self.postMessage({ type: 'PROGRESS', totalMB: chunks * CHUNK_MB, chunks });

          // Yield periodically so STOP/CLEAN/STATUS messages can be processed.
          if (chunks % 4 === 0) {
            await new Promise((res) => setTimeout(res, 0));
          }
        } catch (err) {
          self.postMessage({ type: 'ERROR', msg: err.message });
          isRunning = false;
          closeAccessHandle();
        }
      }
    } catch (err) {
      self.postMessage({ type: 'ERROR', msg: err.message });
      isRunning = false;
      closeAccessHandle();
    }

  } else if (cmd === 'STATUS') {
    try {
      let bytes = 0;
      if (accessHandle) {
        bytes = accessHandle.getSize();
      } else {
        if (!root) root = await navigator.storage.getDirectory();
        const fh = await root.getFileHandle(TARGET_FILENAME);
        const file = await fh.getFile();
        bytes = file.size;
      }
      const sizeMB = bytes / (1024 * 1024);
      const chunks = Math.floor(bytes / CHUNK_SIZE);
      self.postMessage({ type: 'STATUS', sizeMB, chunks });
    } catch {
      self.postMessage({ type: 'STATUS', sizeMB: 0, chunks: 0 });
    }

  } else if (cmd === 'STOP') {
    isRunning = false;
    closeAccessHandle();
    self.postMessage({ type: 'STOPPED' });

  } else if (cmd === 'CLEAN' || cmd === 'CLEAR') {
    isRunning = false;
    closeAccessHandle();
    try {
      if (!root) root = await navigator.storage.getDirectory();
      await root.removeEntry(TARGET_FILENAME);
    } catch {
      // Ignore if file does not exist
    }
    self.postMessage({ type: cmd === 'CLEAR' ? 'CLEARED' : 'CLEANED' });
  }
};
