import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, Circle } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Tasks } from '../services/db'
import { snoozeTask, dismissTask } from '../services/notificationService'
import type { TaskAlert } from '../services/notificationService'
import { Z } from '../zIndex'

interface ToastProps {
  alert:    TaskAlert | null
  onDismiss: () => void
  accentColor: string
}

const PRIORITY_COLOR = {
  low:    '#fde047',  // yellow-300
  medium: '#60a5fa',  // blue-400
  high:   '#f87171',  // red-400
}

const PRIORITY_LABEL = {
  low:    'Low Priority',
  medium: 'Medium Priority',
  high:   'High Priority',
}

const SNOOZE_OPTIONS = [
  { label: '10 min',  minutes: 10  },
  { label: '30 min',  minutes: 30  },
  { label: '1 hour',  minutes: 60  },
  { label: 'Tomorrow',minutes: 1440 },
]

function ToastNotification({ alert, onDismiss, accentColor: accentColor }: ToastProps) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (alert) {
      setLeaving(false)
      setVisible(true)
      // Auto-dismiss after 10 seconds
      const t = setTimeout(() => handleDismiss(), 500_000)
      return () => clearTimeout(t)
    }
  }, [alert])

  function handleDismiss() {
    if (!alert) return
    setLeaving(true)
    dismissTask(alert.task.id)
    setTimeout(() => { setVisible(false); onDismiss() }, 300)
  }

  async function handleDone() {
    if (!alert) return
    await Tasks.update(alert.task.id, { completed: 1 })
    handleDismiss()
  }

  function handleSnooze(minutes: number) {
    if (!alert) return
    snoozeTask(alert.task.id, minutes)
    setLeaving(true)
    setTimeout(() => { setVisible(false); onDismiss() }, 300)
  }

  if (!visible || !alert) return null

  const color = PRIORITY_COLOR[alert.priority]

  const toast = (
    <div
      className="fixed transition-all duration-300"
      style={{
        bottom:    leaving ? '-120px' : '24px',
        right:     '24px',
        zIndex:    Z.SETTINGS_PANEL + 10,
        opacity:   leaving ? 0 : 1,
        width:     '320px',
      }}
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'rgba(15,15,20,0.97)',
          backdropFilter:  'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border:  `1px solid ${color}40`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}20`,
        }}
      >
        {/* Priority stripe */}
        <div className="h-0.5 w-full" style={{ backgroundColor: color }} />

        {/* Content */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color }}>
                {PRIORITY_LABEL[alert.priority]}
              </div>
              <div className="text-sm font-medium text-white leading-snug">
                {alert.task.title}
              </div>
              {(alert.task.due_date || alert.task.due_time) && (
                <div className="text-xs text-white/40 mt-1 flex items-center gap-1">
                  <Clock size={10} />
                  {alert.task.due_date && new Date(alert.task.due_date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  {alert.task.due_time && ` · ${alert.task.due_time}`}
                </div>
              )}
            </div>
            <button onClick={handleDismiss} className="text-white/25 hover:text-white/60 transition-colors shrink-0 mt-0.5">
              <Circle size={12} style={{ color: accentColor }} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDone}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: color }}
            >
              <CheckCircle2 size={11} />
              Done
            </button>
            <div className="flex items-center gap-1 ml-auto">
              {SNOOZE_OPTIONS.map(o => (
                <button
                  key={o.label}
                  onClick={() => handleSnooze(o.minutes)}
                  className="px-2 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/80 hover:bg-white/8 transition-colors"
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(toast, document.body)
}

export default ToastNotification
