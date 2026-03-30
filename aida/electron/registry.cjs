// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — ELECTRON: Window Registry
// AIDA-2 — electron/registry.cjs
//
// Responsibility:
//   The single shared store of all open BrowserWindow instances.
//   Every window module (apps, panels, widgets) registers its windows here.
//   Every IPC module reads from here to find windows by name.
//
// Why this exists:
//   Without a central registry, each module would need its own windows{}
//   object, leading to circular dependencies and lost window references.
//   One registry, imported by all — clean and unambiguous.
//
// Rules:
//   - No window is created here — only stored and retrieved
//   - No IPC logic here — only get/set/remove operations
//   - Window names are the canonical identity for every window in the system
//
// Window name conventions:
//   Apps:    'aida-chat' | 'file-decks' | 'tasks' | 'terminal' | 'provider'
//   Panels:  'settings' | 'clock-weather-settings' | 'today-settings'
//   Widgets: 'clock-weather-widget'
//   Shell:   'menubar' | 'handle'
// ═══════════════════════════════════════════════════════════════════════════════

// ─── The registry ─────────────────────────────────────────────────────────────
// Plain object. Keys are window names. Values are BrowserWindow instances.
// Modules that need to check all windows iterate Object.values(windows).

const windows = {}

// ─── register ─────────────────────────────────────────────────────────────────
// Store a window instance under its canonical name.
// Called by window factory functions immediately after BrowserWindow creation.

function register(name, win) {
  windows[name] = win

  // Auto-clean on close — prevents stale references accumulating
  win.on('closed', () => {
    if (windows[name] === win) delete windows[name]
  })
}

// ─── getWindow ────────────────────────────────────────────────────────────────
// Retrieve a window by name. Returns undefined if not yet created or destroyed.
// Callers should always check for existence before use:
//   const win = registry.getWindow('file-decks')
//   if (win && !win.isDestroyed()) { ... }

function getWindow(name) {
  return windows[name]
}

// ─── getWindows ───────────────────────────────────────────────────────────────
// Returns the full registry object.
// Used by settings:broadcast to iterate all open windows.

function getWindows() {
  return windows
}

// ─── remove ───────────────────────────────────────────────────────────────────
// Explicitly remove a window from the registry.
// Normally handled automatically by the 'closed' listener in register().
// Available for cases where manual cleanup is needed.

function remove(name) {
  delete windows[name]
}

// ─── isOpen ───────────────────────────────────────────────────────────────────
// Returns true if a window exists and has not been destroyed.
// Convenience wrapper — avoids repetitive null/destroyed checks in callers.

function isOpen(name) {
  const win = windows[name]
  return !!(win && !win.isDestroyed())
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = { register, getWindow, getWindows, remove, isOpen }
