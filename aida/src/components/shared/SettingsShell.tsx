// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: SettingsShell
// AIDA-2 — src/components/shared/SettingsShell.tsx
//
// Responsibility:
//   The standard shell and shared controls for ALL settings panels.
//
// Exports:
//   SettingsShell   — outer container with header + tab bar + content area
//   SectionHeader   — uppercase section label
//   ItemRow         — label + control row
//   SliderRow       — label + range slider + value indicator
//   ToggleRow       — label + description + toggle switch
//   ButtonGroup     — segmented control (Small/Medium/Dark/Light etc.)
//   ColourSwatch    — individual colour swatch button
//   InputRow        — label + text input
//
// Rules:
//   - Zero style definitions here — all from src/themes/panel.ts
//   - No hardcoded colours, sizes, or spacing
//   - Every control is a pure consumer of panel.ts typed functions
//
// Import depth: src/components/shared/ → depth 2 → ../../themes/
// ═══════════════════════════════════════════════════════════════════════════════

import PanelTitleBar      from './PanelTitleBar'
import type { GlobalSettings } from '../../types/settings'
import { defaultSettings }     from '../../types/settings'
import {
  getPanelWindowStyle,
  getPanelTabBarStyle,
  getPanelContentStyle,
  getPanelTabStyle,
  getPanelSectionHeaderStyle,
  getPanelItemRowStyle,
  getPanelItemLabelStyle,
  getPanelItemDescriptionStyle,
  getPanelInputStyle,
  getPanelHelperTextStyle,
  getButtonGroupContainerStyle,
  getButtonGroupItemStyle,
  getToggleTrackStyle,
  getToggleThumbStyle,
  getSliderRowStyle,
  getColourSwatchStyle,
  PANEL_TYPE,
  PANEL_LAYOUT,
  PANEL_BEHAVIOUR,
  getPanelInputWrapperStyle,
  FONT_SIZE_MAP,
} from '../../themes/panel'

// ═══════════════════════════════════════════════════════════════════════════════
// SettingsShell
// The outer container — window background, header with title + close,
// optional tab bar, scrollable content area.
// ═══════════════════════════════════════════════════════════════════════════════

interface SettingsShellProps {
  title:      string
  settings:   GlobalSettings
  onClose:    () => void
  tabs?:      string[]
  activeTab?: number
  onTabChange?: (index: number) => void
  children:   React.ReactNode
}

export function SettingsShell({
  title,
  settings,
  onClose,
  tabs,
  activeTab = 0,
  onTabChange,
  children,
}: SettingsShellProps) {
  const ac = settings.accentColor

  return (
    <div style={getPanelWindowStyle(settings)}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <PanelTitleBar
        title={title}
        settings={settings}
        onClose={onClose}
      />

      {/* ── Tab bar (optional) ────────────────────────────────────────────── */}
      {tabs && tabs.length > 0 && (
        <div style={getPanelTabBarStyle(settings)}>
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => onTabChange?.(i)}
              style={getPanelTabStyle(settings, i === activeTab, ac)}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div style={getPanelContentStyle()}>
        {children}
      </div>

    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SectionHeader
// Uppercase section divider label — "TRANSPARENCY & FROST", "ACCENT COLOR"
// ═══════════════════════════════════════════════════════════════════════════════

interface SectionHeaderProps {
  title:    string
  settings?: GlobalSettings
}

export function SectionHeader({ title, settings = defaultSettings }: SectionHeaderProps) {
  return (
    <div style={getPanelSectionHeaderStyle(settings)}>
      {title}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ItemRow
// A standard label + control row. Children is the control on the right.
// ═══════════════════════════════════════════════════════════════════════════════

interface ItemRowProps {
  label:       string
  description?: string
  settings?:   GlobalSettings
  children:    React.ReactNode
}

export function ItemRow({
  label,
  description,
  settings = defaultSettings,
  children,
}: ItemRowProps) {
  return (
    <div style={getPanelItemRowStyle()}>
      <div>
        <div style={getPanelItemLabelStyle(settings)}>{label}</div>
        {description && (
          <div style={getPanelItemDescriptionStyle(settings)}>{description}</div>
        )}
      </div>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SliderRow
// Label + range input + numeric value indicator.
// ═══════════════════════════════════════════════════════════════════════════════

interface SliderRowProps {
  label:       string
  value:       number
  min?:        number
  max?:        number
  step?:       number
  onChange:    (value: number) => void
  accentColor: string
  settings?:   GlobalSettings
}

export function SliderRow({
  label,
  value,
  min         = 0,
  max         = 100,
  step        = 1,
  onChange,
  accentColor,
  settings    = defaultSettings,
}: SliderRowProps) {
  return (
    <div style={getSliderRowStyle()}>
      <span style={{
        ...getPanelItemLabelStyle(settings),
        width:     PANEL_LAYOUT.sliderLabelWidth,
        flexShrink: 0,
      }}>
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor }}
      />
      <span style={{
        ...PANEL_TYPE.valueIndicator,
        fontSize:  FONT_SIZE_MAP[settings.fontSize],
        width:     PANEL_LAYOUT.sliderValueWidth,
        textAlign: 'right' as const,
        flexShrink: 0,
      }}>
        {value}
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ToggleRow
// Label + optional description + toggle switch.
// ═══════════════════════════════════════════════════════════════════════════════

interface ToggleRowProps {
  label:        string
  description?: string
  value:        boolean
  onChange:     (value: boolean) => void
  accentColor:  string
  settings?:    GlobalSettings
  disabled?:    boolean
}

export function ToggleRow({
  label,
  description,
  value,
  onChange,
  accentColor,
  settings  = defaultSettings,
  disabled  = false,
}: ToggleRowProps) {
  return (
    <ItemRow label={label} description={description} settings={settings}>
      <button
        onClick={() => !disabled && onChange(!value)}
        style={{
          ...getToggleTrackStyle(settings, value, accentColor),
          opacity: disabled ? PANEL_BEHAVIOUR.disabledOpacity : 1,
        }}
        disabled={disabled}
        aria-checked={value}
        role="switch"
      >
        <span style={getToggleThumbStyle(settings, value)} />
      </button>
    </ItemRow>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ButtonGroup
// Segmented control — Small/Medium/Large, Dark/Light, etc.
// ═══════════════════════════════════════════════════════════════════════════════

interface ButtonGroupProps<T extends string> {
  options:     { label: string; value: T; icon?: string }[]
  value:       T
  onChange:    (value: T) => void
  accentColor: string
  settings?:   GlobalSettings
  subtle?:     boolean   // use background lift instead of accent for active state
}

export function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
  accentColor,
  settings = defaultSettings,
  subtle = false,
}: ButtonGroupProps<T>) {
  return (
    <div style={getButtonGroupContainerStyle(settings)}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={getButtonGroupItemStyle(settings, value === opt.value, accentColor, subtle)}
        >
          {opt.icon && <img src={opt.icon} alt={opt.label} style={getPanelOptionIconStyle()} />}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ColourSwatch
// Individual colour swatch button for the accent colour picker.
// ═══════════════════════════════════════════════════════════════════════════════

interface ColourSwatchProps {
  color:      string
  isSelected: boolean
  onClick:    () => void
  settings?:  GlobalSettings
}

export function ColourSwatch({
  color,
  isSelected,
  onClick,
  settings = defaultSettings,
}: ColourSwatchProps) {
  return (
    <button
      onClick={onClick}
      style={getColourSwatchStyle(color, isSelected, settings)}
      aria-label={color}
      aria-pressed={isSelected}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// InputRow
// Label + text input field.
// ═══════════════════════════════════════════════════════════════════════════════

interface InputRowProps {
  label:       string
  value:       string
  onChange:    (value: string) => void
  placeholder?: string
  description?: string
  settings?:   GlobalSettings
}

export function InputRow({
  label,
  value,
  onChange,
  placeholder,
  description,
  settings = defaultSettings,
}: InputRowProps) {
  return (
    <div style={{ marginBottom: PANEL_LAYOUT.itemSpacingY }}>
      <div style={getPanelItemLabelStyle(settings)}>{label}</div>
      {description && (
        <div style={getPanelHelperTextStyle(settings)}>{description}</div>
      )}
      <div style={getPanelInputWrapperStyle()}>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={getPanelInputStyle(settings)}
        />
      </div>
    </div>
  )
}
