// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 2 — BRIDGE
// AIDA-2 — bridge/preload.cjs
//
// Responsibility:
//   The ONLY communication channel between the renderer (React/UI)
//   and the main process (OS/Electron).
//
// Rules:
//   - No logic here — pass-through calls only
//   - Nothing is accessible in the renderer that is not listed here
//   - Every entry is deliberate and documented
//   - Never bypassed — all renderer↔main communication goes through this file
//   - Adding a new IPC call requires: entry here + handler in electron/ipc/
//
// Structure mirrors electron/ipc/:
//   db.*        → electron/ipc/database.cjs
//   fs.*        → electron/ipc/filesystem.cjs
//   pty.*       → electron/ipc/filesystem.cjs (terminal)
//   send/on/off → electron/ipc/windows.cjs
//   settings.*  → electron/ipc/settings.cjs
// ═══════════════════════════════════════════════════════════════════════════════

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {

  // ── Platform info ──────────────────────────────────────────────────────────
  // Read-only. Available synchronously — no IPC needed.

  platform:   process.platform,
  isElectron: true,

  // ── OS utilities ──────────────────────────────────────────────────────────

  // Open a file or folder with the default OS application
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),

  // Open an AI/web provider in a persistent Electron window
  openProvider:  (url, label, keepSession) =>
    ipcRenderer.invoke('open-provider', url, label, keepSession),
  getOsUsername: () => ipcRenderer.invoke('os:username'),

  // Set whether AIDA launches automatically at OS startup
  setAutoStart: (enabled) => ipcRenderer.invoke('set-auto-start', enabled),

  // Search files and folders in user directories
  searchFiles: (query) => ipcRenderer.invoke('search-files', query),

  // ── Database ───────────────────────────────────────────────────────────────
  // All DB access from React goes through here.
  // Handlers live in electron/ipc/database.cjs.

  db: {

    // Settings
    // Key-value store for all application settings (GlobalSettings,
    // widget settings, panel settings).
    settings: {
      get:    (keys)        => ipcRenderer.invoke('db:settings:get',    keys),
      set:    (key, value)  => ipcRenderer.invoke('db:settings:set',    key, value),
      setAll: (pairs)       => ipcRenderer.invoke('db:settings:setAll', pairs),
      delete: (key)         => ipcRenderer.invoke('db:settings:delete', key),
    },

    // Spaces
    spaces: {
      get:     ()           => ipcRenderer.invoke('db:spaces:get'),
      create:  (data)       => ipcRenderer.invoke('db:spaces:create',  data),
      update:  (id, data)   => ipcRenderer.invoke('db:spaces:update',  id, data),
      archive: (id)         => ipcRenderer.invoke('db:spaces:archive', id),
    },

    // Collections
    collections: {
      get:    (spaceId)     => ipcRenderer.invoke('db:collections:get',    spaceId),
      create: (data)        => ipcRenderer.invoke('db:collections:create', data),
      update: (id, changes) => ipcRenderer.invoke('db:collections:update', id, changes),
      delete: (id)          => ipcRenderer.invoke('db:collections:delete', id),
    },

    // Fields
    fields: {
      get:    (collectionId) => ipcRenderer.invoke('db:fields:get',    collectionId),
      create: (data)         => ipcRenderer.invoke('db:fields:create', data),
      update: (id, changes)  => ipcRenderer.invoke('db:fields:update', id, changes),
      delete: (id)           => ipcRenderer.invoke('db:fields:delete', id),
    },

    // Records
    records: {
      get:     (collectionId, opts) => ipcRenderer.invoke('db:records:get',     collectionId, opts),
      create:  (data)               => ipcRenderer.invoke('db:records:create',  data),
      update:  (id, data)           => ipcRenderer.invoke('db:records:update',  id, data),
      archive: (id)                 => ipcRenderer.invoke('db:records:archive', id),
      delete:  (id)                 => ipcRenderer.invoke('db:records:delete',  id),
    },

    // Tasks
    tasks: {
      get:    ()            => ipcRenderer.invoke('db:tasks:get'),
      create: (data)        => ipcRenderer.invoke('db:tasks:create', data),
      update: (id, changes) => ipcRenderer.invoke('db:tasks:update', id, changes),
      delete: (id)          => ipcRenderer.invoke('db:tasks:delete', id),
    },

    // Notes
    notes: {
      get:    ()            => ipcRenderer.invoke('db:notes:get'),
      create: (data)        => ipcRenderer.invoke('db:notes:create', data),
      update: (id, changes) => ipcRenderer.invoke('db:notes:update', id, changes),
      delete: (id)          => ipcRenderer.invoke('db:notes:delete', id),
    },

    // Events
    events: {
      get:    (range)       => ipcRenderer.invoke('db:events:get',    range),
      create: (data)        => ipcRenderer.invoke('db:events:create', data),
      update: (id, changes) => ipcRenderer.invoke('db:events:update', id, changes),
      delete: (id)          => ipcRenderer.invoke('db:events:delete', id),
    },

    // Chat
    chat: {
      folders: {
        get:    ()            => ipcRenderer.invoke('db:chat:folders:get'),
        create: (data)        => ipcRenderer.invoke('db:chat:folders:create', data),
        update: (id, changes) => ipcRenderer.invoke('db:chat:folders:update', id, changes),
        delete: (id)          => ipcRenderer.invoke('db:chat:folders:delete', id),
      },
      conversations: {
        get:    (opts)        => ipcRenderer.invoke('db:chat:conversations:get',    opts),
        create: (data)        => ipcRenderer.invoke('db:chat:conversations:create', data),
        update: (id, changes) => ipcRenderer.invoke('db:chat:conversations:update', id, changes),
        delete: (id)          => ipcRenderer.invoke('db:chat:conversations:delete', id),
        search: (query)       => ipcRenderer.invoke('db:chat:conversations:search', query),
      },
      messages: {
        get:    (convId) => ipcRenderer.invoke('db:chat:messages:get',    convId),
        add:    (data)   => ipcRenderer.invoke('db:chat:messages:add',    data),
        delete: (id)     => ipcRenderer.invoke('db:chat:messages:delete', id),
      },
    },

    // Licence + Feature flags
    licence: {
      get:          ()    => ipcRenderer.invoke('db:licence:get'),
      flags:        ()    => ipcRenderer.invoke('db:licence:flags'),
      canUse:       (key) => ipcRenderer.invoke('db:licence:canUse',      key),
      catalogue:    ()    => ipcRenderer.invoke('db:modules:catalogue'),
      entitlements: ()    => ipcRenderer.invoke('db:modules:entitlements'),
    },

    // AIDA Memory
    memory: {
      get:    (opts) => ipcRenderer.invoke('db:memory:get',    opts),
      upsert: (data) => ipcRenderer.invoke('db:memory:upsert', data),
      delete: (id)   => ipcRenderer.invoke('db:memory:delete', id),
      purge:  ()     => ipcRenderer.invoke('db:memory:purge'),
    },

    // AIDA Suggestions
    suggestions: {
      get:     (opts) => ipcRenderer.invoke('db:suggestions:get',     opts),
      create:  (data) => ipcRenderer.invoke('db:suggestions:create',  data),
      dismiss: (id)   => ipcRenderer.invoke('db:suggestions:dismiss', id),
      act:     (id)   => ipcRenderer.invoke('db:suggestions:act',     id),
    },

  },

  // ── File System ────────────────────────────────────────────────────────────
  // Handler lives in electron/ipc/filesystem.cjs.

  // AIDA system tools — invoked on-demand by tool call intercept in Window.tsx
  aidaTools: {
    getSystemStats:      () => ipcRenderer.invoke('aida:tool:get_system_stats'),
    getDiskInfo:         () => ipcRenderer.invoke('aida:tool:get_disk_info'),
    getRunningProcesses: () => ipcRenderer.invoke('aida:tool:get_running_processes'),
    getOsInfo:           () => ipcRenderer.invoke('aida:tool:get_os_info'),
  },

  fs: {
    readdir:        (dirPath)             => ipcRenderer.invoke('fs:readdir',               dirPath),
    homedir:        ()                    => ipcRenderer.invoke('fs:homedir'),
    project: {
      archive:      (folderId, folderName) => ipcRenderer.invoke('fs:project:archive',      folderId, folderName),
      restore:      (zipPath)              => ipcRenderer.invoke('fs:project:restore',       zipPath),
      openArchiveDir: ()                   => ipcRenderer.invoke('fs:project:openArchiveDir'),
    },
  },

  // ── Terminal PTY ──────────────────────────────────────────────────────────
  // Pseudo-terminal for the ENGIOS terminal app.
  // Handler lives in electron/ipc/filesystem.cjs.

  pty: {
    create:  (id)             => ipcRenderer.invoke('pty:create',  id),
    write:   (id, data)       => ipcRenderer.invoke('pty:write',   id, data),
    resize:  (id, cols, rows) => ipcRenderer.invoke('pty:resize',  id, cols, rows),
    kill:    (id)             => ipcRenderer.invoke('pty:kill',    id),
    onData:  (id, cb)         => ipcRenderer.on(`pty:data:${id}`, (_, data) => cb(data)),
    onExit:  (id, cb)         => ipcRenderer.once(`pty:exit:${id}`, cb),
    offData: (id)             => ipcRenderer.removeAllListeners(`pty:data:${id}`),
  },

  // ── Window messaging ──────────────────────────────────────────────────────
  // Used by all windows to communicate with the main process and each other.
  // send()  → fire and forget  (window:hide, settings:broadcast, etc.)
  // on()    → listen for events from main (settings:updated, window:focus)
  // off()   → remove a specific listener

  send: (channel, ...args) =>
    ipcRenderer.send(channel, ...args),

  on: (channel, listener) => {
    ipcRenderer.on(channel, listener)
    return () => ipcRenderer.removeListener(channel, listener)
  },

  off: (channel, listener) =>
    ipcRenderer.removeListener(channel, listener),

})
