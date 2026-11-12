<div align="center">

<img src="assets/icons/system/engios_logo_text.png" width="200" alt="ENGIOS Logo" />

# OS Backbone

### Debian 13 · Ollama · Phi-3 Mini

*The foundation everything runs on.*

</div>

---

## What This Is

This is the OS layer of ENGIOS — the stable, intentional foundation that AIDA runs on.

It is not under active feature development. It does not need to be. Its job is to be solid, minimal, and correct — and it is.

> *"Build on principles, not on compromises."*
> — ENGIOS Design Law №13

---

## Current Status

**Proof of concept — stable.**

The OS backbone is installed, running, and proven on physical hardware. It serves as the conceptual and functional foundation for the full ENGIOS system. Active development is happening in [`/aida`](../aida/).

This layer will see significant expansion when AIDA reaches maturity and the two layers begin to unify into a single bootable system.

---

## Why Debian 13?

Three reasons — each one non-negotiable.

**Principles.** Debian publishes a Social Contract and Free Software Guidelines — written commitments to remaining 100% free software, permanently. No corporate owner. No acquisition risk. No commercial agenda. Community governed since 1993. It agreed with ENGIOS's values before we even asked.

**Stability.** Debian Stable is tested with exceptional thoroughness. Packages are conservative by design. For an OS whose founding principle is hardware longevity and reliability, a base that prioritises stability is the only honest choice.

**Respect for hardware.** Debian runs on remarkably modest hardware. It does not bloat. It does not demand. It respects the machine it runs on.

We considered Ubuntu LTS and Linux Mint. Both were rejected — not because they are bad, but because they inherit decisions we did not make. Ubuntu inherits Canonical's commercial agenda. Mint inherits Ubuntu which inherits Canonical. ENGIOS builds from the origin.

> *"We forked from the origin. Not a fork of a fork of a fork of a fork."*

---

## Why Ollama?

Ollama is the de facto standard for running large language models locally on consumer hardware. It was chosen because:

- Runs natively on Linux
- Clean, simple API — AIDA communicates with it directly
- Handles GPU acceleration automatically, falls back gracefully to CPU
- Does not phone home
- Does not auto-update without permission
- Runs what we tell it to run, when we tell it to run

> *"The AI serves within boundaries we set. Not boundaries it sets for itself."*
> — ENGIOS Design Law №15

---

## Why Phi-3 Mini?

Microsoft designed Phi-3 Mini explicitly for edge devices and constrained hardware. At 3.8 billion parameters in 4-bit quantised GGUF format, it runs on the HP Pavilion test machine with no GPU — CPU-only inference — and delivers response quality that is subjectively comparable to cloud AI assistants.

In testing, when asked how an AI assistant should handle a user's personal data, Phi-3 Mini independently responded that user autonomy and privacy must always be respected, the system should never act on assumption, and any action requires user confirmation.

That is AIDA's philosophy described back to us without being told. That is not a coincidence. That is alignment.

> *"The intelligence adapts to the hardware. Not the other way around."*
> — ENGIOS Design Law №14

Different ENGIOS editions run different model sizes, scaled to available hardware:

| Edition | Model | Target Hardware |
|---------|-------|----------------|
| Personal | Phi-3 Mini 3.8B (4-bit) | Modest — 8GB RAM, CPU-only |
| Performance | Mistral 7B / Llama 3.1 8B | Mid to high range |
| Enterprise | Llama 3.1 70B quantised | Server grade |

---

## The Test Machine

ENGIOS is developed and tested on a **donated HP Pavilion 250 G6 (2017)**.

| Spec | Detail |
|------|--------|
| Processor | Intel Core i5-7200U — 2 cores / 4 threads — 2.5GHz / 3.1GHz |
| RAM | 8GB |
| Storage | 256GB SSD |
| Graphics | Intel HD Graphics 620 |
| Origin | Community donation |
| Windows 11 eligible | **No** — abandoned by Microsoft |
| ENGIOS eligible | **Yes** — runs beautifully |

This machine was left on the doorstep one morning with a note. It represents millions of machines currently being forced off Windows 11 due to arbitrary hardware requirements. If ENGIOS runs beautifully on this machine, it runs beautifully on millions like it.

---

## Current State

| Component | Status |
|-----------|--------|
| Debian 13 (Trixie) — minimal netinstall | ✓ Installed and running |
| Unnecessary packages stripped | ✓ 308 packages — ~379MB RAM at idle |
| Auto-login + automatic `startx` on tty1 | ✓ Working |
| Plymouth boot splash — ENGIOS theme | ✓ Working |
| Ollama installed | ✓ Running |
| Phi-3 Mini pulled and loaded | ✓ Running |
| Phi-3 Mini demonstrated AIDA alignment | ✓ Confirmed |
| AIDA Electron shell launching on boot | ✓ Working |

---

## Packages Removed from Base Debian Install

The following were removed as unnecessary for the ENGIOS base layer — Design Law №10 in practice:

`ispell` `ibritish` `groff-base` `man-db` `manpages` `manpages-dev` `vim-tiny` `vim-common` `task-ssh-server` `tasksel` `tasksel-data` `reportbug` `wamerican`

Services disabled at boot: `bluetooth.service` · `cron.service` (AIDA handles scheduling natively)

---

## Long-Term Direction

### Dell labwc test session — November 2026

The Dell Latitude 3520 test uses Debian 13 with labwc 0.8.3-1 and Xwayland
2:24.1.6-1. AIDA has been observed working through Xwayland without the
`--disable-gpu` workaround required in the earlier Openbox test. Electron's
active rendering backend has not yet been independently verified.

The repository-root `Start-AIDA-Linux.sh` provides the next test procedure:

1. Install dependencies in `aida` with `npm ci`, then rebuild SQLite for Electron
   with `./node_modules/.bin/electron-rebuild -f -w better-sqlite3`.
2. Run `npm run build` in `aida` after source updates.
3. Stop existing AIDA and Vite processes, and exit the graphical session.
4. From the Dell's local text console, as the normal logged-in user, run
   `sh /home/jacklewan/ENGIOS/Start-AIDA-Linux.sh`.

The launcher sets `NODE_ENV=production` so the existing window factories load
built HTML files. Development launches retain Vite. Relative build asset paths
support Electron's local file loading. No development server, npm process, or
graphical terminal is started by the launcher. labwc ends when AIDA exits.

This is an unpackaged source-tree test session verified on the Dell.
It is not yet a Debian package, a login-screen entry, an automatic boot
session, or a native Wayland AIDA shell. It preserves the current window layout
and click-through behavior. The earlier hardware and startup claims elsewhere
in this document describe historical tests, not the Dell's current setup.

The built-file launcher was subsequently verified by the owner on the Dell:
AIDA launched quickly and remained responsive with Vite stopped.

The launcher marks its Electron client with `AIDA_DESKTOP_SESSION=1`. In this
Linux session, the open main-panel window retains mouse input over its entire
area, including transparent space. The permanent desktop composition below
supersedes the earlier hide/reveal behavior.
This avoids relying on Electron's Windows/macOS-only forwarded mouse movement
to recover from click-through. Overlay launches retain their existing policy.
The owner verified on the Dell that the settings gear and right-hand Folder/AIDA Chat dropdown both respond correctly after a fresh login.

For password-login integration, run `sh /home/jacklewan/ENGIOS/Enable-AIDA-Login.sh`
as the normal user. It backs up `.profile`, checks the addition with `bash -n`,
and starts the session only after local tty1 login. It leaves SSH and other
consoles available and returns to a prompt when AIDA ends. The owner verified
that a fresh local password login starts AIDA successfully; no auto-login is
configured. Cold-boot behavior has not yet been verified.

Session output is saved to `~/.local/state/engios/aida-session.log`. To bypass
startup, run these commands over SSH before the next local login:

```sh
mkdir -p /home/jacklewan/.config/engios
touch /home/jacklewan/.config/engios/skip-aida-autostart
```

Remove that bypass file to restore startup. The installer reports the original
profile backup path if the login addition needs to be rolled back entirely.

### Permanent main panel and desktop background

The standalone Linux session creates one desktop window containing wallpaper
behind a permanently visible, full-screen main panel. It creates neither a pull handle nor a standalone clock
window. Clock & Weather replaces the Volume column, using its existing widget
display, saved preferences and settings broadcast. An adjacent settings button
remains available even when clock visibility is disabled. Embedded weather is
fixed in its column and wraps within the available width.

The shell ignores its former hide/toggle commands in the desktop session and
owns input across the panel, including transparent areas. Overlay-specific
auto-hide, initial open/closed and widget-position controls are omitted from
the desktop settings UI. Apps and settings still open as separate windows.
The remaining grid, greeting and productivity bar retain their existing layout
rules; the clock column can grow vertically when its contents need to wrap.

Appearance settings provide Choose image and Remove image. The native dialog
accepts PNG, JPEG and WebP files up to 20 MB; decoded images are limited to 40
megapixels. A content-addressed copy is retained under userData/desktop-backgrounds,
while the selected local URL is saved in the existing GlobalSettings record.
Existing records receive the empty-image default through the normal defaults
merge. Removing the selection returns to the theme background; imported files
are retained for reuse. Images use centered cover scaling, which can crop edges.

The owner verified image selection on the Dell. Initial testing exposed an
unmanaged wallpaper window (X11 override-redirect); its focusable configuration
was corrected so labwc can manage it, with pointer input passed through.
The pull handle subsequently remained unresponsive, prompting the owner's
permanent-panel composition above rather than further handle work.

The owner visually verified the permanent composition on the Dell. Widget
background transparency belongs to each widget, independently of panel alpha.
The panel background remains continuous beneath widgets. A fully transparent
widget reveals the panel beneath it; its controls must never cut a hole through
the panel or change another surface. Border and text controls remain separate.

The earlier background cutout was a misunderstanding of independence and has
been removed, including its geometry registry and observers. The owner verified
the corrected transparency composition on the Dell. Wallpaper now paints inside
the main panel window, reusing its settings load and updates. The separate
wallpaper factory, renderer and build entry have been removed. Local lifecycle,
rendered and build checks cover this consolidation. The owner accepted this
state as the Dell desktop milestone; see CHANGELOG.md for observed resource use.
Existing unrelated TypeScript diagnostics remain unchanged.

### Longer-term work

When AIDA reaches sufficient maturity, the two layers will begin to converge:

- Native Wayland compositor to replace the Electron shell
- Deep OS-level integration — AIDA as a true kernel-adjacent process
- Packaged installer for the full ENGIOS system
- Hardware compatibility database

> *"Build the experience first. Build the plumbing later."*

---

<div align="center">

*ENGIOS — Engineered Intelligent OS · <a href="https://engios.dev" target="_blank">engios.dev</a>*

**Because machines deserve to live longer too.**

</div>
