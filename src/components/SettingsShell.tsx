// ─── AIDA Shared Settings UI Components ──────────────────────────────────────
// Import these into ANY settings panel to ensure visual consistency.

import { Circle } from 'lucide-react'
import { Z } from '../zIndex'

// ─── Modal Shell ──────────────────────────────────────────────────────────────
interface SettingsShellProps {
  title: string
  isOpen: boolean
  onClose: () => void
  tabs: { id: string; label: string }[]
  activeTab: string
  onTabChange: (id: string) => void
  accentColor: string
  children: React.ReactNode
}

export function SettingsShell({ title, isOpen, onClose, tabs, activeTab, onTabChange, accentColor, children }: SettingsShellProps) {
  if (!isOpen) return null
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: Z.SETTINGS_BACKDROP }}
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-130 max-h-[80vh] rounded-xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'rgba(15,15,20,0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: Z.SETTINGS_PANEL,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-sm font-semibold text-white tracking-wide">{title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <Circle size={14} style={{ color: accentColor }} />
          </button>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-white/10 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 py-3 text-xs font-medium transition-colors border-b-2"
              style={{
                borderBottomColor: activeTab === tab.id ? accentColor : 'transparent',
                color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.35)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4 mt-6 first:mt-0">
      {title}
    </h3>
  )
}

// ─── Slider Row ───────────────────────────────────────────────────────────────
export function SliderRow({ label, value, min = 0, max = 100, onChange, accentColor }: {
  label: string; value: number; min?: number; max?: number
  onChange: (val: number) => void; accentColor: string
}) {
  return (
    <div className="flex items-center gap-4 mb-3">
      <span className="text-sm text-white/70 w-32 shrink-0">{label}</span>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 cursor-pointer"
        style={{ accentColor }}
      />
      <span className="text-xs text-white/70 w-8 text-right">{value}</span>
    </div>
  )
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────
export function ToggleRow({ label, description, value, onChange, accentColor }: {
  label: string; description?: string; value: boolean
  onChange: (val: boolean) => void; accentColor: string
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1 mr-4">
        <div className="text-sm text-white/70">{label}</div>
        {description && <div className="text-xs text-white/30 mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative shrink-0"
        style={{
          width: '40px', height: '22px', borderRadius: '11px',
          backgroundColor: value ? accentColor : 'rgba(255,255,255,0.15)',
          transition: 'background-color 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: '3px',
          left: value ? '21px' : '3px',
          width: '16px', height: '16px', borderRadius: '50%',
          backgroundColor: 'white', transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  )
}

// ─── Button Group ─────────────────────────────────────────────────────────────
export function ButtonGroup<T extends string>({ options, value, onChange, accentColor }: {
  options: { label: string; value: T }[]
  value: T; onChange: (val: T) => void; accentColor: string
}) {
  return (
    <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex-1 py-1.5 text-xs rounded-md transition-colors font-medium"
          style={{
            backgroundColor: value === opt.value ? accentColor : 'transparent',
            color: value === opt.value ? 'white' : 'rgba(255,255,255,0.4)',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Input Row ────────────────────────────────────────────────────────────────
export function InputRow({ label, value, placeholder, onChange, onConfirm, accentColor }: {
  label: string; value: string; placeholder?: string
  onChange: (val: string) => void
  onConfirm?: () => void
  accentColor: string
}) {
  return (
    <div className="mb-3">
      <div className="text-sm text-white/70 mb-1.5">{label}</div>
      <div className="flex gap-2">
        <input
          type="text" value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && onConfirm) onConfirm() }}
          placeholder={placeholder}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/20 outline-none"
        />
        {onConfirm && (
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs rounded-lg text-white transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            Set
          </button>
        )}
      </div>
    </div>
  )
}
