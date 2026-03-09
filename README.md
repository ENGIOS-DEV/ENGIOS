<div align="center">

<!-- Replace with your actual logo path once hosted -->
<img src="src/assets/icons/aida_logo.png" alt="AIDA Logo" width="120" />

# AIDA
### AI-Integrated Desktop Assistant

*A proactive, always-on desktop companion that anticipates your needs — not just another app to open.*

[![Electron](https://img.shields.io/badge/Electron-latest-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-latest-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## The Vision

Most desktop tools are **reactive** — you open them when you need them, then close them and forget they exist. AIDA is different.

AIDA is designed to be **proactive**. It lives quietly at the edge of your screen, always present but never intrusive, surfacing what you need before you know you need it. It's not a launcher, not a widget pack, not a dashboard — it's a unified layer of intelligence that wraps around your entire workflow.

The philosophy is simple: **your desktop should work for you, not the other way around**. AIDA acts as a persistent co-pilot — aware of your schedule, your files, your system, and your preferred AI tools — ready to act the moment you reach for it.

Every design decision has been made in service of one goal: **keep you in flow**.

---

## What AIDA Is (And Isn't)

| AIDA **is** | AIDA **is not** |
|---|---|
| Always visible, never in the way | A full-screen application |
| A unified command surface | A replacement for your existing apps |
| Proactively aware of context | An AI chatbot |
| Deeply customisable | Bloatware |
| A productivity multiplier | Another thing to manage |

---

## Features

### Menu Bar
A pull-down panel that lives at the very top of your screen. Tap the handle to reveal it; it retreats automatically after a configurable delay. It contains four sections:

- **Quick Actions** — one-click access to create notes, tasks, and calendar events
- **Today** — your schedule at a glance, without opening a calendar app
- **Notifications** — a unified, noise-filtered feed of what actually matters
- **System** — volume, and other system-level controls

The bar is fully transparent and blurred, blending seamlessly with any wallpaper.

---

### Clock & Weather Widget
A floating widget that sits anywhere on your desktop. It shows the time, day, date, and live weather pulled from [Open-Meteo](https://open-meteo.com/) — no API key required.

- Animated weather icons that respond to current conditions and time of day
- Draggable — position it exactly where you want it
- **Lock position** to prevent accidental movement
- Full appearance customisation: font, weight, size, opacity, alignment, layout
- Independent background and border controls
- City override, or automatic geolocation
- Celsius / Fahrenheit toggle
- All settings persist across restarts

---

### AI Provider Launcher
Quick access to your preferred AI chat interfaces, launched as persistent Electron windows — not browser tabs. Each provider maintains its own login session independently.

Supported providers:
- **Gemini** (Google)
- **Meta AI**
- **Groq**
- **Claude** (Anthropic)
- **ChatGPT** (OpenAI)
- **Google Search**
- **Brave Search**

---

### File Search
A fast, local file search bar that scans your Desktop, Documents, Downloads, Pictures, Videos, and Music folders — no indexing service, no background daemon. Results appear instantly, and files open with a single click.

---

### System Monitor
Circular progress rings showing live system metrics. Fully configurable — choose which metrics to display and where on screen to position them.

Available metrics: **CPU · RAM · GPU · VRAM · DISK · TEMP · NETWORK · BATTERY**

---

### Global Settings
A unified settings panel with real-time preview. Changes apply instantly — no save button, no restart required.

| Tab | Controls |
|---|---|
| **Appearance** | Transparency, blur intensity, accent colour, font size |
| **Behavior** | Auto-hide delay, default menu state, animation speed |
| **Monitors** | System monitor toggle, component selection, position |
| **System** | Auto-start with Windows, *(Notifications, Language — coming soon)* |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Shell | [Electron](https://www.electronjs.org/) |
| UI | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) + inline styles for dynamic values |
| Weather | [Open-Meteo API](https://open-meteo.com/) (free, no key) |
| Geocoding | [Nominatim / OpenStreetMap](https://nominatim.org/) (free, no key) |
| Icons | [Meteocons by Bas Milius](https://bas.dev/work/meteocons) (animated SVG) |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/aida.git
cd aida

# Install dependencies
npm install --legacy-peer-deps

# Start in development mode
npm run dev
```

### Running as Electron App

```bash
# In one terminal — start the Vite dev server
npm run dev

# In another terminal — launch Electron
npx electron electron.cjs
```

### Building for Production

```bash
npm run build
```

---

## Project Structure

```
aida/
├── electron.cjs              # Electron main process
├── preload.cjs               # Secure IPC bridge
├── src/
│   ├── App.tsx               # Root component & settings orchestration
│   ├── zIndex.ts             # Centralised z-index layer system
│   ├── theme.ts              # Shared styling functions
│   ├── index.css             # Global styles
│   ├── components/
│   │   ├── MenuBar.tsx           # Pull-down menu panel
│   │   ├── MenuBarHandle.tsx     # The three-dot trigger pill
│   │   ├── ProductivityBar.tsx   # AI launcher + file search
│   │   ├── ClockWeatherWidget.tsx # Floating clock & weather
│   │   ├── SystemMonitor.tsx     # Performance rings
│   │   ├── GlobalSettings.tsx    # Settings modal
│   │   └── SettingsShell.tsx     # Reusable settings UI framework
│   ├── services/
│   │   └── fileSearchService.ts  # Local file system search
│   ├── helpers/
│   │   └── aiProvider.ts         # AI provider utilities
│   └── types/
│       └── settings.ts           # All TypeScript interfaces & defaults
└── public/
    └── wallpaper.png             # Default wallpaper (replace with your own)
```

---

## Architecture Decisions

**Why centralised z-index?**
`zIndex.ts` is a single source of truth for every layer in the app. Without it, stacking contexts become impossible to reason about as the component tree grows.

**Why a shared SettingsShell?**
Every settings panel in AIDA imports from `SettingsShell.tsx`. This guarantees visual consistency with zero effort — a new widget's settings panel automatically looks identical to every other panel.

**Why inline styles for dynamic values?**
Tailwind classes are static. Values like blur intensity, transparency, and accent colour change at runtime based on user settings. Inline styles with computed values are the correct tool for this — there is no runtime Tailwind compiler.

**Why Open-Meteo for weather?**
Completely free, no API key required, no rate limits for reasonable usage, and the data quality is excellent. Removing the API key requirement removes a friction point for every new user.

---

## Roadmap

The following is ordered by priority, with no time constraints attached. AIDA is built carefully — features ship when they are right, not when they are rushed.

### Near Term
- [ ] **Notes widget** — quick-capture floating notepad, persisted locally
- [ ] **Real system metrics** — replace simulated data with live readings via `systeminformation`
- [ ] **Notification system** — configurable, filterable notification feed
- [ ] **Open-provider windows** — persistent Electron windows for AI providers with full login persistence

### Medium Term
- [ ] **Calendar widget** — agenda view, event creation, calendar integration
- [ ] **Music / media controller** — playback controls without switching focus
- [ ] **Multi-monitor support** — widget positioning per display
- [ ] **Custom wallpaper** — set and manage wallpaper from within AIDA
- [ ] **Keyboard shortcuts** — power-user control surface

### Longer Term
- [ ] **Plugin system** — allow third-party widgets
- [ ] **AIDA AI layer** — a proactive assistant that surfaces suggestions based on schedule, files, and context
- [ ] **Cross-platform** — macOS and Linux support
- [ ] **Cloud sync** — optional settings sync across machines
- [ ] **Packaged installer** — one-click Windows installer via Electron Forge

---

## Contributing

Contributions are welcome. Please open an issue before submitting a pull request so we can discuss the approach first. This keeps the codebase intentional rather than accumulated.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit with clear messages: `git commit -m "feat: add notes widget"`
4. Push and open a pull request against `main`

Please follow the existing code style — TypeScript strict mode, inline styles for dynamic values, and components under 200 lines where possible.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
<sub>Built with intention. Designed to disappear.</sub>
</div>
