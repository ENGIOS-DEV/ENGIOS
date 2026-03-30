<div align="center">

![ENGIOS Logo](os/assets/icons/system/engios_logo_text.png)

# ENGIOS — Engineered Intelligent OS

### *Because machines deserve to live longer too.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Base: Debian 13](https://img.shields.io/badge/Base-Debian%2013-A81D33?style=flat-square&logo=debian)](https://www.debian.org/)
[![Shell: Electron](https://img.shields.io/badge/Shell-Electron-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![AI: Ollama](https://img.shields.io/badge/AI-Ollama-000000?style=flat-square)](https://ollama.com/)
[![Status: Active Development](https://img.shields.io/badge/Status-Active%20Development-29ABE2?style=flat-square)]()

</div>

---

## What Is ENGIOS?

ENGIOS is a next-generation Linux-based operating system built around one founding principle:

> **The computer works for the human. Not the other way around.**

It is intelligent, modular, sustainable, and private by architecture. It extends the life of hardware that the industry has declared obsolete — not because that hardware is incapable, but because it lacks an arbitrary chip or falls outside an artificial generation cutoff.

ENGIOS is being developed and tested on a donated 2017 HP Pavilion 250 G6 — a machine Microsoft abandoned for Windows 11. It runs beautifully on 379MB of RAM. That is not a compromise. That is a statement.

---

## This Repository

ENGIOS is two things that belong together. This repository holds both.

```
ENGIOS/
├── os/      The backbone — Debian 13, Ollama, Phi-3 Mini
│            Stable. Intentional. Rarely changes.
│
└── aida/    The intelligence layer — active development
             This is where the work is happening right now.
```

### Why this structure?

AIDA and ENGIOS are inseparable by design. AIDA is not an app that happens to run on Linux. It is the intelligence layer of a specific operating system, built to run on specific hardware, with specific principles baked into every decision.

Separating them into two repositories would suggest they are independent projects. They are not.

**AIDA is being prioritised first** because you cannot build an intelligent OS without first proving the intelligence works. The OS backbone (`os/`) defines the foundation. AIDA (`aida/`) is built on top of it. When AIDA is mature, the two layers will be unified into a single bootable system.

---

## AIDA — The Intelligence Layer

AIDA is a kernel-adjacent intelligence woven into ENGIOS. Not an app. Not a chatbot. A custodian of your hardware and a silent co-pilot for your workflow.

> *"A custodian of your hardware — not a CEO of your life."*
> — ENGIOS Design Law №7

Everything AIDA learns lives on your machine. Nothing leaves without your instruction. It offers — never orders.

**→ [See AIDA →](aida/)**

---

## The OS Backbone

The `os/` layer is Debian 13 with Ollama and Phi-3 Mini — the proven, stable foundation that AIDA runs on. It is intentionally minimal. It is not under active feature development.

> *"308 packages. 379MB of RAM. A complete, networked, AI-capable operating system. Everything else will be there because we decided it belongs there."*

**→ [See the OS backbone →](os/)**

---

## The Design Laws

Every decision in ENGIOS is governed by these principles. They are not guidelines — they are laws.

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

## Four Editions. One Core.

All editions share a single hardened core — same kernel, same security model, same driver stack. Tier-specific capabilities layer on top.

| Edition | Target | Character |
|---------|--------|-----------|
| **Personal** | Everyday users | Calm, simple, capable. *~ relief ~* |
| **Gaming** | Performance users | GPU-optimised. Controller-ready. *~ freedom ~* |
| **Productivity** | Developers & creators | Power tools, deep workflow. |
| **Enterprise** | Businesses | LTS, managed, auditable, compliant. *~ confidence ~* |

---

## The Test Machine

Every line of ENGIOS is written and tested on a **donated HP Pavilion 250 G6 (2017)**.

| Spec | Detail |
|------|--------|
| Processor | Intel Core i5-7200U — 2 cores / 4 threads |
| RAM | 8GB |
| Storage | 256GB SSD |
| Graphics | Intel HD Graphics 620 |
| Windows 11 eligible | **No** — abandoned by Microsoft |
| ENGIOS eligible | **Yes** — runs beautifully |

This machine represents millions like it. If ENGIOS runs beautifully here, it runs beautifully everywhere that matters.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

*ENGIOS — Engineered Intelligent OS · [engios.dev](https://engios.dev)*

**Sovereignty. Restored.**

</div>
