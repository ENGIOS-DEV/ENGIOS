// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: Handle
// AIDA-2 — src/components/menubar/Handle.tsx
//
// Responsibility:
//   The AIDA handle pill. Always visible at top-centre of the screen.
//   Click toggles the menubar. Auto-hides the menubar after inactivity.
//
// Pure consumer of src/themes/handle.ts — zero style definitions here.
//
// Import depth: menubar/ → depth 2 → ../../
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState }  from 'react'
import type { GlobalSettings }           from '../../types/settings'
import { defaultSettings }               from '../../types/settings'
import { loadGlobalSettings }            from '../../services/settingsDb'
import { useGlobal }             from '../../global/useGlobal'
import {
  HANDLE,
  getHandleStyle,
  getHandleBreathingStyle,
  getDotStyle,
  getDotColorDim,
  getDotColorCenter,
} from '../../themes/handle'

// ─── Component ────────────────────────────────────────────────────────────────

export default function Handle() {
  const [settings,   setSettings]   = useState<GlobalSettings>(defaultSettings)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hovered,    setHovered]    = useState(false)
  useGlobal(settings)

  const autoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoHideRef   = useRef(false)
  const delayRef      = useRef(3)
  const menuOpenRef   = useRef(false)

  // ── Timer helpers ──────────────────────────────────────────────────────────

  function clearTimer() {
    if (autoHideTimer.current) {
      clearTimeout(autoHideTimer.current)
      autoHideTimer.current = null
    }
  }

  function scheduleHide() {
    clearTimer()
    if (!autoHideRef.current || !menuOpenRef.current) return
    autoHideTimer.current = setTimeout(() => {
      window.electron?.send('menubar:hide')
    }, delayRef.current * 1000)
  }

  // ── Initial load + IPC listeners ───────────────────────────────────────────

  useEffect(() => {
    loadGlobalSettings().then(s => {
      setSettings(s)
      autoHideRef.current = s.autoHideMenu
      delayRef.current    = s.autoHideDelay
    })

    const offState    = window.electron?.on('menubar:state', (_: unknown, open: boolean) => {
      menuOpenRef.current = open
      setIsMenuOpen(open)
      if (open) scheduleHide()
      else clearTimer()
    })

    const offActivity = window.electron?.on('menubar:activity', () => scheduleHide())

    const offSettings = window.electron?.on('settings:updated', (_: unknown, updated: GlobalSettings) => {
      setSettings(prev => ({ ...prev, ...updated }))
      if (updated.autoHideMenu  !== undefined) autoHideRef.current = updated.autoHideMenu
      if (updated.autoHideDelay !== undefined) delayRef.current    = updated.autoHideDelay
    })

    return () => { offState?.(); offActivity?.(); offSettings?.() }
  }, [])

  // ── Dot colours ────────────────────────────────────────────────────────────
  // All colours from typed functions in handle.ts — none defined here.

  const dots = [
    { color: getDotColorDim(settings), size: HANDLE.dotSize },
    { color: getDotColorDim(settings), size: HANDLE.dotSize },
    { color: getDotColorDim(settings), size: HANDLE.dotSize },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      onClick={() => window.electron?.send('menubar:toggle')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...getHandleStyle(settings, isMenuOpen || hovered),
        ...(hovered && !isMenuOpen ? getHandleBreathingStyle(settings) : {}),
      }}
    >
      {dots.map((dot, i) => (
        <div key={i} style={getDotStyle(dot.size, dot.color, settings)} />
      ))}
    </div>
  )
}
