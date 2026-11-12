# ENGIOS Changelog

*An honest record of what has been built, month by month.*

---

## Linux desktop milestone — 12 November 2026

*Development snapshot on `linux-integrated`; not a packaged OS release.*

- Debian 13 desktop session using labwc, Xwayland and built AIDA files.
- Normal local login starts AIDA; SSH sessions remain independent.
- One desktop window contains wallpaper and the permanent main panel.
- Clock & Weather is embedded in the panel; the pull handle is removed.
- Local wallpaper selection uses the existing persisted settings mechanism.
- Widget transparency reveals the continuous panel beneath it; widget background,
  border and text controls remain independent of panel transparency.
- Windows and integrated Linux development have separate working copies.

The owner verified the desktop on a Dell Latitude 3520. An idle `top` snapshot
showed 989 MiB total system RAM used, 95% CPU idle and no swap use. These are
observations from this setup, not a controlled cross-platform benchmark.

Local production build, single-window lifecycle/input checks and rendered
transparency checks passed. TypeScript checking still reports existing errors
in SettingsShell and the Notes/Tasks themes. The earlier dependency install
reported 69 audit findings; these have not been remediated by this milestone.
The Linux launcher is a source-tree session launcher, not a distribution installer.
AI inference and full OS capability management are not validated by this snapshot.

---

## v0.1.0 — April 2026

*First public release. ENGIOS is a work in progress.*

### What's New — First Release

This is the initial public release of ENGIOS. It represents the current state of active development — a fully functional AIDA layer running on a proven Debian 13 backbone.

### What Works

**AIDA Chat**
- ✓ Streaming AI conversation via local Ollama + phi3mini:latest
- ✓ Full conversation persistence — every chat saved to SQLite on-device
- ✓ Projects — create folders, assign chats, archive, delete
- ✓ Drag and drop chats into project folders
- ✓ Right-click context menus on folders and chats
- ✓ Search across all conversations — titles and message content
- ✓ Live system data — AIDA knows your hardware when you ask
- ✓ Collapsible sidebar with Projects and Chats sections
- ✓ Project archive — saves to Documents/ENGIOS/Archives/ as .aida-archive

**Menu Bar**
- ✓ Pull-down panel — auto-hides, transparent
- ✓ Quick settings — theme, accent colour, transparency, font size
- ✓ Toast notification system — reminders, overdue tasks, system alerts
- ✓ Productivity Bar — unified file search and AI trigger

**Tasks**
- ✓ Full task management — create, edit, complete, delete
- ✓ Due dates, times, priorities, recurrence
- ✓ Reminder toasts — fires before due time
- ✓ Overdue notification system

**File Decks**
- ✓ Three-pane file explorer with resizable panels
- ✓ File navigation and basic preview

**Widgets**
- ✓ System Monitor — live CPU, RAM, GPU, DISK gauges
- ✓ Clock & Weather — live weather via Open-Meteo, no API key required

**OS Backbone**
- ✓ Debian 13 (Trixie) — 308 packages, ~379MB RAM at idle
- ✓ Ollama running locally — no cloud inference
- ✓ phi3mini:latest — 3.8B parameters, 4-bit quantised, CPU-only capable
- ✓ Auto-boot into AIDA — no login prompt, AIDA launches on startup

### Known Issues

- → phi3mini occasionally over-qualifies responses about system data, citing privacy constraints it doesn't actually have — system prompt tuning in progress
- → Archive restore — the IPC handler is built, but the UI trigger is not yet implemented
- → Long AI responses can degrade toward incoherence — num_predict cap and stop tokens not yet applied
- → AIDA Chat conversation titles are the first 60 characters of the first message — AI-generated titles coming

### In Progress

- Restore archive UI
- Ollama response quality improvements
- AIDA boot greeting — contextual, time-aware
- GiG (Get it Gone) — system-level uninstall cleanup
- Productivity Bar notes and task quick-capture

---

*Older entries will appear here as monthly releases accumulate.*

---

*ENGIOS — Engineered Intelligent OS · [engios.dev](https://engios.dev)*
