// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: Tasks App
// AIDA-2 — src/components/apps/tasks/Window.tsx
//
// Responsibility:
//   Task management app. Create, complete, edit and delete tasks.
//   All data via window.electron.db.tasks — no local state persistence.
//   Zero style definitions — all from src/themes/app/tasks.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect }  from 'react'
import { Plus, Trash2, Circle, CheckCircle2, Pencil, Check, X } from 'lucide-react'
import type { GlobalSettings }  from '../../../types/settings'
import { defaultSettings }      from '../../../types/settings'
import { loadGlobalSettings }   from '../../../services/settingsDb'
import { useGlobal }            from '../../../global/useGlobal'
import AppTitleBar              from '../../shared/AppTitleBar'
import DatePicker               from '../../shared/DatePicker'
import TimePicker               from '../../shared/TimePicker'
import RepeatPicker             from '../../shared/RepeatPicker'
import {
  getAppWindowElevatedStyle,
  getAppBodyStyle,
  getTaskRowStyle,
  getTaskRowHoverStyle,
  getTaskRowEditStyle,
  getTaskEditInputStyle,
  getTaskFormInputStyle,
  getTaskPriorityGroupStyle,
  getTaskPriorityButtonStyle,
  getTaskCancelButtonStyle,
  getTaskSaveButtonStyle,
  getTaskAddButtonStyle,
  getTaskNewButtonStyle,
  getTaskIconButtonStyle,
  getTaskBadgeStyle,
  getTaskTitleStyle,
  getTaskMetaRowStyle,
  getTaskPriorityDotStyle,
  getTaskPriorityLabelStyle,
  getTaskDueLabelStyle,
  getTaskFormContainerStyle,
  getTaskTabBarStyle,
  getTaskTabStyle,
  getTaskListStyle,
  getTaskListInnerStyle,
  getTaskEmptyStateStyle,
  getTaskEmptyLabelStyle,
  getTaskFooterStyle,
  getTaskFooterTextStyle,
  getTaskFooterButtonStyle,
  getTaskToggleStyle,
} from '../../../themes/app'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id:                number
  title:             string
  completed:         number
  priority:          'low' | 'medium' | 'high'
  due_date:          string | null
  due_time:          string | null
  completed_date:    string | null
  reminder_interval: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDue(date: string | null, time: string | null): string {
  if (!date) return ''
  const d = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return time ? `${d} · ${time}` : d
}

const PRIORITY_COLOR: Record<string, string> = {
  low:    'var(--color-text-warning)',
  medium: 'var(--color-text-info)',
  high:   'var(--color-text-error)',
}

// ─── TaskRow ──────────────────────────────────────────────────────────────────

function TaskRow({ task, ac, settings, onToggle, onDelete, onSave }: {
  task:     Task
  ac:       string
  settings: GlobalSettings
  onToggle: () => void
  onDelete: () => void
  onSave:   (changes: Partial<Task>) => void
}) {
  const [editing,          setEditing]          = useState(false)
  const [title,            setTitle]            = useState(task.title)
  const [priority,         setPriority]         = useState(task.priority)
  const [dueDate,          setDueDate]          = useState(task.due_date ?? '')
  const [dueTime,          setDueTime]          = useState(task.due_time ?? '')
  const [reminderInterval, setReminderInterval] = useState<string | null>(task.reminder_interval ?? null)
  const [hovered,          setHovered]          = useState(false)

  function handleSave() {
    onSave({ title, priority, due_date: dueDate || null, due_time: dueTime || null, reminder_interval: reminderInterval || null })
    setEditing(false)
  }

  if (editing) {
    return (
      <div style={getTaskRowEditStyle()}>
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
          style={getTaskEditInputStyle(ac)}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
          <div style={getTaskPriorityGroupStyle(false)}>
            {(['low', 'medium', 'high'] as const).map(p => (
              <button key={p} onClick={() => setPriority(p)}
                style={getTaskPriorityButtonStyle(priority === p, ac)}
              >{p}</button>
            ))}
          </div>
          <DatePicker value={dueDate} onChange={setDueDate} accentColor={ac} settings={settings} />
          {dueDate && <TimePicker value={dueTime} onChange={setDueTime} accentColor={ac} settings={settings} />}
          {dueDate && (
            <RepeatPicker
              value={(reminderInterval ?? '15min') as any}
              isActive={reminderInterval !== null}
              onChange={(v: string) => setReminderInterval(v)}
              onSelect={() => setReminderInterval(prev => prev ?? '15min')}
              accentColor={ac}
              settings={settings}
              standalone
            />
          )}
          <div style={{ flex: 1 }} />
          <button onClick={() => setEditing(false)} style={getTaskCancelButtonStyle()}><X size={15} /></button>
          <button onClick={handleSave} style={getTaskSaveButtonStyle(ac)}><Check size={11} /> Save</button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ ...getTaskRowStyle(), ...(hovered ? getTaskRowHoverStyle() : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button onClick={onToggle} style={getTaskToggleStyle(ac, !!task.completed)}
        title={task.completed ? 'Mark incomplete' : 'Mark complete'}>
        {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={getTaskTitleStyle(!!task.completed)}>{task.title}</div>
        <div style={getTaskMetaRowStyle()}>
          <span style={getTaskPriorityDotStyle(PRIORITY_COLOR[task.priority])} />
          <span style={getTaskPriorityLabelStyle(PRIORITY_COLOR[task.priority])}>{task.priority}</span>
          {task.due_date && (
            <span style={getTaskDueLabelStyle()}>· {formatDue(task.due_date, task.due_time)}</span>
          )}
        </div>
      </div>

      {hovered && (
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button onClick={() => setEditing(true)} style={getTaskIconButtonStyle()}><Pencil size={13} /></button>
          <button onClick={onDelete} style={getTaskIconButtonStyle()}><Trash2 size={13} /></button>
        </div>
      )}
    </div>
  )
}

// ─── Window ───────────────────────────────────────────────────────────────────

export default function Window() {
  const [settings,            setSettings]            = useState<GlobalSettings>(defaultSettings)
  const [tasks,               setTasks]               = useState<Task[]>([])
  const [newTitle,            setNewTitle]            = useState('')
  const [newPriority,         setNewPriority]         = useState<Task['priority']>('medium')
  const [newDueDate,          setNewDueDate]          = useState('')
  const [newDueTime,          setNewDueTime]          = useState('')
  const [newReminderInterval, setNewReminderInterval] = useState<string | null>(null)
  const [showForm,            setShowForm]            = useState(false)
  const [filter,              setFilter]              = useState<'active' | 'all' | 'completed'>('active')
  useGlobal(settings)

  useEffect(() => {
    loadGlobalSettings().then(setSettings)
    load()
  }, [])

  useEffect(() => {
    const offSettings = window.electron?.on('settings:updated', (_: unknown, u: GlobalSettings) => setSettings(p => ({ ...p, ...u })))
    const offFocus    = window.electron?.on('window:focus', () => { loadGlobalSettings().then(setSettings); load() })
    const offTasks    = window.electron?.on('tasks:updated', () => load())
    return () => { offSettings?.(); offFocus?.(); offTasks?.() }
  }, [])

  async function load() {
    const all = await window.electron!.db.tasks.get()
    setTasks(all as Task[])
  }

  async function handleCreate() {
    if (!newTitle.trim()) return
    await window.electron!.db.tasks.create({
      title:             newTitle.trim(),
      priority:          newPriority,
      due_date:          newDueDate || null,
      due_time:          newDueTime || null,
      reminder_interval: newReminderInterval,
    })
    setNewTitle(''); setNewPriority('medium'); setNewDueDate(''); setNewDueTime(''); setNewReminderInterval(null)
    setShowForm(false)
    load()
  }

  const ac          = settings.accentColor
  const filtered    = tasks.filter(t => {
    if (filter === 'all')       return true
    if (filter === 'completed') return !!t.completed
    return !t.completed
  })
  const activeCount = tasks.filter(t => !t.completed).length

  return (
    <div style={{ ...getAppWindowElevatedStyle(settings), display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>

      {/* ── Title bar ───────────────────────────────────────────────────── */}
      <AppTitleBar title="Tasks" settings={settings} onClose={() => window.electron?.send('window:hide', 'tasks')}>
        {activeCount > 0 && <span style={getTaskBadgeStyle(ac)}>{activeCount}</span>}
        <button onClick={() => setShowForm(p => !p)} style={getTaskNewButtonStyle(ac)}>
          <Plus size={12} /> New Task
        </button>
      </AppTitleBar>

      <div style={getAppBodyStyle()}>

        {/* ── New task form ────────────────────────────────────────────── */}
        {showForm && (
          <div style={getTaskFormContainerStyle()}>
            <input
              autoFocus
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowForm(false) }}
              placeholder="What needs to be done?"
              style={getTaskFormInputStyle(ac, !!newTitle)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <div style={getTaskPriorityGroupStyle(true)}>
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button key={p} onClick={() => setNewPriority(p)}
                    style={getTaskPriorityButtonStyle(newPriority === p, ac)}
                  >{p}</button>
                ))}
              </div>
              <DatePicker value={newDueDate} onChange={setNewDueDate} accentColor={ac} settings={settings} />
              {newDueDate && <TimePicker value={newDueTime} onChange={setNewDueTime} accentColor={ac} settings={settings} />}
              {newDueDate && (
                <RepeatPicker
                  value={(newReminderInterval ?? '15min') as any}
                  isActive={newReminderInterval !== null}
                  onChange={(v: string) => setNewReminderInterval(v)}
                  onSelect={() => setNewReminderInterval(prev => prev ?? '15min')}
                  accentColor={ac}
                  settings={settings}
                  standalone
                />
              )}
              <div style={{ flex: 1 }} />
              <button onClick={() => setShowForm(false)} style={getTaskCancelButtonStyle()}><X size={15} /></button>
              <button onClick={handleCreate} disabled={!newTitle.trim()} style={getTaskAddButtonStyle(ac, !newTitle.trim())}>Add</button>
            </div>
          </div>
        )}

        {/* ── Filter tabs ──────────────────────────────────────────────── */}
        <div style={{ ...getTaskTabBarStyle(), WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          {(['active', 'all', 'completed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={getTaskTabStyle(filter === f, ac)}>{f}</button>
          ))}
        </div>

        {/* ── Task list ────────────────────────────────────────────────── */}
        <div style={getTaskListStyle()}>
          {filtered.length === 0 ? (
            <div style={getTaskEmptyStateStyle()}>
              <CheckCircle2 size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p style={getTaskEmptyLabelStyle()}>
                {filter === 'completed' ? 'No completed tasks yet' : 'All clear! No tasks here.'}
              </p>
            </div>
          ) : (
            <div style={getTaskListInnerStyle()}>
              {filtered.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  ac={ac}
                  settings={settings}
                  onToggle={async () => {
                    const nowCompleted = !task.completed
                    await window.electron!.db.tasks.update(task.id, {
                      completed:      nowCompleted ? 1 : 0,
                      completed_date: nowCompleted ? new Date().toISOString().slice(0, 10) : null,
                    })
                    load()
                  }}
                  onDelete={async () => { await window.electron!.db.tasks.delete(task.id); load() }}
                  onSave={async changes => { await window.electron!.db.tasks.update(task.id, changes); load() }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        {tasks.length > 0 && (
          <div style={getTaskFooterStyle()}>
            <span style={getTaskFooterTextStyle()}>
              {activeCount} remaining · {tasks.length - activeCount} done
            </span>
            {tasks.some(t => t.completed) && (
              <button
                onClick={async () => { await Promise.all(tasks.filter(t => t.completed).map(t => window.electron!.db.tasks.delete(t.id))); load() }}
                style={getTaskFooterButtonStyle()}
              >
                Clear completed
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
