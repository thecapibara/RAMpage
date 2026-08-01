let isRunning = false;
let totalBytes = 0;
let statsTimer = null;

const runDownloader = async () => {
  const targetUrl = 'https://speed.cloudflare.com/__down?bytes=52428800'; // 50MB Chunks
  
  while (isRunning) {
    try {
      const response = await fetch(`${targetUrl}&r=${Math.random()}`, {
           cache: 'no-store',
           mode: 'cors'
      });
      const reader = response.body.getReader();
      while (isRunning) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) totalBytes += value.length;
      }
    } catch {
      await new Promise(r => setTimeout(r, 100));
    }
  }
};

const runFlooder = async () => {
   while (isRunning) {
       try {
           await fetch(`https://www.google.com/generate_204?r=${Math.random()}`, { 
               mode: 'no-cors', 
               cache: 'no-store' 
           });
           totalBytes += 500; 
       } catch { await new Promise(r => setTimeout(r, 50)); }
   }
};

self.onmessage = (e) => {
  if (e.data === 'START') {
    isRunning = true;
    totalBytes = 0;
    
    for(let i=0; i<6; i++) runDownloader(i);
    // Запускаємо 4 флудери (для кількості з'єднань)
    for(let i=0; i<4; i++) runFlooder();

    statsTimer = setInterval(() => {
        if (isRunning) self.postMessage({ total: totalBytes });
    }, 200);

  } else if (e.data === 'STOP') {
    isRunning = false;
    if (statsTimer) { clearInterval(statsTimer); statsTimer = null; }
  }
};
