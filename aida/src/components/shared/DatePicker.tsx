// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: DatePicker
// AIDA-2 — src/components/shared/DatePicker.tsx
//
// Responsibility:
//   Reusable custom date picker. Replaces native <input type="date">.
//   Used across all app windows that need date selection.
//
// Rules:
//   - Zero style definitions — all from src/themes/app.ts
//   - Accepts value (YYYY-MM-DD string) and onChange callback
//   - Closes on outside click and Escape
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays }  from 'lucide-react'
import FloatyMenu                                    from './FloatyMenu'
import type { GlobalSettings }                       from '../../types/settings'
import { defaultSettings }                           from '../../types/settings'
import {
  getDatePickerHeaderStyle,
  getDatePickerNavButtonStyle,
  getDatePickerMonthLabelStyle,
  getDatePickerWeekdayStyle,
  getDatePickerCellStyle,
  getDatePickerFooterStyle,
  getDatePickerFooterButtonStyle,
  getDatePickerTriggerStyle,
} from '../../themes/app'

// ─── Props ────────────────────────────────────────────────────────────────────

interface DatePickerProps {
  value:       string              // YYYY-MM-DD or ''
  onChange:    (v: string) => void
  accentColor: string
  settings?:   GlobalSettings
  placeholder?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS   = ['January','February','March','April','May','June','July','August','September','October','November','December']

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function startDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function formatDisplay(value: string): string {
  if (!value) return ''
  const d = new Date(value + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DatePicker({
  value,
  onChange,
  accentColor,
  settings   = defaultSettings,
  placeholder = 'Pick a date',
}: DatePickerProps) {
  const today    = new Date()
  const initDate = value ? new Date(value + 'T00:00:00') : today

  const [open,       setOpen]       = useState(false)
  const [viewYear,   setViewYear]   = useState(initDate.getFullYear())
  const [viewMonth,  setViewMonth]  = useState(initDate.getMonth())
  const [hovered,    setHovered]    = useState<number | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Update view when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00')
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
  }, [value])

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }, [viewMonth])

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }, [viewMonth])

  function selectDay(day: number, month = viewMonth, year = viewYear) {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    onChange(`${year}-${mm}-${dd}`)
    setOpen(false)
  }

  // Build calendar grid
  const startDay = startDayOfMonth(viewYear, viewMonth)
  const numDays  = daysInMonth(viewYear, viewMonth)
  const prevDays = daysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1)

  const cells: { day: number; month: number; year: number; otherMonth: boolean }[] = []

  // Previous month overflow
  for (let i = startDay - 1; i >= 0; i--) {
    const m = viewMonth === 0 ? 11 : viewMonth - 1
    const y = viewMonth === 0 ? viewYear - 1 : viewYear
    cells.push({ day: prevDays - i, month: m, year: y, otherMonth: true })
  }
  // Current month
  for (let d = 1; d <= numDays; d++) {
    cells.push({ day: d, month: viewMonth, year: viewYear, otherMonth: false })
  }
  // Next month overflow — fill to complete rows
  let next = 1
  while (cells.length % 7 !== 0) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1
    const y = viewMonth === 11 ? viewYear + 1 : viewYear
    cells.push({ day: next++, month: m, year: y, otherMonth: true })
  }

  const selectedStr = value
  const todayStr    = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  function cellKey(c: typeof cells[0]) {
    return `${c.year}-${String(c.month+1).padStart(2,'0')}-${String(c.day).padStart(2,'0')}`
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>

      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        style={getDatePickerTriggerStyle(settings)}
      >
        <CalendarDays size={13} />
        <span>{value ? formatDisplay(value) : placeholder}</span>
      </button>

      <FloatyMenu triggerRef={triggerRef} open={open} onClose={() => setOpen(false)}>
        <div style={{ userSelect: 'none', width: '280px' }}>

          {/* Header */}
          <div style={getDatePickerHeaderStyle()}>
            <button
              style={getDatePickerNavButtonStyle()}
              onClick={prevMonth}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={getDatePickerMonthLabelStyle()}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              style={getDatePickerNavButtonStyle()}
              onClick={nextMonth}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {WEEKDAYS.map(d => (
              <div key={d} style={getDatePickerWeekdayStyle()}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((c, i) => {
              const key      = cellKey(c)
              const isSel    = key === selectedStr
              const isToday  = key === todayStr
              const isHov    = hovered === i
              return (
                <button
                  key={i}
                  style={{
                    ...getDatePickerCellStyle(isToday, isSel, c.otherMonth, accentColor),
                    ...(isHov && !isSel ? { backgroundColor: 'var(--color-bg-elevated)' } : {}),
                  }}
                  onClick={() => selectDay(c.day, c.month, c.year)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {c.day}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div style={getDatePickerFooterStyle()}>
            <button
              style={getDatePickerFooterButtonStyle()}
              onClick={() => { onChange(''); setOpen(false) }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Clear
            </button>
            <button
              style={getDatePickerFooterButtonStyle()}
              onClick={() => { onChange(todayStr); setOpen(false) }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Today
            </button>
          </div>

        </div>
      </FloatyMenu>
    </div>
  )
}
