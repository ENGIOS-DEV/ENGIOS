// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 6 — DATA: Core Schema
// AIDA-2 — database/schema.cjs
//
// Responsibility:
//   - Database connection and initialisation
//   - All core table definitions
//   - Migration system (versioned, transactional, non-destructive)
//   - Core CRUD exported for use by electron/ipc/database.cjs
//
// Rules:
//   - Never imports from database/flags.cjs — isolation is one-way
//   - Never imports from any Electron, React, or UI layer
//   - All access from the renderer goes through bridge/preload.cjs
//   - Migrations are additive only — never destructive
//
// DB location:
//   Windows: C:\Users\<user>\AppData\Roaming\aida\aida.db
//   Linux:   ~/.config/aida/aida.db
// ═══════════════════════════════════════════════════════════════════════════════

const Database = require('better-sqlite3')
const path     = require('path')
const { app }  = require('electron')

// ─── Connection ───────────────────────────────────────────────────────────────
let db

function getDb() {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'aida.db')
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    db.pragma('synchronous = NORMAL')
    initSchema()
    runMigrations()
  }
  return db
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

function initSchema() {

  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version    INTEGER NOT NULL,
      applied_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      key        TEXT    NOT NULL UNIQUE,
      value      TEXT    NOT NULL DEFAULT '',
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT    NOT NULL,
      notes      TEXT    NOT NULL DEFAULT '',
      priority   TEXT    NOT NULL DEFAULT 'medium',
      completed  INTEGER NOT NULL DEFAULT 0,
      due_date   TEXT,
      due_time   TEXT,
      recurrence TEXT,
      folder_id  INTEGER,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT    NOT NULL DEFAULT '',
      content    TEXT    NOT NULL DEFAULT '',
      color      TEXT    NOT NULL DEFAULT '#ffffff',
      pinned     INTEGER NOT NULL DEFAULT 0,
      folder_id  INTEGER,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      start_time  TEXT    NOT NULL,
      end_time    TEXT    NOT NULL,
      color       TEXT    NOT NULL DEFAULT '#29ABE2',
      location    TEXT    NOT NULL DEFAULT '',
      all_day     INTEGER NOT NULL DEFAULT 0,
      recurrence  TEXT,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS spaces (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      type       TEXT    NOT NULL DEFAULT 'custom',
      icon       TEXT    NOT NULL DEFAULT '📁',
      color      TEXT    NOT NULL DEFAULT '#6366f1',
      is_system  INTEGER NOT NULL DEFAULT 0,
      position   INTEGER NOT NULL DEFAULT 0,
      archived   INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      space_id   INTEGER NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
      name       TEXT    NOT NULL,
      icon       TEXT    NOT NULL DEFAULT '📋',
      is_system  INTEGER NOT NULL DEFAULT 0,
      position   INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS fields (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      name          TEXT    NOT NULL,
      field_type    TEXT    NOT NULL DEFAULT 'text',
      options_json  TEXT    NOT NULL DEFAULT '{}',
      required      INTEGER NOT NULL DEFAULT 0,
      is_system     INTEGER NOT NULL DEFAULT 0,
      position      INTEGER NOT NULL DEFAULT 0
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      position      INTEGER NOT NULL DEFAULT 0,
      archived      INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS field_values (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id     INTEGER NOT NULL REFERENCES records(id)  ON DELETE CASCADE,
      field_id      INTEGER NOT NULL REFERENCES fields(id)   ON DELETE CASCADE,
      value_text    TEXT,
      value_number  REAL,
      value_boolean INTEGER,
      value_date    TEXT,
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(record_id, field_id)
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS relations (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      field_id       INTEGER NOT NULL REFERENCES fields(id)  ON DELETE CASCADE,
      from_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
      to_record_id   INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
      created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(field_id, from_record_id, to_record_id)
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      space_id INTEGER NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
      name     TEXT    NOT NULL,
      color    TEXT    NOT NULL DEFAULT '#6366f1'
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS record_tags (
      record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
      tag_id    INTEGER NOT NULL REFERENCES tags(id)    ON DELETE CASCADE,
      PRIMARY KEY (record_id, tag_id)
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS views (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      name          TEXT    NOT NULL,
      view_type     TEXT    NOT NULL DEFAULT 'table',
      filters_json  TEXT    NOT NULL DEFAULT '[]',
      sort_json     TEXT    NOT NULL DEFAULT '[]',
      group_by      TEXT,
      is_default    INTEGER NOT NULL DEFAULT 0,
      position      INTEGER NOT NULL DEFAULT 0
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_folders (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      position   INTEGER NOT NULL DEFAULT 0,
      starred    INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      space_id      INTEGER REFERENCES spaces(id) ON DELETE SET NULL,
      folder_id     INTEGER REFERENCES chat_folders(id) ON DELETE SET NULL,
      title         TEXT    NOT NULL DEFAULT 'New conversation',
      model         TEXT    NOT NULL DEFAULT 'phi3mini',
      provider      TEXT    NOT NULL DEFAULT 'ollama',
      system_prompt TEXT    NOT NULL DEFAULT '',
      pinned        INTEGER NOT NULL DEFAULT 0,
      archived      INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
      role            TEXT    NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content         TEXT    NOT NULL DEFAULT '',
      model_used      TEXT,
      tokens_used     INTEGER,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS aida_memory (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      category    TEXT    NOT NULL,
      key         TEXT    NOT NULL,
      value       TEXT    NOT NULL,
      confidence  REAL    NOT NULL DEFAULT 0.5,
      source_type TEXT    NOT NULL DEFAULT 'observation',
      source_id   INTEGER,
      observed_at TEXT    NOT NULL DEFAULT (datetime('now')),
      expires_at  TEXT,
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(category, key)
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS aida_context (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
      entity_type     TEXT    NOT NULL,
      entity_id       INTEGER NOT NULL,
      relevance       REAL    NOT NULL DEFAULT 0.5,
      injected_at     TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS aida_suggestions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      type        TEXT    NOT NULL DEFAULT 'reminder',
      title       TEXT    NOT NULL,
      body        TEXT    NOT NULL DEFAULT '',
      action_json TEXT    NOT NULL DEFAULT '{}',
      dismissed   INTEGER NOT NULL DEFAULT 0,
      acted_on    INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      expires_at  TEXT
    );
  `)

  const safeIdx = (sql) => { try { db.exec(sql) } catch (_) {} }
  safeIdx('CREATE INDEX IF NOT EXISTS idx_collections_space    ON collections(space_id)')
  safeIdx('CREATE INDEX IF NOT EXISTS idx_fields_collection    ON fields(collection_id)')
  safeIdx('CREATE INDEX IF NOT EXISTS idx_records_collection   ON records(collection_id)')
  safeIdx('CREATE INDEX IF NOT EXISTS idx_fv_record            ON field_values(record_id)')
  safeIdx('CREATE INDEX IF NOT EXISTS idx_fv_field             ON field_values(field_id)')
  safeIdx('CREATE INDEX IF NOT EXISTS idx_relations_from       ON relations(from_record_id)')
  safeIdx('CREATE INDEX IF NOT EXISTS idx_relations_to         ON relations(to_record_id)')
  safeIdx('CREATE INDEX IF NOT EXISTS idx_conv_folder          ON chat_conversations(folder_id)')
  safeIdx('CREATE INDEX IF NOT EXISTS idx_conv_space           ON chat_conversations(space_id)')
  safeIdx('CREATE INDEX IF NOT EXISTS idx_messages_conv        ON chat_messages(conversation_id)')
  safeIdx('CREATE INDEX IF NOT EXISTS idx_memory_category      ON aida_memory(category)')
  safeIdx('CREATE INDEX IF NOT EXISTS idx_suggestions_type     ON aida_suggestions(type)')
  safeIdx('CREATE INDEX IF NOT EXISTS idx_settings_key         ON settings(key)')
}

// ═══════════════════════════════════════════════════════════════════════════════
// MIGRATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function runMigrations() {
  const current = db.prepare(
    'SELECT MAX(version) as v FROM schema_version'
  ).get()?.v ?? 0

  const migrations = [
    // v1 — AIDA-2 baseline. Schema established by initSchema() above.
    () => {},
    // v2 — Add completed_date to tasks for same-day completion visibility.
    () => {
      db.exec(`ALTER TABLE tasks ADD COLUMN completed_date TEXT`)
    },
    // v3 — Add reminder_interval to tasks for pre-event reminders.
    () => {
      db.exec(`ALTER TABLE tasks ADD COLUMN reminder_interval TEXT`)
    },
  ]

  const insert = db.prepare(`INSERT INTO schema_version (version) VALUES (?)`)
  migrations.forEach((fn, i) => {
    const version = i + 1
    if (current < version) {
      db.transaction(() => { fn(); insert.run(version) })()
    }
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

function getSetting(key) {
  const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(key)
  return row ? row.value : null
}

function getSettings(keys) {
  if (!keys || !keys.length) {
    return getDb().prepare('SELECT key, value FROM settings').all()
      .reduce((acc, r) => { acc[r.key] = r.value; return acc }, {})
  }
  const ph = keys.map(() => '?').join(',')
  return getDb().prepare(`SELECT key, value FROM settings WHERE key IN (${ph})`).all(...keys)
    .reduce((acc, r) => { acc[r.key] = r.value; return acc }, {})
}

function setSetting(key, value) {
  getDb().prepare(`
    INSERT INTO settings (key, value, updated_at) VALUES (@key, @value, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = datetime('now')
  `).run({ key, value: String(value) })
  return { key, value }
}

function setSettings(pairs) {
  const stmt = getDb().prepare(`
    INSERT INTO settings (key, value, updated_at) VALUES (@key, @value, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = datetime('now')
  `)
  getDb().transaction(() => pairs.forEach(({ key, value }) => stmt.run({ key, value: String(value) })))()
  return pairs
}

function deleteSetting(key) {
  getDb().prepare('DELETE FROM settings WHERE key = ?').run(key)
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════════════════════════

function getTasks() {
  return getDb().prepare(`SELECT * FROM tasks ORDER BY completed ASC, priority DESC, due_date ASC, created_at DESC`).all()
}

function createTask({ title, notes = '', priority = 'medium', due_date = null, due_time = null, recurrence = null, folder_id = null } = {}) {
  const r = getDb().prepare(`INSERT INTO tasks (title, notes, priority, due_date, due_time, recurrence, folder_id, completed_date, reminder_interval) VALUES (@title, @notes, @priority, @due_date, @due_time, @recurrence, @folder_id, NULL, @reminder_interval)`).run({ title, notes, priority, due_date, due_time, recurrence, folder_id, reminder_interval: null })  // null = user hasn't set one yet; fireReminders falls back to Today Settings interval
  return getDb().prepare('SELECT * FROM tasks WHERE id = ?').get(r.lastInsertRowid)
}

function updateTask(id, changes) {
  const fields = Object.keys(changes).map(k => `${k} = @${k}`).join(', ')
  getDb().prepare(`UPDATE tasks SET ${fields}, updated_at = datetime('now') WHERE id = @id`).run({ ...changes, id })
  return getDb().prepare('SELECT * FROM tasks WHERE id = ?').get(id)
}

function updateTasksByPriority(priority, reminder_interval) {
  getDb().prepare(`UPDATE tasks SET reminder_interval = ?, updated_at = datetime('now') WHERE priority = ? AND completed = 0`).run(reminder_interval, priority)
  return { success: true }
}

function deleteTask(id) {
  getDb().prepare('DELETE FROM tasks WHERE id = ?').run(id)
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTES
// ═══════════════════════════════════════════════════════════════════════════════

function getNotes() {
  return getDb().prepare(`SELECT * FROM notes ORDER BY pinned DESC, updated_at DESC`).all()
}

function createNote({ title = '', content = '', color = '#ffffff', pinned = 0 } = {}) {
  const r = getDb().prepare(`INSERT INTO notes (title, content, color, pinned) VALUES (@title, @content, @color, @pinned)`).run({ title, content, color, pinned })
  return getDb().prepare('SELECT * FROM notes WHERE id = ?').get(r.lastInsertRowid)
}

function updateNote(id, changes) {
  const fields = Object.keys(changes).map(k => `${k} = @${k}`).join(', ')
  getDb().prepare(`UPDATE notes SET ${fields}, updated_at = datetime('now') WHERE id = @id`).run({ ...changes, id })
  return getDb().prepare('SELECT * FROM notes WHERE id = ?').get(id)
}

function deleteNote(id) {
  getDb().prepare('DELETE FROM notes WHERE id = ?').run(id)
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

function getEvents({ from, to } = {}) {
  if (from && to) return getDb().prepare(`SELECT * FROM events WHERE start_time >= @from AND start_time <= @to ORDER BY start_time ASC`).all({ from, to })
  return getDb().prepare('SELECT * FROM events ORDER BY start_time ASC').all()
}

function createEvent({ title, description = '', start_time, end_time, color = '#29ABE2', location = '', all_day = 0, recurrence = null } = {}) {
  const r = getDb().prepare(`INSERT INTO events (title, description, start_time, end_time, color, location, all_day, recurrence) VALUES (@title, @description, @start_time, @end_time, @color, @location, @all_day, @recurrence)`).run({ title, description, start_time, end_time, color, location, all_day, recurrence })
  return getDb().prepare('SELECT * FROM events WHERE id = ?').get(r.lastInsertRowid)
}

function updateEvent(id, changes) {
  const fields = Object.keys(changes).map(k => `${k} = @${k}`).join(', ')
  getDb().prepare(`UPDATE events SET ${fields}, updated_at = datetime('now') WHERE id = @id`).run({ ...changes, id })
  return getDb().prepare('SELECT * FROM events WHERE id = ?').get(id)
}

function deleteEvent(id) {
  getDb().prepare('DELETE FROM events WHERE id = ?').run(id)
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPACES
// ═══════════════════════════════════════════════════════════════════════════════

function getSpaces() {
  return getDb().prepare(`SELECT * FROM spaces WHERE archived = 0 ORDER BY is_system DESC, position ASC`).all()
}

function createSpace({ name, type = 'custom', icon = '📁', color = '#6366f1', position = 0 } = {}) {
  const r = getDb().prepare(`INSERT INTO spaces (name, type, icon, color, position) VALUES (@name, @type, @icon, @color, @position)`).run({ name, type, icon, color, position })
  return getDb().prepare('SELECT * FROM spaces WHERE id = ?').get(r.lastInsertRowid)
}

function updateSpace(id, changes) {
  const fields = Object.keys(changes).map(k => `${k} = @${k}`).join(', ')
  getDb().prepare(`UPDATE spaces SET ${fields} WHERE id = @id`).run({ ...changes, id })
  return getDb().prepare('SELECT * FROM spaces WHERE id = ?').get(id)
}

function archiveSpace(id) {
  getDb().prepare('UPDATE spaces SET archived = 1 WHERE id = ?').run(id)
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLLECTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getCollections(spaceId) {
  return getDb().prepare(`SELECT * FROM collections WHERE space_id = ? ORDER BY position ASC`).all(spaceId)
}

function createCollection({ space_id, name, icon = '📋', position = 0 } = {}) {
  const r = getDb().prepare(`INSERT INTO collections (space_id, name, icon, position) VALUES (@space_id, @name, @icon, @position)`).run({ space_id, name, icon, position })
  return getDb().prepare('SELECT * FROM collections WHERE id = ?').get(r.lastInsertRowid)
}

function updateCollection(id, changes) {
  const fields = Object.keys(changes).map(k => `${k} = @${k}`).join(', ')
  getDb().prepare(`UPDATE collections SET ${fields} WHERE id = @id`).run({ ...changes, id })
  return getDb().prepare('SELECT * FROM collections WHERE id = ?').get(id)
}

function deleteCollection(id) {
  getDb().prepare('DELETE FROM collections WHERE id = ?').run(id)
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIELDS
// ═══════════════════════════════════════════════════════════════════════════════

function getFields(collectionId) {
  return getDb().prepare(`SELECT * FROM fields WHERE collection_id = ? ORDER BY position ASC`).all(collectionId)
}

function createField({ collection_id, name, field_type = 'text', options_json = '{}', required = 0, position = 0 } = {}) {
  const r = getDb().prepare(`INSERT INTO fields (collection_id, name, field_type, options_json, required, position) VALUES (@collection_id, @name, @field_type, @options_json, @required, @position)`).run({ collection_id, name, field_type, options_json, required, position })
  return getDb().prepare('SELECT * FROM fields WHERE id = ?').get(r.lastInsertRowid)
}

function updateField(id, changes) {
  const fields = Object.keys(changes).map(k => `${k} = @${k}`).join(', ')
  getDb().prepare(`UPDATE fields SET ${fields} WHERE id = @id`).run({ ...changes, id })
  return getDb().prepare('SELECT * FROM fields WHERE id = ?').get(id)
}

function deleteField(id) {
  getDb().prepare('DELETE FROM fields WHERE id = ?').run(id)
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECORDS + FIELD VALUES
// ═══════════════════════════════════════════════════════════════════════════════

function getRecords(collectionId, { archived = 0 } = {}) {
  const records = getDb().prepare(`SELECT * FROM records WHERE collection_id = ? AND archived = ? ORDER BY position ASC, created_at DESC`).all(collectionId, archived)
  const getValues = getDb().prepare(`SELECT fv.*, f.name as field_name, f.field_type FROM field_values fv JOIN fields f ON f.id = fv.field_id WHERE fv.record_id = ?`)
  return records.map(r => ({ ...r, values: getValues.all(r.id) }))
}

function createRecord({ collection_id, values = [], position = 0 } = {}) {
  return getDb().transaction(() => {
    const r  = getDb().prepare(`INSERT INTO records (collection_id, position) VALUES (@collection_id, @position)`).run({ collection_id, position })
    const id = r.lastInsertRowid
    if (values.length) {
      const stmt = getDb().prepare(`INSERT INTO field_values (record_id, field_id, value_text, value_number, value_boolean, value_date) VALUES (@record_id, @field_id, @value_text, @value_number, @value_boolean, @value_date)`)
      values.forEach(v => stmt.run({ record_id: id, field_id: v.field_id, value_text: v.value_text ?? null, value_number: v.value_number ?? null, value_boolean: v.value_boolean ?? null, value_date: v.value_date ?? null }))
    }
    return getRecords(collection_id).find(r => r.id === Number(id))
  })()
}

function updateRecord(id, { values = [] } = {}) {
  return getDb().transaction(() => {
    getDb().prepare(`UPDATE records SET updated_at = datetime('now') WHERE id = ?`).run(id)
    if (values.length) {
      const stmt = getDb().prepare(`INSERT INTO field_values (record_id, field_id, value_text, value_number, value_boolean, value_date, updated_at) VALUES (@record_id, @field_id, @value_text, @value_number, @value_boolean, @value_date, datetime('now')) ON CONFLICT(record_id, field_id) DO UPDATE SET value_text = @value_text, value_number = @value_number, value_boolean = @value_boolean, value_date = @value_date, updated_at = datetime('now')`)
      values.forEach(v => stmt.run({ record_id: id, field_id: v.field_id, value_text: v.value_text ?? null, value_number: v.value_number ?? null, value_boolean: v.value_boolean ?? null, value_date: v.value_date ?? null }))
    }
    const record = getDb().prepare('SELECT * FROM records WHERE id = ?').get(id)
    const vals   = getDb().prepare(`SELECT fv.*, f.name as field_name, f.field_type FROM field_values fv JOIN fields f ON f.id = fv.field_id WHERE fv.record_id = ?`).all(id)
    return { ...record, values: vals }
  })()
}

function archiveRecord(id) {
  getDb().prepare(`UPDATE records SET archived = 1, updated_at = datetime('now') WHERE id = ?`).run(id)
  return { success: true }
}

function deleteRecord(id) {
  getDb().prepare('DELETE FROM records WHERE id = ?').run(id)
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT — FOLDERS
// ═══════════════════════════════════════════════════════════════════════════════

function getChatFolders() {
  return getDb().prepare(`SELECT * FROM chat_folders ORDER BY starred DESC, position ASC, created_at ASC`).all()
}

function createChatFolder({ name, position = 0, starred = 0 } = {}) {
  const r = getDb().prepare(`INSERT INTO chat_folders (name, position, starred) VALUES (@name, @position, @starred)`).run({ name, position, starred })
  return getDb().prepare('SELECT * FROM chat_folders WHERE id = ?').get(r.lastInsertRowid)
}

function updateChatFolder(id, changes) {
  const fields = Object.keys(changes).map(k => `${k} = @${k}`).join(', ')
  getDb().prepare(`UPDATE chat_folders SET ${fields} WHERE id = @id`).run({ ...changes, id })
  return getDb().prepare('SELECT * FROM chat_folders WHERE id = ?').get(id)
}

function deleteChatFolder(id) {
  getDb().prepare('DELETE FROM chat_folders WHERE id = ?').run(id)
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT — CONVERSATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getChatConversations({ folderId } = {}) {
  if (folderId !== undefined) {
    const isNull = folderId === null
    return getDb().prepare(`SELECT * FROM chat_conversations WHERE folder_id ${isNull ? 'IS NULL' : '= @folderId'} ORDER BY pinned DESC, updated_at DESC`).all(isNull ? {} : { folderId })
  }
  return getDb().prepare(`SELECT * FROM chat_conversations ORDER BY pinned DESC, updated_at DESC`).all()
}

function createChatConversation({ title = 'New conversation', folder_id = null, model = 'phi3mini', provider = 'ollama', pinned = 0 } = {}) {
  const r = getDb().prepare(`INSERT INTO chat_conversations (title, folder_id, model, provider, pinned) VALUES (@title, @folder_id, @model, @provider, @pinned)`).run({ title, folder_id, model, provider, pinned })
  return getDb().prepare('SELECT * FROM chat_conversations WHERE id = ?').get(r.lastInsertRowid)
}

function updateChatConversation(id, changes) {
  const fields = Object.keys(changes).map(k => `${k} = @${k}`).join(', ')
  getDb().prepare(`UPDATE chat_conversations SET ${fields}, updated_at = datetime('now') WHERE id = @id`).run({ ...changes, id })
  return getDb().prepare('SELECT * FROM chat_conversations WHERE id = ?').get(id)
}

function deleteChatConversation(id) {
  getDb().prepare('DELETE FROM chat_conversations WHERE id = ?').run(id)
  return { success: true }
}

function searchChatConversations(query) {
  return getDb().prepare(`SELECT DISTINCT c.* FROM chat_conversations c LEFT JOIN chat_messages m ON m.conversation_id = c.id WHERE c.title LIKE @q OR m.content LIKE @q ORDER BY c.updated_at DESC`).all({ q: `%${query}%` })
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT — MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════

function getChatMessages(conversationId) {
  return getDb().prepare(`SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC`).all(conversationId)
}

function addChatMessage({ conversation_id, role, content, model_used = null, tokens_used = null }) {
  const r = getDb().prepare(`INSERT INTO chat_messages (conversation_id, role, content, model_used, tokens_used) VALUES (@conversation_id, @role, @content, @model_used, @tokens_used)`).run({ conversation_id, role, content, model_used, tokens_used })
  getDb().prepare(`UPDATE chat_conversations SET updated_at = datetime('now') WHERE id = ?`).run(conversation_id)
  return getDb().prepare('SELECT * FROM chat_messages WHERE id = ?').get(r.lastInsertRowid)
}

function deleteChatMessage(id) {
  getDb().prepare('DELETE FROM chat_messages WHERE id = ?').run(id)
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AIDA MEMORY
// ═══════════════════════════════════════════════════════════════════════════════

function getMemory({ category } = {}) {
  if (category) return getDb().prepare(`SELECT * FROM aida_memory WHERE category = ? AND (expires_at IS NULL OR expires_at > datetime('now')) ORDER BY confidence DESC`).all(category)
  return getDb().prepare(`SELECT * FROM aida_memory WHERE expires_at IS NULL OR expires_at > datetime('now') ORDER BY category ASC, confidence DESC`).all()
}

function upsertMemory({ category, key, value, confidence = 0.5, source_type = 'observation', source_id = null, expires_at = null }) {
  getDb().prepare(`INSERT INTO aida_memory (category, key, value, confidence, source_type, source_id, expires_at, updated_at) VALUES (@category, @key, @value, @confidence, @source_type, @source_id, @expires_at, datetime('now')) ON CONFLICT(category, key) DO UPDATE SET value = @value, confidence = @confidence, source_type = @source_type, source_id = @source_id, expires_at = @expires_at, updated_at = datetime('now')`).run({ category, key, value, confidence, source_type, source_id, expires_at })
  return getDb().prepare('SELECT * FROM aida_memory WHERE category = ? AND key = ?').get(category, key)
}

function deleteMemory(id) {
  getDb().prepare('DELETE FROM aida_memory WHERE id = ?').run(id)
  return { success: true }
}

function purgeExpiredMemory() {
  const r = getDb().prepare(`DELETE FROM aida_memory WHERE expires_at <= datetime('now')`).run()
  return { purged: r.changes }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AIDA SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getSuggestions({ includeExpired = false } = {}) {
  const where = includeExpired ? 'WHERE dismissed = 0' : "WHERE dismissed = 0 AND (expires_at IS NULL OR expires_at > datetime('now'))"
  return getDb().prepare(`SELECT * FROM aida_suggestions ${where} ORDER BY created_at DESC`).all()
}

function createSuggestion({ type = 'reminder', title, body = '', action_json = '{}', expires_at = null }) {
  const r = getDb().prepare(`INSERT INTO aida_suggestions (type, title, body, action_json, expires_at) VALUES (@type, @title, @body, @action_json, @expires_at)`).run({ type, title, body, action_json, expires_at })
  return getDb().prepare('SELECT * FROM aida_suggestions WHERE id = ?').get(r.lastInsertRowid)
}

function dismissSuggestion(id) {
  getDb().prepare('UPDATE aida_suggestions SET dismissed = 1 WHERE id = ?').run(id)
  return { success: true }
}

function actOnSuggestion(id) {
  getDb().prepare('UPDATE aida_suggestions SET acted_on = 1, dismissed = 1 WHERE id = ?').run(id)
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  getDb,
  getSetting, getSettings, setSetting, setSettings, deleteSetting,
  getTasks, createTask, updateTask, updateTasksByPriority, deleteTask,
  getNotes, createNote, updateNote, deleteNote,
  getEvents, createEvent, updateEvent, deleteEvent,
  getSpaces, createSpace, updateSpace, archiveSpace,
  getCollections, createCollection, updateCollection, deleteCollection,
  getFields, createField, updateField, deleteField,
  getRecords, createRecord, updateRecord, archiveRecord, deleteRecord,
  getChatFolders, createChatFolder, updateChatFolder, deleteChatFolder,
  getChatConversations, createChatConversation, updateChatConversation,
  deleteChatConversation, searchChatConversations,
  getChatMessages, addChatMessage, deleteChatMessage,
  getMemory, upsertMemory, deleteMemory, purgeExpiredMemory,
  getSuggestions, createSuggestion, dismissSuggestion, actOnSuggestion,
}
