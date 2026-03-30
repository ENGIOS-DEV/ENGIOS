// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — ELECTRON IPC: Settings Handlers
// AIDA-2 — electron/ipc/settings.cjs
//
// Responsibility:
//   All IPC handlers for settings operations.
//   Settings are read/written via database/schema.cjs (via db:settings:*)
//   which is handled in electron/ipc/database.cjs.
//
//   This file owns one additional responsibility that database.cjs does not:
//   BROADCASTING — when settings change, every open window must be notified
//   so its UI updates immediately without requiring a reload.
//
// Channels handled here:
//   settings:broadcast  — main receives updated settings, sends to all windows
//
// Rules:
//   - The broadcast is the ONLY way settings propagate across windows
//   - Never read/write settings directly here — that is database.cjs's job
//   - Every window listens for 'settings:updated' and re-applies its theme
// ═══════════════════════════════════════════════════════════════════════════════

const { ipcMain } = require('electron')
const registry    = require('../registry.cjs')

// ─── settings:broadcast ───────────────────────────────────────────────────────
// Triggered by any window when GlobalSettings change.
// Sends the updated settings object to EVERY open, non-destroyed window.
// Each window's Window.tsx listens for 'settings:updated' and calls
// setSettings() → useGlobal() → applyGlobal() to re-inject CSS variables.
//
// Also handles widget visibility toggling — when showClockWidget or

// ─── today-settings:broadcast ────────────────────────────────────────────────
ipcMain.on('today-settings:broadcast', (_event, updated) => {
  // Broadcast to all windows
  const windows = registry.getWindows()
  Object.values(windows).forEach(win => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('today-settings:updated', updated)
    }
  })

  // Update all incomplete tasks of each priority with the new reminder interval
  // Only updates if the priority is enabled and has a specific interval set
  try {
    const intervalMap = {
      high:   updated.highPriorityInterval,
      medium: updated.mediumPriorityInterval,
      low:    updated.lowPriorityInterval,
    }
    const enabledMap = {
      high:   updated.highPriorityEnabled !== false,
      medium: updated.mediumPriorityEnabled !== false,
      low:    updated.lowPriorityEnabled !== false,
    }
    Object.entries(intervalMap).forEach(([priority, interval]) => {
      if (enabledMap[priority] && interval && interval !== 'repeat') {
        db.updateTasksByPriority(priority, interval)
      } else if (enabledMap[priority] && interval === 'repeat') {
        const repeatEvery = updated[`${priority}RepeatEvery`] ?? '1hr'
        db.updateTasksByPriority(priority, repeatEvery)
      }
    })
  } catch (err) {
    console.error('[today-settings] task update failed:', err.message)
  }
})

ipcMain.on('settings:broadcast', (_event, updated) => {
  const windows = registry.getWindows()

  // ── Broadcast to all windows ──────────────────────────────────────────────
  Object.values(windows).forEach(win => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('settings:updated', updated)
    }
  })

  // ── Widget visibility ─────────────────────────────────────────────────────
  // Only act when the relevant toggle was explicitly included in the update.
  // hasOwnProperty check prevents false triggers on unrelated setting changes.

  if (Object.prototype.hasOwnProperty.call(updated, 'showClockWidget')) {
    const win = windows['clock-weather-widget']
    if (win && !win.isDestroyed()) {
      updated.showClockWidget ? win.showInactive() : win.hide()
    }
  }

})

// ─── clock-settings:update ───────────────────────────────────────────────────
// Sent by the widget context menu to update a single clock setting
// (e.g. positionLocked). Merges with existing settings and broadcasts.

ipcMain.on('clock-settings:update', async (_event, changes) => {
  const { getDb, setSetting, getSetting } = require('../../database/schema.cjs')
  const KEY = 'aida-clock-settings'
  try {
    const raw  = getSetting(KEY)
    const prev = raw ? JSON.parse(raw) : {}
    const next = { ...prev, ...changes }
    setSetting(KEY, JSON.stringify(next))
    const windows = registry.getWindows()
    Object.values(windows).forEach(win => {
      if (win && !win.isDestroyed()) {
        win.webContents.send('clock-settings:updated', next)
      }
    })
  } catch (err) {
    console.error('[clock-settings:update]', err.message)
  }
})
