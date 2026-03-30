// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — ELECTRON: Main Process
// AIDA-2 — electron/main.cjs
//
// Responsibility:
//   Application lifecycle and IPC routing ONLY.
//   This file starts the app, creates the initial windows, and wires
//   all modules together. It does no work itself.
//
// What lives here:
//   - app lifecycle (ready, window-all-closed, quit)
//   - isDev flag and preload path — passed to all window factories
//   - Initial window creation on startup
//   - IPC routing for open/show/hide per named window
//   - Auto-start registration
//   - Provider window management
//
// What does NOT live here:
//   - Window creation logic        → electron/windows/*.cjs
//   - IPC handler implementations  → electron/ipc/*.cjs
//   - Registry management          → electron/registry.cjs
//   - Database operations          → database/*.cjs
//   - Any UI or styling logic      → src/
// ═══════════════════════════════════════════════════════════════════════════════

'use strict'

const { app, ipcMain, BrowserWindow, screen, shell } = require('electron')
const path = require('path')
const { nativeImage } = require('electron')

// ─── Environment ──────────────────────────────────────────────────────────────
const isDev      = !app.isPackaged
const DEV_PORT   = 5390
const preloadPath = path.join(__dirname, '../bridge/preload.cjs')

// ─── Module imports ───────────────────────────────────────────────────────────
// Order matters — registry first, then DB, then windows, then IPC handlers.

const registry = require('./registry.cjs')
const db       = require('../database/schema.cjs')
const seeds    = require('../database/seeds.cjs')

const { createAppWindow,    ensureAppWindow    } = require('./windows/apps.cjs')
const { createPanelWindow,  ensurePanelWindow  } = require('./windows/panels.cjs')
const { createWidgetWindow                     } = require('./windows/widgets.cjs')

// IPC handlers — imported for side effects (they register themselves)
const { onTasksUpdated } = require('./ipc/database.cjs')
require('./ipc/settings.cjs')
require('./ipc/filesystem.cjs')
require('./ipc/windows.cjs')
require('./ipc/system.cjs')

// ─── Pending provider loads ───────────────────────────────────────────────────
// When a provider window is new, the renderer signals ready before we send data.
const pendingProviderLoads = {}

ipcMain.on('renderer:ready', (event, name) => {
  const win = require('electron').BrowserWindow.fromWebContents(event.sender)
  if (!win) return

  // Emit named ready event for any listener waiting on this specific window
  if (name) ipcMain.emit(`renderer:ready:${name}`)

  // Find which provider window this is and send its pending data
  const allWindows = registry.getWindows()
  for (const [key, w] of Object.entries(allWindows)) {
    if (w === win && key.startsWith('provider-') && pendingProviderLoads[key]) {
      win.webContents.send('provider:load', pendingProviderLoads[key])
      delete pendingProviderLoads[key]
      break
    }
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// APP LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════════

// Prevent background timer throttling (safe — no widget lifecycle issues)
app.commandLine.appendSwitch('disable-background-timer-throttling')

// ── OS username ──────────────────────────────────────────────────────────────
const os = require('os')
ipcMain.handle('os:username', () => os.userInfo().username)

app.whenReady().then(() => {
  // Set taskbar/dock icon to AIDA logo
  try {
    const iconPath = path.join(__dirname, '../src/assets/icons/aida.ico')
    const icon     = nativeImage.createFromPath(iconPath)
    if (!icon.isEmpty()) app.setAppUserModelId('ENGIOS.AIDA')
    // Set icon on all subsequently created windows via default
  } catch (_) {}
  // ── Initialise database ─────────────────────────────────────────────────────
  // getDb() initialises the connection, runs schema, runs migrations.
  // seeds.runSeeds() seeds default data for both core and flags.
  db.getDb()
  seeds.runSeeds()

  // ── Create initial windows ──────────────────────────────────────────────────
  createInitialWindows()

  // ── macOS re-activate ────────────────────────────────────────────────────────
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createInitialWindows()
  })
})

app.on('window-all-closed', () => {
  // On macOS apps conventionally stay open until explicitly quit.
  // On all other platforms — quit when all windows are closed.
  if (process.platform !== 'darwin') app.quit()
})

// ═══════════════════════════════════════════════════════════════════════════════
// INITIAL WINDOW CREATION
// Creates the shell (menubar + handle) and desktop widgets on startup.
// All other windows are created lazily on first use via ensureAppWindow /
// ensurePanelWindow.
// ═══════════════════════════════════════════════════════════════════════════════

function createInitialWindows() {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize

  // ── Handle first — show immediately, don't wait for ready-to-show ──────────
  createHandleWindow()

  // ── Menubar + Widgets after handle ─────────────────────────────────────────
  createMenubarWindow()

  // ── Widgets ─────────────────────────────────────────────────────────────────
  // Created at startup. Visibility controlled by GlobalSettings.
  const clockPos   = { x: sw - 400, y: 8   }

  const clockWin   = createWidgetWindow('clock-weather-widget', isDev, preloadPath, DEV_PORT, clockPos.x, clockPos.y)
  // Toast now renders inside the menubar window — no separate widget needed

  // Show widgets according to saved GlobalSettings
  clockWin.once('ready-to-show', () => {
    try {
      const raw      = db.getSetting('aida-settings')
      const settings = raw ? JSON.parse(raw) : {}
      if (settings.showClockWidget !== false) clockWin.showInactive()
    } catch (_) {
      clockWin.showInactive()
    }
  })

  // Toast window — show only after first window:fit (via toast:ready)
  ipcMain.once('toast:ready', () => toastWin.showInactive())

  // ── Nudge system ─────────────────────────────────────────────────────────
  // Tracks which task IDs have been nudged this session — resets at midnight.
  const nudgedToday = new Map()  // taskId → timestamp of last nudge

  // ── Interval helpers ─────────────────────────────────────────────────────
  function intervalToMs(interval) {
    switch (interval) {
      case '15min': return 15 * 60 * 1000
      case '30min': return 30 * 60 * 1000
      case '1hr':   return 60 * 60 * 1000
      case '4hr':   return  4 * 60 * 60 * 1000
      default:      return 0
    }
  }

  function fireNudges() {
    const menuWin = registry.getWindow('menubar')
    if (!menuWin || menuWin.isDestroyed()) return
    try {
      const todayRaw      = db.getSetting('today-settings')
      const cfg           = todayRaw ? JSON.parse(todayRaw) : {}
      if (cfg.notificationsEnabled === false) return

      const todayStr = new Date().toISOString().slice(0, 10)
      const allTasks = db.getTasks()

      // Per-priority settings
      const priorityEnabled = {
        high:   cfg.highPriorityEnabled   !== false,
        medium: cfg.mediumPriorityEnabled !== false,
        low:    cfg.lowPriorityEnabled    !== false,
      }
      const priorityInterval = {
        high:   cfg.highPriorityInterval   ?? '15min',
        medium: cfg.mediumPriorityInterval ?? '1hr',
        low:    cfg.lowPriorityInterval    ?? '4hr',
      }
      const repeatEveryMs = {
        high:   intervalToMs(cfg.highRepeatEvery   ?? '30min'),
        medium: intervalToMs(cfg.mediumRepeatEvery ?? '30min'),
        low:    intervalToMs(cfg.lowRepeatEvery    ?? '30min'),
      }

      const overdueRepeat = cfg.overdueRepeatInterval ?? '30min'
      const now = Date.now()

      const overdue = allTasks
        .filter(t => {
          if (!priorityEnabled[t.priority]) return false
          if (t.completed || !t.due_date || t.due_date >= todayStr) return false
          const last = nudgedToday.get(t.id)
          if (!last) return true  // never nudged this session
          // startup-only — never repeat
          if (overdueRepeat === 'startup-only') return false
          // Check if enough time has passed based on this task's priority interval
          const interval = priorityInterval[t.priority] ?? '1hr'
          if (interval === 'repeat') return now - last >= repeatEveryMs[t.priority]
          const ms = intervalToMs(interval)
          return ms > 0 && now - last >= ms
        })
        .sort((a, b) => a.due_date < b.due_date ? -1 : 1)

      overdue.forEach((task, i) => {
        nudgedToday.set(task.id, now)
        setTimeout(() => {
          const menuWin = registry.getWindow('menubar')
    if (!menuWin || menuWin.isDestroyed()) return
          const daysAgo = Math.round(
            (new Date(todayStr) - new Date(task.due_date)) / 86400000
          )
          const when    = daysAgo === 0 ? 'today'
                        : daysAgo === 1 ? 'yesterday'
                        : `${daysAgo} days ago`
          const variant = task.priority === 'high'   ? 'error'
                        : task.priority === 'medium' ? 'info'
                        :                              'warning'
          menuWin.webContents.send('toast:show', {
            variant,
            title:    `Hey, just a heads up! 👋`,
            message:  `"${task.title}" was due ${when}. Did you get to it?`,
            duration: 12000,
            overdue:  true,
            action:   { label: 'Open Tasks', ipc: 'tasks:open' },
          })
        }, i * 2000)
      })
    } catch (err) {
      console.error('[nudge] check failed:', err.message)
    }
  }

  // Reset nudged map at midnight so next day starts fresh
  function scheduleMidnightReset() {
    const now      = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    setTimeout(() => {
      nudgedToday.clear()
      scheduleMidnightReset()
    }, midnight - now)
  }
  scheduleMidnightReset()

  // ── Reminder system ──────────────────────────────────────────────────────
  // Fires a toast when now >= due_datetime - reminder_interval
  // Tracks which tasks have been reminded this session
  const remindedToday  = new Set()
  const recentlySaved  = new Map()  // taskId → timestamp of save

  function intervalToMinutes(interval) {
    switch (interval) {
      case '15min': return 15
      case '30min': return 30
      case '1hr':   return 60
      case '4hr':   return 240
      default:      return 0
    }
  }

  function fireReminders() {
    const menuWin = registry.getWindow('menubar')
    if (!menuWin || menuWin.isDestroyed()) return
    try {
      const todayRaw      = db.getSetting('today-settings')
      const cfg           = todayRaw ? JSON.parse(todayRaw) : {}
      if (cfg.remindersEnabled === false) return

      const now      = new Date()
      const todayStr = now.toISOString().slice(0, 10)
      const allTasks = db.getTasks()

      allTasks.forEach(task => {
        // Must have due_date, due_time and reminder_interval
        if (task.completed || !task.due_date || !task.due_time || !task.reminder_interval) return
        if (remindedToday.has(task.id)) return
        // Don't fire immediately after editing — give user time to adjust
        const savedAt = recentlySaved.get(task.id)
        if (savedAt && (Date.now() - savedAt) < 30000) return

        const minutes    = intervalToMinutes(task.reminder_interval)
        if (minutes === 0) return

        const dueMs      = new Date(`${task.due_date}T${task.due_time}:00`).getTime()
        const reminderMs = dueMs - (minutes * 60 * 1000)

        if (now.getTime() >= reminderMs && now.getTime() < dueMs) {
          remindedToday.add(task.id)
          const variant = task.priority === 'high'   ? 'error'
                        : task.priority === 'medium' ? 'info'
                        :                              'warning'
          menuWin.webContents.send('toast:show', {
            variant,
            title:    `Reminder 🔔`,
            message:  `"${task.title}" is due at ${task.due_time}`,
            duration: 0,        // 0 = no auto-dismiss, user must interact
            reminder: true,
            taskId:   task.id,
          })
        }
      })
    } catch (err) {
      console.error('[reminders] check failed:', err.message)
    }
  }

  // When any task is saved/edited, clear remindedToday and re-check
  onTasksUpdated((id) => {
    if (id) {
      remindedToday.delete(id)
      recentlySaved.set(id, Date.now())  // record save time
    } else {
      remindedToday.clear()
    }
    setTimeout(fireReminders, 500)
  })

  // Start nudge/reminder system once menubar renderer is ready
  ipcMain.once('menubar:ready', () => {
    // Give DB a moment to settle
    setTimeout(() => {
      fireNudges()
      fireReminders()
      setInterval(fireReminders, 60 * 1000)
      setInterval(fireNudges,    5 * 60 * 1000)
    }, 2000)
  })

}

// ─── createHandleWindow ──────────────────────────────────────────────────────
// The small accent pill that peeks at the top of the screen.
// Always visible. alwaysOnTop: true. Triggers menubar reveal on hover/click.

function createHandleWindow() {
  const { width: sw }        = screen.getPrimaryDisplay().workAreaSize
  const { HANDLE_W, HANDLE_H } = require('../src/themes/handle.constants.cjs')

  const win = new BrowserWindow({
    width:       HANDLE_W,
    height:      HANDLE_H,
    x:           Math.round(sw / 2) - Math.round(HANDLE_W / 2),
    y:           0,
    frame:       false,
    transparent: true,
    hasShadow:   false,
    alwaysOnTop: true,
    resizable:   false,
    skipTaskbar: true,
    movable:     false,
    show:        false,
    webPreferences: {
      preload:          preloadPath,
      nodeIntegration:  false,
      contextIsolation: true,
    },
  })

  if (isDev) {
    win.loadURL(`http://localhost:${DEV_PORT}/src/components/menubar/handle.html`)
  } else {
    win.loadFile(path.join(__dirname, '../dist/src/components/menubar/handle.html'))
  }

  win.setMenu(null)
  win.webContents.once('did-finish-load', () => win.show())
  registry.register('handle', win)
  return win
}

// ─── createMenubarWindow ─────────────────────────────────────────────────────
// Full-screen transparent window for the pull-down menubar surface.
// Hidden by default. Transparent to mouse events when hidden.
// Revealed by the handle window via IPC.

function createMenubarWindow() {
  const { width, height } = screen.getPrimaryDisplay().bounds

  const win = new BrowserWindow({
    width,
    height,   // full screen height — content is fixed/top, dropdowns render freely below
    x:           0,
    y:           0,
    frame:           false,
    transparent:     true,
    alwaysOnTop:     false,
    resizable:   false,
    skipTaskbar: true,
    movable:     false,
    show:        false,
    webPreferences: {
      preload:              preloadPath,
      nodeIntegration:      false,
      contextIsolation:     true,
      backgroundThrottling: false,
    },
  })

  if (isDev) {
    win.loadURL(`http://localhost:${DEV_PORT}/src/components/menubar/menubar.html`)
  } else {
    win.loadFile(path.join(__dirname, '../dist/src/components/menubar/menubar.html'))
  }

  win.setMenu(null)

  // Transparent to mouse events — content div is fixed/top-only so
  // transparent areas don't block clicks. Mirrors AIDA-1 pattern.
  win.setIgnoreMouseEvents(true, { forward: true })

  win.on('focus', () => {
    if (!win.isDestroyed()) win.webContents.send('window:focus')
  })

  registry.register('menubar', win)
  return win
}

// ═══════════════════════════════════════════════════════════════════════════════
// IPC — WINDOW OPEN HANDLERS
// Each named window has an open channel. Creates on first use, shows on
// subsequent calls. All app/panel windows use show() + focus().
// Widgets are handled via settings:broadcast in ipc/settings.cjs.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Helper — open or create ───────────────────────────────────────────────────

function openAppWindow(name) {
  const win = ensureAppWindow(name, isDev, preloadPath, DEV_PORT)
  if (win && !win.isDestroyed()) { win.show(); win.focus() }
}

function openPanelWindow(name) {
  const win = ensurePanelWindow(name, isDev, preloadPath, DEV_PORT)
  if (!win || win.isDestroyed()) return
  if (win.webContents.isLoading()) {
    win.webContents.once('did-finish-load', () => {
      if (!win.isDestroyed()) { win.show(); win.focus() }
    })
  } else {
    win.show()
    win.focus()
  }
}

// ── App windows ──────────────────────────────────────────────────────────────

ipcMain.on('file-decks:open',  () => openAppWindow('file-decks'))
ipcMain.on('project:openArchiveDir', () => {
  const os   = require('os')
  const path = require('path')
  const fs   = require('fs')
  const { shell } = require('electron')
  const archiveDir = path.join(os.homedir(), 'Documents', 'ENGIOS', 'Archives')
  fs.mkdirSync(archiveDir, { recursive: true })
  shell.openPath(archiveDir)
})
ipcMain.on('aida-chat:open', (_event, query) => {
  const win = ensureAppWindow('aida-chat', isDev, preloadPath, DEV_PORT)
  if (win && !win.isDestroyed()) {
    win.show()
    win.focus()
    if (query) {
      const send = () => win.webContents.send('aida-chat:query', query)
      if (!win.webContents.isLoading() && win.webContents.getURL() !== '') {
        send()
      } else {
        win.webContents.once('did-finish-load', send)
      }
    }
  }
})

ipcMain.on('search:open', (_event, query) => {
  // OS file search — opens File Decks with query pre-filled
  const win = ensureAppWindow('file-decks', isDev, preloadPath, DEV_PORT)
  if (win && !win.isDestroyed()) {
    win.show()
    win.focus()
    if (query) win.webContents.send('search:query', query)
  }
})
ipcMain.on('tasks:open',       () => openAppWindow('tasks'))
ipcMain.on('terminal:open',    () => openAppWindow('terminal'))

// Also handle the legacy channel name sent by the menubar for File Decks
ipcMain.on('explorer:open',    () => openAppWindow('file-decks'))

// ── Panel windows ────────────────────────────────────────────────────────────

ipcMain.on('settings:open',              () => openPanelWindow('settings'))
ipcMain.on('clock-weather-settings:open',() => openPanelWindow('clock-weather-settings'))
ipcMain.on('today-settings:open',        () => openPanelWindow('today-settings'))

// ── Provider window ──────────────────────────────────────────────────────────
// Provider is a special app window — it loads a URL, not a local HTML file,
// and requires webviewTag. Handled separately here.

ipcMain.handle('open-provider', async (_event, url, label, keepSession) => {
  // Each provider gets its own window keyed by provider id
  const providerId = label.includes('|') ? label.split('|')[0] : label.toLowerCase().replace(/[^a-z0-9]/g, '-')
  const windowKey  = `provider-${providerId}`

  let win = registry.getWindow(windowKey)

  if (!win || win.isDestroyed()) {
    // Create a fresh BrowserWindow for this provider — bypass ensureAppWindow
    // so each gets its own independent registry entry
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
    win = new BrowserWindow({
      width:  1200,
      height: 860,
      x:      Math.round((sw - 1200) / 2),
      y:      Math.round((sh - 860)  / 2),
      frame:       false,
      transparent: false,
      resizable:   true,
      skipTaskbar: false,
      show:        false,
      webPreferences: {
        preload:              preloadPath,
        nodeIntegration:      false,
        contextIsolation:     true,
        backgroundThrottling: false,
        webviewTag:           true,
      },
    })

    if (isDev) {
      win.loadURL(`http://localhost:${DEV_PORT}/src/components/apps/provider/index.html`)
    } else {
      win.loadFile(path.join(__dirname, '../dist/src/components/apps/provider/index.html'))
    }

    win.setMenu(null)
    win.on('focus', () => { if (!win.isDestroyed()) win.webContents.send('window:focus') })
    registry.register(windowKey, win)
  }

  if (win && !win.isDestroyed()) {
    if (!win.webContents.isLoading() && win.webContents.getURL() !== '') {
      // Already loaded — React is mounted, send immediately
      win.webContents.send('provider:load', { url, label, keepSession })
    } else {
      // New window — store data, renderer:ready handler will send it when React mounts
      pendingProviderLoads[windowKey] = { url, label, keepSession }
    }
    win.show()
    win.focus()
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// IPC — AUTO START
// ═══════════════════════════════════════════════════════════════════════════════

ipcMain.handle('set-auto-start', (_event, enabled) => {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path:        app.getPath('exe'),
  })
  return { success: true }
})

