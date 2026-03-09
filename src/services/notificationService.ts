// ─── AIDA Notification Service ────────────────────────────────────────────────
// Watches the clock, checks tasks, fires alerts when due.

import { Tasks } from './db'
import type { Task } from './db'

export type Priority = 'low' | 'medium' | 'high'

export interface AlertState {
  low:    boolean   // left dot
  medium: boolean   // right dot
  high:   boolean   // center dot
}

export interface TaskAlert {
  task:    Task
  priority: Priority
}

type AlertCallback  = (state: AlertState) => void
type ToastCallback  = (alert: TaskAlert) => void

// Snoozed task IDs with their snooze-until timestamp
const snoozed = new Map<number, number>()

// Already-toasted this session (avoid re-toasting until snoozed/dismissed)
const toasted = new Set<number>()

let alertCb: AlertCallback | null = null
let toastCb: ToastCallback | null = null
let interval: ReturnType<typeof setInterval> | null = null

export function onAlertChange(cb: AlertCallback)  { alertCb = cb }
export function onToast(cb: ToastCallback)         { toastCb = cb }

export function snoozeTask(id: number, minutes: number) {
  snoozed.set(id, Date.now() + minutes * 60 * 1000)
  toasted.delete(id)
}

export function dismissTask(id: number) {
  toasted.add(id)
  snoozed.delete(id)
}

async function check() {
  const now   = Date.now()
  const today = new Date().toISOString().slice(0, 10)
  const tasks = await Tasks.getAll()

  const due = tasks.filter(t => {
    if (t.completed) return false
    if (!t.due_date)  return false
    if (t.due_date > today) return false

    // If snoozed, check if snooze has expired
    if (snoozed.has(t.id)) {
      if (now < snoozed.get(t.id)!) return false
      snoozed.delete(t.id) // snooze expired
    }

    // If due today with a time, check if time has passed
    if (t.due_date === today && t.due_time) {
      const [h, m] = t.due_time.split(':').map(Number)
      const dueMs  = new Date().setHours(h, m, 0, 0)
      return now >= dueMs
    }

    return true // overdue or due today without time
  })

  // Build alert state
  const state: AlertState = {
    low:    due.some(t => t.priority === 'low'),
    medium: due.some(t => t.priority === 'medium'),
    high:   due.some(t => t.priority === 'high'),
  }
  alertCb?.(state)

  // Fire toast for first un-toasted due task (highest priority first)
  const priority: Priority[] = ['high', 'medium', 'low']
  for (const p of priority) {
    const task = due.find(t => t.priority === p && !toasted.has(t.id))
    if (task) {
      toasted.add(task.id)
      toastCb?.({ task, priority: p })
      break // one toast at a time
    }
  }
}

export function startNotificationService() {
  check() // immediate check on start
  interval = setInterval(check, 30_000) // check every 30 seconds
}

export function stopNotificationService() {
  if (interval) clearInterval(interval)
}
