# RAMpage! v5.0

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/React-19-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.0-sky)

**RAMpage!** is a comprehensive browser-based system stress suite. It exercises the
limits of every major browser subsystem — main thread, Web Workers, GPU compute,
storage, network, audio thread, service worker, and the 2D rasterizer — through a
single dark glass UI.

## ⚠️ Ethical Use & Disclaimer

**READ THIS BEFORE USING:**

This software is developed strictly for **educational purposes** and for **stress
testing your own hardware/software environments**.

* **DO NOT** use this tool to crash public terminals, kiosks, or computers that do
  not belong to you.
* **DO NOT** use this tool for malicious "Denial of Service" attacks or to freeze
  user browsers on purpose.
* **Liability:** The developer is not responsible for any data loss, hardware
  instability, or system crashes resulting from the misuse of this tool. By using
  this software, you agree that you are testing your own system limits.

## ✨ Stress Vectors (11)

| Vector | Subsystem hit | What it does |
|---|---|---|
| 🧠 **RAM & CPU** | Web Workers + heap | Multi-threaded RAM allocation up to ~16 GB, with CPU burner, hash stress, Minions (cross-window RAM bypass) |
| 💾 **Storage** | OPFS sync writes | Fills local disk with raw 10 MB chunks via SyncAccessHandle until browser quota |
| 🎮 **GPU** | WebGL compute | Three shader modes (Fractal / 3D raymarch / Fire), resolution up to 8K, overdrive passes |
| 🎮 **VRAM Eater** | GPU texture memory | Allocates 64 MB uncompressed RGBA8 textures until VRAM exhaustion |
| 🌐 **Network** | fetch storm | Background worker that burns bandwidth with parallel download streams |
| 🔗 **WebRTC mesh** | DTLS/SRTP + ICE | N peer-pairs connected via local loopback, DataChannel junk + optional media tracks for heavy video encode/decode |
| 🗄️ **IndexedDB** | structured clone + quota | Parallel object stores receiving `Blob` puts — every `put()` re-clones the payload until `QuotaExceededError` |
| ⚡ **SW hammer** | service worker thread | Registered SW intercepts `/sw-hammer/*` fetches and runs heavy work (Fibonacci / SHA-256 / buffer XOR / JSON churn) in its own thread |
| 🔊 **AudioContext abuse** | audio/DSP render thread | Parallel `OfflineAudioContext` jobs in 4 modes — Convolution (FFT), Oscillator banks, WaveShaper tables, all-in-one |
| 🎨 **Pixel 2D** | 2D rasterizer + memory bus | 8K `Canvas2D` with `getImageData` / per-pixel mutation / `putImageData` × N passes per frame (XOR / Noise / Blend) |
| 🏆 **Benchmarks** | composite scoring | CPU survival suite + GPU test suites (Light / Normal / Burner) with persistent high scores |

## 🛡️ Emergency Reset

The **Emergency reset** button in the sidebar footer instantly terminates every
worker, clears IndexedDB and OPFS storage, closes all Service Worker registrations,
releases all WebRTC connections, cancels audio contexts and drops all GPU work.

## 🚀 Installation

This project uses **Vite** and **Tailwind CSS v3**.

### Prerequisites

* Node.js v18 or higher

### 1. Clone the repository

```
git clone https://github.com/thecapibara/rampage.git
cd rampage
```

### 2. Install Dependencies

```
npm install
```

### 3. Run the Development Server

```
npm run dev
```

### 4. Build for Production

```
npm run build
npm run preview
```

## 🖥 Usage Guide

Pick a vector from the sidebar, adjust its controls, and hit the primary action
button. Several vectors can run simultaneously. The status pill in the sidebar
footer shows the global system state (idle / active / error). The **event log**
at the bottom of every view records every action with live copy-to-clipboard.

## 🧩 Tech Stack

* **React 19** + **Vite 5**
* **Tailwind CSS 3** with custom dark palette + glass utilities
* **Space Grotesk** display font for the logo, **Inter** for body, **JetBrains Mono** for metrics
* Vanilla WebWorkers, OfflineAudioContext, WebRTC, IndexedDB, File System Access, Service Worker APIs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.