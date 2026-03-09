const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')

// ─── Database Location ────────────────────────────────────────────────────────
// Stored in user's app data folder so it survives app updates
// e.g. C:\Users\Admin\AppData\Roaming\aida\aida.db
let db

function getDb() {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'aida.db')
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL') // Better performance for concurrent reads
    db.pragma('foreign_keys = ON')
    initSchema()
  }
  return db
}

// ─── Schema ───────────────────────────────────────────────────────────────────
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT    NOT NULL DEFAULT '',
      content    TEXT    NOT NULL DEFAULT '',
      color      TEXT    NOT NULL DEFAULT '#ffffff',
      pinned     INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT    NOT NULL,
      notes      TEXT    NOT NULL DEFAULT '',
      completed  INTEGER NOT NULL DEFAULT 0,
      priority   TEXT    NOT NULL DEFAULT 'medium',
      due_date   TEXT,
      due_time   TEXT,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      start_time  TEXT    NOT NULL,
      end_time    TEXT    NOT NULL,
      color       TEXT    NOT NULL DEFAULT '#6366f1',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  // ── Migrations: safely add columns to existing databases ──────────────
  const taskCols = db.prepare(`PRAGMA table_info(tasks)`).all().map(c => c.name)
  if (!taskCols.includes('due_time')) {
    db.exec(`ALTER TABLE tasks ADD COLUMN due_time TEXT`)
  }
}

// ─── Notes ────────────────────────────────────────────────────────────────────
function getNotes() {
  return getDb().prepare(`
    SELECT * FROM notes ORDER BY pinned DESC, updated_at DESC
  `).all()
}

function createNote({ title = '', content = '', color = '#ffffff', pinned = 0 } = {}) {
  const result = getDb().prepare(`
    INSERT INTO notes (title, content, color, pinned)
    VALUES (@title, @content, @color, @pinned)
  `).run({ title, content, color, pinned })
  return getDb().prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid)
}

function updateNote(id, changes) {
  const fields = Object.keys(changes).map(k => `${k} = @${k}`).join(', ')
  getDb().prepare(`
    UPDATE notes SET ${fields}, updated_at = datetime('now') WHERE id = @id
  `).run({ ...changes, id })
  return getDb().prepare('SELECT * FROM notes WHERE id = ?').get(id)
}

function deleteNote(id) {
  getDb().prepare('DELETE FROM notes WHERE id = ?').run(id)
  return { success: true }
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
function getTasks() {
  return getDb().prepare(`
    SELECT * FROM tasks ORDER BY completed ASC, priority DESC, due_date ASC, created_at DESC
  `).all()
}

function createTask({ title, notes = '', priority = 'medium', due_date = null, due_time = null } = {}) {
  const result = getDb().prepare(`
    INSERT INTO tasks (title, notes, priority, due_date, due_time)
    VALUES (@title, @notes, @priority, @due_date, @due_time)
  `).run({ title, notes, priority, due_date, due_time })
  return getDb().prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid)
}

function updateTask(id, changes) {
  const fields = Object.keys(changes).map(k => `${k} = @${k}`).join(', ')
  getDb().prepare(`
    UPDATE tasks SET ${fields}, updated_at = datetime('now') WHERE id = @id
  `).run({ ...changes, id })
  return getDb().prepare('SELECT * FROM tasks WHERE id = ?').get(id)
}

function deleteTask(id) {
  getDb().prepare('DELETE FROM tasks WHERE id = ?').run(id)
  return { success: true }
}

// ─── Events ───────────────────────────────────────────────────────────────────
function getEvents({ from, to } = {}) {
  if (from && to) {
    return getDb().prepare(`
      SELECT * FROM events
      WHERE start_time >= @from AND start_time <= @to
      ORDER BY start_time ASC
    `).all({ from, to })
  }
  return getDb().prepare('SELECT * FROM events ORDER BY start_time ASC').all()
}

function createEvent({ title, description = '', start_time, end_time, color = '#6366f1' } = {}) {
  const result = getDb().prepare(`
    INSERT INTO events (title, description, start_time, end_time, color)
    VALUES (@title, @description, @start_time, @end_time, @color)
  `).run({ title, description, start_time, end_time, color })
  return getDb().prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid)
}

function updateEvent(id, changes) {
  const fields = Object.keys(changes).map(k => `${k} = @${k}`).join(', ')
  getDb().prepare(`
    UPDATE events SET ${fields}, updated_at = datetime('now') WHERE id = @id
  `).run({ ...changes, id })
  return getDb().prepare('SELECT * FROM events WHERE id = ?').get(id)
}

function deleteEvent(id) {
  getDb().prepare('DELETE FROM events WHERE id = ?').run(id)
  return { success: true }
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  // Notes
  getNotes, createNote, updateNote, deleteNote,
  // Tasks
  getTasks, createTask, updateTask, deleteTask,
  // Events
  getEvents, createEvent, updateEvent, deleteEvent,
}
