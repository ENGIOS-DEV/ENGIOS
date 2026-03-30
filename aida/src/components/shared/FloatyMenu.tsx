// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: FloatyMenu
// AIDA-2 — src/components/shared/FloatyMenu.tsx
//
// Global floating menu template. Renders via portal into document.body.
// Used in app and panel windows (both resizable) so clipping is not an issue.
// Closes on outside click or Escape.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef }  from 'react'
import { createPortal }       from 'react-dom'
import { getFloatyMenuStyle }  from '../../themes/app'

interface FloatyMenuProps {
  triggerRef: React.RefObject<HTMLElement | null>
  open:       boolean
  onClose:    () => void
  children:   React.ReactNode
}

export default function FloatyMenu({
  triggerRef,
  open,
  onClose,
  children,
}: FloatyMenuProps) {
  const menuRef    = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  // Position below trigger, aligned to its left edge
  function getPos() {
    if (!triggerRef.current) return { top: 0, left: 0 }
    const r = triggerRef.current.getBoundingClientRect()
    return { top: r.bottom + 4, left: r.left }
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      const path      = e.composedPath()
      const inMenu    = menuRef.current    && path.includes(menuRef.current)
      const inTrigger = triggerRef.current && path.includes(triggerRef.current)
      if (!inMenu && !inTrigger) onCloseRef.current()
    }
    const t = setTimeout(() => window.addEventListener('mousedown', handler), 50)
    return () => { clearTimeout(t); window.removeEventListener('mousedown', handler) }
  }, [open])

  // Close on Escape or parent scroll
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onCloseRef.current() }
    function onScroll(e: Event) {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) return
      onCloseRef.current()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll',  onScroll, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll',  onScroll, true)
    }
  }, [open])

  if (!open) return null

  const pos = getPos()

  return createPortal(
    <div
      ref={menuRef}
      style={getFloatyMenuStyle(pos.top, pos.left)}
    >
      {children}
    </div>,
    document.body
  )
}
