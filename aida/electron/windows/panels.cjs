// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — ELECTRON: Panel Window Factory
// AIDA-2 — electron/windows/panels.cjs
//
// Responsibility:
//   Creates ALL panel windows using one standard config.
//   Panels are settings and preferences windows — fixed size, centred,
//   always on top of app windows but below fullscreen apps.
//
// Standard panel window config (from BLUEPRINT.md):
//   frame:       false  — no OS title bar — React renders its own chrome
//   transparent: true   — panel manages its own background and border radius
//   resizable:   false  — panels are fixed size — no user resizing
//   skipTaskbar: true   — panels do not appear in the taskbar
//
// Panel windows:
//   settings                  — Global Settings
//   clock-weather-settings    — Clock & Weather widget settings
//   today-settings            — Today panel settings
//
// Rules:
//   - All panel windows use createPanelWindow() — no exceptions
//   - Dimensions come from PANEL_SIZES — never hardcoded in this file
//   - Panels are always centred on the primary display
//   - show: false on creation — IPC handlers control when panels appear
// ═══════════════════════════════════════════════════════════════════════════════

const { BrowserWindow, screen } = require('electron')
const path                      = require('path')
const registry                  = require('../registry.cjs')

// ─── Config ───────────────────────────────────────────────────────────────────
// Standard config applied to every panel window.

const PANEL_WINDOW_CONFIG = {
  frame:       false,
  transparent: true,
  resizable:   true,
  skipTaskbar: true,
  alwaysOnTop: false,
}

// ─── Dimensions ───────────────────────────────────────────────────────────────
// All panels share one of two sizes:
//   standard  — widget settings panels (480 × 580)
//   wide      — global settings panel  (700 × 500)

const PANEL_SIZES = {
  'settings':                 { width: 700, height: 500 },
  'clock-weather-settings':   { width: 480, height: 580 },
  'today-settings':           { width: 480, height: 680 },
}

// ─── HTML entry paths ────────────────────────────────────────────────────────

const PANEL_PATHS = {
  'settings':                'src/components/panels/global-settings/index.html',
  'clock-weather-settings':  'src/components/panels/clock-weather-settings/index.html',
  'today-settings':          'src/components/panels/today-settings/index.html',
}

// ─── createPanelWindow ────────────────────────────────────────────────────────
// The single factory function for all panel windows.
// Always centred on the primary display.
// Registers in the registry immediately after creation.

function createPanelWindow(name, isDev, preloadPath, devPort = 5390) {
  const sizes = PANEL_SIZES[name]
  if (!sizes) throw new Error(`[panels] Unknown panel window name: "${name}"`)

  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
  const x = Math.round((sw - sizes.width)  / 2)
  const y = Math.round((sh - sizes.height) / 2)

  const win = new BrowserWindow({
    width:  sizes.width,
    height: sizes.height,
    x,
    y,
    ...PANEL_WINDOW_CONFIG,
    show: false,
    webPreferences: {
      preload:              preloadPath,
      nodeIntegration:      false,
      contextIsolation:     true,
      backgroundThrottling: false,
    },
  })

  const htmlPath = PANEL_PATHS[name]
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

// ─── ensurePanelWindow ───────────────────────────────────────────────────────
// Returns an existing panel window or creates it on first use.

function ensurePanelWindow(name, isDev, preloadPath, devPort = 5390) {
  if (registry.isOpen(name)) return registry.getWindow(name)
  return createPanelWindow(name, isDev, preloadPath, devPort)
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = { createPanelWindow, ensurePanelWindow, PANEL_SIZES }
