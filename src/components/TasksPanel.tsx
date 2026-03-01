import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Circle, CheckCircle2, Pencil, Check } from 'lucide-react'
import DatePicker from './ui/DatePicker'
import TimePicker from './ui/TimePicker'
import { Tasks } from '../services/db'
import type { Task } from '../services/db'
import { Z } from '../zIndex'
import type { GlobalSettings } from '../types/settings'

interface TasksPanelProps {
  isOpen: boolean
  onClose: () => void
  settings: GlobalSettings
}

const PRIORITY_COLORS = {
  low:    'text-yellow-300',
  medium: 'text-blue-400',
  high:   'text-red-400',
}

const PRIORITY_DOT = {
  low:    'bg-yellow-300',
  medium: 'bg-blue-400',
  high:   'bg-red-400',
}

function formatDateTime(due_date: string | null, due_time: string | null): string {
  if (!due_date) return ''
  const date = new Date(due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return due_time ? `${date} · ${due_time}` : date
}

// ─── Inline editable task row ─────────────────────────────────────────────────
function TaskRow({
  task, ac, onToggle, onDelete, onSave,
}: {
  task: Task
  ac: string
  onToggle: () => void
  onDelete: () => void
  onSave: (changes: Partial<Task>) => void
}) {
  const [editing, setEditing]   = useState(false)
  const [title, setTitle]       = useState(task.title)
  const [priority, setPriority] = useState(task.priority)
  const [dueDate, setDueDate]   = useState(task.due_date ?? '')
  const [dueTime, setDueTime]   = useState(task.due_time ?? '')

  function handleSave() {
    onSave({ title, priority, due_date: dueDate || null, due_time: dueTime || null })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="px-3 py-3 rounded-lg bg-white/5 flex flex-col gap-2.5">
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
          style={{ borderColor: ac }}
        />
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            {(['low', 'medium', 'high'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className="px-2.5 py-0.5 text-xs rounded-md transition-colors capitalize font-medium"
                style={{
                  backgroundColor: priority === p ? ac : 'transparent',
                  color: priority === p ? 'white' : 'rgba(255,255,255,0.4)',
                }}
              >
                {p}
              </button>
            ))}
          </div>
          {/* Date */}
          <DatePicker value={dueDate} onChange={setDueDate} accentColor={ac} />
          {/* Time — only if date is set */}
          {dueDate && (
            <TimePicker value={dueTime} onChange={setDueTime} accentColor={ac} />
          )}
          {/* Save */}
          <button
            onClick={handleSave}
            className="ml-auto flex items-center gap-1 px-3 py-1 text-xs rounded-lg text-white"
            style={{ backgroundColor: ac }}
          >
            <Check size={11} /> Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg group hover:bg-white/5 transition-colors">
      {/* Complete toggle */}
      <button
        onClick={onToggle}
        className="flex-shrink-0 transition-colors"
        style={{ color: task.completed ? ac : 'rgba(255,255,255,0.25)' }}
      >
        {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${task.completed ? 'line-through text-white/30' : 'text-white/80'}`}>
          {task.title}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
          <span className={`text-xs capitalize ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
          {task.due_date && (
            <span className="text-xs text-white/30">
              · {formatDateTime(task.due_date, task.due_time)}
            </span>
          )}
        </div>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setEditing(true)}
          className="p-1 text-white/30 hover:text-white/70 transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-white/30 hover:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
function TasksPanel({ isOpen, onClose, settings }: TasksPanelProps) {
  const [tasks, setTasks]               = useState<Task[]>([])
  const [newTitle, setNewTitle]         = useState('')
  const [newPriority, setNewPriority]   = useState<'low' | 'medium' | 'high'>('medium')
  const [newDueDate, setNewDueDate]     = useState(() => new Date().toISOString().slice(0, 10))
  const [newDueTime, setNewDueTime]     = useState(() => {
    const n = new Date()
    return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`
  })
  const [showForm, setShowForm]         = useState(false)
  const [filter, setFilter]             = useState<'all' | 'active' | 'completed'>('active')
  const ac = settings.accentColor

  useEffect(() => { if (isOpen) load() }, [isOpen])

  async function load() {
    setTasks(await Tasks.getAll())
  }

  async function handleCreate() {
    if (!newTitle.trim()) return
    await Tasks.create({
      title:    newTitle.trim(),
      priority: newPriority,
      due_date: newDueDate || null,
      due_time: newDueTime || null,
    })
    const nowReset = new Date()
    setNewTitle(''); setNewPriority('medium')
    setNewDueDate(nowReset.toISOString().slice(0, 10))
    setNewDueTime(`${String(nowReset.getHours()).padStart(2,'0')}:${String(nowReset.getMinutes()).padStart(2,'0')}`)
    setShowForm(false)
    load()
  }

  async function handleSave(id: number, changes: Partial<Task>) {
    await Tasks.update(id, changes)
    load()
  }

  const filtered   = tasks.filter(t => filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true)
  const activeCount = tasks.filter(t => !t.completed).length

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: Z.SETTINGS_BACKDROP }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] max-h-[80vh] rounded-xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'rgba(15,15,20,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: Z.SETTINGS_PANEL,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-white tracking-wide">Tasks</h2>
            {activeCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: ac }}>
                {activeCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm(p => !p)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-white"
              style={{ backgroundColor: ac }}
            >
              <Plus size={12} /> New Task
            </button>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors ml-1">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* New Task Form */}
        {showForm && (
          <div className="px-6 py-4 border-b border-white/10 flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <input
              autoFocus
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowForm(false) }}
              placeholder="What needs to be done?"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none mb-3"
              style={{ borderColor: newTitle ? ac : undefined }}
            />
            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority */}
              <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className="px-2.5 py-1 text-xs rounded-md transition-colors capitalize font-medium"
                    style={{
                      backgroundColor: newPriority === p ? ac : 'transparent',
                      color: newPriority === p ? 'white' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {/* Date */}
              <DatePicker value={newDueDate} onChange={setNewDueDate} accentColor={ac} />
              {/* Time */}
              {newDueDate && (
                <TimePicker value={newDueTime} onChange={setNewDueTime} accentColor={ac} />
              )}
              {/* Submit */}
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="ml-auto px-4 py-1.5 text-xs rounded-lg text-white transition-opacity disabled:opacity-30"
                style={{ backgroundColor: ac }}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex border-b border-white/10 flex-shrink-0">
          {(['active', 'all', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-1 py-2.5 text-xs font-medium transition-colors border-b-2 capitalize"
              style={{
                borderBottomColor: filter === f ? ac : 'transparent',
                color: filter === f ? 'white' : 'rgba(255,255,255,0.35)',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/25">
              <CheckCircle2 size={32} className="mb-3 opacity-50" />
              <p className="text-sm">
                {filter === 'completed' ? 'No completed tasks yet' : 'All clear! No tasks here.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filtered.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  ac={ac}
                  onToggle={async () => { await Tasks.update(task.id, { completed: task.completed ? 0 : 1 }); load() }}
                  onDelete={async () => { await Tasks.delete(task.id); load() }}
                  onSave={changes => handleSave(task.id, changes)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {tasks.length > 0 && (
          <div className="px-6 py-3 border-t border-white/10 flex-shrink-0 flex items-center justify-between">
            <span className="text-xs text-white/25">{activeCount} remaining · {tasks.length - activeCount} done</span>
            {tasks.some(t => t.completed) && (
              <button
                onClick={async () => { await Promise.all(tasks.filter(t => t.completed).map(t => Tasks.delete(t.id))); load() }}
                className="text-xs text-white/25 hover:text-red-400 transition-colors"
              >
                Clear completed
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default TasksPanel
