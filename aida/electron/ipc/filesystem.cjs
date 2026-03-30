// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — ELECTRON IPC: Filesystem & Terminal Handlers
// AIDA-2 — electron/ipc/filesystem.cjs
//
// Responsibility:
//   All IPC handlers for filesystem operations and terminal PTY management.
//   The renderer has zero direct filesystem access — everything goes through here.
//
// Sections:
//   1. FILESYSTEM   — directory reading, home directory, file opening
//   2. FILE SEARCH  — search files and folders in user directories
//   3. TERMINAL PTY — pseudo-terminal for the ENGIOS terminal app
//
// Rules:
//   - Never expose raw filesystem access beyond what is listed here
//   - PTY instances are tracked by ID — one PTY per terminal tab/session
//   - All PTY cleanup happens on kill or on window close
// ═══════════════════════════════════════════════════════════════════════════════

const { ipcMain, shell } = require('electron')
const registry             = require('../registry.cjs')
const os                 = require('os')
const fs                 = require('fs')
const path               = require('path')

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — FILESYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

// ── fs:homedir ────────────────────────────────────────────────────────────────
// Returns the current user's home directory path.
// Used by File Decks to set the initial navigation location.

ipcMain.handle('fs:homedir', () => {
  return os.homedir()
})

// ── fs:readdir ────────────────────────────────────────────────────────────────
// Reads the contents of a directory.
// Returns an array of { name, path, isDir, size, modified } objects.
// Hidden files (starting with .) are excluded.

ipcMain.handle('fs:readdir', async (_event, dirPath) => {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })

    return entries
      .filter(entry => !entry.name.startsWith('.'))
      .map(entry => {
        const fullPath = path.join(dirPath, entry.name)
        const isDir    = entry.isDirectory()
        let size       = 0
        let modified   = new Date()

        try {
          const stat = fs.statSync(fullPath)
          size       = stat.size
          modified   = stat.mtime
        } catch (_) {
          // stat can fail on protected system files — return safe defaults
        }

        return { name: entry.name, path: fullPath, isDir, size, modified }
      })
      .sort((a, b) => {
        // Directories first, then files — both sorted alphabetically
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
        return a.name.localeCompare(b.name)
      })

  } catch (err) {
    console.error('[fs:readdir] error:', err.message)
    return []
  }
})

// ── open-file ────────────────────────────────────────────────────────────────
// Opens a file or folder using the default OS application.
// Uses Electron's shell.openPath — never executes files directly.

ipcMain.handle('open-file', async (_event, filePath) => {
  try {
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      // Open in File Decks and navigate to the folder
      const win = registry.getWindow('file-decks')
      if (win && !win.isDestroyed()) {
        // Already open — show and navigate directly
        win.show()
        win.focus()
        win.webContents.send('explorer:navigate', filePath)
      } else {
        // Not open yet — emit open, then wait for renderer:ready before navigating
        ipcMain.emit('file-decks:open')
        ipcMain.once('renderer:ready:file-decks', () => {
          const newWin = registry.getWindow('file-decks')
          if (newWin && !newWin.isDestroyed()) {
            // Small delay to ensure React useEffect listeners are registered
            setTimeout(() => newWin.webContents.send('explorer:navigate', filePath), 300)
          }
        })
      }
      return { success: true }
    }
    // For files — open FileDecks, navigate to parent folder, select the file
    const parentDir = path.dirname(filePath)
    const fileName  = path.basename(filePath)
    const win = registry.getWindow('file-decks')
    if (win && !win.isDestroyed()) {
      win.show()
      win.focus()
      win.webContents.send('explorer:navigate', parentDir)
      setTimeout(() => win.webContents.send('explorer:select', fileName), 150)
    } else {
      ipcMain.emit('file-decks:open')
      ipcMain.once('renderer:ready:file-decks', () => {
        const newWin = registry.getWindow('file-decks')
        if (newWin && !newWin.isDestroyed()) {
          setTimeout(() => {
            newWin.webContents.send('explorer:navigate', parentDir)
            setTimeout(() => newWin.webContents.send('explorer:select', fileName), 150)
          }, 300)
        }
      })
    }
    return { success: true }
  } catch (err) {
    console.error('[open-file] error:', err.message)
    return { error: err.message }
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — FILE SEARCH
// ═══════════════════════════════════════════════════════════════════════════════

// ── search-files ─────────────────────────────────────────────────────────────
// Searches for files and folders matching a query string.
// Searches within the user's home directory only.
// Returns up to 20 results to keep the response snappy.

ipcMain.handle('search-files', async (_event, query) => {
  if (!query || query.trim().length < 2) return []

  const results  = []
  const homedir  = os.homedir()
  const search   = query.toLowerCase()
  const MAX      = 20

  function walk(dir, depth = 0) {
    if (results.length >= MAX || depth > 4) return
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (results.length >= MAX) break
        if (entry.name.startsWith('.')) continue
        const fullPath = path.join(dir, entry.name)
        // Skip junction points, symlinks and reparse points — restricted on Windows
        try {
          const lstat = fs.lstatSync(fullPath)
          // Junction points show as directories but have JUNCTION reparse tag
          // Detect by checking if lstat and stat differ (symlink/junction)
          if (lstat.isSymbolicLink()) continue
          // Additional check: if it's a directory, verify it's not a junction
          if (lstat.isDirectory()) {
            const stat = fs.statSync(fullPath)
            // If the inode differs between lstat and stat, it's a junction/reparse point
            if (lstat.ino !== stat.ino) continue
          }
        } catch { continue }

        if (entry.name.toLowerCase().includes(search)) {
          results.push({
            name:  entry.name,
            path:  fullPath,
            isDir: entry.isDirectory(),
          })
        }
        if (entry.isDirectory()) walk(fullPath, depth + 1)
      }
    } catch (_) {
      // Skip directories we can't read (permissions etc.)
    }
  }

  walk(homedir)
  return results
})

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — TERMINAL PTY
// Pseudo-terminal support for the ENGIOS terminal app (ENGIOS build only).
// Each terminal session has a unique ID. PTY instances are stored in a Map.
// node-pty is required only when the terminal is actually used — lazy require
// prevents crashes on systems where node-pty is not installed.
// ═══════════════════════════════════════════════════════════════════════════════

const ptyMap = new Map()

function getPty() {
  try {
    return require('node-pty')
  } catch (_) {
    console.warn('[pty] node-pty not available — terminal disabled')
    return null
  }
}

// ── pty:create ────────────────────────────────────────────────────────────────
// Creates a new PTY session with the given ID.
// Uses the system shell — bash on Linux, cmd on Windows.

ipcMain.handle('pty:create', (_event, id) => {
  const nodePty = getPty()
  if (!nodePty) return { error: 'node-pty not available' }

  const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash'
  const pty   = nodePty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd:  os.homedir(),
    env:  process.env,
  })

  pty.onData(data => {
    // Forward PTY output to the renderer window that owns this session
    const { BrowserWindow } = require('electron')
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) {
        win.webContents.send(`pty:data:${id}`, data)
      }
    })
  })

  pty.onExit(({ exitCode }) => {
    const { BrowserWindow } = require('electron')
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) {
        win.webContents.send(`pty:exit:${id}`, exitCode)
      }
    })
    ptyMap.delete(id)
  })

  ptyMap.set(id, pty)
  return { success: true }
})

// ── pty:write ─────────────────────────────────────────────────────────────────
// Sends keystrokes/commands to the PTY session.

ipcMain.handle('pty:write', (_event, id, data) => {
  const pty = ptyMap.get(id)
  if (pty) pty.write(data)
  return { success: true }
})

// ── pty:resize ────────────────────────────────────────────────────────────────
// Resizes the PTY when the terminal window is resized.

ipcMain.handle('pty:resize', (_event, id, cols, rows) => {
  const pty = ptyMap.get(id)
  if (pty) pty.resize(cols, rows)
  return { success: true }
})

// ── pty:kill ──────────────────────────────────────────────────────────────────
// Terminates a PTY session and removes it from the map.

ipcMain.handle('pty:kill', (_event, id) => {
  const pty = ptyMap.get(id)
  if (pty) {
    pty.kill()
    ptyMap.delete(id)
  }
  return { success: true }
})


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — PROJECT ARCHIVE
// Exports a project folder + all conversations + messages as a gzipped JSON file.
// Format: .aida-archive — gzip compressed, no external dependencies.
// Saves to Documents/ENGIOS/Archives/. Fully restorable by AIDA.
// ═══════════════════════════════════════════════════════════════════════════════

const zlib = require('zlib')
const db   = require('../../database/schema.cjs')

// ── fs:project:archive ────────────────────────────────────────────────────────

ipcMain.handle('fs:project:archive', async (_event, folderId, folderName) => {
  try {
    const archiveDir = path.join(os.homedir(), 'Documents', 'ENGIOS', 'Archives')
    fs.mkdirSync(archiveDir, { recursive: true })

    // Gather all conversations + messages for this folder
    const conversations = db.getDb()
      .prepare(`SELECT * FROM chat_conversations WHERE folder_id = ? ORDER BY updated_at DESC`)
      .all(folderId)

    const payload = {
      version:      1,
      type:         'aida-project-archive',
      folder:       { id: folderId, name: folderName },
      exported_at:  new Date().toISOString(),
      conversations: conversations.map(conv => ({
        ...conv,
        messages: db.getDb()
          .prepare(`SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC`)
          .all(conv.id),
      })),
    }

    const json     = JSON.stringify(payload, null, 2)
    const safeName = folderName.replace(/[^a-z0-9_\-]/gi, '_')
    const ts       = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filePath = path.join(archiveDir, `${safeName}_${ts}.aida-archive`)

    // Gzip compress and write
    const compressed = zlib.gzipSync(Buffer.from(json, 'utf8'))
    fs.writeFileSync(filePath, compressed)

    return { success: true, path: filePath }
  } catch (err) {
    console.error('[fs:project:archive] error:', err.message)
    return { error: err.message }
  }
})

// ── fs:project:restore ────────────────────────────────────────────────────────

ipcMain.handle('fs:project:restore', async (_event, archivePath) => {
  try {
    const compressed = fs.readFileSync(archivePath)
    const json       = zlib.gunzipSync(compressed).toString('utf8')
    const data       = JSON.parse(json)

    if (data.type !== 'aida-project-archive') {
      return { error: 'Not a valid AIDA archive file' }
    }

    // Create new folder
    const folder = db.getDb()
      .prepare(`INSERT INTO chat_folders (name, position, starred) VALUES (@name, @position, @starred)`)
      .run({ name: data.folder.name + ' (restored)', position: 0, starred: 0 })

    const newFolderId = folder.lastInsertRowid

    for (const conv of (data.conversations ?? [])) {
      const newConv = db.getDb()
        .prepare(`INSERT INTO chat_conversations (title, folder_id, model, provider) VALUES (@title, @folder_id, @model, @provider)`)
        .run({ title: conv.title, folder_id: newFolderId, model: conv.model ?? 'phi3mini', provider: conv.provider ?? 'ollama' })

      for (const msg of (conv.messages ?? [])) {
        db.getDb()
          .prepare(`INSERT INTO chat_messages (conversation_id, role, content, model_used) VALUES (@conversation_id, @role, @content, @model_used)`)
          .run({ conversation_id: newConv.lastInsertRowid, role: msg.role, content: msg.content, model_used: msg.model_used ?? null })
      }
    }

    return { success: true, folderId: newFolderId }
  } catch (err) {
    console.error('[fs:project:restore] error:', err.message)
    return { error: err.message }
  }
})

// ── fs:project:openArchiveDir ─────────────────────────────────────────────────

ipcMain.handle('fs:project:openArchiveDir', async () => {
  const archiveDir = path.join(os.homedir(), 'Documents', 'ENGIOS', 'Archives')
  fs.mkdirSync(archiveDir, { recursive: true })
  await shell.openPath(archiveDir)
  return { success: true }
})
