// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: TimePicker
// AIDA-2 — src/components/shared/TimePicker.tsx
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react'
import { Clock }                       from 'lucide-react'
import FloatyMenu                      from './FloatyMenu'
import type { GlobalSettings }         from '../../types/settings'
import { defaultSettings }             from '../../types/settings'
import {
  getTimePickerColumnStyle,
  getTimePickerRowStyle,
  getTimePickerSeparatorStyle,
  getTimePickerHeaderStyle,
  getTimePickerTriggerStyle,
  getTimePickerFooterStyle,
  getTimePickerFooterButtonStyle,
  TIME_PICKER,
} from '../../themes/app'

interface TimePickerProps {
  value:        string
  onChange:     (v: string) => void
  accentColor:  string
  settings?:    GlobalSettings
  placeholder?: string
}

function pad(n: number): string { return String(n).padStart(2, '0') }

const HOURS   = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)

export default function TimePicker({
  value,
  onChange,
  accentColor,
  settings    = defaultSettings,
  placeholder = 'Pick a time',
}: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const [hovH, setHovH] = useState<number | null>(null)
  const [hovM, setHovM] = useState<number | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const hourRef         = useRef<HTMLDivElement>(null)
  const minRef          = useRef<HTMLDivElement>(null)

  const selHour = value ? parseInt(value.split(':')[0]) : null
  const selMin  = value ? parseInt(value.split(':')[1]) : null

  // Scroll to selection on open
  useEffect(() => {
    if (!open) return
    setTimeout(() => {
      if (hourRef.current && selHour !== null)
        hourRef.current.scrollTop = selHour * TIME_PICKER.rowH - TIME_PICKER.rowH * 2
      if (minRef.current && selMin !== null)
        minRef.current.scrollTop = selMin * TIME_PICKER.rowH - TIME_PICKER.rowH * 2
    }, 20)
  }, [open])

  function selectHour(h: number) { onChange(`${pad(h)}:${pad(selMin ?? 0)}`) }
  function selectMinute(m: number) { onChange(`${pad(selHour ?? 0)}:${pad(m)}`) }
  function setNow() {
    const n = new Date()
    onChange(`${pad(n.getHours())}:${pad(n.getMinutes())}`)
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>

      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      <button ref={triggerRef} onClick={() => setOpen(o => !o)} style={getTimePickerTriggerStyle(settings)}>
        <Clock size={13} />
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{value || placeholder}</span>
      </button>

      {/* ── Popup ───────────────────────────────────────────────────────── */}
      <FloatyMenu triggerRef={triggerRef} open={open} onClose={() => setOpen(false)}>

        {/* Headers + Columns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={getTimePickerHeaderStyle()}>Hour</div>
            <div ref={hourRef} onScroll={e => e.stopPropagation()} style={{ ...getTimePickerColumnStyle(), scrollbarWidth: 'none' } as React.CSSProperties}>
              {HOURS.map(h => (
                <button key={h}
                  style={getTimePickerRowStyle(h === selHour, h === hovH, accentColor)}
                  onClick={() => selectHour(h)}
                  onMouseEnter={() => setHovH(h)}
                  onMouseLeave={() => setHovH(null)}
                >{pad(h)}</button>
              ))}
            </div>
          </div>
          <div style={getTimePickerSeparatorStyle()}>:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={getTimePickerHeaderStyle()}>Min</div>
            <div ref={minRef} onScroll={e => e.stopPropagation()} style={{ ...getTimePickerColumnStyle(), scrollbarWidth: 'none' } as React.CSSProperties}>
              {MINUTES.map(m => (
                <button key={m}
                  style={getTimePickerRowStyle(m === selMin, m === hovM, accentColor)}
                  onClick={() => selectMinute(m)}
                  onMouseEnter={() => setHovM(m)}
                  onMouseLeave={() => setHovM(null)}
                >{pad(m)}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={getTimePickerFooterStyle()}>
          <button style={getTimePickerFooterButtonStyle()}
            onClick={() => { onChange(''); setOpen(false) }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >Clear</button>
          <button style={getTimePickerFooterButtonStyle()}
            onClick={setNow}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >Now</button>
        </div>

      </FloatyMenu>
    </div>
  )
}
