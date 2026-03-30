// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: RepeatPicker
// AIDA-2 — src/components/shared/RepeatPicker.tsx
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useRef }            from 'react'
import { Bell }                        from 'lucide-react'
import FloatyMenu                      from './FloatyMenu'
import type { GlobalSettings }         from '../../types/settings'
import { defaultSettings }             from '../../types/settings'
import type { RepeatEvery }            from '../../types/settings'
import { getTimePickerTriggerStyle, getRepeatPickerOptionStyle } from '../../themes/app'

interface RepeatPickerProps {
  value:       RepeatEvery
  isActive:    boolean
  onChange:    (v: RepeatEvery) => void
  onSelect:    () => void
  accentColor: string
  settings?:   GlobalSettings
  standalone?: boolean
}

const OPTIONS: { label: string; value: RepeatEvery }[] = [
  { label: '15m', value: '15min' },
  { label: '30m', value: '30min' },
  { label: '1hr', value: '1hr'   },
  { label: '4hr', value: '4hr'   },
]

export default function RepeatPicker({
  value,
  isActive,
  onChange,
  onSelect,
  accentColor,
  settings = defaultSettings,
  standalone = false,
}: RepeatPickerProps) {
  const [open,     setOpen]  = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  function handleClick() {
    onSelect()
    setOpen(o => !o)
  }

  return (
    <div style={{ position: 'relative', ...(standalone ? { display: 'inline-block' } : { flex: 1 }) }}>

      {/* ── Trigger — exact copy of TimePicker trigger ────────────────── */}
      <button
        ref={triggerRef}
        onClick={handleClick}
        style={standalone
          ? getTimePickerTriggerStyle(settings)
          : {
              width:           '100%',
              padding:         '6px 0',
              borderRadius:    'var(--radius-sm)',
              backgroundColor: isActive ? accentColor : 'transparent',
              color:           isActive ? '#fff' : 'var(--color-text-muted)',
              border:          'none',
              cursor:          'pointer',
              fontSize:        'var(--font-size-xs)',
              transition:      'all 0.15s ease',
            }
        }
      >
        {standalone ? (
          <>
            <Bell size={13} />
            <span>Reminder</span>
          </>
        ) : 'Repeat'}
      </button>

      {/* ── Dropdown via FloatyMenu ───────────────────────────────────── */}
      <FloatyMenu
        triggerRef={triggerRef}
        open={open}
        onClose={() => setOpen(false)}
       
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={getRepeatPickerOptionStyle(opt.value === value, accentColor)}
              onMouseEnter={e => {
                if (opt.value !== value)
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor =
                  opt.value === value ? accentColor : 'transparent'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FloatyMenu>
    </div>
  )
}
