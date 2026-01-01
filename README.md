# RAM Eater Ultimate v3.1

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/React-18-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.0-sky)

**RAM Eater Ultimate** is a sophisticated browser-based stress testing tool designed to visualize memory allocation behavior, garbage collection, and CPU load handling within a modern web browser environment. 

It utilizes **Web Workers** to allocate memory off the main thread, ensuring the UI remains responsive while pushing the browser's limits.

## ⚠️ Ethical Use & Disclaimer

**READ THIS BEFORE USING:**

This software is developed strictly for **educational purposes** and for **stress testing your own hardware/software environments**.

* **DO NOT** use this tool to crash public terminals, kiosks, or computers that do not belong to you.
* **DO NOT** use this tool for malicious "Denial of Service" attacks or to freeze user browsers on purpose.
* **Liability:** The developer is not responsible for any data loss, hardware instability, or system crashes resulting from the misuse of this tool. By using this software, you agree that you are testing your own system limits.

## ✨ Key Features

* **High-Volume Allocation:** Capable of targeting up to ~16GB of RAM (browser dependent).
* **CPU Stress Test:** Integrated CPU burner with adjustable intensity (0-100%) using heavy math operations.
* **Multi-Threaded Architecture:** Uses Web Workers to prevent main thread freezing during heavy loads.
* **Allocation Patterns:**
    * **Linear:** Steady, continuous allocation.
    * **Sawtooth:** Ramps up and dumps memory cyclically to test Garbage Collection.
    * **Chaos:** Random allocation and dumping behavior.
* **Data Types:** Switch between `BUFFER` (Uint8Array) and `STRING` allocation methods.
* **Live Visualization:** Real-time area charts tracking Total vs. Used memory.
* **Emergency Stop:** Press **ESC** 3 times quickly to immediately terminate all workers and clear memory.

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

1.  **Target Memory:** Use the slider to set the desired RAM limit (default: 4GB).
2.  **Pattern:** Select how memory is allocated (Linear/Sawtooth/Chaos).
3.  **CPU Load:** Increase this slider to add processing strain alongside memory usage.
4.  **Start:** Click the **START** button.
5.  **Monitor:** Watch the "Live Memory" chart and the system logs.
6.  **Stop/Reset:** Click **STOP** to pause, or **RESET** to clear all memory and kill workers.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.