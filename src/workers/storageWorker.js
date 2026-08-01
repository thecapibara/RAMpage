let isRunning = false;
let accessHandle = null;
let root = null;
let fileHandle = null;

self.onmessage = async (e) => {
  if (e.data === 'START') {
    if (isRunning) return;
    isRunning = true;

    try {
      // 1. Отримуємо доступ до кореневої папки
      root = await navigator.storage.getDirectory();
      
      // 2. Створюємо (або відкриваємо) один ВЕЛЕТЕНСЬКИЙ файл
      fileHandle = await root.getFileHandle('rampage_heavy.bin', { create: true });
      
      // 3. Отримуємо синхронний хендл (тільки для Web Workers!)
      accessHandle = await fileHandle.createSyncAccessHandle();

      // 4. Підготовка буфера (10 MB)
      const CHUNK_SIZE = 10 * 1024 * 1024;
      const buffer = new Uint8Array(CHUNK_SIZE).fill(Math.random() * 255);

      // 5. Цикл запису
      while (isRunning) {
        try {
          // Пишемо синхронно (найшвидший спосіб у браузері)
          accessHandle.write(buffer); 
          accessHandle.flush(); // Примусово зберігаємо на диск
          
          self.postMessage({ type: 'WRITTEN', mb: 10 });
        } catch (err) {
          // Якщо диск повний (Quota Exceeded)
          self.postMessage({ type: 'ERROR', msg: err.message });
          isRunning = false; 
          if (accessHandle) {
            accessHandle.close();
            accessHandle = null;
          }
        }
      }
    } catch (err) {
      self.postMessage({ type: 'ERROR', msg: err.message });
      isRunning = false;
      if (accessHandle) {
        accessHandle.close();
        accessHandle = null;
      }
    }

  } else if (e.data === 'STOP') {
    isRunning = false;
    if (accessHandle) {
      accessHandle.close(); // Обов'язково закриваємо хендл
      accessHandle = null;
    }
    self.postMessage({ type: 'STOPPED' });

  } else if (e.data === 'CLEAR') {
    isRunning = false;
    if (accessHandle) {
      accessHandle.close();
      accessHandle = null;
    }
    try {
      if (!root) root = await navigator.storage.getDirectory();
      // Видаляємо файл
      await root.removeEntry('rampage_heavy.bin');
      self.postMessage({ type: 'CLEARED' });
    } catch (err) {
      // Ігноруємо помилку, якщо файлу немає
      self.postMessage({ type: 'CLEARED' });
    }
  }
};
