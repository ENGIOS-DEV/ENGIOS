<div align="center">

<img src="src/assets/icons/system/aida_logo_text.png" width="300" alt="AIDA Logo" />

# Artificially Intelligent Desktop Assistant

### The intelligence layer of ENGIOS.

[![Electron](https://img.shields.io/badge/Electron-v40-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Ollama](https://img.shields.io/badge/AI-Ollama%20%2B%20Phi--3%20Mini-000000?style=flat-square)](https://ollama.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=flat-square&logo=sqlite)](https://www.sqlite.org/)
[![Status: Active Development](https://img.shields.io/badge/Status-Active%20Development-29ABE2?style=flat-square)]()

</div>

---

## What Is AIDA?

AIDA is not an app. It is not a chatbot. It is the intelligence layer woven into ENGIOS — a kernel-adjacent custodian of your hardware and a silent co-pilot for your workflow.

> *"A custodian of your hardware — not a CEO of your life."*
> — ENGIOS Design Law №7

Everything AIDA learns lives on your machine. Nothing leaves without your instruction. It offers — never orders. It is a system that understands context, anticipates needs, and works alongside you as a partner — not as a product.

**This is where active development is happening.**

---

## Architecture

AIDA is built with Electron + React + TypeScript, running on top of the [ENGIOS OS backbone](../os/). It communicates with a local Ollama instance for AI inference — no cloud, no API keys, no third parties.

```
AIDA Architecture
─────────────────────────────────────────────────────────

  LAYER 1  OS / Electron    — main process, IPC routing, OS access
  LAYER 2  Bridge           — preload.cjs, controlled renderer API
  LAYER 3  Global System    — tokens, palette, typography, motion
  LAYER 4  Theme/Convention — style specifications per surface type
  LAYER 5  Components       — pure UI consumers, zero raw styles
  LAYER 6  Data             — SQLite via better-sqlite3, no localStorage

─────────────────────────────────────────────────────────
  AI: Ollama → phi3mini:latest → local inference only
  DB: SQLite → on-device → nothing persisted to cloud
```

Every architectural decision is documented in [`BLUEPRINT.md`](BLUEPRINT.md).

---

## What Works Right Now

### AIDA Chat
A fully functional private AI conversation interface.

- Streaming responses from `phi3mini:latest` via local Ollama
- Full conversation persistence — every chat saved to SQLite
- Collapsible sidebar with Projects and Chats sections
- **Projects** — create folders, assign chats, archive to `.aida-archive`, delete
- **Drag and drop** chats into project folders
- **Right-click context menus** on folders and chats
- **Search** across all conversations — titles and message content
- Live system data injection — AIDA knows your hardware when you ask

### AIDA System Awareness
When you ask AIDA about your system, it fetches live data — on demand, never in background:

- CPU load, temperature, core count
- RAM usage and availability
- GPU model and VRAM
- Disk drives, used and free space
- Running processes by CPU usage
- OS version, kernel, hostname, uptime

All fetched locally via `systeminformation`. Nothing leaves the machine.

### Productivity Bar
One unified input surface — type anything, AIDA routes it:

- File search across your home directory
- AI conversation trigger (`@` prefix → opens AIDA Chat)
- Live search results with scrollbar

### Menu Bar
A pull-down panel with quick actions, system controls, and notifications. Auto-hides. Transparent. Always available.

- App launchers
- Quick settings (theme, accent colour, transparency, font size)
- Toast notification system — reminders, overdue tasks, system alerts
- Productivity Bar integrated

### Tasks
A full task management app:

- Create, edit, complete, delete tasks
- Due dates, times, priorities, recurrence
- Folder organisation
- Reminder system — fires toasts before due time
- Overdue notification system

### File Decks
A three-pane file explorer:

- Folder hierarchy navigation
- File preview and media playback
- Resizable panels

### System Monitor Widget
Live performance rings — CPU, RAM, GPU, DISK, TEMP, NETWORK, BATTERY.

### Clock & Weather Widget
Floating, draggable, configurable. Live weather via Open-Meteo — no API key, no account, no tracking.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Electron v40 |
| UI framework | React 18 + TypeScript |
| Build tool | Vite 7 |
| Database | SQLite via better-sqlite3 |
| AI runtime | Ollama (local) |
| AI model | phi3mini:latest (Phi-3 Mini 3.8B, 4-bit quantised) |
| System info | systeminformation |
| Icons | lucide-react |
| Dev port | 5390 |

---

## Running AIDA

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Ollama](https://ollama.com/) running locally
- Phi-3 Mini pulled: `ollama pull phi3mini:latest`

### Development

```bash
# Install dependencies
npm install

# Terminal 1 — Vite dev server
npm run dev

# Terminal 2 — Electron
npx electron electron/main.cjs
```

AIDA runs on port `5390` in development.

### Production Build

```bash
npm run build
```

---

## Project Structure

```
aida/
├── BLUEPRINT.md                  ← Architectural law. Read this first.
├── electron/
│   ├── main.cjs                  ← App lifecycle, IPC routing
│   ├── registry.cjs              ← Window registry
│   ├── ipc/
│   │   ├── database.cjs          ← All DB IPC handlers
│   │   ├── settings.cjs          ← Settings broadcast
│   │   ├── windows.cjs           ← Window show/hide/toggle
│   │   ├── filesystem.cjs        ← File ops, project archive
│   │   └── system.cjs            ← Live system data (on-demand)
│   ├── windows/
│   │   ├── apps.cjs              ← App window factory
│   │   ├── panels.cjs            ← Panel window factory
│   │   └── widgets.cjs           ← Widget window factory
│   └── services/
│       └── windowEffects.cjs     ← Win11 acrylic/mica effects
├── bridge/
│   └── preload.cjs               ← Secure IPC bridge
├── database/
│   ├── schema.cjs                ← Core data model
│   ├── flags.cjs                 ← Feature flags (isolated)
│   └── seeds.cjs                 ← Default data
├── src/
│   ├── global/                   ← Tokens, palette, typography, motion
│   ├── themes/                   ← Style conventions per surface type
│   │   └── app/                  ← Per-app theme files
│   ├── components/
│   │   ├── apps/                 ← App windows
│   │   │   ├── aida-chat/        ← AIDA Chat (primary)
│   │   │   ├── tasks/            ← Tasks app
│   │   │   └── file-decks/       ← File explorer
│   │   ├── menubar/              ← Menu bar + handle
│   │   ├── panels/               ← Settings panels
│   │   ├── widgets/              ← Desktop widgets
│   │   └── shared/               ← Shared components
│   ├── services/                 ← DB service layer
│   └── types/                    ← TypeScript declarations
└── vite.config.ts
```

---

## Privacy by Architecture

- **Local AI inference** — queries never leave your machine
- **On-device database** — SQLite, nothing synced to cloud
- **No telemetry** — no analytics, no crash reporting, no tracking
- **No third parties** — not a product, not a profile, not a spy
- **System access on-demand** — AIDA only reads hardware data when you ask

> *"Your privacy is never a fair exchange."*
> — ENGIOS Design Law №6

---

## AIDA's Operational Boundaries

These are absolute. Non-negotiable. Documented here so they cannot be quietly removed.

- **Online access** — update events only, initiated by ENGIOS, never by the model
- **Task scope** — defined and bounded by ENGIOS, never self-expanding
- **Capability upgrades** — triggered by hardware or edition changes only, controlled by ENGIOS

> *"The AI serves within boundaries we set. Not boundaries it sets for itself."*
> — ENGIOS Design Law №15

---

## What's Next

- System prompt refinement — phi3mini identity consistency
- Archive restore UI — IPC handler built, UI trigger pending
- Ollama hallucination mitigation — `num_predict` cap + stop tokens
- AIDA boot greeting — contextual, time-aware
- GiG (Get it Gone) — system-level uninstall cleanup
- Native Wayland compositor — long-term goal, replaces Electron shell

---

## Contributing

Read [`BLUEPRINT.md`](BLUEPRINT.md) before touching any code. Every architectural decision is documented there. If it is not in the blueprint, it gets planned before it gets built.

---

<div align="center">

*ENGIOS — Engineered Intelligent OS · <a href="https://engios.dev" target="_blank">engios.dev</a>*

**Sovereignty. Restored.**

</div>
