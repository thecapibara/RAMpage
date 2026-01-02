# RAM Eater Ultimate v4.0 - RAMPAGE Edition

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/React-18-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.0-sky) [![App](https://img.shields.io/badge/demo-online-green?logo=vercel&logoColor=white)](https://ram-eater-ultimate.vercel.app/)

**RAM Eater Ultimate** has evolved from a simple memory tool into a **comprehensive browser-based system stress suite**. 

It is designed to visualize and test browser limits across multiple vectors: **RAM allocation, CPU concurrency, GPU rendering, Storage quotas, and Network bandwidth**. It utilizes Web Workers, WebGL shaders, and IndexedDB to ensure maximum load generation while keeping the main interface responsive.

## ⚠️ Ethical Use & Disclaimer

**READ THIS BEFORE USING:**

This software is developed strictly for **educational purposes** and for **stress testing your own hardware/software environments**.

* **DO NOT** use this tool to crash public terminals, kiosks, or computers that do not belong to you.
* **DO NOT** use this tool for malicious "Denial of Service" attacks or to freeze user browsers on purpose.
* **Liability:** The developer is not responsible for any data loss, hardware instability, or system crashes resulting from the misuse of this tool. By using this software, you agree that you are testing your own system limits.

## ✨ Key Features (v4.0 Update)

* **🧠 High-Volume RAM Allocation:** Push memory usage to the limit (up to ~16GB) using multi-threaded Web Workers to test Garbage Collection and OOM behavior.
* **🔥 CPU Stress Test:** Integrated CPU burner with adjustable intensity (0-100%) that runs complex math operations on separate threads.
* **🎮 GPU Stress & Burner:** Advanced WebGL renderer featuring:
    * **3 Modes:** Fractal, 3D Raymarching, and Particle Fire.
    * **Resolution Scaling:** Render up to 8K resolution.
    * **Overdrive:** Render multiple passes per frame to maximize GPU load.
* **💾 Storage Killer:** Rapidly fills local disk space by writing 10MB binary blobs to IndexedDB until the browser throws a Quota Exceeded error.
* **⚡ Network Storm:** Simulates heavy network traffic by running parallel download streams and request floods to saturate bandwidth.
* **🏆 Competitive Benchmarking:**
    * **CPU Survival:** Test how long your browser can survive increasing RAM/CPU loads.
    * **GPU Benchmark:** Run automated graphical tests and get a performance score.
* **🛡️ Emergency Stop:** Press **ESC** 3 times quickly or use the "Emergency Reset" button to immediately terminate all workers, clear memory, and stop renders.

## 🚀 Installation & Setup

This project uses **Vite** and **Tailwind CSS**.

### Prerequisites
* Node.js (v18 or higher recommended)

### 1. Clone the repository

```git clone https://github.com/thecapibara/rameater.git
cd rameater
```

### 2. Install Dependencies

```npm install
# Install Lucide icons
npm install lucide-react
# Install Tailwind CSS (Explicitly v3 for compatibility)
npm install -D tailwindcss@3 postcss autoprefixer
```

### 3. Initialize Tailwind

```
npx tailwindcss init -p
```

### 4. Run the Development Server

```
npm run dev
```
## 🛠 Configuration

Ensure your `tailwind.config.js` is set up to scan your source files:

```
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 🖥 Usage Guide

1.  **RAM/CPU Tab:** Set target MB and CPU load, then click **Start Load**.
2.  **Storage Tab:** Click **Fill** to start writing blobs to disk. Watch the "MB Written" counter.
3.  **GPU Tab:** Select a mode (Fractal/3D/Fire), adjust resolution/intensity, and click **Manual Start**.
4.  **Network:** Click **Burn Traffic** to start the bandwidth stress test.
5.  **Benchmarks:** Use the "Benchmarks" panel to run automated scoring tests.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
