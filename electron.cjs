const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs').promises
const os = require('os')
const db = require('./database.cjs')

// ─── Search Paths ──────────────────────────────────────────────────────────
const USER_FOLDERS = [
  path.join(os.homedir(), 'Desktop'),
  path.join(os.homedir(), 'Documents'),
  path.join(os.homedir(), 'Downloads'),
  path.join(os.homedir(), 'Pictures'),
  path.join(os.homedir(), 'Videos'),
  path.join(os.homedir(), 'Music'),
]

const EXCLUDED_FOLDERS = [
  'node_modules', '.git', 'AppData', 'Application Data',
  '.vscode', '.cache', 'Cache', 'Temp', 'tmp',
  '$Recycle.Bin', 'System Volume Information',
  'ProgramData', 'Windows', 'Program Files', 'Program Files (x86)'
]

// ─── File Search ───────────────────────────────────────────────────────────
async function searchFiles(query, maxResults = 10) {
  const results = []
  const q = query.toLowerCase()

  // First check if any top-level user folders match
  for (const folderPath of USER_FOLDERS) {
    const folderName = path.basename(folderPath).toLowerCase()
    if (folderName.includes(q) && results.length < maxResults) {
      try {
        const stats = await fs.stat(folderPath)
        results.push({
          name: path.basename(folderPath),
          path: folderPath,
          type: 'folder',
          modified: stats.mtime,
        })
      } catch (e) { /* skip */ }
    }
  }

  // Then search inside each folder recursively
  async function searchDirectory(dirPath, depth = 0) {
    if (depth > 3 || results.length >= maxResults) return
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })
      for (const entry of entries) {
        if (results.length >= maxResults) break
        if (entry.name.startsWith('.')) continue
        if (EXCLUDED_FOLDERS.some(ex => entry.name.toLowerCase().includes(ex.toLowerCase()))) continue

        const fullPath = path.join(dirPath, entry.name)
        const lowerName = entry.name.toLowerCase()

        if (lowerName.includes(q)) {
          try {
            const stats = await fs.stat(fullPath)
            results.push({
              name: entry.name,
              path: fullPath,
              type: entry.isDirectory() ? 'folder' : 'file',
              modified: stats.mtime,
            })
          } catch (e) { /* skip */ }
        }

        if (entry.isDirectory()) {
          await searchDirectory(fullPath, depth + 1)
        }
      }
    } catch (e) { /* skip inaccessible folders */ }
  }

  for (const folder of USER_FOLDERS) {
    await searchDirectory(folder)
  }

  return results
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────
ipcMain.handle('search-files', async (_, query) => {
  return await searchFiles(query)
})

ipcMain.handle('open-file', async (_, filePath) => {
  await shell.openPath(filePath)
})

// ─── Open Provider Window ──────────────────────────────────────────────────
ipcMain.handle('open-provider', async (_, url, label) => {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    icon: path.join(__dirname, 'src/assets/icons/aida_logo.png'),
    title: label,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      partition: `persist:provider-${label.toLowerCase().replace(/\s+/g, '-')}`,
    },
  })
  win.loadURL(url)
})

// ─── Auto Start with Windows ─────────────────────────────────────────────
ipcMain.handle('set-auto-start', async (_, enabled) => {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: app.getPath('exe'),
  })
})

// ─── Database: Notes ─────────────────────────────────────────────────────
ipcMain.handle('db:notes:get',    ()                => db.getNotes())
ipcMain.handle('db:notes:create', (_, data)         => db.createNote(data))
ipcMain.handle('db:notes:update', (_, id, changes)  => db.updateNote(id, changes))
ipcMain.handle('db:notes:delete', (_, id)           => db.deleteNote(id))

// ─── Database: Tasks ─────────────────────────────────────────────────────
ipcMain.handle('db:tasks:get',    ()                => db.getTasks())
ipcMain.handle('db:tasks:create', (_, data)         => db.createTask(data))
ipcMain.handle('db:tasks:update', (_, id, changes)  => db.updateTask(id, changes))
ipcMain.handle('db:tasks:delete', (_, id)           => db.deleteTask(id))

// ─── Database: Events ────────────────────────────────────────────────────
ipcMain.handle('db:events:get',    (_, range)       => db.getEvents(range))
ipcMain.handle('db:events:create', (_, data)        => db.createEvent(data))
ipcMain.handle('db:events:update', (_, id, changes) => db.updateEvent(id, changes))
ipcMain.handle('db:events:delete', (_, id)          => db.deleteEvent(id))

// ─── Create Window ─────────────────────────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'src/assets/icons/aida_logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    frame: true,
    transparent: false,
  })

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
