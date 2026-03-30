// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: Widget Context Menu
// AIDA-2 — src/components/widgets/clock-weather/ContextMenu.tsx
//
// Responsibility:
//   Single-item context menu for the Clock & Weather widget.
//   Self-positions to stay within screen bounds.
//   All styles from src/themes/widget.ts — zero definitions here.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef }    from 'react'
import { Settings }             from 'lucide-react'
import type { GlobalSettings }  from '../../../types/settings'
import {
  getWidgetContextMenuStyle,
  getWidgetContextMenuItemStyle,
  getWidgetContextMenuItemHoverStyle,
  WIDGET_LAYOUT,
  Z,
} from '../../../themes/widget'

// ─── Props ────────────────────────────────────────────────────────────────────

interface WidgetContextMenuProps {
  x:           number
  y:           number
  settings:    GlobalSettings
  accentColor: string
  label:       string
  onOpen:      () => void
  onClose:     () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WidgetContextMenu({
  x,
  y,
  settings,
  accentColor,
  label,
  onOpen,
  onClose,
}: WidgetContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Self-clamp to screen bounds with padding
  useEffect(() => {
    const el = menuRef.current
    if (!el) return
    const PAD   = 10
    const menuW = el.offsetWidth
    const menuH = el.offsetHeight
    const winW  = window.innerWidth
    const winH  = window.innerHeight
    let left = x
    let top  = y
    if (left + menuW + PAD > winW) left = winW - menuW - PAD
    if (top  + menuH + PAD > winH) top  = winH - menuH - PAD
    if (left < PAD) left = PAD
    if (top  < PAD) top  = PAD
    el.style.left = `${left}px`
    el.style.top  = `${top}px`
  }, [x, y])

  // Close when the widget window loses focus (user clicked elsewhere on screen)
  useEffect(() => {
    const off = window.electron?.on('widget:blur', () => onClose())
    return () => off?.()
  }, [onClose])

  return (
    <div
      ref={menuRef}
      onMouseDown={e => e.stopPropagation()}
      style={{
        ...getWidgetContextMenuStyle(settings),
        position: 'fixed',
        left:     x,
        top:      y,
        zIndex:   Z.CONTEXT_MENU,
      }}
    >
      <button
        style={getWidgetContextMenuItemStyle(settings)}
        onMouseEnter={e => Object.assign(e.currentTarget.style, getWidgetContextMenuItemHoverStyle(settings))}
        onMouseLeave={e => Object.assign(e.currentTarget.style, { backgroundColor: 'transparent' })}
        onClick={() => { onOpen(); onClose() }}
      >
        <Settings size={WIDGET_LAYOUT.contextMenuIconSize} style={{ color: accentColor, flexShrink: 0 }} />
        {label}
      </button>
    </div>
  )
}
