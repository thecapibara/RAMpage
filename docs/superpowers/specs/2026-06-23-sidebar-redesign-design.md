# UI Redesign — Sidebar + Focused Panel

**Date:** 2026-06-23
**Status:** Approved (direction)
**Scope:** Full UI rebuild of `Dashboard.jsx` (and `MinionWindow.jsx` visual pass). Layout, hierarchy, density, and color all change. **No logic, worker, or state-machine changes** — same props in/out to workers, same localStorage keys, same benchmark suites.

## What went wrong before (so we don't repeat it)

Two mistakes the user called out:
1. **Renamed the brand.** Title was `RAMPAGE!`. I changed it to "RAMEATER" without asking. → Keep `RAMPAGE!`.
2. **Recolored instead of redesigned.** Swapping indigo→matrix-green while keeping the cramped 4-column grid of sliders/segmented-controls is still "AI slop," just a different hue. → This spec is a **structural** redesign, not a recolor.

The slop smell comes from: everything crammed into one viewport row, no hierarchy, every control a tiny segmented switch, no breathing room, decorative glow substituting for real design.

## Direction (approved)

**Sidebar nav + focused main panel.** One stress tool visible at a time, with real space around it. Modern dark devtool feel — Raycast/Arc energy. **Not** pure black, **not** matrix green. Calm, refined, with the brand green used sparingly as a live/active signal only.

## Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  SIDEBAR (240px, fixed)        │  MAIN (flex-1)                   │
│                                │                                  │
│  RAMPAGE!                      │  ┌─────────────────────────────┐ │
│  stress suite                  │  │ RAM & CPU         ● active  │ │
│                                │  │                              │ │
│  ─────────                     │  │  allocated   1,228 MB        │ │
│  ▸ RAM & CPU      ● active     │  │  ▁▂▃▅▆▇ (chart)              │ │
│  ▢ Storage                     │  │                              │ │
│  ▢ GPU                         │  │  pattern    linear chaos was  │ │
│  ▢ Network                     │  │  target     ────●──  4096 MB  │ │
│  ▢ Benchmarks                  │  │  cpu load   ──●────  20%      │ │
│                                │  │                              │ │
│  ─────────                     │  │  [    Start load    ]        │ │
│  Status: ● active              │  └─────────────────────────────┘ │
│  Reset all…                    │                                  │
│                                │  Logs (collapsed to one line,    │
│                                │  expands on click/hover)        │
└──────────────────────────────────────────────────────────────────┘
```

**Sidebar (fixed 240px, `hidden` on mobile → becomes top tab bar):**
- Brand block: `RAMPAGE!` wordmark + `stress suite` subtitle.
- Nav: one item per tool (RAM & CPU, Storage, GPU, Network, Benchmarks). Active item = accent-tinted background + accent left-border. Each shows a tiny status dot when that subsystem is active (green = running).
- Footer of sidebar: global status (`● active` / `● idle` / `● error`) + a muted "Reset all…" link that opens the existing ConfirmModal.

**Main panel:**
- One `view` at a time, switched by sidebar selection. Replaces the 4-column grid entirely.
- Each view is a single content card (`max-w-3xl`, centered, generous padding `p-8`).
- Card has: title row (tool name + live status dot), a big readout (the headline metric in large type), a chart where relevant, the controls, one primary CTA.

## Color system (dark Raycast/Arc)

| Token    | Hex       | Use                                          |
|----------|-----------|----------------------------------------------|
| base     | `#0E0E10` | app background                               |
| sidebar  | `#0A0A0C` | sidebar background (slightly darker than base)|
| panel    | `#161618` | card surface                                 |
| panel-2  | `#1A1A1E` | nested surfaces / chart area                 |
| border   | `#232327` | 1px borders                                  |
| text     | `#ECECEC` | primary text                                 |
| muted    | `#8B8B92` | labels, hints                                |
| faint    | `#5A5A62` | disabled / placeholders                      |
| accent   | `#34D399` | live/active state ONLY (sparingly)           |
| danger   | `#F87171` | destructive actions                          |

**Rules:**
- Accent green appears **only** for: active subsystem status dots, a running metric number, an active sidebar item's left border. It is **not** used for buttons, borders, or decoration at rest.
- Buttons: primary = `bg-white text-black` (calm, confident, modern — used for **start** actions only), destructive = `bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/40 hover:bg-[#F87171]/25` (used for **stop/kill/clean** actions), secondary = `bg-transparent border border-[#232327] text-[#8B8B92] hover:border-[#3A3A42] hover:text-[#ECECEC]` (for neutral toggles like "Shader test" at rest). When a primary start button is active/running, it becomes the destructive stop button (toggle).
- No glow. No `drop-shadow` for decoration. No `animate-pulse` except the one ConfirmModal alert icon.
- Radii: `rounded-xl` (12px) on cards, `rounded-lg` on buttons/inputs.
- Typography: system font stack (NOT mono everywhere — mono only for numbers/code/logs). The matrix-green era used `font-mono` site-wide; that read as "terminal cosplay." Use `-apple-system, system-ui, sans-serif` for UI text, `font-mono` only for metric values and logs.

## Views (one per sidebar item)

### RAM & CPU view
- **Headline:** `allocated` value large, e.g. `1,228 MB` (mono).
- **Chart:** `SimpleChart` with a calm accent (`#34D399`) — same component, new color prop. Wider/taller now that it owns the panel (not a 128px strip).
- **Controls:** RAM mode (segmented pills, restyled — STANDARD / HASH / MINIONS — same 3-way switch, new token styling), RAM target slider, CPU load slider (or hash-intensity locked bar when HASH mode).
- **Primary CTA:** `Start load` / `Stop` (toggles).
- **Minions:** When mode = MINIONS, the panel swaps to minion controls (count slider, size slider, WebRTC toggle, Spawn/Kill). Same behavior as today.

### Storage view
- **Headline:** `storageUsed` MB (mono, accent when filling).
- **Chart:** storage trace.
- **Copy:** one line describing OPFS write.
- **CTAs:** `Fill` (primary), `Clean` (destructive). While filling, primary becomes `Stop fill` (destructive).

### GPU view
- **Headline:** current mode + `ready` / live FPS when active.
- **Preview:** the `GpuCanvas` lives here full-width (no more tiny 128px preview). Double-click still opens the fullscreen popup (unchanged).
- **Controls:** mode pills (FRACTAL/3D/FIRE), intensity, resolution, overdrive sliders.
- **CTA:** `Shader test` / `Manual stop`.
- **VRAM burner:** a secondary card below the main one (not crammed into the same column) with its own count + Eat/Stop.

### Network view
- **Headline:** download speed (accent when active) + total burned.
- **CTA:** `Burn traffic` / `Stop network`.

### Benchmarks view
- CPU/RAM and GPU benches. High scores displayed as clean stat rows.
- CPU: one `Run survival` / `Stop`. GPU: three buttons (Light/Normal/Burner) — styled as a **stacked or rowed choice with labels**, not three identical pills.
- Results still open the existing bench-results modal (restyled).

## Status LED — derived (no new state/effects)

Same approach as before, presentation-only:
```
const anyActive = isAllocating || isFillingStorage || gpuActive || netActive ||
                  vramActive || isBenchmarking || gpuBenchMode !== 'NONE';
const status = error ? 'error' : anyActive ? 'active' : 'idle';
```
Rendered in the sidebar footer as `● active` / `● idle` / `● error`, plus per-nav-item dots.

## Per-view switching mechanism

Add one piece of state: `const [view, setView] = useState('RAM')` (replaces `activeTab`). No effect needed — it's just which view's JSX to render. All existing state/handlers stay; we just gate rendering by `view` instead of rendering everything at once. This is the structural change that fixes the cramming.

## ConfirmModal pass

Already restyled in the discarded branch conceptually; redo here under the new token system: `bg-[#0E0E10]` panel, `border-[#F87171]`, white title, destructive confirm button, neutral cancel. Keep one subtle glow on the confirm button only (earned — destructive).

## Out of scope (explicit)

- No worker logic, benchmark math, or localStorage key changes.
- No new dependencies. Tailwind arbitrary-value classes, literal hexes.
- `SimpleChart.jsx` internals untouched (only `color` prop values change).
- `GpuCanvas.jsx`, `ErrorBoundary.jsx`, `icons.jsx` untouched.
- `MinionWindow.jsx` gets only a light visual pass to match tokens (it's a separate popup window; full redesign not required — just stop it being rose/indigo/amber rainbow).
- `index.html` `<title>` stays `RAMpage!`.

## Risks & verification

- **Risk:** restructuring render into view-gated JSX could drop a control or mis-wire a handler. **Mitigation:** each view is implemented as a clearly-delimited block; after wiring, run the dev server and click through every tool's start/stop path before claiming done.
- **Acceptance:** `npm run build` clean; dev-server click-through of every tool's start→running→stop; no `slate-*`, `indigo-*`, `amber-*`, `rose-*`, `fuchsia-*`, `teal-*`, `cyan-*`, `emerald-*` classes remain; title reads `RAMPAGE!`; sidebar nav switches the visible panel.

## Files

1. `src/components/Dashboard.jsx` — full rebuild of the render tree + one new `view` state. Logic handlers copied through unchanged.
2. `src/components/ConfirmModal.jsx` — token-aligned restyle.
3. `src/components/MinionWindow.jsx` — light token pass (no logic).
