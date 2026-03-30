// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — ELECTRON: Widget Window Factory
// AIDA-2 — electron/windows/widgets.cjs
//
// Responsibility:
//   Creates ALL desktop widget windows using one standard config.
//   Widgets live on the desktop — persistent, unobtrusive, always visible
//   but never in the way.
//
// Standard widget window config (from BLUEPRINT.md):
//   frame:       false  — no OS chrome — widget renders its own shape
//   transparent: true   — widget manages its own background and shape
//   resizable:   false  — widgets have fixed dimensions (can grow via window:fit)
//   skipTaskbar: true   — widgets do not appear in the taskbar
//   alwaysOnTop: false  — widgets sit below fullscreen apps
//
// Critical widget rules:
//   - NEVER use show() or focus() on widgets — always showInactive()
//   - Widgets must never steal focus from the user's active window
//   - Widget positions are persisted to the DB and restored on startup
//   - Widgets clamp to the display work area — never go off-screen
//   - window:fit IPC allows widgets to resize as their content changes
//
// Widget windows:
//   clock-weather-widget  — Clock & Weather desktop widget
// ═══════════════════════════════════════════════════════════════════════════════

const { BrowserWindow, screen, ipcMain } = require('electron')
const path                               = require('path')
const registry                           = require('../registry.cjs')
const db                                 = require('../../database/schema.cjs')

// ─── Config ───────────────────────────────────────────────────────────────────

const WIDGET_WINDOW_CONFIG = {
  frame:       false,
  transparent: true,
  resizable:   false,
  skipTaskbar: true,
  alwaysOnTop: false,
}

// ─── HTML entry paths ────────────────────────────────────────────────────────

const WIDGET_PATHS = {
  'clock-weather-widget': 'src/components/widgets/clock-weather/index.html',
}

// ─── DB keys for persisted positions ────────────────────────────────────────
// Widget positions are stored in the settings table under these keys.

const WIDGET_POSITION_KEYS = {
  'clock-weather-widget': 'widget-pos-clock-weather',
}

// ─── getWidgetStartPosition ──────────────────────────────────────────────────
// Returns the last saved position for a widget, or the default position
// if no saved position exists yet.
// Clamps to the display work area so widgets never start off-screen.

function getWidgetStartPosition(name, defaultX, defaultY) {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
  const key = WIDGET_POSITION_KEYS[name]

  try {
    const raw = db.getSetting(key)
    if (raw) {
      const { x, y } = JSON.parse(raw)
      return {
        x: Math.max(0, Math.min(x, sw - 100)),
        y: Math.max(0, Math.min(y, sh - 100)),
      }
    }
  } catch (_) {
    // Corrupt or missing position — fall through to default
  }

  return {
    x: Math.max(0, Math.min(defaultX, sw - 100)),
    y: Math.max(0, Math.min(defaultY, sh - 100)),
  }
}

// ─── saveWidgetPosition ──────────────────────────────────────────────────────
// Persists a widget's current position to the settings DB.
// Called after a drag ends (via window:savePosition IPC).

function saveWidgetPosition(name, x, y) {
  const key = WIDGET_POSITION_KEYS[name]
  if (key) db.setSetting(key, JSON.stringify({ x, y }))
}

// ─── createWidgetWindow ──────────────────────────────────────────────────────
// The single factory function for all widget windows.
// Starts at a small placeholder size — widgets measure their content
// and send window:fit to set their real dimensions.

function createWidgetWindow(name, isDev, preloadPath, devPort = 5390, defaultX, defaultY) {
  if (!WIDGET_PATHS[name]) throw new Error(`[widgets] Unknown widget name: "${name}"`)

  const pos = getWidgetStartPosition(name, defaultX, defaultY)

  const win = new BrowserWindow({
    width:  10,   // placeholder — widget sends window:fit once content is measured
    height: 10,
    x:      pos.x,
    y:      pos.y,
    ...WIDGET_WINDOW_CONFIG,
    show: false,
    webPreferences: {
      preload:              preloadPath,
      nodeIntegration:      false,
      contextIsolation:     true,
      backgroundThrottling: false,
    },
  })

  const htmlPath = WIDGET_PATHS[name]
  if (isDev) {
    win.loadURL(`http://localhost:${devPort}/${htmlPath}`)
  } else {
    win.loadFile(path.join(__dirname, '../../dist', htmlPath))
  }

  win.setMenu(null)

  // Widgets never send window:focus — they don't reload settings on focus
  // because they use showInactive() and should never interrupt the user

  // When the widget loses focus (user clicked elsewhere), tell the renderer
  // so floating UI like context menus can close themselves.
  win.on('blur', () => {
    if (!win.isDestroyed()) win.webContents.send('widget:blur')
  })

  registry.register(name, win)
  return win
}

// ─── IPC: window:fit ─────────────────────────────────────────────────────────
// Allows a widget to resize itself after measuring its content.
// Clamps to the display work area — widget can never go off-screen.
// Anchor parameter keeps the specified edge fixed during resize:
//   'right'  — right edge stays fixed (widget grows left)
//   'bottom' — bottom edge stays fixed (widget grows up)

ipcMain.on('window:fit', (_event, { name, width, height, anchor }) => {
  const win = registry.getWindow(name)
  if (!win || win.isDestroyed()) return

  const display = screen.getDisplayNearestPoint(win.getBounds())
  const wa      = display.workArea

  const newW = Math.ceil(width)
  const newH = Math.ceil(height)
  const [oldX, oldY] = win.getPosition()
  const [oldW, oldH] = win.getSize()

  let newX = oldX
  let newY = oldY

  if (win.isVisible()) {
    if (anchor === 'right')       newX = oldX + (oldW - newW)
    if (anchor === 'bottom')      newY = oldY + (oldH - newH)
    // 'top' anchor — x:0, y:0, full screen width, content height
    if (anchor === 'top')        { newX = 0; newY = 0 }
    // 'bottom-right' anchor — pin to bottom-right, grow upward
    if (anchor === 'bottom-right') {
      newX = wa.x + wa.width  - newW - 16
      newY = wa.y + wa.height - newH - 16
    }
  }

  // Clamp to work area
  newX = Math.max(wa.x, Math.min(newX, wa.x + wa.width  - newW))
  newY = Math.max(wa.y, Math.min(newY, wa.y + wa.height - newH))

  win.setBounds({ x: newX, y: newY, width: newW, height: newH })
})

// ─── IPC: window:savePosition ────────────────────────────────────────────────
// Called by a widget after a drag ends to persist its new position.

ipcMain.on('window:savePosition', (_event, { name }) => {
  const win = registry.getWindow(name)
  if (!win || win.isDestroyed()) return
  const [x, y] = win.getPosition()
  saveWidgetPosition(name, x, y)
})

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  createWidgetWindow,
  getWidgetStartPosition,
  saveWidgetPosition,
}

// ─── IPC: window:dragBy ──────────────────────────────────────────────────────
// Moves a widget window by a delta (dx, dy) rather than absolute position.
// Called on every mousemove during a widget drag.

ipcMain.on('window:dragBy', (_event, { name, dx, dy }) => {
  const win = registry.getWindow(name)
  if (!win || win.isDestroyed()) return
  const [x, y] = win.getPosition()
  win.setPosition(x + Math.round(dx), y + Math.round(dy))
})
