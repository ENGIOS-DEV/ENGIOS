// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: ToastStack
// AIDA-2 — src/components/menubar/ToastStack.tsx
//
// Responsibility:
//   Floating toast notification stack for the menubar window.
//   Stacks up to 3 toasts, auto-dismisses, pauses on hover.
//
// Usage:
//   const { addToast } = useToast()
//   addToast({ variant: 'success', title: 'Done!', message: 'Task complete.' })
//
// Rules:
//   - Zero style definitions — all from src/themes/menubar.ts
//   - No Electron window — renders inside the menubar window
//   - Max 3 toasts visible at once
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react'
import { Info, CheckCircle2, AlertTriangle, XCircle, X }  from 'lucide-react'
import type { GlobalSettings }  from '../../types/settings'
import type { ToastVariant }    from '../../themes/menubar'
import {
  TOAST_DURATION,
  TOAST_VARIANT_COLOR,
  getToastStackStyle,
  getToastStyle,
  getToastReminderTabsStyle,
  getToastReminderButtonStyle,
  getToastBodyStyle,
  getToastIconStyle,
  getToastContentStyle,
  getToastTitleStyle,
  getToastMessageStyle,
  getToastActionStyle,
  getToastCloseStyle,
  getToastProgressStyle,
} from '../../themes/menubar'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToastItem {
  id:        string
  variant:   ToastVariant
  title:     string
  message?:  string
  duration?: number
  action?:   { label: string; onClick?: () => void; ipc?: string }
  overdue?:  boolean
  reminder?: boolean
  taskId?:   number
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const ICONS: Record<ToastVariant, React.ReactNode> = {
  info:    <Info          size={16} />,
  success: <CheckCircle2  size={16} />,
  warning: <AlertTriangle size={16} />,
  error:   <XCircle       size={16} />,
}

// ─── Single Toast ─────────────────────────────────────────────────────────────

function Toast({
  toast,
  settings,
  onDismiss,
}: {
  toast:     ToastItem
  settings:  GlobalSettings
  onDismiss: (id: string) => void
}) {
  const isReminder = toast.reminder === true
  const duration   = isReminder ? 0 : (toast.duration ?? TOAST_DURATION)
  const [pct, setPct]         = useState(100)
  const [visible, setVisible] = useState(false)
  const hovering   = useRef(false)
  const startedAt  = useRef(Date.now())
  const remaining  = useRef(duration)
  const rafRef     = useRef<number | null>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Slide in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  // Progress countdown
  const tick = useCallback(() => {
    if (hovering.current) return
    const elapsed  = Date.now() - startedAt.current
    const left     = remaining.current - elapsed
    const newPct   = Math.max(0, (left / duration) * 100)
    setPct(newPct)
    if (newPct <= 0) {
      dismiss()
    } else {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [])

  useEffect(() => {
    if (isReminder) return
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current)  cancelAnimationFrame(rafRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [tick])

  function pause() {
    hovering.current  = true
    remaining.current = remaining.current - (Date.now() - startedAt.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }

  function resume() {
    hovering.current = false
    startedAt.current = Date.now()
    rafRef.current = requestAnimationFrame(tick)
  }

  function dismiss() {
    setVisible(false)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  const slideStyle: React.CSSProperties = {
    transform:    visible ? 'translateX(0)'     : 'translateX(calc(100% + 16px))',
    opacity:      visible ? 1                   : 0,
    transition:   'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
    pointerEvents: 'auto' as const,
  }

  return (
    <div
      style={{ ...getToastStyle(toast.variant), ...slideStyle }}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {/* Body */}
      <div style={getToastBodyStyle()}>

        {/* Icon */}
        <div style={getToastIconStyle(toast.variant)}>
          {ICONS[toast.variant]}
        </div>

        {/* Content */}
        <div style={getToastContentStyle()}>
          <div style={{ ...getToastTitleStyle(settings), color: TOAST_VARIANT_COLOR[toast.variant] }}>{toast.title}</div>
          {toast.message && (
            <div style={getToastMessageStyle(settings)}>{toast.message}</div>
          )}
          {toast.action && (
            <button
              style={getToastActionStyle(toast.variant, settings)}
              onClick={() => {
                if (toast.action!.ipc) window.electron?.send(toast.action!.ipc)
                if (toast.action!.onClick) toast.action!.onClick()
                dismiss()
              }}
            >
              {toast.action.label} →
            </button>
          )}
        </div>

        {/* Close */}
        {!isReminder && <button
          style={getToastCloseStyle()}
          onClick={dismiss}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
        >
          <X size={14} />
        </button>}

      </div>

      {/* Reminder tabs OR progress bar */}
      {toast.reminder ? (
        <div style={getToastReminderTabsStyle()}>
          {[
            { label: 'Dismiss',  fn: () => dismiss() },
            { label: 'Postpone', fn: () => { window.electron?.send('tasks:open'); dismiss() } },
            { label: 'Complete', fn: () => {
              if (toast.taskId) window.electron?.db?.tasks?.update(toast.taskId, {
                completed: 1, completed_date: new Date().toISOString().slice(0, 10),
              })
              dismiss()
            }},
          ].map((btn, i, arr) => (
            <button key={btn.label} onClick={btn.fn}
              style={getToastReminderButtonStyle(btn.label === 'Complete', i === arr.length - 1)}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >{btn.label}</button>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--color-bg-subtle)', height: '3px' }}>
          <div style={getToastProgressStyle(toast.variant, pct)} />
        </div>
      )}

    </div>
  )
}

// ─── ToastStack ───────────────────────────────────────────────────────────────

interface ToastStackProps {
  toasts:    ToastItem[]
  settings:  GlobalSettings
  onDismiss: (id: string) => void
}

export default function ToastStack({ toasts, settings, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null

  return (
    <div style={getToastStackStyle()}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          settings={settings}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}
