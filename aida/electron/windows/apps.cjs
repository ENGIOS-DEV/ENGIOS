// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — ELECTRON: App Window Factory
// AIDA-2 — electron/windows/apps.cjs
//
// Responsibility:
//   Creates ALL app windows using one standard config.
//   Apps are full-featured windows — file manager, chat, tasks, terminal.
//
// Standard app window config (from BLUEPRINT.md):
//   frame:       false  — no OS title bar — React renders its own via AppTitleBar
//   transparent: false  — OS paints the background — window is always visible
//   resizable:   true   — user can resize app windows
//   skipTaskbar: false  — app windows appear in the taskbar
//
// App windows:
//   file-decks  — File Decks (file manager + editor)
//   aida-chat   — AIDA Chat (local AI conversation)
//   tasks       — Tasks (task management)
//   terminal    — Terminal (ENGIOS build only)
//   provider    — AI Provider (web-based provider window)
//
// Rules:
//   - All app windows use createAppWindow() — no exceptions
//   - Dimensions come from APP_SIZES — never hardcoded in this file
//   - Windows are registered in the registry immediately after creation
//   - show: false on creation — IPC handlers control when windows appear
// ═══════════════════════════════════════════════════════════════════════════════

const { BrowserWindow, screen, nativeImage } = require('electron')
const path                                   = require('path')
const registry                               = require('../registry.cjs')

const appIcon = nativeImage.createFromPath(path.join(__dirname, '../../src/assets/icons/aida.ico'))

// ─── Config ───────────────────────────────────────────────────────────────────
// Standard config applied to every app window.
// Any deviation requires a documented reason in BLUEPRINT.md.

const APP_WINDOW_CONFIG = {
  frame:       false,
  transparent: false,
  resizable:   true,
  skipTaskbar: false,
  icon:        appIcon,
}

// ─── Dimensions ───────────────────────────────────────────────────────────────
// Default sizes per app. All in pixels.

const APP_SIZES = {
  'file-decks': { width: 820,  height: 560 },
  'aida-chat':  { width: 800,  height: 560 },
  'tasks':      { width: 700,  height: 600 },
  'terminal':   { width: 800,  height: 480 },
  'provider':   { width: 1200, height: 860 },
}

// ─── HTML entry paths ────────────────────────────────────────────────────────
// Maps window name to its index.html path.

const APP_PATHS = {
  'file-decks': 'src/components/apps/file-decks/index.html',
  'aida-chat':  'src/components/apps/aida-chat/index.html',
  'tasks':      'src/components/apps/tasks/index.html',
  'terminal':   'src/components/apps/terminal/index.html',
  'provider':   'src/components/apps/provider/index.html',
}

// ─── createAppWindow ──────────────────────────────────────────────────────────
// The single factory function for all app windows.
// Centres the window on the primary display's work area.
// Registers it in the registry immediately.
// Wires up the focus event so Window.tsx can reload settings on focus.

function createAppWindow(name, isDev, preloadPath, devPort = 5390) {
  const sizes = APP_SIZES[name]
  if (!sizes) throw new Error(`[apps] Unknown app window name: "${name}"`)

  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
  const x = Math.round((sw - sizes.width)  / 2)
  const y = Math.round((sh - sizes.height) / 2)

  const win = new BrowserWindow({
    width:  sizes.width,
    height: sizes.height,
    x,
    y,
    ...APP_WINDOW_CONFIG,
    show: false,
    webPreferences: {
      preload:              preloadPath,
      nodeIntegration:      false,
      contextIsolation:     true,
      backgroundThrottling: false,
      // provider window needs webview tag for embedding web content
      webviewTag: name === 'provider',
    },
  })

  const htmlPath = APP_PATHS[name]
  if (isDev) {
    win.loadURL(`http://localhost:${devPort}/${htmlPath}`)
  } else {
    win.loadFile(path.join(__dirname, '../../dist', htmlPath))
  }

  win.setMenu(null)

  // Notify the window when it regains focus — Window.tsx reloads settings
  win.on('focus', () => {
    if (!win.isDestroyed()) {
      win.webContents.send('window:focus')
    }
  })

  registry.register(name, win)
  return win
}

// ─── ensureAppWindow ─────────────────────────────────────────────────────────
// Returns an existing app window or creates it on first use.
// This is the lazy creation pattern — windows are only created when needed,
// not all at startup.

function ensureAppWindow(name, isDev, preloadPath, devPort = 5390) {
  if (registry.isOpen(name)) return registry.getWindow(name)
  return createAppWindow(name, isDev, preloadPath, devPort)
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = { createAppWindow, ensureAppWindow, APP_SIZES }
