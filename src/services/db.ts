// ─── AIDA Database Service ────────────────────────────────────────────────────
// Clean typed interface for all database operations.
// Components import from here — never call window.electron.db directly.

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Note {
  id: number
  title: string
  content: string
  color: string
  pinned: 0 | 1
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  title: string
  notes: string
  completed: 0 | 1
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  due_time: string | null
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: number
  title: string
  description: string
  start_time: string
  end_time: string
  color: string
  created_at: string
  updated_at: string
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export const Notes = {
  getAll: (): Promise<Note[]> =>
    window.electron!.db.notes.get(),

  create: (data: Partial<Note>): Promise<Note> =>
    window.electron!.db.notes.create(data),

  update: (id: number, changes: Partial<Note>): Promise<Note> =>
    window.electron!.db.notes.update(id, changes),

  delete: (id: number): Promise<{ success: boolean }> =>
    window.electron!.db.notes.delete(id),
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const Tasks = {
  getAll: (): Promise<Task[]> =>
    window.electron!.db.tasks.get(),

  create: (data: Partial<Task>): Promise<Task> =>
    window.electron!.db.tasks.create(data),

  update: (id: number, changes: Partial<Task>): Promise<Task> =>
    window.electron!.db.tasks.update(id, changes),

  delete: (id: number): Promise<{ success: boolean }> =>
    window.electron!.db.tasks.delete(id),
}

// ─── Events ───────────────────────────────────────────────────────────────────

export const Events = {
  getAll: (range?: { from: string; to: string }): Promise<CalendarEvent[]> =>
    window.electron!.db.events.get(range),

  create: (data: Partial<CalendarEvent>): Promise<CalendarEvent> =>
    window.electron!.db.events.create(data),

  update: (id: number, changes: Partial<CalendarEvent>): Promise<CalendarEvent> =>
    window.electron!.db.events.update(id, changes),

  delete: (id: number): Promise<{ success: boolean }> =>
    window.electron!.db.events.delete(id),
}
