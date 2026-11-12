// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — ELECTRON IPC: Desktop Background
// AIDA-2 — electron/ipc/desktop.cjs
//
// Responsibility:
//   Select a local raster image through the native dialog and retain a private
//   copy in userData. Return its URL; settingsDb owns preference persistence.
//   Only the registered settings window may request image selection.
// ═══════════════════════════════════════════════════════════════════════════════

const { app, ipcMain, dialog, nativeImage } = require('electron')
const fs                                  = require('fs/promises')
const path                                = require('path')
const { pathToFileURL }                    = require('url')
const { createHash }                       = require('crypto')
const registry                            = require('../registry.cjs')

// ─── Import limits ───────────────────────────────────────────────────────────
// Limit file size and validate decoded image dimensions; SVG and remote URLs are not
// accepted. Content-addressed copies remain stable across app restarts.

const MAX_IMAGE_BYTES = 20 * 1024 * 1024
const MAX_IMAGE_PIXELS = 40 * 1000 * 1000
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

// ─── Native selection ────────────────────────────────────────────────────────

ipcMain.handle('desktop:choose-background', async (event) => {
  const win = registry.getWindow('settings')
  if (!win || win.isDestroyed() || event.sender !== win.webContents) {
    return { error: 'Open AIDA Settings to choose a background image.' }
  }

  try {
    const result = await dialog.showOpenDialog(win, {
      title:       'Choose desktop background',
      defaultPath: app.getPath('pictures'),
      properties:  ['openFile'],
      filters:     [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }],
    })
    if (result.canceled || !result.filePaths[0]) return { cancelled: true }

    const sourcePath = result.filePaths[0]
    const extension  = path.extname(sourcePath).toLowerCase()
    const stat       = await fs.stat(sourcePath)
    if (!IMAGE_EXTENSIONS.has(extension) || !stat.isFile() || stat.size > MAX_IMAGE_BYTES) {
      return { error: 'Choose a PNG, JPEG or WebP image no larger than 20 MB.' }
    }

    const data  = await fs.readFile(sourcePath)
    const image = nativeImage.createFromBuffer(data)
    const size  = image.getSize()
    if (data.length > MAX_IMAGE_BYTES || image.isEmpty() || size.width * size.height > MAX_IMAGE_PIXELS) {
      return { error: 'Choose a valid image with no more than 40 megapixels.' }
    }

    const directory = path.join(app.getPath('userData'), 'desktop-backgrounds')
    const digest    = createHash('sha256').update(data).digest('hex')
    const target    = path.join(directory, digest + extension)
    await fs.mkdir(directory, { recursive: true })
    await fs.writeFile(target, data)
    return { imageUrl: pathToFileURL(target).href }
  } catch (err) {
    console.error('[desktop:choose-background]', err.message)
    return { error: 'The image could not be imported. Choose another image and try again.' }
  }
})
