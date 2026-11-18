# RAMpage! v6.0

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/React-19-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.0-sky) ![WebGPU](https://img.shields.io/badge/WebGPU-WGSL-emerald)

**RAMpage!** is a comprehensive browser-based system stress suite. It exercises the
limits of every major browser subsystem — main thread, Web Workers, SharedArrayBuffer
atomics, WebGL & WebGPU compute, VRAM, OPFS storage, network, WebRTC, audio DSP,
service worker, and an offscreen 2D rasterizer — through a single dark glass UI.

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

## ✨ Stress Vectors (12)

| Vector | Subsystem hit | What it does |
|---|---|---|
| 🧠 **RAM & CPU** | Web Workers + SAB Atomics + WASM | Multi-threaded RAM allocation up to ~16 GB (`LINEAR` / `CHAOS` / physical page-touched `WASM`), CPU burner (`STANDARD` / `HASH` / `ATOMICS` cross-worker `SharedArrayBuffer` cache-line contention), Minions (cross-window RAM bypass), plus quick presets (**Smoke**, **Thermal**, **OOM Push**) |
| 💾 **Storage** | OPFS sync writes | Fills local disk with incompressible `xorshift32`-filled 10 MB chunks via `SyncAccessHandle` until browser quota |
| 🎮 **GPU** | WebGL compute | Three shader modes (Fractal / 3D raymarch / Fire), resolution up to 8K, overdrive passes |
| 🎮 **VRAM Eater** | GPU texture memory | Allocates 64 MB uncompressed RGBA8 textures until VRAM exhaustion |
| ⚡ **WebGPU** | WGSL compute + `GPUBuffer` VRAM | Real WGSL `@workgroup_size(64)` FMA + trig compute shader reporting live GFLOPS & dispatches/s, plus 64 MB striped `GPUBuffer` VRAM allocator |
| 🌐 **Network** | fetch storm | Background worker that burns bandwidth with parallel download streams |
| 🔗 **WebRTC mesh** | DTLS/SRTP + ICE | N peer-pairs connected via local loopback, DataChannel junk + optional media tracks for heavy video encode/decode |
| 🗄️ **IndexedDB** | structured clone + quota | Parallel object stores receiving `Blob` puts — every `put()` re-clones the payload until `QuotaExceededError` |
| ⚡ **SW hammer** | service worker thread | Registered SW intercepts `/sw-hammer/*` fetches and runs heavy work (Fibonacci / SHA-256 / buffer XOR / JSON churn) in its own thread |
| 🔊 **AudioContext abuse** | audio/DSP render thread | Parallel `OfflineAudioContext` jobs in 4 modes — Convolution (FFT), Oscillator banks, WaveShaper tables, all-in-one |
| 🎨 **Pixel 2D** | `OffscreenCanvas` 2D worker | Non-blocking worker-driven up-to-8K `OffscreenCanvas` with `getImageData` / per-pixel mutation / `putImageData` × N passes per frame (XOR / Noise / Blend) |
| 🏆 **Benchmarks** | composite scoring | CPU survival suite scored from allocated RAM and real measured worker ops + GPU test suites (Light / Normal / Burner) with persistent high scores |

## 📊 Telemetry, Presets & Safety

* **Real System Telemetry:** Cross-origin isolation (`COOP: same-origin`, `COEP: credentialless`) unlocks `SharedArrayBuffer` (`COI` badge) and `performance.measureUserAgentSpecificMemory()` (with `performance.memory` JS heap fallback), alongside live event-loop lag EMA and `navigator.storage.estimate()` usage/quota tracking in the sidebar.
* **Stress Presets:** One-click presets in **RAM & CPU** — **Smoke** (`512 MB · 25% · Standard`), **Thermal** (`4096 MB · 80% · Hash`), and **OOM Push** (`12288 MB · 100% · Standard`).
* **Safety Auto-Stop Timer:** Configurable sidebar countdown (`Off` / `30s` / `60s` / `5m`) that automatically triggers a clean shutdown when active stress runs expire.

## 🛡️ Emergency Reset

The **Emergency reset** button in the sidebar footer instantly terminates every
worker (including `Atomics` and `OffscreenCanvas` workers), clears IndexedDB and OPFS
storage, closes all Service Worker registrations, releases all WebRTC connections,
cancels audio contexts, and drops all WebGL & WebGPU compute/VRAM work.

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

*(Vite dev and preview servers automatically send COOP/COEP `credentialless` headers for `SharedArrayBuffer` and UA memory telemetry.)*

### 4. Build for Production

```
npm run build
npm run preview
```

## 🖥 Usage Guide

Pick a vector from the sidebar, adjust its controls (or select a **Smoke** / **Thermal** / **OOM Push** preset), optionally arm the **Auto-stop** safety timer, and hit the primary action button. Several vectors can run simultaneously. The status pill, `COI` indicator, heap readout, and event-loop lag meter in the sidebar footer track global system health in real time. The **event log** at the bottom of every view records every action with live copy-to-clipboard.

## 🧩 Tech Stack

* **React 19** + **Vite 5**
* **Tailwind CSS 3** with custom dark palette + glass utilities
* **Syncopate** display font for the logo, **Inter** for body, **JetBrains Mono** for metrics
* WebGPU (WGSL), WebGL, Web Workers, `SharedArrayBuffer` + `Atomics`, `OffscreenCanvas`, WebAssembly Memory, `OfflineAudioContext`, WebRTC, IndexedDB, OPFS (`FileSystemSyncAccessHandle`), Service Worker APIs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
