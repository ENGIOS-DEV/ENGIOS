# ENGIOS Setup Guide

*Get ENGIOS + AIDA running on your machine.*

---

## What You Are Installing

ENGIOS consists of two layers:

| Layer | What it is |
|-------|-----------|
| **OS Backbone** | Debian 13 + Ollama + Phi-3 Mini — the foundation |
| **AIDA** | The Electron desktop app — the intelligence layer |

You can run **AIDA standalone on Windows or Linux** without the full OS setup. The full OS experience requires a Debian 13 installation.

---

## Option A — AIDA Standalone (Windows / Linux)

Run AIDA on your existing operating system. This is the quickest way to try ENGIOS.

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Ollama](https://ollama.com/) installed and running
- Phi-3 Mini model pulled

### Step 1 — Install Ollama

Download and install Ollama from [ollama.com](https://ollama.com/).

Verify it is running:
```bash
ollama list
```

### Step 2 — Pull Phi-3 Mini

```bash
ollama pull phi3mini:latest
```

This downloads approximately 2.4GB. Allow a few minutes depending on your connection.

Verify it loaded:
```bash
ollama run phi3mini:latest "Hello"
```

You should get a response. Press `Ctrl+D` to exit.

### Step 3 — Install AIDA

Download the latest release from [github.com/ENGIOS-DEV/ENGIOS/releases](https://github.com/ENGIOS-DEV/ENGIOS/releases).

Extract the archive, then:

```bash
cd aida/
npm install
```

### Step 4 — Run AIDA

**Development mode (recommended for first run):**

Open two terminals:

```bash
# Terminal 1
npm run dev

# Terminal 2 (after Terminal 1 shows "ready")
npx electron electron/main.cjs
```

AIDA will launch as a desktop application.

### Step 5 — First Conversation

Once AIDA is running:

1. Click the handle pill at the top of the screen to open the menu bar
2. Type a message in the Productivity Bar and press `@` + Enter to open AIDA Chat
3. Or click the AIDA Chat icon in the menu bar

Ask AIDA anything. Try: *"What is my current system configuration?"*

---

## Option B — Full ENGIOS on Debian 13

Install the complete ENGIOS system — Debian 13 as the OS with AIDA running natively.

> **This requires either a spare machine, a virtual machine, or replacing your current OS.**
> The recommended approach for first-time installation is a virtual machine.

### Prerequisites

- A machine (physical or virtual) with at least:
  - 2GB RAM (4GB+ recommended)
  - 20GB storage
  - Network connection
- [Debian 13 (Trixie) netinstall ISO](https://www.debian.org/devel/debian-installer/)

### Step 1 — Install Debian 13

Boot from the Debian 13 netinstall ISO.

During installation:
- Choose **minimal installation** — no desktop environment
- Set up a user account
- Enable network access

When the installer completes, you will have a clean command-line Debian system.

### Step 2 — Run the ENGIOS OS Setup Script

Once logged in to Debian, download and run the setup script:

```bash
curl -fsSL https://raw.githubusercontent.com/ENGIOS-DEV/ENGIOS/main/os/setup.sh | bash
```

This script will:
- Install Node.js
- Install Ollama
- Pull Phi-3 Mini
- Install AIDA dependencies
- Configure auto-login and automatic AIDA startup on boot

The script takes approximately 10–20 minutes depending on your connection speed.

### Step 3 — Reboot

```bash
sudo reboot
```

AIDA will launch automatically on boot.

---

## Troubleshooting

### AIDA opens but AI responses fail

Verify Ollama is running:
```bash
ollama list
```

If Phi-3 Mini is not listed:
```bash
ollama pull phi3mini:latest
```

If Ollama is not running:
```bash
ollama serve
```

### "Cannot find module" errors on npm install

```bash
npm install --legacy-peer-deps
```

### AIDA window is blank white

This is a known issue when the app fails to load. Check the terminal for error messages. Most commonly caused by Vite dev server not being ready — wait a few seconds after starting Terminal 1 before launching Terminal 2.

### AIDA responses are doubled

Ensure you are running the latest release. This was a known issue in earlier versions caused by React StrictMode — it has been fixed.

### Ollama returns 400 or 500 errors

Phi-3 Mini does not support Ollama's tool calling API. Ensure you are running the latest AIDA release, which uses keyword detection instead.

---

## Hardware Notes

ENGIOS is designed to run on modest hardware. If you are running it on an older machine:

- Phi-3 Mini requires approximately 2.4GB of RAM for the model alone
- First response after loading takes approximately 10 seconds on CPU-only hardware
- Subsequent responses are faster once the model is warm

If you are running on a machine with 4GB RAM or less, close other applications before starting Ollama.

---

## Uninstalling

### Remove Ollama model
```bash
ollama rm phi3mini:latest
```

### Remove Ollama
Follow the uninstall instructions at [ollama.com](https://ollama.com/).

### Remove AIDA
Delete the `aida/` folder. AIDA stores its database at:
- Windows: `%APPDATA%/ENGIOS/`
- Linux: `~/.config/ENGIOS/`

Delete that folder to remove all conversation history and settings.

---

## Getting Help

- Open an issue at [github.com/ENGIOS-DEV/ENGIOS/issues](https://github.com/ENGIOS-DEV/ENGIOS/issues)
- Include your OS, Node.js version, and the error message

---

## What to Expect

ENGIOS is in active development. Every monthly release is an honest snapshot of progress. Some features are complete, some are partial, some are placeholders. The [release notes](https://github.com/ENGIOS-DEV/ENGIOS/releases) for each version document exactly what works and what does not.

This is not finished software. It is a project being built in public, with full transparency about where it is and where it is going.

---

*ENGIOS — Engineered Intelligent OS · [engios.dev](https://engios.dev)*

**Because machines deserve to live longer too.**
