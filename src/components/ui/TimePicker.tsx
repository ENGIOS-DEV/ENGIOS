import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Clock } from 'lucide-react'

interface TimePickerProps {
  value: string
  onChange: (val: string) => void
  accentColor: string
  placeholder?: string
}

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

const ITEM_H  = 34
const VISIBLE = 5

function ScrollColumn({ items, selected, onSelect, accentColor }: {
  items: string[]
  selected: string
  onSelect: (v: string) => void
  accentColor: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const idx = items.indexOf(selected)
    if (idx < 0 || !ref.current) return
    ref.current.scrollTop = idx * ITEM_H - ITEM_H * Math.floor(VISIBLE / 2)
  }, [selected])

  return (
    <div
      ref={ref}
      className="overflow-y-auto"
      style={{ height: ITEM_H * VISIBLE, scrollbarWidth: 'none' }}
    >
      {items.map(item => {
        const active = item === selected
        return (
          <button
            key={item}
            onClick={() => onSelect(item)}
            className="flex items-center justify-center w-full rounded-lg transition-all text-sm font-mono"
            style={{
              height: ITEM_H,
              backgroundColor: active ? accentColor : 'transparent',
              color: active ? 'white' : 'rgba(255,255,255,0.35)',
              fontWeight: active ? '600' : '400',
            }}
          >
            {item}
          </button>
        )
      })}
    </div>
  )
}

function TimePicker({ value, onChange, accentColor, placeholder = 'Time' }: TimePickerProps) {
  const [open, setOpen]       = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })
  const triggerRef            = useRef<HTMLButtonElement>(null)
  const dropRef               = useRef<HTMLDivElement>(null)

  const now    = new Date()
  const parts  = value ? value.split(':') : [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ]
  const hour   = parts[0] ?? String(now.getHours()).padStart(2, '0')
  const minute = parts[1] ?? String(now.getMinutes()).padStart(2, '0')

  // Position dropdown below trigger
  function openPicker() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropPos({ top: rect.bottom + 8, left: rect.left })
    }
    setOpen(true)
  }

  // Close on outside click
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

  const dropdown = (
    <div
      ref={dropRef}
      style={{
        position: 'fixed',
        top: dropPos.top,
        left: dropPos.left,
        width: '156px',
        backgroundColor: 'rgba(18,18,24,0.98)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        zIndex: 9999,
        overflow: 'hidden',
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Current time display */}
      <div className="pt-3 pb-2 text-center">
        <span className="text-lg font-mono font-semibold text-white tracking-widest">
          {hour}:{minute}
        </span>
      </div>

      {/* Column headers */}
      <div className="flex px-3 gap-2 mb-1">
        <div className="flex-1 text-[10px] text-white/25 text-center uppercase tracking-widest">Hr</div>
        <div className="w-4" />
        <div className="flex-1 text-[10px] text-white/25 text-center uppercase tracking-widest">Min</div>
      </div>

      {/* Columns */}
      <div className="relative px-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <ScrollColumn items={HOURS}   selected={hour}   onSelect={h => onChange(`${h}:${minute}`)} accentColor={accentColor} />
          </div>
          <div className="flex items-center justify-center text-white/20 font-mono text-base w-4 pb-1">:</div>
          <div className="flex-1">
            <ScrollColumn items={MINUTES} selected={minute} onSelect={m => onChange(`${hour}:${m}`)}   accentColor={accentColor} />
          </div>
        </div>
      </div>

      {/* Clear */}
      {value && (
        <div className="px-4 py-2.5 border-t border-white/10 mt-2 flex justify-end">
          <button
            onClick={() => { onChange(''); setOpen(false) }}
            className="text-xs text-white/25 hover:text-white/60 transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={open ? () => setOpen(false) : openPicker}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors"
        style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: `1px solid ${open ? accentColor : 'rgba(255,255,255,0.1)'}`,
          color: value ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
          minWidth: '80px',
        }}
      >
        <Clock size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
        <span>{value || placeholder}</span>
      </button>

      {open && createPortal(dropdown, document.body)}
    </div>
  )
}

export default TimePicker
