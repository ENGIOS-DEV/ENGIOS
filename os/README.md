<div align="center">

<img src="os/assets/icons/system/engios_logo_text.png" width="300" alt="ENGIOS Logo" />

# ENGIOS — OS Backbone

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
