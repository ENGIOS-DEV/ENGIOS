// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — ELECTRON IPC: Database Handlers
// AIDA-2 — electron/ipc/database.cjs
//
// Responsibility:
//   All ipcMain handlers for database operations.
//   Routes every db:* call from the renderer to the correct
//   function in database/schema.cjs or database/flags.cjs.
//
// Rules:
//   - No business logic here — call the DB function and return the result
//   - Every handler name matches exactly what preload.cjs invokes
//   - Never imports from src/ — this is Layer 1, not Layer 5
//   - Errors are caught and returned as { error: message } objects
//     so the renderer can handle them gracefully
// ═══════════════════════════════════════════════════════════════════════════════

const { ipcMain } = require('electron')
const db          = require('../../database/schema.cjs')
const flags       = require('../../database/flags.cjs')
const registry    = require('../registry.cjs')

// ─── Broadcast helper ─────────────────────────────────────────────────────────
// Sends tasks:updated to all open windows so they reload their task lists.

let _onTasksUpdated = null
function onTasksUpdated(cb) { _onTasksUpdated = cb }

function broadcastTasksUpdated(id = null) {
  Object.values(registry.getWindows()).forEach(win => {
    if (win && !win.isDestroyed()) win.webContents.send('tasks:updated')
  })
  if (_onTasksUpdated) _onTasksUpdated(id)
}

module.exports.onTasksUpdated = onTasksUpdated

// ─── Safe handler wrapper ─────────────────────────────────────────────────────
// Catches errors so a DB failure never crashes the main process.
// Returns { error: string } to the renderer on failure.

function handle(channel, fn) {
  ipcMain.handle(channel, async (_event, ...args) => {
    try {
      return await fn(...args)
    } catch (err) {
      console.error(`[db] ${channel} error:`, err.message)
      return { error: err.message }
    }
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

handle('db:settings:get',    (keys)        => db.getSettings(keys))
handle('db:settings:set',    (key, value)  => db.setSetting(key, value))
handle('db:settings:setAll', (pairs)       => db.setSettings(pairs))
handle('db:settings:delete', (key)         => db.deleteSetting(key))

// ═══════════════════════════════════════════════════════════════════════════════
// SPACES
// ═══════════════════════════════════════════════════════════════════════════════

handle('db:spaces:get',     ()          => db.getSpaces())
handle('db:spaces:create',  (data)      => db.createSpace(data))
handle('db:spaces:update',  (id, data)  => db.updateSpace(id, data))
handle('db:spaces:archive', (id)        => db.archiveSpace(id))

// ═══════════════════════════════════════════════════════════════════════════════
// COLLECTIONS
// ═══════════════════════════════════════════════════════════════════════════════

handle('db:collections:get',    (spaceId)      => db.getCollections(spaceId))
handle('db:collections:create', (data)         => db.createCollection(data))
handle('db:collections:update', (id, changes)  => db.updateCollection(id, changes))
handle('db:collections:delete', (id)           => db.deleteCollection(id))

// ═══════════════════════════════════════════════════════════════════════════════
// FIELDS
// ═══════════════════════════════════════════════════════════════════════════════

handle('db:fields:get',    (collectionId) => db.getFields(collectionId))
handle('db:fields:create', (data)         => db.createField(data))
handle('db:fields:update', (id, changes)  => db.updateField(id, changes))
handle('db:fields:delete', (id)           => db.deleteField(id))

// ═══════════════════════════════════════════════════════════════════════════════
// RECORDS
// ═══════════════════════════════════════════════════════════════════════════════

handle('db:records:get',     (collectionId, opts) => db.getRecords(collectionId, opts))
handle('db:records:create',  (data)               => db.createRecord(data))
handle('db:records:update',  (id, data)            => db.updateRecord(id, data))
handle('db:records:archive', (id)                  => db.archiveRecord(id))
handle('db:records:delete',  (id)                  => db.deleteRecord(id))

// ═══════════════════════════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════════════════════════

handle('db:tasks:get',    ()            => db.getTasks())
handle('db:tasks:create', async (data)        => { const r = await db.createTask(data);      broadcastTasksUpdated(r?.id); return r })
handle('db:tasks:update', async (id, changes) => { const r = await db.updateTask(id, changes); broadcastTasksUpdated(id);   return r })
handle('db:tasks:delete', async (id)          => { const r = await db.deleteTask(id);          broadcastTasksUpdated(); return r })

// ═══════════════════════════════════════════════════════════════════════════════
// NOTES
// ═══════════════════════════════════════════════════════════════════════════════

handle('db:notes:get',    ()            => db.getNotes())
handle('db:notes:create', (data)        => db.createNote(data))
handle('db:notes:update', (id, changes) => db.updateNote(id, changes))
handle('db:notes:delete', (id)          => db.deleteNote(id))

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

handle('db:events:get',    (range)       => db.getEvents(range))
handle('db:events:create', (data)        => db.createEvent(data))
handle('db:events:update', (id, changes) => db.updateEvent(id, changes))
handle('db:events:delete', (id)          => db.deleteEvent(id))

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT — FOLDERS
// ═══════════════════════════════════════════════════════════════════════════════

handle('db:chat:folders:get',    ()            => db.getChatFolders())
handle('db:chat:folders:create', (data)        => db.createChatFolder(data))
handle('db:chat:folders:update', (id, changes) => db.updateChatFolder(id, changes))
handle('db:chat:folders:delete', (id)          => db.deleteChatFolder(id))

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT — CONVERSATIONS
// ═══════════════════════════════════════════════════════════════════════════════

handle('db:chat:conversations:get',    (opts)        => db.getChatConversations(opts))
handle('db:chat:conversations:create', (data)        => db.createChatConversation(data))
handle('db:chat:conversations:update', (id, changes) => db.updateChatConversation(id, changes))
handle('db:chat:conversations:delete', (id)          => db.deleteChatConversation(id))
handle('db:chat:conversations:search', (query)       => db.searchChatConversations(query))

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT — MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════

handle('db:chat:messages:get',    (convId) => db.getChatMessages(convId))
handle('db:chat:messages:add',    (data)   => db.addChatMessage(data))
handle('db:chat:messages:delete', (id)     => db.deleteChatMessage(id))

// ═══════════════════════════════════════════════════════════════════════════════
// LICENCE + FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════════════════════

handle('db:licence:get',          ()    => flags.getLicence())
handle('db:licence:flags',        ()    => flags.getFeatureFlags())
handle('db:licence:canUse',       (key) => flags.canUseFeature(key))
handle('db:modules:catalogue',    ()    => flags.getModuleCatalogue())
handle('db:modules:entitlements', ()    => flags.getModuleEntitlements())

// ═══════════════════════════════════════════════════════════════════════════════
// AIDA MEMORY
// ═══════════════════════════════════════════════════════════════════════════════

handle('db:memory:get',    (opts) => db.getMemory(opts))
handle('db:memory:upsert', (data) => db.upsertMemory(data))
handle('db:memory:delete', (id)   => db.deleteMemory(id))
handle('db:memory:purge',  ()     => db.purgeExpiredMemory())

// ═══════════════════════════════════════════════════════════════════════════════
// AIDA SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════════════════

handle('db:suggestions:get',     (opts) => db.getSuggestions(opts))
handle('db:suggestions:create',  (data) => db.createSuggestion(data))
handle('db:suggestions:dismiss', (id)   => db.dismissSuggestion(id))
handle('db:suggestions:act',     (id)   => db.actOnSuggestion(id))
