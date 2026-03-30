// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — ELECTRON IPC: Window Handlers
// AIDA-2 — electron/ipc/windows.cjs
//
// Responsibility:
//   All IPC handlers for window lifecycle management.
//   Show, hide, minimise, maximise, focus — all window state changes
//   triggered by the renderer go through here.
//
// Channels handled:
//   window:show      — show a named window
//   window:hide      — hide a named window
//   window:minimise  — minimise the sending window
//   window:maximise  — toggle maximise on the sending window
//   window:focus     — notify a window it has regained focus (settings reload)
//
// Rules:
//   - Window identity comes from the registry — never hardcoded here
//   - Never creates windows — that is electron/windows/*.cjs responsibility
//   - Widgets use showInactive() — they must never steal focus
//   - App and panel windows use show() + focus()
// ═══════════════════════════════════════════════════════════════════════════════

const { ipcMain, BrowserWindow } = require('electron')
const registry                   = require('../registry.cjs')

// ── window:show ───────────────────────────────────────────────────────────────
// Shows a named window. Widget windows use showInactive() — they never
// steal focus from whatever the user is currently doing.
// All other windows use show() + focus().

const WIDGET_NAMES = new Set(['clock-weather-widget'])

// ── Track open panels for menubar auto-hide suspension ───────────────────────
const PANEL_NAMES = new Set(['settings', 'clock-weather-settings', 'today-settings'])

ipcMain.on('window:show', (_event, name) => {
  const win = registry.getWindow(name)
  if (!win || win.isDestroyed()) return

  if (WIDGET_NAMES.has(name)) {
    win.showInactive()
  } else {
    win.show()
    win.focus()
    if (PANEL_NAMES.has(name)) {
      registry.getWindow('handle')?.webContents.send('menubar:panel-open')
    }
  }
})

// ── window:hide ───────────────────────────────────────────────────────────────
// Hides a named window without destroying it.
// The window's state is preserved — showing it again is instant.

// ── window:close ─────────────────────────────────────────────────────────────
// Closes the window that sent the message — used by provider windows which
// don't know their own registry key.

ipcMain.on('window:close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win && !win.isDestroyed()) win.close()
})

ipcMain.on('window:hide', (_event, name) => {
  const win = registry.getWindow(name)
  if (win && !win.isDestroyed()) {
    win.hide()
    if (PANEL_NAMES.has(name)) {
      registry.getWindow('handle')?.webContents.send('menubar:panel-closed')
    }
  }
})

// ── window:minimise ───────────────────────────────────────────────────────────
// Minimises the window that sent the message.
// Uses the sender's webContents to identify the correct window.

ipcMain.on('window:minimise', event => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win && !win.isDestroyed()) win.minimize()
})

// ── window:maximise ───────────────────────────────────────────────────────────
// Toggles maximise state on the sending window.
// If maximised — restores. If not — maximises.

ipcMain.on('window:maximise', event => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win || win.isDestroyed()) return
  win.isMaximized() ? win.unmaximize() : win.maximize()
})

// ── window:focus ──────────────────────────────────────────────────────────────
// Sent by the main process to a window when it regains focus.
// Each Window.tsx listens for this and reloads settings from the DB —
// ensuring the window always reflects the latest saved state.
// This handler is outbound only (main → renderer) — registered here
// for documentation purposes. The actual send happens in main.cjs
// via the 'focus' event on each BrowserWindow.

// ── Menubar toggle / show / hide ──────────────────────────────────────────────
// Handle window sends menubar:toggle on click.
// menubar:show and menubar:hide are available for programmatic use.
// setIgnoreMouseEvents ensures the full-screen menubar window only
// captures mouse events when it is actually visible.

// Mirrors AIDA-1 proven pattern exactly.
// Toggle does NOT call setIgnoreMouseEvents — the fixed-position content div
// only covers what it needs to. The transparent area has no DOM element.

// ── toast:show ───────────────────────────────────────────────────────────────
// Send a toast to the desktop toast widget from anywhere in main process.
// Also callable from renderer via window.electron.send('toast:show', payload)

ipcMain.on('toast:show', (_event, toast) => {
  const win = registry.getWindow('toast')
  if (win && !win.isDestroyed()) {
    win.showInactive()
    win.webContents.send('toast:show', toast)
  }
})

let toastsShowing = false
ipcMain.on('toast:showing', () => { toastsShowing = true })
ipcMain.on('toast:hidden',  () => { toastsShowing = false })

ipcMain.on('menubar:toggle', () => {
  const win = registry.getWindow('menubar')
  if (!win || win.isDestroyed()) return
  if (win.isVisible()) {
    win.setIgnoreMouseEvents(true, { forward: true })
    win.hide()
    registry.getWindow('handle')?.webContents.send('menubar:state', false)
  } else {
    win.setIgnoreMouseEvents(false)
    win.show()
    registry.getWindow('handle')?.webContents.send('menubar:state', true)
  }
})

ipcMain.on('menubar:mouse-over-content', () => {
  const win = registry.getWindow('menubar')
  if (win && !win.isDestroyed()) win.setIgnoreMouseEvents(false)
})

ipcMain.on('menubar:mouse-over-transparent', () => {
  const win = registry.getWindow('menubar')
  if (win && !win.isDestroyed()) win.setIgnoreMouseEvents(true, { forward: true })
})

ipcMain.on('menubar:hide', () => {
  if (toastsShowing) return   // don't hide while toasts are visible
  const win = registry.getWindow('menubar')
  if (!win || win.isDestroyed()) return
  win.setIgnoreMouseEvents(true, { forward: true })
  win.hide()
  registry.getWindow('handle')?.webContents.send('menubar:state', false)
})
