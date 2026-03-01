import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface DatePickerProps {
  value: string
  onChange: (val: string) => void
  accentColor: string
  placeholder?: string
}

const DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function DatePicker({ value, onChange, accentColor, placeholder = 'Date' }: DatePickerProps) {
  const parsed = value ? new Date(value + 'T12:00:00') : null
  const today  = new Date()

  const [open, setOpen]       = useState(false)
  const [view, setView]       = useState<Date>(parsed ?? new Date())
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })
  const triggerRef            = useRef<HTMLButtonElement>(null)
  const dropRef               = useRef<HTMLDivElement>(null)

  useEffect(() => { if (parsed) setView(parsed) }, [value])

  function openPicker() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropPos({ top: rect.bottom + 8, left: rect.left })
    }
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const year  = view.getFullYear()
  const month = view.getMonth()

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function selectDay(day: number) {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    onChange(`${year}-${mm}-${dd}`)
    setOpen(false)
  }

  const isSelected = (day: number) =>
    !!parsed && parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === day

  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const displayValue = parsed
    ? parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  const dropdown = (
    <div
      ref={dropRef}
      style={{
        position: 'fixed',
        top: dropPos.top,
        left: dropPos.left,
        width: '260px',
        backgroundColor: 'rgba(18,18,24,0.98)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        zIndex: 9999,
        padding: '12px',
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setView(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-medium text-white">{MONTHS[month]} {year}</span>
        <button onClick={() => setView(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-white/25 py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const selected = isSelected(day)
          const todayDay = isToday(day)
          return (
            <button
              key={day}
              onClick={() => selectDay(day)}
              className="flex items-center justify-center h-8 w-full rounded-lg text-xs transition-all hover:bg-white/10"
              style={{
                backgroundColor: selected ? accentColor : 'transparent',
                color: selected ? 'white' : todayDay ? accentColor : 'rgba(255,255,255,0.7)',
                fontWeight: selected || todayDay ? '600' : '400',
                outline: todayDay && !selected ? `1px solid ${accentColor}40` : 'none',
              }}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
        <button
          onClick={() => {
            const t  = new Date()
            const mm = String(t.getMonth() + 1).padStart(2, '0')
            const dd = String(t.getDate()).padStart(2, '0')
            onChange(`${t.getFullYear()}-${mm}-${dd}`)
            setOpen(false)
          }}
          className="text-xs transition-colors hover:text-white"
          style={{ color: accentColor }}
        >
          Today
        </button>
        {value && (
          <button onClick={() => { onChange(''); setOpen(false) }} className="text-xs text-white/25 hover:text-white/60 transition-colors">
            Clear
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={open ? () => setOpen(false) : openPicker}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors"
        style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: `1px solid ${open ? accentColor : 'rgba(255,255,255,0.1)'}`,
          color: displayValue ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
          minWidth: '130px',
        }}
      >
        <Calendar size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
        <span>{displayValue || placeholder}</span>
      </button>

      {open && createPortal(dropdown, document.body)}
    </div>
  )
}

export default DatePicker
