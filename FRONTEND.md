# IdleFL — Frontend Documentation

This document describes **site-wide CSS**, **Tailwind usage**, **each routed page’s layout and copy**, and a **full breakdown of the landing page** (stats, colors, visuals, and exact feature text). Paths are relative to `IdleFL_Frontend/`.

---

## 1. Global styling (`src/index.css`)

### 1.1 Fonts

- **Primary font**: JetBrains Mono (weights 400, 500, 700), loaded from Google Fonts.
- **`body`**: `font-family: 'JetBrains Mono', monospace`, background `var(--bg)`, text `var(--text)`.

### 1.2 Theme tokens (`@theme` + `:root`)

These drive the **coral / terminal “hacker red”** look:

| Token | Value | Role |
|-------|--------|------|
| Accent | `#ff6b6b` | Primary coral — buttons, links, emphasis |
| Accent dim | `#cc3333` | Gradient end for primary buttons |
| Green | `#00ff88` | Success / CUDA-adjacent accents |
| Cyan | `#00d4ff` | Info badges, secondary highlights |
| Amber | `#ffaa00` | Warnings, infra callout accent |
| Error red | `#ff4444` | Errors, danger variant |
| Background `--bg` | `#0f0808` | Near-black warm red undertone |
| Surface `--surface` | `#1f1010` | Cards, panels |
| Surface2 `--surface2` | `#2d1515` | Nested chips / ribbons |
| Text `--text` | `#ffe8e8` | Primary readable text |
| Muted `--muted` | `#8a5555` | Secondary labels |
| Border `--border` | `rgba(255, 107, 107, 0.12)` | Default borders |
| Accent glow | `rgba(255, 107, 107, 0.15)` | Hover glows |

### 1.3 Tailwind v4

- `@import "tailwindcss"` pulls in Tailwind 4 with the above `@theme` tokens where applicable.

### 1.4 Scrollbar & selection

- Thin scrollbar (6px), thumb `rgba(255,107,107,0.3)` on `--bg` track.
- Text selection: `rgba(255,107,107,0.3)` fill.

### 1.5 Key CSS animations (defined in `index.css`)

- `pageIn`, `fadeUp`, `fadeIn`, `fadeInScale`, `blink`, `spin`, `shimmer`, `pulse-dot`, `shake`, `badge-pulse`, `pulse-red`, `dash-border`, `countUp`, `typewriter`, `slideDown`, `glow-line`.

### 1.6 Utility / component classes (site-wide)

| Class | Purpose |
|-------|---------|
| `.page-enter` | Page entrance |
| `.fade-in` / `.fade-in-scale` | Fade animations |
| `.blink` | Blinking caret aesthetic |
| `.stat-number` | Stat reveal |
| `.stagger` | Staggered children `fadeUp` |
| `.status-dot-active` | Pulsing coral dot (navbar / session) |
| `.cursor` | Fake terminal cursor `::after` |
| `.card-hover` | Card lift + coral glow on hover |
| `.scanlines` | Subtle horizontal scanline overlay (`::before`) |
| `.card` | Surface card with hover glow |
| `.glow-text` | Coral text shadow on numbers |
| `.compute-cuda` / `.compute-mps` / `.compute-cpu` | Device compute badges |
| `.progress-bar` / `.progress-bar-fill` | Thin progress track |
| `.xterm-container` | xterm.js sizing |
| `.feature-card` | Top coral accent line on hover |
| `.badge-training-pulse` | Cyan pulse for training status |
| `.btn-shimmer` | Shimmer on hover (used by `Button`) |
| `.dashed-animated` | Animated dashed coral border |
| `.demo-banner` | Amber demo strip |
| `.badge-tech-info` | Small cyan uppercase “technical” pill |
| `.infra-brief-callout` | Amber-bordered training disclaimer box |

### 1.7 `tailwind.config.js` (legacy extend)

- Extended palette includes green `#00ff88`, cyan `#00d4ff`, amber `#ffaa00`, red `#ff4444`, and alternate `bg/surface` blues (`#0a0a0f` family) — **note**: primary UI relies more on `index.css` `:root` than these extend colors.

### 1.8 App shell nuance (`src/App.jsx`)

- Routed layout wraps children in a div with `background: #0a0a0f` and `minHeight: 100vh`.
- **Landing** and **Auth** use their own `var(--bg)` (`#0f0808`), so there is a **slight possible mismatch** between the outer wrapper and page backgrounds on those routes.

---

## 2. Shared layout

### 2.1 Navbar (`src/components/layout/Navbar.jsx`)

- **Hidden** on `/` and `/auth`.
- **Height**: 56px, sticky, blurred `rgba(15,8,8,0.95)`, bottom border `rgba(255,107,107,0.18)`.
- **Logo**: `IdleFL` + blinking `_` in `#ff6b6b`.
- **Links** (when logged in): Session, Training, Terminal — active state coral bg/border; Session shows red dot if a device is `dropped`.
- **Socket indicator**: pulsing dot `#ff6b6b` when connected (“Live”), gray when offline.
- **User**: email (md+), Logout (hover `#ff4444`).

### 2.2 PageWrapper (`src/components/layout/PageWrapper.jsx`)

- Padding: `px-4 sm:px-6 lg:px-8 py-8`, `min-h-[calc(100vh-56px)]`, `fade-in`.
- **Title**: `h1` white mono; prefix **`▶`** in `#00ff88` then title text.

### 2.3 Button (`src/components/ui/Button.jsx`)

- **Primary**: gradient `135deg, #ff6b6b → #cc3333`, text `#0f0808`, coral border, hover glow.
- **Secondary**: transparent, coral text/border.
- **Danger**: `#ff4444`.
- **Ghost**: light text, subtle hover border.
- Uses `.btn-shimmer`.

---

## 3. Pages overview

| Route | File | Navbar | Summary |
|-------|------|--------|---------|
| `/` | `src/pages/LandingPage.jsx` | Hidden | Marketing home: mesh + mock terminal, video placeholder, stats, why/how, features, tech ribbon, CTA |
| `/auth` | `src/pages/AuthPage.jsx` | Hidden | Login / register card |
| `/session` | `src/pages/SessionPage.jsx` | Shown | Create/join session; devices grid; training CTA |
| `/training` | `src/pages/TrainingPage.jsx` | Shown | Dataset, model, config, devices; infra disclaimer; live training UI |
| `/terminal` | `src/pages/TerminalPage.jsx` | Shown | xterm device terminal + optional command history sidebar |

---

## 4. Landing page — detailed reference (`src/pages/LandingPage.jsx`)

Root container: `min-h-screen font-mono`, background `var(--bg)` (`#0f0808`).

### 4.1 Header

- Bottom border: `1px solid rgba(255,107,107,0.08)`.
- **Logo**: `IdleFL` + blinking `_`, `#ff6b6b`.
- **Link**: “Sign In →”, default `#8a5555`, hover `#ff6b6b`.

### 4.2 Hero section

- **Classes**: `scanlines`, `min-h-[92vh]`, horizontal padding, flex centered vertically.
- **Radial glow** (absolute): ellipse at ~15% 50%, `rgba(255,107,107,0.06)` fading out.
- **Layout**: column on small screens; `lg:flex-row` — copy left, visuals right.

#### Left column (copy)

1. **Pill badge**  
   - Text: **“Federated coordination · peer worker mesh”**  
   - Style: `text-xs`, `#ff6b6b`, border `rgba(255,107,107,0.3)`, bg `rgba(255,107,107,0.05)`.

2. **`h1`**  
   - **“Idle”** in `#ff6b6b`, **“FL”** in white.  
   - `font-mono`, responsive `clamp(52px, 8vw, 84px)`, text shadow `0 0 40px rgba(255,107,107,0.2)`.

3. **Primary subtitle** (`#ffe8e8`):  
   **“Train one global model from many machines — orchestrated rounds, FedAvg merges, live worker telemetry.”**

4. **Secondary subtitle** (`#8a5555`):  
   **“Engineering-led FL stack: sovereign data stays local; idle GPUs and CPUs donate epochs instead of raw datasets.”**

5. **CTAs**  
   - **Get Started →**: gradient `#ff6b6b → #cc3333`, text `#0f0808`, hover box-shadow coral.  
   - **View Architecture**: outline coral, anchor `#how-it-works`, hover border + glow.

#### Right column (visuals)

**A. Live Network Mesh (`LiveNetworkMesh`)**

- Outer frame: bg `#080404`, border `rgba(255,107,107,0.2)`, inset shadow, **aspect ratio 1:1**, min height 260px, max width 420px.
- **Label** (overlay): **“Live mesh · coordinator plane”** — `text-[10px]` mono, `rgba(255,107,107,0.5)`.
- **Canvas**: 9 nodes at normalized positions, edges between pairs; background grid `rgba(255,107,107,0.07)`; edges pulse alpha/width; nodes pulse radius + outer glow; stroke `rgba(255,232,232,0.85)` on node rim.

**B. Mock Training Terminal (`MockTrainingTerminal`)**

- Window chrome: traffic lights `#ff5f57`, `#febc2e`, `#28c840`; title bar bg `rgba(255,107,107,0.05)`, bottom border `rgba(255,107,107,0.1)`.
- **Chrome title**: **“idlefl-coordinator — mock training log”** (`#8a5555`, `text-[10px]`).
- Body: bg `#080404`, border coral 20%, shadow.
- **Header line** (gray `#444`): **`┌─ Coordinator trace (demo) ─────────────┐`**
- **Lines** (appear sequentially; loop ~9.2s):

  | Delay (s) | Text | Line color |
  |-----------|------|------------|
  | 0.0 | `[coord] Aggregator online · session FL-4829` | `#00d4ff` |
  | 0.45 | `[mesh] Node LAB-03 connected · RTX 3060 (CUDA)` | `#00ff88` |
  | 0.95 | `[mesh] Node LAB-07 connected · Apple M2 (MPS)` | `#00ff88` |
  | 1.45 | `[shard] Partitioned dataset · N=12,400 across 2 workers` | `#ffe8e8` |
  | 2.0 | *(blank)* | — |
  | 2.35 | `[round] k=2 · local SGD complete · uploading weights (4.2 KB)` | `#ff6b6b` |
  | 3.05 | `[fedavg] Weights aggregated · global model v0.2 broadcast` | `#00ff88` |
  | 3.65 | `[coord] Round 3/10 dispatched · heartbeat OK` | `#8a5555` |
  | 4.25 | `[fault] LAB-07 missed ping · shard reassigned to LAB-03` | `#ffaa00` |
  | 5.0 | `[fedavg] Catch-up merge complete · training resumed` | `#00ff88` |
  | 5.65 | `[●] Listening for next round...` | `#ff6b6b` |

- **Prompt**: `$` + blinking `_` in `#ff6b6b`.

### 4.3 “See it in action”

- **Heading**: **“See it in action”** (`text-2xl`, white, `font-mono`).
- **Sub**: **“A real training run — two laptops, MNIST dataset, 10 rounds”** (`#8a5555`).
- **Embed**: 16:9 frame, border `rgba(255,107,107,0.15)`, bg `#080404`, YouTube iframe placeholder URL `https://www.youtube.com/embed/YOUR_VIDEO_ID`.

### 4.4 Stats bar

- Section: `var(--surface)` bg, top/bottom `var(--border)`.
- **Grid**: 2 cols mobile, 4 cols `md+`.

**Exact stat rows** (`STATS`):

| Icon | Value shown | Label | Extra |
|------|-------------|-------|--------|
| ⚡ | `—` | Training Speedup | Subtext: **“benchmark pending”** |
| 🔒 | `0 bytes` | Raw Data Sent | — |
| 🎯 | `—` | CNN Accuracy (MNIST) | **“benchmark pending”** |
| 🛡️ | `90s` | Max Fault Detection | — |

- Numbers use `.glow-text`, color `#ff6b6b`, animate in on intersection (opacity + slide).
- Footer line: **“Benchmarks coming soon”** — `text-[10px] mono`, `rgba(255,107,107,0.35)`.

### 4.5 Why / How (`#how-it-works`)

- Section bg: vertical gradient `var(--bg) → var(--surface) → var(--bg)`.

**Eyebrow**: **“Principles · then mechanics”** — uppercase, tracking, `rgba(255,107,107,0.45)`.

**Main heading**: **“Why federated learning, engineered here”**

**Intro line**: **“Recruiters see tooling clarity: IdleFL foregrounds governance and footprint before listing workflow steps.”**

#### Why pillars (two cards)

1. **Tag**: **“Why · Data sovereignty”** (`#ff6b6b`)  
   **Icon**: `◇` (`rgba(255,107,107,0.5)`)  
   **Title**: **“Privacy without caveats”**  
   **Body**: **“Training stays on hardware you control. Indexed rows and labels never cross the wire — only compact weight tensors participate in aggregation, so collaborators improve one model without pooling sensitive raw data.”**

2. **Tag**: **“Why · Resource sustainability”**  
   **Icon**: `⌁`  
   **Title**: **“Idle GPUs as infrastructure”**  
   **Body**: **“Laptops and workstations spend most of their time idle. IdleFL routes shards to available CUDA / MPS / CPU workers so spare cycles become federated capacity instead of burning extra cloud GPU hours.”**

Card chrome: `var(--surface)`, `var(--border)`, subtle inner coral outline.

#### Coordinator flow (three steps)

**Subheading**: **“Coordinator flow”** (explicit color `#ffe8e8` on heading element)

| # | Title | Description |
|---|--------|-------------|
| 01 | Partition & assign | Coordinator shards metadata and assigns work using device scoring — still without exposing raw samples. |
| 02 | Train locally | Each node runs SGD on its shard; checkpoints and heartbeats stream over WebSockets for observability. |
| 03 | FedAvg merge | Weighted averages combine updates each round; stragglers time out and shards fail over to healthy nodes. |

Step cards: bg `rgba(255,107,107,0.05)`, border `rgba(255,107,107,0.18)`.

### 4.6 Features grid

- Section bg: **`#0c0607`** (slightly lifted from pure `--bg`).
- **Heading**: **“Features”**

**Exact six features** (`FEATURES`):

| Icon | Title | Description |
|------|-------|-------------|
| ⚖️ | FedAvg Aggregation | Production-grade federated averaging merges independently trained weights into a unified global model each round. |
| 🛡️ | Fault Tolerance | Device drops are detected within 90s. Training continues without the straggler; rejoining is seamless. |
| 📊 | Real-time Dashboard | Live loss curves, accuracy, round progress, and per-device GPU/CPU stats via WebSocket. |
| 🔒 | Privacy by Design | Raw training data never leaves each device. Only gradient updates are transmitted. |
| 🖥️ | Remote Terminal | SSH-like xterm.js terminal into any connected device directly from the browser. |
| 🏆 | Device Scoring | Intelligent scoring balances CPU, RAM, reliability, and active tasks for optimal shard allocation. |

- Cards: `.feature-card.card-hover`, `var(--surface)`, `var(--border)`, icon tile bg `var(--accent-glow)`; titles `font-mono` white; body `#8a5555`.

### 4.7 Tech stack ribbon

- **Heading**: **“Tech stack ribbon”**
- **Sub**: **“Grouped by responsibility — real-time plane, numerical compute, and application core.”**

| Group label | Chips |
|-------------|--------|
| Real-time | Socket.IO, Redis |
| Compute | PyTorch, NumPy |
| Core | Node.js, React |

- Group panels: `var(--surface)` / `var(--border)`; labels uppercase coral `#ff6b6b`; chips `var(--surface2)`, coral hover border/glow.

### 4.8 Final CTA

- Bg `var(--surface)`, top border `var(--border)`.
- **Heading**: **“Start a session in ”** + **“60 seconds.”** (seconds in `#ff6b6b`).
- **Line**: **“No infrastructure. No cloud bill. Just laptops.”**
- Button: **“Get Started →”** — same primary gradient as hero.

### 4.9 Footer

- Text: **“IdleFL — Distributed Federated Learning · Built for Hackers”**
- Color `#4a2a2a`, top border `rgba(255,107,107,0.06)`.

---

## 5. Other pages — appearance & content

### 5.1 Auth (`/auth`)

- Full viewport centered; `var(--bg)`.
- Logo link to `/`: `IdleFL` + `_`, tagline **“Distributed Federated Learning”** (`#4a2a2a`).
- Card: `var(--surface)`, `var(--border)`, coral shadow.
- Tabs: **“→ Login”** / **“+ Register”** — active coral tint.
- After register success: **“Account Created!”**, User ID `CopyBox`, amber warning **“⚠ Save this — it's how devices identify you.”**, button **“Continue to Session →”**.
- Form errors: red mono box.
- Footer link: **“← Back to home”**.

### 5.2 Session (`/session`)

- **PageWrapper title**: `Session`.
- **No session**: centered card **“Start a Federated Session”**, **“+ Create New Session”**, divider **“or”**, join field placeholder **“FL-XXXX”**, **“Join Session →”**.
- **Active session**: optional coral banner **“SESSION CREATED — share this code with friends”** + large session code + copy button.
- Status strip: `.status-dot-active`, shows session code, device count, **“Ready to train”** (green) or **“No GPU detected”** (amber).
- Columns: `SessionInfo`, `ScriptDownload`; grid of `DeviceCard` + dashed **“Waiting for next device…”** placeholder.
- Bottom: **“Start Training →”** (disabled if no devices); may show **“⚠ No GPU device”**.
- **WarningBanner** if majority CPU-only devices.

### 5.3 Training (`/training`)

- **Idle / setup**: panels **“1. Upload Dataset”**, **“2. Select Model”** (+ **`InfrastructureBrief`** below model selector), **“ConfigPanel”**; right rail devices list or **EmptyDevicesGuide** (numbered steps referencing Session).
- **`InfrastructureBrief`**: badge **“Technical Info”** (`.badge-tech-info`); paragraph begins **“Technical Note:”** then explains free-tier latency for CNN weight transfers and recommends tabular models for demos. Repeated in sticky bar on **`lg+`** next to **“▶ Start Training”**.
- **Sticky bar** (when dataset ready): coral top border, blur dark bg; status line **“✓ Dataset ready · …”**.
- **In progress**: **“Training — In Progress”**, `RoundFlash` **“⚡ FedAvg Round N complete”**, abort, `RoundProgress`, `LossGraph`, `DeviceContribution`, live devices.
- **Complete**: metrics cards, download buttons, PDF export note **“JSON format — importable via numpy/PyTorch”**.
- Uses `WarningBanner`, coral/amber patterns consistent with theme.

### 5.4 Terminal (`/terminal`)

- **No session**: centered **“>_”** watermark, **“No active session”**, **“Start a session before accessing the terminal.”**, **“→ Go to Session”** primary button.
- **With session**: height `calc(100vh - 56px)`; top chrome traffic lights; `DeviceSelector`; **Clear** / **History** toggles; main `TerminalEmulator` or empty state **“Select a device to open terminal”** with blink block.
- Sidebar: `CommandHistory` when open.
- **Footer status bar**: **“● WS Connected”** / **“○ WS Disconnected”**, device name, latency coloring (green / amber / red); right text **“Commands are whitelisted. No shell injection possible.”**

---

## 6. Color combination summary

- **Dominant**: near-black warm background `#0f0808`, coral accent `#ff6b6b`, muted rose-brown `#8a5555`, light text `#ffe8e8`.
- **Semantics**: green `#00ff88` (success / GPU ready), cyan `#00d4ff` (info / coordinator lines), amber `#ffaa00` (warnings / infra note), red `#ff4444` (errors).
- **Depth**: `#080404` for terminal/video frames; `#0c0607` features band; gradients on CTAs `#ff6b6b → #cc3333`.

---

## 7. Source file map

| Concern | Primary files |
|---------|----------------|
| Global CSS | `src/index.css` |
| Tailwind config | `tailwind.config.js` |
| Routing & shell | `src/App.jsx` |
| Landing | `src/pages/LandingPage.jsx` |
| Auth | `src/pages/AuthPage.jsx` |
| Session | `src/pages/SessionPage.jsx` |
| Training | `src/pages/TrainingPage.jsx` |
| Terminal | `src/pages/TerminalPage.jsx` |
| Chrome | `src/components/layout/Navbar.jsx`, `PageWrapper.jsx` |
| Buttons | `src/components/ui/Button.jsx` |

---

*Generated from the codebase as of the documented file contents; update this file when UI copy or styles change.*
