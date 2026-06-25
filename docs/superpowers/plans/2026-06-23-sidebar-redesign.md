# Sidebar Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the cramped 4-column RAMPAGE! dashboard with a modern sidebar-nav + focused-panel layout (dark Raycast/Arc feel), restructuring the render into one-tool-at-a-time views — keeping all worker logic, state, and benchmark math untouched.

**Architecture:** Add a `view` state to `Dashboard.jsx` controlling which single tool panel renders. Extract each tool's JSX into its own presentational component under `src/components/views/` that receives state + handlers as props (pure presentation, no logic). The sidebar is a new `Sidebar.jsx`. Shared UI primitives (buttons, sliders, status dot, segmented pills) go in `src/components/ui/` so every view uses the same button language. `Dashboard.jsx` becomes the orchestrator: holds all state/handlers, renders `Sidebar` + the active view + modals.

**Tech Stack:** React 19, Tailwind 3 (arbitrary-value classes, no config change), Vite 5. No new deps.

**Spec:** `docs/superpowers/specs/2026-06-23-sidebar-redesign-design.md`

**Verification note — NO test runner** in this project (`package.json` has no `test` script). Gates are `npm run build` + `npm run lint` (must not add new errors) + manual dev-server click-through. Do not invent a test framework.

---

## File Structure

**Created (new — focused, one responsibility each):**

UI primitives (`src/components/ui/`):
- `src/components/ui/Button.jsx` — primary / destructive / secondary variants (the one button language).
- `src/components/ui/StatusDot.jsx` — the `●` dot, takes `state` prop (`idle`/`active`/`error`).
- `src/components/ui/Segmented.jsx` — the pill group (replaces every per-module mode switcher).
- `src/components/ui/Slider.jsx` — labeled range input (replaces ad-hoc sliders + labels).
- `src/components/ui/Panel.jsx` — the content card wrapper (title row + status dot + children).

Views (`src/components/views/`):
- `src/components/views/RamCpuView.jsx` — RAM & CPU tool (+ Minions sub-mode).
- `src/components/views/StorageView.jsx` — Storage killer.
- `src/components/views/GpuView.jsx` — GPU stress + VRAM burner (two cards).
- `src/components/views/NetworkView.jsx` — Network storm.
- `src/components/views/BenchmarksView.jsx` — CPU + GPU benchmarks.

Chrome:
- `src/components/Sidebar.jsx` — brand block, nav, status footer.

**Modified:**
- `src/components/Dashboard.jsx` — gut the old render tree; import the new pieces; hold state/handlers; render `Sidebar` + active view + modals. Add `view` state.
- `src/components/ConfirmModal.jsx` — token-aligned restyle.
- `src/components/MinionWindow.jsx` — light token pass (no logic change).

**Untouched:** `SimpleChart.jsx`, `GpuCanvas.jsx`, `ErrorBoundary.jsx`, `icons.jsx`, all workers, `constants/index.js`, `App.jsx`, `tailwind.config.js`, `index.html`.

**Design tokens (use these exact literals everywhere):**

| Token   | Hex       | Tailwind arbitrary            |
|---------|-----------|-------------------------------|
| base    | `#0E0E10` | `bg-[#0E0E10]`                |
| sidebar | `#0A0A0C` | `bg-[#0A0A0C]`                |
| panel   | `#161618` | `bg-[#161618]`                |
| panel-2 | `#1A1A1E` | `bg-[#1A1A1E]`                |
| border  | `#232327` | `border-[#232327]`            |
| text    | `#ECECEC` | `text-[#ECECEC]`              |
| muted   | `#8B8B92` | `text-[#8B8B92]`              |
| faint   | `#5A5A62` | `text-[#5A5A62]`              |
| accent  | `#34D399` | `text-[#34D399]` / `bg-[#34D399]` |
| danger  | `#F87171` | `text-[#F87171]` / `bg-[#F87171]` |

**Button variants (defined once in Button.jsx, used everywhere):**
- **primary** (start): `bg-white text-black hover:bg-[#ECECEC] font-semibold`
- **destructive** (stop/kill/clean): `bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/40 hover:bg-[#F87171]/25`
- **secondary** (neutral toggle): `bg-transparent border border-[#232327] text-[#8B8B92] hover:border-[#3A3A42] hover:text-[#ECECEC]`

**Font rule:** UI text = `font-sans` (Tailwind default: system stack). Numbers/metrics/logs = `font-mono`. Do NOT put `font-mono` on the root container.

---

### Task 1: Baseline gate + new directories

**Files:** none (verification + scaffolding)

- [ ] **Step 1: Confirm clean build on main-derived branch**

Run:
```bash
cd /home/vitaly/Desktop/prj/rameater/rameater
npm run build
```
Expected: success.

- [ ] **Step 2: Note baseline lint errors (do not fix — pre-existing)**

Run: `npm run lint 2>&1 | tail -5`
Expected: errors in `icons.jsx`, `networkWorker.js`, `ramWorker.js`, `storageWorker.js` (pre-existing, not ours). Note the count — the gate after each task is "no NEW errors beyond this baseline."

- [ ] **Step 3: Create directories**

Run:
```bash
mkdir -p src/components/ui src/components/views
```

- [ ] **Step 4: Commit scaffolding (empty .gitkeep)**

Run:
```bash
touch src/components/ui/.gitkeep src/components/views/.gitkeep
git add src/components/ui/.gitkeep src/components/views/.gitkeep
git commit -m "[DOC] Scaffold ui/ and views/ directories"
```

---

### Task 2: UI primitives — Button

**Files:**
- Create: `src/components/ui/Button.jsx`

- [ ] **Step 1: Create the Button component**

Create `src/components/ui/Button.jsx`:

```jsx
import React from 'react';
import Icons from '../icons';

const VARIANTS = {
  primary: 'bg-white text-black hover:bg-[#ECECEC] font-semibold',
  destructive: 'bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/40 hover:bg-[#F87171]/25',
  secondary: 'bg-transparent border border-[#232327] text-[#8B8B92] hover:border-[#3A3A42] hover:text-[#ECECEC]',
};

export default function Button({ variant = 'primary', icon, children, className = '', ...props }) {
  const Icon = icon ? Icons[icon] : null;
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${className}`}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}
```

Notes:
- `icon` is a string key into `Icons` (e.g. `"Play"`, `"Square"`) so callers don't import Icons themselves.
- Spread `props` last so `onClick`, `disabled`, `type` pass through.

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: success (file isn't imported yet but must compile).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Button.jsx
git commit -m "[NEW] Add Button primitive (primary/destructive/secondary)"
```

---

### Task 3: UI primitives — StatusDot, Segmented, Slider, Panel

**Files:**
- Create: `src/components/ui/StatusDot.jsx`
- Create: `src/components/ui/Segmented.jsx`
- Create: `src/components/ui/Slider.jsx`
- Create: `src/components/ui/Panel.jsx`

- [ ] **Step 1: Create StatusDot**

Create `src/components/ui/StatusDot.jsx`:

```jsx
import React from 'react';

const STATES = {
  idle:   { dot: 'bg-[#5A5A62]', ring: '' },
  active: { dot: 'bg-[#34D399]', ring: 'shadow-[0_0_8px_#34D399]' },
  error:  { dot: 'bg-[#F87171]', ring: '' },
};

export default function StatusDot({ state = 'idle', className = '' }) {
  const s = STATES[state] || STATES.idle;
  return <span className={`inline-block w-2 h-2 rounded-full ${s.dot} ${s.ring} ${className}`} />;
}
```

- [ ] **Step 2: Create Segmented (pill group)**

Create `src/components/ui/Segmented.jsx`:

```jsx
import React from 'react';

export default function Segmented({ options, value, onChange, disabled }) {
  return (
    <div className="inline-flex gap-1 p-1 bg-[#0A0A0C] rounded-lg border border-[#232327]">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            value === opt.value
              ? 'bg-[#34D399]/15 text-[#34D399]'
              : 'text-[#8B8B92] hover:text-[#ECECEC]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

`options` shape: `[{ value: 'STANDARD', label: 'Standard' }, ...]`. `value`/`onChange` are controlled.

- [ ] **Step 3: Create Slider**

Create `src/components/ui/Slider.jsx`:

```jsx
import React from 'react';

export default function Slider({ label, value, min, max, step = 1, onChange, disabled, suffix = '', valueClassName = 'text-[#ECECEC]' }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-[#8B8B92]">{label}</span>
        <span className={`font-mono ${valueClassName}`}>{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-[#232327] rounded-lg accent-[#ECECEC] disabled:opacity-40"
      />
    </div>
  );
}
```

Notes: track uses neutral `#232327`, thumb `#ECECEC` — accent green is reserved for live state, not UI chrome. A view can pass `valueClassName="text-[#34D399]"` when the metric is live.

- [ ] **Step 4: Create Panel (content card)**

Create `src/components/ui/Panel.jsx`:

```jsx
import React from 'react';
import StatusDot from './StatusDot';

export default function Panel({ title, status, action, children, className = '' }) {
  return (
    <section className={`bg-[#161618] border border-[#232327] rounded-xl ${className}`}>
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#232327]">
        <div className="flex items-center gap-2.5">
          {status && <StatusDot state={status} />}
          <h2 className="text-sm font-semibold text-[#ECECEC] tracking-wide">{title}</h2>
        </div>
        {action}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: success.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/StatusDot.jsx src/components/ui/Segmented.jsx src/components/ui/Slider.jsx src/components/ui/Panel.jsx
git commit -m "[NEW] Add StatusDot, Segmented, Slider, Panel primitives"
```

---

### Task 4: Sidebar component

**Files:**
- Create: `src/components/Sidebar.jsx`

- [ ] **Step 1: Create Sidebar**

Create `src/components/Sidebar.jsx`:

```jsx
import React from 'react';
import Icons from './icons';
import StatusDot from './ui/StatusDot';

const NAV = [
  { view: 'RAM',     label: 'RAM & CPU',  icon: 'Cpu' },
  { view: 'STORAGE', label: 'Storage',    icon: 'HardDrive' },
  { view: 'GPU',     label: 'GPU',        icon: 'Monitor' },
  { view: 'NETWORK', label: 'Network',    icon: 'Wifi' },
  { view: 'BENCH',   label: 'Benchmarks', icon: 'Trophy' },
];

export default function Sidebar({ view, onViewChange, status, activeViews, onReset }) {
  return (
    <aside className="w-60 shrink-0 bg-[#0A0A0C] border-r border-[#232327] flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#232327]">
        <h1 className="text-lg font-semibold text-[#ECECEC] tracking-wide">
          <span className="text-[#34D399]">RAM</span>PAGE!
        </h1>
        <div className="text-[10px] text-[#5A5A62] uppercase tracking-[0.2em] mt-0.5">stress suite</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {NAV.map((item) => {
          const Icon = Icons[item.icon];
          const isActive = view === item.view;
          const isRunning = activeViews.includes(item.view);
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors border-l-2 ${
                isActive
                  ? 'bg-[#34D399]/5 text-[#ECECEC] border-[#34D399]'
                  : 'text-[#8B8B92] hover:text-[#ECECEC] hover:bg-[#161618] border-transparent'
              }`}
            >
              <Icon size={16} />
              <span className="flex-1 text-left">{item.label}</span>
              {isRunning && <StatusDot state="active" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#232327] space-y-3">
        <div className="flex items-center gap-2 text-xs text-[#8B8B92]">
          <StatusDot state={status} />
          <span className="uppercase tracking-wide">{status}</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-[#5A5A62] hover:text-[#F87171] transition-colors"
        >
          Reset all…
        </button>
      </div>
    </aside>
  );
}
```

Notes:
- `view` is the active view key; `onViewChange` sets it.
- `status` is the global idle/active/error string; `activeViews` is an array of view keys currently running (drives per-item dots).
- `onReset` opens the existing ConfirmModal (wired in Task 11).

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/Sidebar.jsx
git commit -m "[NEW] Add Sidebar nav component"
```

---

### Task 5: RamCpuView component

**Files:**
- Create: `src/components/views/RamCpuView.jsx`

This view takes the RAM/CPU state + handlers as props (all defined in Dashboard). It also handles the MINIONS sub-mode swap.

- [ ] **Step 1: Create RamCpuView**

Create `src/components/views/RamCpuView.jsx`:

```jsx
import React from 'react';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import Segmented from '../ui/Segmented';
import Slider from '../ui/Slider';
import SimpleChart from '../SimpleChart';
import ErrorBoundary from '../ErrorBoundary';
import Icons from '../icons';

export default function RamCpuView({
  // data
  allocatedMB, chartDataRAM, cpuMode, ramMode, targetMB, cpuLoad,
  isAllocating, isBenchmarking, gpuBenchMode, isMobile,
  // minions
  minionSize, minionCount, minions, minionWebRTC,
  // handlers
  setCpuMode, setRamMode, setTargetMB, setCpuLoad,
  setMinionSize, setMinionCount, setMinionWebRTC,
  allocateMemory, stopRAM, spawnMinions, handleKillMinionsConfirm,
}) {
  const busy = isBenchmarking || gpuBenchMode !== 'NONE';
  const running = isAllocating;

  return (
    <Panel
      title="RAM & CPU"
      status={running ? 'active' : 'idle'}
    >
      {/* Headline + chart */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-1">Allocated</div>
          <div className={`text-4xl font-mono font-semibold ${running ? 'text-[#34D399]' : 'text-[#ECECEC]'}`}>
            {allocatedMB.toLocaleString()} <span className="text-base text-[#5A5A62]">MB</span>
          </div>
        </div>
      </div>
      <div className="h-40 mb-6">
        <ErrorBoundary>
          <SimpleChart data={chartDataRAM} max={16384} color="#34D399" label="RAM Usage" unit="MB" />
        </ErrorBoundary>
      </div>

      {/* Mode switch */}
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-2">Mode</div>
        <Segmented
          options={[
            { value: 'STANDARD', label: 'Standard' },
            { value: 'HASH', label: 'Hash stress' },
            { value: 'MINIONS', label: isMobile ? 'Minions (PC only)' : 'Minions' },
          ]}
          value={cpuMode}
          onChange={setCpuMode}
        />
      </div>

      {cpuMode !== 'MINIONS' ? (
        <>
          <div className="mb-6">
            <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-2">Allocation pattern</div>
            <Segmented
              options={[
                { value: 'LINEAR', label: 'Linear' },
                { value: 'CHAOS', label: 'Chaos' },
                { value: 'WASM', label: 'WASM' },
              ]}
              value={ramMode}
              onChange={setRamMode}
              disabled={isAllocating}
            />
          </div>

          <div className="space-y-4 mb-8">
            <Slider label="RAM target" value={targetMB} min={500} max={16384} step={100} suffix=" MB" onChange={setTargetMB} disabled={busy} />
            {cpuMode === 'HASH' ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B8B92]">Hash intensity</span>
                  <span className="font-mono text-[#34D399]">MAX</span>
                </div>
                <div className="w-full h-1 bg-[#232327] rounded-lg overflow-hidden">
                  <div className="h-full w-full bg-[#34D399] animate-pulse" />
                </div>
              </div>
            ) : (
              <Slider label="CPU load" value={cpuLoad} min={0} max={100} step={10} suffix="%" onChange={setCpuLoad} disabled={busy} />
            )}
          </div>

          {!isAllocating ? (
            <Button variant="primary" icon="Play" onClick={allocateMemory} disabled={busy}>
              {cpuMode === 'HASH' ? 'Start hashing' : 'Start load'}
            </Button>
          ) : (
            <Button variant="destructive" icon="Square" onClick={stopRAM}>
              Stop process
            </Button>
          )}
        </>
      ) : (
        <MinionsSub
          isMobile={isMobile}
          minionSize={minionSize}
          minionCount={minionCount}
          minions={minions}
          minionWebRTC={minionWebRTC}
          setMinionSize={setMinionSize}
          setMinionCount={setMinionCount}
          setMinionWebRTC={setMinionWebRTC}
          spawnMinions={spawnMinions}
          handleKillMinionsConfirm={handleKillMinionsConfirm}
        />
      )}
    </Panel>
  );
}

function MinionsSub({ minionSize, minionCount, minions, minionWebRTC, setMinionSize, setMinionCount, setMinionWebRTC, spawnMinions, handleKillMinionsConfirm }) {
  return (
    <>
      <div className="p-3 mb-6 rounded-lg bg-[#F87171]/10 border border-[#F87171]/30 text-xs text-[#ECECEC] leading-relaxed">
        <strong className="text-[#F87171]">Warning:</strong> Spawns separate windows to bypass browser memory limits. Desktop only. Allow popups if blocked.
      </div>
      <div className="space-y-4 mb-6">
        <Slider label="Window size" value={minionSize} min={256} max={2048} step={128} suffix=" MB" onChange={setMinionSize} />
        <div>
          <Slider label="Count" value={minionCount} min={1} max={20} step={1} suffix=" wins" onChange={setMinionCount} />
          <div className="text-right text-[10px] text-[#5A5A62] mt-1">Total: {(minionSize * minionCount / 1024).toFixed(1)} GB</div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={minionWebRTC}
            onChange={(e) => setMinionWebRTC(e.target.checked)}
            className="w-4 h-4 accent-[#34D399] bg-[#1A1A1E] border-[#232327] rounded"
          />
          <span className="text-xs text-[#8B8B92] flex items-center gap-1">
            <Icons.Wifi size={12} /> Enable WebRTC storm
          </span>
        </label>
      </div>
      {minions.length === 0 ? (
        <Button variant="primary" icon="Layers" onClick={spawnMinions}>Spawn minions</Button>
      ) : (
        <Button variant="destructive" icon="Trash2" onClick={handleKillMinionsConfirm}>
          Kill all ({minions.length})
        </Button>
      )}
    </>
  );
}
```

Notes:
- `MAX_LIMIT` (16384) is inlined in the Slider max and chart max — keep consistent with `constants/index.js`. (If you prefer, import `MAX_LIMIT` from `../constants` — either is fine; the value is stable.)
- Minions sub-panel is a local function component in the same file (co-located; it's only used here).

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/views/RamCpuView.jsx
git commit -m "[NEW] Add RamCpuView (RAM/CPU + Minions sub-mode)"
```

---

### Task 6: StorageView component

**Files:**
- Create: `src/components/views/StorageView.jsx`

- [ ] **Step 1: Create StorageView**

Create `src/components/views/StorageView.jsx`:

```jsx
import React from 'react';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import SimpleChart from '../SimpleChart';
import ErrorBoundary from '../ErrorBoundary';

export default function StorageView({
  storageUsed, storageCount, chartDataStorage, isFillingStorage,
  isBenchmarking, gpuBenchMode,
  fillStorage, stopStorage, clearStorage,
}) {
  const busy = isBenchmarking || gpuBenchMode !== 'NONE';
  const running = isFillingStorage;

  return (
    <Panel title="Storage" status={running ? 'active' : 'idle'}>
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-1">Written</div>
        <div className={`text-4xl font-mono font-semibold ${running ? 'text-[#34D399]' : 'text-[#ECECEC]'}`}>
          {storageUsed.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-base text-[#5A5A62]">MB</span>
        </div>
        <div className="text-xs text-[#5A5A62] mt-1">{storageCount} files</div>
      </div>
      <div className="h-40 mb-6">
        <ErrorBoundary>
          <SimpleChart data={chartDataStorage} max={Math.max(2000, storageUsed * 1.2)} color="#34D399" label="Disk Usage" unit="MB" />
        </ErrorBoundary>
      </div>
      <p className="text-xs text-[#5A5A62] leading-relaxed mb-6">
        Writes raw 10MB chunks directly to disk via OPFS (Sync Access Handle) until quota limit.
      </p>
      {!isFillingStorage ? (
        <div className="flex gap-3">
          <Button variant="primary" icon="Database" onClick={fillStorage} disabled={busy}>Fill</Button>
          <Button variant="destructive" icon="Trash2" onClick={clearStorage} disabled={busy || storageUsed === 0}>Clean</Button>
        </div>
      ) : (
        <Button variant="destructive" icon="Square" onClick={stopStorage}>Stop fill</Button>
      )}
    </Panel>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/views/StorageView.jsx
git commit -m "[NEW] Add StorageView"
```

---

### Task 7: GpuView component (stress + VRAM)

**Files:**
- Create: `src/components/views/GpuView.jsx`

- [ ] **Step 1: Create GpuView**

Create `src/components/views/GpuView.jsx`:

```jsx
import React from 'react';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import Segmented from '../ui/Segmented';
import Slider from '../ui/Slider';
import GpuCanvas from '../GpuCanvas';
import ErrorBoundary from '../ErrorBoundary';
import StatusDot from '../ui/StatusDot';

export default function GpuView({
  gpuActive, gpuMode, gpuIntensity, gpuResolution, gpuOverdrive,
  showGpuPopup, isBenchmarking, gpuBenchMode,
  // VRAM
  vramActive, vramCount,
  // handlers
  setGpuMode, setGpuIntensity, setGpuResolution, setGpuOverdrive,
  toggleGpu, openGpuPopup, handleGpuCrash,
  runVramBurner, stopVramBurner,
}) {
  const busy = isBenchmarking || gpuBenchMode !== 'NONE';

  return (
    <div className="space-y-5">
      <Panel title="GPU stress" status={gpuActive ? 'active' : 'idle'}>
        {/* Live preview */}
        <div className="h-56 mb-6 rounded-lg overflow-hidden bg-black border border-[#232327] relative group">
          {gpuActive ? (
            <ErrorBoundary>
              <GpuCanvas
                active={!showGpuPopup}
                intensity={gpuIntensity}
                resolution={gpuResolution}
                mode={gpuMode}
                overdrive={gpuOverdrive}
                onClick={openGpuPopup}
                onError={handleGpuCrash}
              />
            </ErrorBoundary>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[#5A5A62] text-sm tracking-widest uppercase">Ready</span>
            </div>
          )}
          {gpuActive && !showGpuPopup && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="text-xs text-[#ECECEC] flex items-center gap-2"><Icons.Maximize size={14} /> Double-click to expand</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-2">Shader</div>
          <Segmented
            options={[
              { value: 'FRACTAL', label: 'Fractal' },
              { value: '3D', label: '3D' },
              { value: 'FIRE', label: 'Fire' },
            ]}
            value={gpuMode}
            onChange={setGpuMode}
            disabled={busy}
          />
        </div>

        <div className="space-y-4 mb-8">
          <Slider label={gpuMode === 'FIRE' ? 'Particle density' : 'Shader complexity'} value={gpuIntensity} min={1} max={100} suffix="%" onChange={setGpuIntensity} disabled={busy} />
          <div>
            <Slider label="Resolution" value={Math.log2(gpuResolution / 1024)} min={0} max={3} step={1} onChange={(v) => setGpuResolution(1024 * Math.pow(2, v))} disabled={busy} />
            <div className="flex justify-between text-[10px] text-[#5A5A62] mt-1"><span>1K</span><span>2K</span><span>4K</span><span>8K</span></div>
          </div>
          <Slider label="Overdrive (passes)" value={gpuOverdrive} min={1} max={20} step={1} onChange={setGpuOverdrive} disabled={busy} valueClassName="font-mono text-[#ECECEC]" />
        </div>

        <Button
          variant={gpuActive ? 'destructive' : 'secondary'}
          icon={gpuActive ? 'Square' : 'Play'}
          onClick={toggleGpu}
          disabled={busy}
        >
          {gpuActive ? 'Manual stop' : 'Shader test'}
        </Button>
      </Panel>

      {/* VRAM burner — secondary card */}
      <Panel title="VRAM eater" status={vramActive ? 'active' : 'idle'}>
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-1">Eaten</div>
            <div className={`text-3xl font-mono font-semibold ${vramActive ? 'text-[#34D399]' : 'text-[#ECECEC]'}`}>
              {(vramCount * 64).toLocaleString()} <span className="text-sm text-[#5A5A62]">MB</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-[#5A5A62] mb-6">Allocates 64MB uncompressed textures until VRAM is exhausted.</p>
        {!vramActive ? (
          <Button variant="secondary" icon="Layers" onClick={runVramBurner} disabled={busy}>Eat VRAM</Button>
        ) : (
          <Button variant="destructive" icon="Square" onClick={stopVramBurner} className="animate-pulse">Stop eating ({vramCount})</Button>
        )}
      </Panel>
    </div>
  );
}
```

Note: `Icons` is used in the hover hint — add `import Icons from '../icons';` at the top of the file if not present. (It is referenced as `<Icons.Maximize/>`.) Include this import.

- [ ] **Step 2: Add the missing Icons import**

Ensure the top of `src/components/views/GpuView.jsx` includes:

```jsx
import Icons from '../icons';
```

(alongside the other imports.)

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/components/views/GpuView.jsx
git commit -m "[NEW] Add GpuView (stress + VRAM burner)"
```

---

### Task 8: NetworkView component

**Files:**
- Create: `src/components/views/NetworkView.jsx`

- [ ] **Step 1: Create NetworkView**

Create `src/components/views/NetworkView.jsx`:

```jsx
import React from 'react';
import Panel from '../ui/Panel';
import Button from '../ui/Button';

export default function NetworkView({ netActive, netStats, runNetworkStress, stopNetworkStress }) {
  const running = netActive;
  return (
    <Panel title="Network storm" status={running ? 'active' : 'idle'}>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-[#1A1A1E] border border-[#232327]">
          <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-1">Speed</div>
          <div className={`text-3xl font-mono font-semibold ${running ? 'text-[#34D399]' : 'text-[#ECECEC]'}`}>
            {netStats.speed.toFixed(1)}
            <span className="text-sm text-[#5A5A62] ml-1">Mbps</span>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-[#1A1A1E] border border-[#232327]">
          <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-1">Burned</div>
          <div className={`text-3xl font-mono font-semibold ${running ? 'text-[#34D399]' : 'text-[#ECECEC]'}`}>
            {netStats.total.toFixed(0)}
            <span className="text-sm text-[#5A5A62] ml-1">MB</span>
          </div>
        </div>
      </div>
      {!netActive ? (
        <Button variant="primary" icon="DownloadCloud" onClick={runNetworkStress}>Burn traffic</Button>
      ) : (
        <Button variant="destructive" icon="Square" onClick={stopNetworkStress}>Stop network</Button>
      )}
    </Panel>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/views/NetworkView.jsx
git commit -m "[NEW] Add NetworkView"
```

---

### Task 9: BenchmarksView component

**Files:**
- Create: `src/components/views/BenchmarksView.jsx`

- [ ] **Step 1: Create BenchmarksView**

Create `src/components/views/BenchmarksView.jsx`:

```jsx
import React from 'react';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import Segmented from '../ui/Segmented';
import Icons from '../icons';

export default function BenchmarksView({
  benchType, setBenchType,
  // cpu
  cpuHighScore, isBenchmarking, cpuBenchScore,
  startCpuBenchmark, stopCpuBenchmark,
  // gpu
  gpuHighScores, gpuBenchMode,
  runGpuBenchmark,
}) {
  const gpuBusy = gpuBenchMode !== 'NONE';

  return (
    <Panel title="Benchmarks" status={isBenchmarking || gpuBusy ? 'active' : 'idle'}>
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-2">Suite</div>
        <Segmented
          options={[
            { value: 'CPU', label: 'CPU / RAM' },
            { value: 'GPU', label: 'GPU' },
          ]}
          value={benchType}
          onChange={setBenchType}
        />
      </div>

      {benchType === 'CPU' ? (
        <>
          <div className="mb-8">
            <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-1">High score</div>
            <div className="text-4xl font-mono font-semibold text-[#34D399]">{cpuHighScore}</div>
            {isBenchmarking && <div className="text-sm text-[#ECECEC] mt-2 font-mono">current: {cpuBenchScore}</div>}
          </div>
          {!isBenchmarking ? (
            <Button variant="primary" icon="Play" onClick={startCpuBenchmark} disabled={gpuBusy}>Run survival</Button>
          ) : (
            <Button variant="destructive" icon="Square" onClick={stopCpuBenchmark}>Stop</Button>
          )}
        </>
      ) : (
        <>
          <div className="space-y-2 mb-8">
            {[
              { key: 'LIGHT', label: 'Light', score: gpuHighScores.LIGHT },
              { key: 'NORMAL', label: 'Normal', score: gpuHighScores.NORMAL },
              { key: 'BURNER', label: 'Burner', score: gpuHighScores.BURNER },
            ].map((row) => (
              <div key={row.key} className="flex justify-between items-center py-2 border-b border-[#232327] last:border-0">
                <span className="text-sm text-[#8B8B92] uppercase tracking-wide">{row.label}</span>
                <span className="text-xl font-mono font-semibold text-[#ECECEC]">{row.score}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="primary" onClick={() => runGpuBenchmark('LIGHT')} disabled={isBenchmarking || gpuBusy}>Light</Button>
            <Button variant="primary" onClick={() => runGpuBenchmark('NORMAL')} disabled={isBenchmarking || gpuBusy}>Normal</Button>
            <Button variant="primary" onClick={() => runGpuBenchmark('BURNER')} disabled={isBenchmarking || gpuBusy}>Burner</Button>
          </div>
        </>
      )}
    </Panel>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/views/BenchmarksView.jsx
git commit -m "[NEW] Add BenchmarksView"
```

---

### Task 10: LogsPanel component (the collapsed log strip)

**Files:**
- Create: `src/components/LogsPanel.jsx`

Per spec: logs collapse to one line under the main panel and expand on hover/click.

- [ ] **Step 1: Create LogsPanel**

Create `src/components/LogsPanel.jsx`:

```jsx
import React, { useState } from 'react';

export default function LogsPanel({ logs }) {
  const [open, setOpen] = useState(false);
  const last = logs[0];

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-[#0A0A0C] border border-[#232327] rounded-lg text-xs text-[#8B8B92] hover:text-[#ECECEC] transition-colors"
      >
        <span className="flex items-center gap-2 uppercase tracking-wide">
          <span className="text-[#5A5A62]">&gt;_</span> logs
        </span>
        <span className="text-[#5A5A62]">{open ? 'hide' : 'show'}</span>
      </button>
      {open && (
        <div className="mt-2 max-h-48 overflow-y-auto bg-[#0A0A0C] border border-[#232327] rounded-lg p-3 font-mono text-xs space-y-0.5">
          {logs.length === 0 ? (
            <div className="text-[#5A5A62]">&gt; system ready…</div>
          ) : (
            logs.map((l, i) => (
              <div key={i} className={l.includes('Error') ? 'text-[#F87171]' : 'text-[#8B8B92]'}>
                <span className="text-[#5A5A62]">&gt;</span> {l}
              </div>
            ))
          )}
        </div>
      )}
      {!open && last && (
        <div className="mt-2 px-4 py-2 bg-[#0A0A0C] border border-[#232327] rounded-lg font-mono text-xs text-[#8B8B92] truncate">
          <span className="text-[#5A5A62]">&gt;</span> {last}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/LogsPanel.jsx
git commit -m "[NEW] Add collapsible LogsPanel"
```

---

### Task 11: Rebuild Dashboard.jsx as orchestrator

**Files:**
- Modify: `src/components/Dashboard.jsx` — replace the entire render tree (lines ~688–end) and add `view` state + `activeViews` derivation + `toggleGpu` helper. Keep ALL state declarations and handler functions above the return unchanged.

This is the big one. Do it in sub-steps.

- [ ] **Step 1: Add the new imports at the top**

At the top of `src/components/Dashboard.jsx`, after the existing imports (lines 1–13), add:

```jsx
import Sidebar from './Sidebar';
import LogsPanel from './LogsPanel';
import RamCpuView from './views/RamCpuView';
import StorageView from './views/StorageView';
import GpuView from './views/GpuView';
import NetworkView from './views/NetworkView';
import BenchmarksView from './views/BenchmarksView';
import { MAX_LIMIT } from '../constants';
```

(`MAX_LIMIT` is already imported in the existing code if present — check; if the existing import line `import { MAX_LIMIT, WORKER_CAP, LIGHT_SUITE, NORMAL_SUITE, BURNER_SUITE } from '../constants';` already exists, do not re-add `MAX_LIMIT`. Just add the component imports.)

- [ ] **Step 2: Add `view` state + derived values**

Find the `useState` block near the top of the component (around line 18: `const [activeTab, setActiveTab] = useState('RAM');`). Change it to add `view`:

```jsx
const [activeTab, setActiveTab] = useState('RAM');
const [view, setView] = useState('RAM');
```

(Keep `activeTab` — it's still referenced by the chart loop. Or, simpler: replace all `activeTab`/`setActiveTab` usages with `view`/`setView`. The chart loop `if(activeTab === 'STORAGE')` only matters for the old top-strip; in the new layout charts live in their views, so that loop can stay as-is harmlessly. To minimize risk, KEEP `activeTab` and ADD `view`.)

Just below the existing `anyActive`-style logic isn't there yet — add this derivation right before the `return (`:

```jsx
  const anyActive = isAllocating || isFillingStorage || gpuActive || netActive ||
                    vramActive || isBenchmarking || gpuBenchMode !== 'NONE';
  const status = error ? 'error' : anyActive ? 'active' : 'idle';
  const activeViews = [
    isAllocating && 'RAM',
    isFillingStorage && 'STORAGE',
    (gpuActive || vramActive) && 'GPU',
    netActive && 'NETWORK',
    (isBenchmarking || gpuBenchMode !== 'NONE') && 'BENCH',
  ].filter(Boolean);

  const toggleGpu = () => {
    setGpuActive(!gpuActive);
    setActiveTab('GPU');
  };
```

- [ ] **Step 3: Replace the ENTIRE render tree**

Find the line `return (` (the component's main return, after `stopVramBurner`). Replace everything from `return (` through the final `);` at the end of the file with:

```jsx
  return (
    <div className="h-screen w-full flex bg-[#0E0E10] text-[#ECECEC] overflow-hidden font-sans">
      <Sidebar
        view={view}
        onViewChange={setView}
        status={status}
        activeViews={activeViews}
        onReset={handleEmergencyResetConfirm}
      />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          {view === 'RAM' && (
            <RamCpuView
              allocatedMB={allocatedMB}
              chartDataRAM={chartDataRAM}
              cpuMode={cpuMode}
              ramMode={ramMode}
              targetMB={targetMB}
              cpuLoad={cpuLoad}
              isAllocating={isAllocating}
              isBenchmarking={isBenchmarking}
              gpuBenchMode={gpuBenchMode}
              isMobile={isMobile}
              minionSize={minionSize}
              minionCount={minionCount}
              minions={minions}
              minionWebRTC={minionWebRTC}
              setCpuMode={setCpuMode}
              setRamMode={setRamMode}
              setTargetMB={setTargetMB}
              setCpuLoad={setCpuLoad}
              setMinionSize={setMinionSize}
              setMinionCount={setMinionCount}
              setMinionWebRTC={setMinionWebRTC}
              allocateMemory={allocateMemory}
              stopRAM={stopRAM}
              spawnMinions={spawnMinions}
              handleKillMinionsConfirm={handleKillMinionsConfirm}
            />
          )}

          {view === 'STORAGE' && (
            <StorageView
              storageUsed={storageUsed}
              storageCount={storageCount}
              chartDataStorage={chartDataStorage}
              isFillingStorage={isFillingStorage}
              isBenchmarking={isBenchmarking}
              gpuBenchMode={gpuBenchMode}
              fillStorage={fillStorage}
              stopStorage={stopStorage}
              clearStorage={clearStorage}
            />
          )}

          {view === 'GPU' && (
            <GpuView
              gpuActive={gpuActive}
              gpuMode={gpuMode}
              gpuIntensity={gpuIntensity}
              gpuResolution={gpuResolution}
              gpuOverdrive={gpuOverdrive}
              showGpuPopup={showGpuPopup}
              isBenchmarking={isBenchmarking}
              gpuBenchMode={gpuBenchMode}
              vramActive={vramActive}
              vramCount={vramCount}
              setGpuMode={setGpuMode}
              setGpuIntensity={setGpuIntensity}
              setGpuResolution={setGpuResolution}
              setGpuOverdrive={setGpuOverdrive}
              toggleGpu={toggleGpu}
              openGpuPopup={() => setShowGpuPopup(true)}
              handleGpuCrash={handleGpuCrash}
              runVramBurner={runVramBurner}
              stopVramBurner={stopVramBurner}
            />
          )}

          {view === 'NETWORK' && (
            <NetworkView
              netActive={netActive}
              netStats={netStats}
              runNetworkStress={runNetworkStress}
              stopNetworkStress={stopNetworkStress}
            />
          )}

          {view === 'BENCH' && (
            <BenchmarksView
              benchType={benchType}
              setBenchType={setBenchType}
              cpuHighScore={cpuHighScore}
              isBenchmarking={isBenchmarking}
              cpuBenchScore={cpuBenchScore}
              startCpuBenchmark={startCpuBenchmark}
              stopCpuBenchmark={stopCpuBenchmark}
              gpuHighScores={gpuHighScores}
              gpuBenchMode={gpuBenchMode}
              runGpuBenchmark={runGpuBenchmark}
            />
          )}

          <LogsPanel logs={logs} />
        </div>
      </main>

      {/* GPU fullscreen popup (kept inline — tightly coupled to bench state) */}
      {showGpuPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-5xl h-[80vh] bg-black border border-[#232327] rounded-xl overflow-hidden flex flex-col">
            {gpuBenchMode !== 'NONE' && (
              <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-md border border-[#232327] p-4 rounded-xl text-[#ECECEC] min-w-[200px]">
                <div className="flex items-center gap-2 mb-2 border-b border-[#232327] pb-2">
                  <Icons.Trophy size={16} className="text-[#34D399]" />
                  <span className="font-semibold text-sm">{gpuBenchMode} test</span>
                </div>
                <div className="text-xs font-mono space-y-1 text-[#8B8B92]">
                  <div>scene: {gpuMode}</div>
                  <div>res: {gpuResolution}px</div>
                  <div>overdrive: <span className="text-[#F87171]">x{gpuOverdrive}</span></div>
                  <div className="text-[#34D399]">stage {gpuBenchStage + 1}/{gpuBenchMode === 'LIGHT' ? LIGHT_SUITE.length : (gpuBenchMode === 'NORMAL' ? NORMAL_SUITE.length : BURNER_SUITE.length)}</div>
                </div>
                <div className="mt-3 bg-white/5 rounded-lg p-2 flex justify-between items-end">
                  <div>
                    <div className="text-[10px] text-[#8B8B92]">avg fps</div>
                    <div className="text-xl font-semibold">
                      {gpuBenchTimeLeft > 18 ? '…' : (gpuBenchAvgBuffer.slice(4).reduce((a, b) => a + b, 0) / (gpuBenchAvgBuffer.length - 4 || 1)).toFixed(0)}
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{gpuBenchTimeLeft}</div>
                </div>
              </div>
            )}
            <div className="absolute top-4 right-20 z-20 bg-black/70 text-[#34D399] text-xs font-mono font-semibold px-3 py-1.5 rounded backdrop-blur-md border border-[#232327]">
              fps: {gpuBenchTimeLeft > 18 && gpuBenchMode !== 'NONE' ? 'warming…' : gpuBenchCurrentFps}
            </div>
            <button
              onClick={() => gpuBenchMode !== 'NONE' ? cancelGpuBenchmark() : setShowGpuPopup(false)}
              className="absolute top-4 right-4 z-50 bg-[#161618]/80 hover:bg-[#F87171] text-[#ECECEC] p-2 rounded-full backdrop-blur-md transition-colors border border-[#232327]"
            >
              <Icons.X size={20} />
            </button>
            <div className="flex-1 relative">
              <ErrorBoundary>
                <GpuCanvas
                  active={true}
                  key={gpuBenchStage}
                  intensity={gpuIntensity}
                  resolution={gpuResolution}
                  mode={gpuMode}
                  overdrive={gpuOverdrive}
                  onFpsUpdate={handleGpuFpsUpdate}
                  isPopup={true}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}

      {/* Bench results modal */}
      {showBenchResults && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
          <div className="bg-[#161618] border border-[#34D399]/60 rounded-xl max-w-lg w-full p-6 font-mono">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-[#ECECEC]">{showBenchResults} results</h2>
              <div className="text-4xl text-[#34D399] font-bold mt-2">
                {gpuBenchResults.reduce((acc, r) => acc + Math.round(r.avgFps * (r.res / 1024) * r.od), 0).toLocaleString()}
              </div>
              <div className="text-xs text-[#8B8B92] uppercase mt-1">total score</div>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-1 mb-4 pr-2">
              {gpuBenchResults.map((r, i) => {
                const score = Math.round(r.avgFps * (r.res / 1024) * r.od);
                return (
                  <div key={i} className="flex justify-between items-center bg-[#1A1A1E] border border-[#232327] p-2 rounded text-xs">
                    <div className="flex flex-col">
                      <span className="text-[#ECECEC] font-semibold">{r.mode}</span>
                      <span className="text-[#5A5A62] text-[10px]">{r.res}px • x{r.od} od</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[#34D399] font-semibold">{score} pts</div>
                      <div className="text-[#5A5A62] text-[10px]">{r.avgFps.toFixed(0)} fps</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShowBenchResults(false)} className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-[#ECECEC] transition-colors">Close</button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: success. If it fails, the most likely cause is a prop name mismatch — check each view component's prop list against what Dashboard passes. Fix and rebuild.

- [ ] **Step 5: Verify lint has no NEW errors**

Run: `npm run lint 2>&1 | grep -E "Dashboard|views/|ui/|Sidebar|LogsPanel"`
Expected: may show pre-existing `forceUpdateStorage`/`cpuBenchStage`/hook-dep warnings in Dashboard (those were there before, in unchanged code). No errors from the new files. If a new file errors, fix it.

- [ ] **Step 6: Commit**

```bash
git add src/components/Dashboard.jsx
git commit -m "[UPD] Rebuild Dashboard as orchestrator (sidebar + views)"
```

---

### Task 12: Restyle ConfirmModal to tokens

**Files:**
- Modify: `src/components/ConfirmModal.jsx`

- [ ] **Step 1: Replace ConfirmModal**

Rewrite `src/components/ConfirmModal.jsx`:

```jsx
import React from 'react';
import Icons from './icons';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-md bg-[#0E0E10] border border-[#F87171]/50 rounded-xl p-6">
        <div className="flex items-center gap-3 border-b border-[#232327] pb-4 mb-4">
          <Icons.ShieldAlert className="text-[#F87171] w-7 h-7 animate-pulse" />
          <h2 className="text-base font-semibold text-[#ECECEC] uppercase tracking-wide">{title}</h2>
        </div>
        <p className="text-sm text-[#ECECEC] mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-transparent border border-[#232327] text-[#8B8B92] font-semibold py-2.5 rounded-lg text-xs hover:border-[#3A3A42] hover:text-[#ECECEC] transition-colors uppercase tracking-wide"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/40 hover:bg-[#F87171]/25 font-semibold py-2.5 rounded-lg text-xs transition-colors uppercase tracking-wide"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/ConfirmModal.jsx
git commit -m "[UPD] Restyle ConfirmModal to dark token system"
```

---

### Task 13: Light token pass on MinionWindow

**Files:**
- Modify: `src/components/MinionWindow.jsx` — only the `return (...)` JSX (lines ~145–169). Do NOT touch any logic/effects/handlers.

- [ ] **Step 1: Replace the MinionWindow render**

In `src/components/MinionWindow.jsx`, replace the `return (...)` block (from `return (` to the closing `);`) with:

```jsx
  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#ECECEC] p-4 flex flex-col items-center justify-center font-sans select-none">
      <h1 className="text-xl font-semibold text-[#F87171] tracking-wide">MINION</h1>
      <div className="text-xs text-[#8B8B92] mt-2 font-mono">id: {myId.slice(-4)}</div>

      <div className="flex flex-col items-center gap-2 mt-4">
        <div className="text-xs text-[#5A5A62]">eating {targetMB} MB…</div>
        {useWebRTC && (
          <div className="text-[10px] font-semibold text-[#34D399] border border-[#34D399]/40 px-2 py-1 rounded bg-[#34D399]/10 flex items-center gap-2">
            <Icons.Wifi size={10} /> WEBRTC STORM
          </div>
        )}
      </div>

      <div className="text-4xl font-mono font-semibold mt-4 text-[#34D399]">
        {allocatedMB.toFixed(0)} <span className="text-sm text-[#5A5A62]">MB</span>
      </div>
      <button
        onClick={() => window.close()}
        className="mt-8 bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/40 hover:bg-[#F87171]/25 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
      >
        Self destruct
      </button>
    </div>
  );
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/MinionWindow.jsx
git commit -m "[UPD] MinionWindow token pass (no logic change)"
```

---

### Task 14: Final acceptance — build, lint sweep, no old tokens, click-through

**Files:** none (verification)

- [ ] **Step 1: Clean build**

Run:
```bash
npm run build
```
Expected: success.

- [ ] **Step 2: No new lint errors**

Run:
```bash
npm run lint 2>&1 | tail -8
```
Expected: only the pre-existing errors in `icons.jsx` + the three workers (noted in Task 1). No errors in `Dashboard.jsx`, `views/`, `ui/`, `Sidebar.jsx`, `LogsPanel.jsx`, `ConfirmModal.jsx`, `MinionWindow.jsx` beyond the pre-existing `forceUpdateStorage`/`cpuBenchStage`/hook-dep warnings.

- [ ] **Step 3: No old-theme tokens remain**

Run a search across `src/components/` for the old palette:
- `indigo-`, `amber-`, `rose-`, `fuchsia-`, `teal-`, `cyan-`, `emerald-`, `slate-9`, `font-graffiti`, `rotate-3`, `-skew-x`, `Permanent Marker`

Expected: zero matches.

- [ ] **Step 4: Title intact**

Confirm `src/components/Sidebar.jsx` renders `RAMPAGE!` (the `<span className="text-[#34D399]">RAM</span>PAGE!` line). Confirm `index.html` `<title>` is still `RAMpage!`.

- [ ] **Step 5: Dev-server click-through**

Run: `npm run dev`, open the app. For each sidebar item, verify:
1. **RAM & CPU:** set mode Standard, drag target to 1024, click Start load → allocated number goes green, status flips to `active`, sidebar RAM dot lights. Click Stop process → back to idle.
2. **RAM & CPU → Minions:** switch mode to Minions, set count 2, Spawn → windows open. Kill all → closes.
3. **Storage:** Fill → number goes green, dot lights. Stop fill / Clean → idle.
4. **GPU:** Shader test → preview animates, dot lights. Manual stop → idle. Eat VRAM → count climbs. Stop eating.
5. **Network:** Burn traffic → speed/burned go green. Stop network.
6. **Benchmarks:** Run survival (CPU) → score climbs, stop. Switch to GPU, click Light → popup runs, results modal shows at end.
7. **Reset all…** (sidebar footer) → ConfirmModal opens, Confirm clears everything.
8. Logs panel: click show/hide, last log shows when collapsed.

If any path is broken, fix and re-commit as a follow-up.

- [ ] **Step 6: No commit unless a fix was needed** — if all pass, the redesign is complete.

---

## Self-Review

**1. Spec coverage:**

| Spec requirement | Task |
|---|---|
| Sidebar nav (240px) + focused main panel | Tasks 4, 11 |
| Dark Raycast/Arc tokens (`#0E0E10` base etc.) | Token table; applied across Tasks 2–13 |
| `RAMPAGE!` name retained (not renamed) | Task 4 (Sidebar), verified Task 14 |
| One view at a time via `view` state | Task 11 |
| Status LED derived (no new effects) | Task 11 (`anyActive`/`status`/`activeViews`) |
| Primary = white, destructive = red-tint, secondary = outline | Task 2 (Button variants) |
| Accent green only for live/active | StatusDot, per-view metric coloring |
| No `font-mono` site-wide (system stack for UI) | Task 11 root `font-sans` |
| RAM & CPU view (+ Minions sub-mode) | Task 5 |
| Storage view | Task 6 |
| GPU view (stress + VRAM as separate cards) | Task 7 |
| Network view | Task 8 |
| Benchmarks view | Task 9 |
| ConfirmModal restyled | Task 12 |
| MinionWindow light pass | Task 13 |
| Logs collapsible | Task 10 |
| No worker/logic/state changes | Preserved — handlers copied through unchanged in Task 11 |

**Gaps found during review:**
- GPU popup + bench-results modal: spec said "results still open the existing modal (restyled)." These are inline in Dashboard (tightly coupled to bench state) — covered in Task 11's render replacement. ✓
- `activeTab` vs `view`: spec says `view` replaces `activeTab`. The plan keeps both to avoid touching the chart-loop logic (low risk), but `activeTab` is now vestigial. Acceptable for v1 — not a correctness issue. ✓

**2. Placeholder scan:** No TBD/TODO/"appropriate"/"similar to." Every step has full code. The one `MAX_LIMIT` note (inline 16384 vs import) gives both options explicitly. ✓

**3. Type/prop consistency:** Checked every view's prop list against Dashboard's pass-through in Task 11. Names match (`allocatedMB`, `cpuMode`, `setCpuMode`, `toggleGpu`, `openGpuPopup`, `runVramBurner`, etc.). `Segmented`'s `options`/`value`/`onChange` shape is identical across Tasks 5, 7, 9. `Button`'s `variant`/`icon` props used consistently. `Slider`'s `label`/`value`/`onChange`/`suffix` consistent. ✓

**4. Scope check:** Single subsystem (UI layer of the dashboard + 2 small files). Decomposed into 12 focused new files + orchestrator rewrite. Appropriately scoped for one plan. ✓
