# ENGIOS / AIDA — Project Reference
*Permanent document. Read at the start of every session.*
*Update only when project direction changes.*
*Last updated: March 2026*

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
| 2 | Hardware longevity is not a feature — it is a founding principle. |
| 3 | Privacy is architecture, not a setting. |
| 4 | No telemetry. No data leaves the machine without explicit user instruction. |
| 5 | Nothing is installed that the user did not ask for. |
| 6 | The OS should be invisible when not needed. Present when it is. |
| 7 | A custodian of your hardware — not a CEO of your life. |
| 8 | AIDA offers. It never orders. |
| 9 | Sovereign computing is not paranoia — it is self-respect. |
| 10 | If it's not necessary for OS or app operations, it does not belong on the system. |
| 11 | Speed is a feature. Bloat is a bug. |
| 12 | The measure of a system's intelligence is how rarely it makes the user feel like a beginner. |
| 13 | Build on principles, not on compromises. |
| 14 | The intelligence adapts to the hardware. Not the other way around. |
| 15 | The AI serves within boundaries we set. Not boundaries it sets for itself. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| OS Base | Debian 13 (Trixie), stripped to ~308 packages, ~379MB RAM idle |
| Desktop Shell | Electron v40 + React + TypeScript + Vite |
| Styling | Tailwind CSS + typed style functions from convention files |
| Database | SQLite via `better-sqlite3` |
| Local AI | Ollama + Phi-3 Mini (local inference, no cloud) |
| Build Targets | `engios` (full OS) / `windows` (standalone AIDA for Windows) |

---

## Hardware

| Machine | Spec | Role |
|---------|------|------|
| Dev machine | Windows, Ryzen AI 9 HX 370, 64GB RAM | Development |
| Test machine | HP Pavilion 250 G6 (2017), i5-7200U, 8GB RAM | The machine Microsoft abandoned for Windows 11. ENGIOS runs beautifully on it. |

---

## Project Structure

```
Two active directories:

C:\AIDA\        — AIDA-1. Working project. Live development continues here
                  until AIDA-2 reaches feature parity.

C:\AIDA-2\      — AIDA-2. Clean architectural rebuild.
                  Built strictly according to BLUEPRINT.md.
                  Will replace AIDA-1 when stable.
```

---

## Active Documents (read at session start)

| File | Location | Purpose |
|------|----------|---------|
| `ENGIOS_PROJECT.md` | `C:\AIDA-2\` root | This file. Project identity and principles. |
| `AIDA_SESSION.md` | `C:\AIDA-2\` root | Last session summary. What's done, pending, next. |
| `BLUEPRINT.md` | `C:\AIDA-2\` root | Architectural law. Layer definitions, rules, decisions. |
| `CHECKLIST.md` | `C:\AIDA-2\` root | Definition of done per layer. |

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

## Build Order (AIDA-2)

Each layer must be complete and proven before the next begins.
No exceptions.

```
1. ✅ Project scaffold     — folders, config files, placeholder files
2. ⬜ Layer 6 — Data       — database/schema.cjs, flags.cjs, seeds.cjs
3. ⬜ Layer 2 — Bridge     — bridge/preload.cjs
4. ⬜ Layer 1 — Electron   — electron/main.cjs + all modules
5. ⬜ Layer 3 — Global     — src/global/ system
6. ⬜ Layer 4 — Theme      — src/themes/ convention files
7. ⬜ Layer 5 — Components — one at a time, proven before next
```

---

## Session Workflow

1. Zip `C:\AIDA-2\` (exclude `node_modules/`, `dist/`, `.git/`)
2. Upload zip + `BLUEPRINT.md` + `ENGIOS_PROJECT.md` + `AIDA_SESSION.md`
3. Claude reads all four before touching anything
4. State what we are building this session
5. Claude confirms it fits the blueprint before any code is written
6. At end of session — Claude generates updated `AIDA_SESSION.md`
7. Save it to `C:\AIDA-2\` root, replacing the previous version

---

*This document is the identity of the project.
Every line of code written should be consistent with it.*
