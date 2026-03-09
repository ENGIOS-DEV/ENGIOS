<div align="center">

<img src="src/assets/icons/ENGIOS_logo_text.png" alt="ENGIOS Logo" width="120" />

# ENGIOS
### Engineered Intelligent OS

*Because machines deserve to live longer too.*

[![Debian](https://img.shields.io/badge/Base-Debian%2013-A81D33?style=flat-square&logo=debian)](https://www.debian.org/)
[![Electron](https://img.shields.io/badge/Shell-Electron-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/UI-React%2018-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## What Is ENGIOS?

ENGIOS is a next-generation Linux-based operating system built around one founding principle:

> **The computer works for the human. Not the other way around.**

It is intelligent, modular, sustainable, and private by architecture. It extends the life of hardware that the industry has declared obsolete — not because that hardware is incapable, but because it lacks an arbitrary chip or falls outside an artificial generation cutoff.

ENGIOS is being developed and tested on a donated 2017 HP Pavilion 250 G6 — a machine Microsoft abandoned for Windows 11. It runs beautifully on 379MB of RAM. That is not a compromise. That is a statement.

---

## The Mission

The technology industry has a disposal problem. Millions of capable machines are discarded every year — not because they are broken, but because software has been engineered to outgrow them. ENGIOS is a direct response to that.

**Hardware longevity is not optional. It is a founding principle.**

A machine that works should keep working. An OS that respects the hardware it runs on, respects the person who owns it, and respects the planet it exists on — that is what ENGIOS is.

---

## AIDA — The Intelligence Layer

ENGIOS ships with AIDA: a kernel-adjacent intelligence woven into the OS. Not an app. Not a chatbot. A custodian of your hardware and a silent co-pilot for your workflow.

> *"A custodian of your hardware — not a CEO of your life."*
> — ENGIOS Design Law №7

AIDA watches your resources, learns your habits, and surfaces what you need before you reach for it. Everything it learns lives on your machine. Nothing leaves without your instruction. It offers — never orders.

**AIDA's operational boundaries are absolute:**
- Online access — update events only, initiated by ENGIOS, never by the model
- Task scope — defined and bounded by ENGIOS, never self-expanding
- Capability upgrades — triggered by hardware or edition changes only

> *"The AI serves within boundaries we set. Not boundaries it sets for itself."*
> — ENGIOS Design Law №15

---

## Four Editions. One Core.

All editions share a single hardened core — same kernel, same security model, same driver stack. Tier-specific capabilities layer on top. Users migrate between editions without reinstalling.

| Edition | Target | Positioning |
|---|---|---|
| **Personal** | Everyday users | Calm, simple, capable. *~ relief ~* |
| **Gaming** | Performance users | GPU-optimised. Controller-ready. *~ freedom ~* |
| **Productivity** | Developers & creators | Power tools, deep workflow |
| **Enterprise** | Businesses | LTS, managed, auditable, compliant. *~ confidence ~* |

---

## Privacy by Architecture

Privacy in ENGIOS is not a setting you enable. It is the default state of the entire system.

| Principle | Implementation |
|---|---|
| Local AI inference | Queries never leave your machine |
| Contained sessions | History goes nowhere by default |
| No telemetry | No data collection. No exceptions |
| Local credential storage | Passwords on your device only |
| No third parties | Not a spy. Not a profile. Not a product |

> *"Your privacy is never a fair exchange."*
> — ENGIOS Design Law №6

---

## What ENGIOS Delivers

### The Productivity Bar
One unified input surface replaces three separate applications. Type anything — find a file, ask AIDA a question, search the web, set a reminder. The system silently routes intent to the right capability. No mode switching. No app launching. No friction.

### AIDA Chat
A persistent, locally-stored conversation layer. Full chat history with folder organisation, search, and pinned conversations — all backed by SQLite on your machine. Streaming responses via local inference. Nothing in the cloud.

### The Integrated Explorer
A three-pane file explorer with resizable panels. Left: folder hierarchy. Centre: live adaptive workspace. Right: directory contents. Every pane adjustable to how you work.

### System Monitor
Live performance rings — CPU, RAM, GPU, DISK, TEMP, NETWORK, BATTERY. Positioned anywhere on screen. Always present, never intrusive.

### Clock & Weather Widget
Floating, draggable, fully configurable. Live weather via Open-Meteo — no API key, no account, no tracking.

### Menu Bar
A pull-down panel with quick actions, today's schedule, notifications, and system controls. Auto-hides. Fully transparent. Blends with any wallpaper.

---

## The Test Machine

ENGIOS is developed and tested on a **donated HP Pavilion 250 G6 (2017)**.

| Spec | Detail |
|---|---|
| Processor | Intel Core i5-7200U — 2 cores / 4 threads |
| RAM | 8GB |
| Storage | 256GB SSD |
| Graphics | Intel HD Graphics 620 |
| Windows 11 eligible | **No** — abandoned by Microsoft |
| ENGIOS eligible | **Yes** — runs beautifully |

This machine represents millions like it. If ENGIOS runs beautifully here, it runs beautifully everywhere that matters.

---

## Technical Foundation

| Layer | Technology | Reason |
|---|---|---|
| OS Base | Debian 13 (Trixie) — stable, amd64 | Community governed since 1993. Social Contract. No corporate owner |
| AI Runtime | Ollama | Local inference. No phone home. Fully controllable |
| AI Model (Personal) | Microsoft Phi-3 Mini 3.8B (4-bit GGUF) | Designed for edge devices. Exceptional reasoning on constrained hardware |
| AI Model (Performance) | Mistral 7B / Llama 3.1 8B | Mid to high range hardware |
| AI Model (Enterprise) | Llama 3.1 70B quantised | Server grade hardware |
| Desktop Shell | Electron (transitional) | AIDA codebase already proven. Native Wayland compositor is the long-term goal |
| UI | React 18 + TypeScript + Vite | |
| Database | SQLite via better-sqlite3 | Local. Private. No server |
| Styling | Tailwind CSS + inline styles | |

> *"The intelligence adapts to the hardware. Not the other way around."*
> — ENGIOS Design Law №14

---

## The Design Laws

Every decision in ENGIOS is governed by these principles:

| # | Law |
|---|---|
| 1 | The computer works for the human. Not the other way around. |
| 2 | Privacy is not a feature. It is the default state of the entire system. |
| 3 | Hardware longevity is not optional. It is a founding principle. |
| 4 | Sovereignty is not a mode you activate. It is permanent. |
| 5 | Traditionally, operating systems have asked you to adapt. ENGIOS adapts to you. |
| 6 | Your privacy is never a fair exchange. |
| 7 | A custodian of your hardware — not a CEO of your life. |
| 8 | Because one shouldn't need to beg. |
| 9 | Never point fingers. Never shame. Simply do the job better. |
| 10 | If it's not necessary for OS or app operations, it does not belong on the system. |
| 11 | What you install is your business. What you leave behind is ours. |
| 12 | The measure of a system's intelligence is how rarely it makes the user feel like a beginner. |
| 13 | Build on principles, not on compromises. |
| 14 | The intelligence adapts to the hardware. Not the other way around. |
| 15 | The AI serves within boundaries we set. Not boundaries it sets for itself. |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher
- [Ollama](https://ollama.com/) running locally (for AIDA)

### Installation

```bash
# Clone the repository
git clone https://github.com/ENGIOS-DEV/ENGIOS.git
cd ENGIOS

# Install dependencies
npm install --legacy-peer-deps

# Start in development mode
npm run dev
```

### Running as Electron App

```bash
# Terminal 1 — Vite dev server
npm run dev

# Terminal 2 — Electron
npx electron electron.cjs
```

### Building for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
ENGIOS/
├── electron.cjs                  # Electron main process + IPC handlers
├── preload.cjs                   # Secure IPC bridge
├── database.cjs                  # SQLite schema — notes, tasks, events, chat
├── src/
│   ├── App.tsx                   # Root component & state orchestration
│   ├── zIndex.ts                 # Centralised z-index layer system
│   ├── components/
│   │   ├── MenuBar.tsx           # Pull-down menu panel
│   │   ├── MenuBarHandle.tsx     # Trigger handle
│   │   ├── ProductivityBar.tsx   # Unified input — search, AI, files, chats
│   │   ├── AidaChat.tsx          # AIDA conversation interface
│   │   ├── FileExplorer.tsx      # Three-pane file explorer
│   │   ├── Terminal.tsx          # Embedded terminal
│   │   ├── ClockWeatherWidget.tsx
│   │   ├── SystemMonitor.tsx
│   │   ├── GlobalSettings.tsx
│   │   └── SettingsShell.tsx
│   ├── helpers/
│   │   └── aiProvider.ts         # Ollama streaming interface
│   ├── services/
│   │   ├── fileSearchService.ts
│   │   └── notificationService.ts
│   └── types/
│       └── settings.ts
```

---

## Roadmap

Built carefully. Features ship when they are right, not when they are rushed.

### Near Term
- [ ] First AIDA conversation on physical hardware — THE milestone
- [ ] AIDA boot greeting — contextual, time-aware
- [ ] Plymouth boot splash — ENGIOS grid background
- [ ] GiG (Get it Gone) — system-level uninstall cleanup
- [ ] Productivity Bar — notes and task quick-capture

### Medium Term
- [ ] Native Wayland compositor — replace Electron shell
- [ ] AIDA proactive suggestions — schedule and context aware
- [ ] Multi-monitor support
- [ ] Calendar integration
- [ ] Packaged installer

### Longer Term
- [ ] ENGIOS Personal edition — first public release
- [ ] Gaming edition — GPU optimisation layer
- [ ] Enterprise edition — audit, compliance, managed deployment
- [ ] Hardware compatibility database

---

## Contributing

Contributions are welcome. Please open an issue before submitting a pull request — this keeps the codebase intentional rather than accumulated.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit clearly: `git commit -m "feat: description"`
4. Push and open a pull request against `main`

Code style: TypeScript strict mode · inline styles for dynamic values · components under 200 lines where possible · `apt purge` not `apt remove`.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

*ENGIOS — Engineered Intelligent OS · [engios.dev](https://engios.dev)*

**Sovereignty. Restored.**

</div>
