# UI Rebrand — Circuit-Board Console

**Date:** 2026-06-22
**Status:** Approved (direction)
**Scope:** Visual layer only — `src/components/Dashboard.jsx`, `src/components/ConfirmModal.jsx`. No logic, state, workers, or layout structure changes.

## Problem

The dashboard reads as "AI slop": graffiti font (`Permanent Marker`) on the title, decorative `rotate-3` / `-skew-x-6` transforms, a per-button rainbow (indigo / amber / rose / fuchsia / cyan / teal / emerald — every module a different hue), decorative glow shadows on static elements, and a `v4.4 • JustGL & Gemini` credit. None of it matches the app's own brand icon, which is a **circuit-board monster (electric green `#00FF66` + cyan glow `#00FFFF` on pure black) eating a RAM stick**.

## Goal

Make the UI look like the monster that's eating your hardware. Strip decoration; make every visual choice map back to the icon. Glow stops being decoration and becomes a **status signal**: dim green = idle, bright green + cyan halo = actively burning.

## Design

### Color system

Tokens (use as literal Tailwind classes / inline values; no theme extension needed for v1):

| Token      | Hex       | Use                                                        |
|------------|-----------|------------------------------------------------------------|
| base       | `#000000` | page background                                            |
| panel      | `#0a0d0a` | card / module backgrounds                                  |
| border     | `#1a261a` | subtle green-tinted borders                                |
| border-on  | `#00FF66` | active/selected borders (with low opacity fill)            |
| text       | `#e5e5e5` | primary text                                               |
| muted      | `#5a7a5a` | labels, hints, secondary text                              |
| accent     | `#00FF66` | primary actions, active state — the monster green          |
| energy     | `#00FFFF` | running/active data, "feeding" glow — matches icon eyes    |
| danger     | `#ff3a3a` | stop / destructive only                                    |

Rationale: one green everywhere replaces the rainbow. Cyan marks "this subsystem is currently burning." Red is reserved so destructive actions stay obvious.

### What gets removed (the slop)

- `<style>` block importing `Permanent Marker` font + `.font-graffiti` class → **deleted entirely**.
- Title skew: `transform -skew-x-6` → removed.
- Logo container rotation: `transform rotate-3` → removed.
- `v4.4 • JustGL & Gemini` credit → removed from header.
- Decorative glow shadows on static buttons/elements (e.g. `shadow-[0_0_10px_rgba(245,158,11,0.5)]`) → removed unless the element represents an active/burning state.
- Per-module accent colors (Storage amber, GPU teal, Network cyan, Benchmarks indigo/rose) → all replaced by the green/cyan/red system above.

### Surfaces

**Header**
- Wordmark `RAMEATER` in mono uppercase, tracked (`tracking-[0.3em]`), white. Replaces graffiti title.
- Monster icon: keep the existing `Icons.Layers` icon in its container, but recolor the container to the green-tint system and **remove the `transform rotate-3`**. No icon swap.
- **Status LED** (new element, pure presentation — derives from existing state, adds no new state): a dot + label.
  - `● IDLE` — dim green dot (`bg-green-600/40`)
  - `● FEEDING` — bright green dot + cyan halo (`bg-[#00FF66] shadow-[0_0_8px_#00FFFF]`) — shown when *any* of: `isAllocating`, `isFillingStorage`, `gpuActive`, `netActive`, `vramActive`, `isBenchmarking`, `gpuBenchMode !== 'NONE'` is true.
  - `● ERROR` — red dot — shown when `error` is truthy (and no active burn).

**Tabs** (RAM & CPU / Storage / GPU Stress)
- Active: green text + green underline (`border-b-2 border-[#00FF66] text-[#00FF66]`).
- Inactive: muted text (`text-[#5a7a5a]`), no fill, hover → green text.
- Removes `bg-slate-800` fill on active.

**Charts** (`SimpleChart` is used via props; the inline `color` prop is the lever)
- RAM chart: `color="#00FF66"` (was `#6366f1`).
- Storage chart: `color="#00FF66"` when idle/`#00FFFF` when `isFillingStorage` (was `#f59e0b`).
- (Chart component internals not modified — only the `color` prop values passed in.)

**Buttons — global rules**
- Primary / start: `bg-[#00FF66] hover:brightness-110 text-black font-bold`.
- Stop / kill / destructive: `bg-[#ff3a3a]/90 hover:bg-[#ff3a3a] text-white` — applies to STOP PROCESS, STOP FILL, KILL ALL, EMERGENCY RESET confirm, network stop, VRAM stop, bench stop.
- Secondary / neutral: `bg-transparent border border-[#1a261a] text-[#5a7a5a] hover:border-[#00FF66]/40 hover:text-[#00FF66]`.
- Active-state toggle buttons (e.g. the manual "SHADER TEST" / "MANUAL STOP", the start/stop pairs): follow the primary vs stop rules above depending on the action the button performs.

**Mode pills / segmented selectors** (STANDARD / HASH / MINIONS, LINEAR / CHAOS / WASM, FRACTAL / 3D / FIRE, CPU / GPU bench tabs)
- Selected: `border border-[#00FF66]/50 bg-[#00FF66]/10 text-[#00FF66]`.
- Unselected: `border border-[#1a261a] bg-transparent text-[#5a7a5a] hover:text-[#00FF66]`.
- Removes the per-pill distinct colors (amber for HASH, rose for MINIONS, fuchsia for CHAOS, etc.). One system for all.

**Stat numbers / readouts** (Storage `MB Written`, Network speed/total, bench scores, VRAM eaten, minion counts)
- Numeric value in `text-[#00FF66] font-mono`.
- When the related subsystem is actively running, value color → `text-[#00FFFF]`.
- Unit/label in `text-[#5a7a5a]`.

**Sliders** (`accent-indigo-500` / `accent-orange-500` / `accent-rose-500` / `accent-emerald-500` / `accent-teal-500` / `accent-red-500` / `accent-amber-500`)
- All → `accent-[#00FF66]`. One track color.

**GPU overlay / popup & bench-results modal** (inline in Dashboard)
- Popup: keep `bg-black/95`, change `border-slate-800` → `border-[#1a261a]`, bench HUD text accents green/cyan instead of indigo.
- Bench-results modal: `border-2 border-[#00FF66]`, score in green (`text-[#00FF66]`), per-row points green, "CLOSE" button primary-green.
- "READY TO BURN" placeholder text → `text-[#00FF66]/30`.
- FPS readout (`text-green-400`) → `text-[#00FF66]` — already close, just align hex.

**ConfirmModal** (`src/components/ConfirmModal.jsx`)
- Border `border-2 border-red-500` → `border-2 border-[#ff3a3a]`.
- Alert icon `text-red-500` → `text-[#ff3a3a]` (keep `animate-pulse` — it's a warning, earned).
- Title stays white uppercase mono — fine.
- Cancel button → neutral rule (transparent, green-tinted border, muted text, green hover).
- Confirm button → danger rule (`bg-[#ff3a3a]`), keep a subtle red glow here only (`shadow-[0_0_12px_rgba(255,58,58,0.35)]`) — it's a destructive confirmation, the glow is earned.
- Glow shadow on the card itself (`shadow-[0_0_20px_rgba(239,68,68,0.3)]`) → **drop entirely**. The `border-2 border-[#ff3a3a]` + pulsing icon already carry the warning; the card glow is decoration.

**Logs panel**
- Already `bg-black/50 font-mono`. Keep. Error lines already red — align to `text-[#ff3a3a]`. Info lines → `text-[#5a7a5a]` dim, or keep current `text-slate-300`. "System Ready..." placeholder → `text-[#00FF66]/40`.
- Adds a `>` prefix to each log line for terminal feel (presentation only, applied in the render of `logs.map`).

### Status LED — derivation logic

The LED is **pure presentation** derived from existing state; it introduces **no new state variable and no new effect**. Computed inline in render:

```
const anyActive = isAllocating || isFillingStorage || gpuActive || netActive ||
                  vramActive || isBenchmarking || gpuBenchMode !== 'NONE';
const ledState = error ? 'error' : anyActive ? 'feeding' : 'idle';
```

Rendered as a dot + uppercase label. No new `useEffect`, no new interval.

### Layout structure

**Unchanged.** Same grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`), same four columns, same bottom row, same header row, same tabbed chart panel. Only `className` strings and the `<style>` block change. Component composition, the worker logic, the state machine, the modals' behavior — all identical.

## Out of scope (explicitly)

- No changes to `ramWorker.js`, `networkWorker.js`, `storageWorker.js`.
- No changes to `SimpleChart.jsx`, `GpuCanvas.jsx`, `MinionWindow.jsx`, `ErrorBoundary.jsx` internals. (Chart gets new `color` prop values only.)
- No new dependencies. No Tailwind theme extension in v1 (literal hex classes are fine and keep the diff localized).
- No copy/wording changes to button labels other than the header credit removal (the mode names like "HASH STRESS", "MINIONS", "CHAOS" stay — they describe functions, not decoration).
- No favicon/icon rework (brand icon already correct).
- `App.css` leftover Vite template styles (`.logo`, `logo-spin`) — leave untouched; not loaded by Dashboard.

## Files changed

1. `src/components/Dashboard.jsx` — replace the `<style>` graffiti import; replace all `bg-slate-*`, `border-slate-*`, per-module color, `accent-*`, glow-shadow, and transform classes with the token system above; add the status LED derivation + element; align chart `color` props.
2. `src/components/ConfirmModal.jsx` — align border/icon/button to danger + neutral rules.

## Risks & verification

- **Risk:** mass className rewrite could introduce a typo that breaks Tailwind JIT (class silently absent). **Mitigation:** run `npm run build` after; Tailwind warns on nothing but missing classes just render unstyled — eyeball the dev server. Acceptance check: every interactive element visibly has one of {green primary, red destructive, neutral outline}.
- **Risk:** changing chart `color` prop — confirm `SimpleChart` passes it through to the stroke style. **Mitigation:** read `SimpleChart.jsx` before the change; if it hardcodes, adjust the prop usage accordingly.
- **Acceptance:** `npm run build` succeeds; visual diff on dev server shows no slate-blue/indigo remaining, no graffiti font, no skewed/rotated header, status LED reflects burn state.
