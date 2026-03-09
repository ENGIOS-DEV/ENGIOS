const { contextBridge, ipcRenderer } = require('electron')

// ─── Expose safe APIs to React ─────────────────────────────────────────────
contextBridge.exposeInMainWorld('electron', {

  // Search files and folders in user directories
  searchFiles: (query) => ipcRenderer.invoke('search-files', query),

  // Open a file or folder with the default OS application
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),

  // Open an AI/web provider in a persistent Electron window
  openProvider: (url, label) => ipcRenderer.invoke('open-provider', url, label),

  // Set whether AIDA launches automatically with Windows
  setAutoStart: (enabled) => ipcRenderer.invoke('set-auto-start', enabled),

  // ── Database: Notes ──────────────────────────────────────────────────────
  db: {
    notes: {
      get:    ()             => ipcRenderer.invoke('db:notes:get'),
      create: (data)         => ipcRenderer.invoke('db:notes:create', data),
      update: (id, changes)  => ipcRenderer.invoke('db:notes:update', id, changes),
      delete: (id)           => ipcRenderer.invoke('db:notes:delete', id),
    },
    tasks: {
      get:    ()             => ipcRenderer.invoke('db:tasks:get'),
      create: (data)         => ipcRenderer.invoke('db:tasks:create', data),
      update: (id, changes)  => ipcRenderer.invoke('db:tasks:update', id, changes),
      delete: (id)           => ipcRenderer.invoke('db:tasks:delete', id),
    },
    events: {
      get:    (range)        => ipcRenderer.invoke('db:events:get', range),
      create: (data)         => ipcRenderer.invoke('db:events:create', data),
      update: (id, changes)  => ipcRenderer.invoke('db:events:update', id, changes),
      delete: (id)           => ipcRenderer.invoke('db:events:delete', id),
    },
  },

  // File System
  fs: {
    readdir: (dirPath) => ipcRenderer.invoke('fs:readdir', dirPath),
    homedir: ()                => ipcRenderer.invoke('fs:homedir'),
  },

  // Terminal PTY
  pty: {
    create:  (id)              => ipcRenderer.invoke('pty:create', id),
    write:   (id, data)        => ipcRenderer.invoke('pty:write', id, data),
    resize:  (id, cols, rows)  => ipcRenderer.invoke('pty:resize', id, cols, rows),
    kill:    (id)              => ipcRenderer.invoke('pty:kill', id),
    onData:  (id, cb)          => ipcRenderer.on(`pty:data:${id}`, (_, data) => cb(data)),
    onExit:  (id, cb)          => ipcRenderer.once(`pty:exit:${id}`, cb),
    offData: (id)              => ipcRenderer.removeAllListeners(`pty:data:${id}`),
  },

  // Check if we're running in Electron
  isElectron: true,

})
