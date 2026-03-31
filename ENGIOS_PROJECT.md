# ENGIOS / AIDA — Project Reference
*Permanent document. Read at the start of every session.*
*Update only when project direction changes.*
*Last updated: April 2026*

---

## What This Project Is

**ENGIOS** is a next-generation Linux-based OS built on Debian 13.
Founding principle: the computer works for the human, not the other way around.
Hardware longevity, privacy by architecture, no telemetry, no corporate owner.

**AIDA** is the AI intelligence layer woven into ENGIOS.
Not an app. Not a chatbot. A kernel-adjacent custodian of hardware.
Everything it learns lives on the machine.
Nothing leaves without explicit user instruction.
AIDA offers — never orders.

---

## The One-Sentence Version

> ENGIOS is the OS that respects the machine and the person using it.
> AIDA is the intelligence that makes that possible — quietly, locally, and on your terms.

---

## Design Laws

These are non-negotiable. Every decision — architectural, visual, functional —
must be consistent with these principles. When in doubt, return here.

| # | Law |
|---|-----|
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

## Tech Stack

| Layer | Technology |
|-------|-----------|
| OS Base | Debian 13 (Trixie), stripped to ~308 packages, ~379MB RAM idle |
| Desktop Shell | Electron v40 + React + TypeScript + Vite 7 |
| Database | SQLite via `better-sqlite3` |
| Local AI | Ollama + phi3mini:latest (local inference, no cloud) |
| System Info | systeminformation (on-demand only, no background polling) |
| Dev Port | 5390 |

---

## Hardware

| Machine | Spec | Role |
|---------|------|------|
| Dev machine | Windows 11, Ryzen AI 9 HX 370, 64GB RAM | Active development |
| Test machine | HP Pavilion 250 G6 (2017), i5-7200U, 8GB RAM | The machine Microsoft abandoned for Windows 11. ENGIOS runs beautifully on it. |

---

## Project Structure

```
C:\ENGIOS\               — The repository root
  aida\                  — AIDA — active development. This is where the work happens.
  os\                    — OS backbone — Debian 13, Ollama, assets. Stable. Rarely changes.
  README.md              — Root landing page — the full ENGIOS story
  SETUP.md               — Installation guide for new users
  CHANGELOG.md           — Monthly release history
  RELEASES.md            — Internal release process guide
  LICENSE                — MIT
  .gitignore
```

GitHub: https://github.com/ENGIOS-DEV/ENGIOS

---

## Active Documents (read at session start)

| File | Location | Purpose |
|------|----------|---------| 
| `ENGIOS_PROJECT.md` | `C:\ENGIOS\aida\` root | This file. Project identity and principles. |
| `BLUEPRINT.md` | `C:\ENGIOS\aida\` root | Architectural law. Layer definitions, rules, decisions. Currently v1.4. |
| `CHECKLIST.md` | `C:\ENGIOS\aida\` root | Definition of done per layer. |
| Handoff document | `C:\ENGIOS\aida\` root | Last session summary. Generated at end of each session. |

---

## Three Editions

| Edition | Target | Character |
|---------|--------|-----------|
| **Personal** | Everyday users | Calm, simple, capable. *~ relief ~* |
| **Performance** | Gamers, creators & power users | Powerful, responsive, unleashed. *~ freedom ~* |
| **Enterprise** | Businesses | LTS, managed, auditable, compliant. *~ confidence ~* |

---

## Brand

| Element | Value |
|---------|-------|
| Logo colours | Main `#E6E6E6` / Accent `#29ABE2` |
| Background | `#0D1117` |
| Fonts | Archivo Black (main) / DM Mono (mono) |
| Website | engios.dev |
| Tagline | *Because machines deserve to live longer too.* |
| Sub-tagline | *Sovereignty. Restored.* |

---

## Current State (April 2026)

All six architectural layers are in place. AIDA is functional and running.

```
✅ Layer 1 — Electron     electron/main.cjs + ipc/ + windows/ + services/
✅ Layer 2 — Bridge       bridge/preload.cjs
✅ Layer 3 — Global       src/global/ — tokens, palette, typography, motion
✅ Layer 4 — Theme        src/themes/ — convention files per surface type
✅ Layer 5 — Components   All major components built and working
✅ Layer 6 — Data         database/ — schema, flags, seeds
```

### What Works
- AIDA Chat — streaming AI conversation, full persistence, projects, search
- AIDA System Awareness — live hardware data on demand (CPU, RAM, GPU, disk, processes, OS)
- Productivity Bar — unified file search + AI trigger
- Menu Bar — pull-down panel, toasts, quick settings
- Tasks — full task management with reminders
- File Decks — three-pane file explorer
- System Monitor Widget — live performance rings
- Clock & Weather Widget — live weather, no API key

### Pending
- Archive restore UI (IPC handler built, no UI trigger yet)
- Ollama response quality improvements (num_predict cap + stop tokens)
- AIDA boot greeting — contextual, time-aware
- GiG (Get it Gone) — system-level uninstall cleanup
- Native Wayland compositor (long-term — replaces Electron shell)

---

## Monthly Release Process

Releases are published at the end of each calendar month.
Current version: `v0.1.0` — April 2026 (first public release)
See `RELEASES.md` for the full release checklist.

---

## Session Workflow

1. Upload `ENGIOS_PROJECT.md` + `BLUEPRINT.md` + latest handoff document
2. Upload a zip of `C:\ENGIOS\aida\` (exclude `node_modules/`, `dist/`, `.git/`)
3. Claude reads all documents before touching anything
4. State what we are building this session
5. Claude confirms it fits the blueprint before any code is written
6. At end of session — Claude generates updated handoff document + BLUEPRINT update if needed
7. Save handoff to `C:\ENGIOS\aida\` root, replacing previous version

---

*This document is the identity of the project.
Every line of code written should be consistent with it.*
