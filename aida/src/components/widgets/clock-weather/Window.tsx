// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: Clock & Weather Widget Window
// AIDA-2 — src/components/widgets/clock-weather/Window.tsx
//
// Responsibility:
//   Settings loader and global CSS variable injector for this widget window.
//   Follows the standard widget Window.tsx pattern.
//
//   Widgets differ from app windows in three ways:
//   1. They load BOTH GlobalSettings and their own widget-specific settings
//   2. They never reload on window:focus — they use showInactive() and
//      should never interrupt the user
//   3. They send window:fit after render so Electron sizes the window
//      to match the widget's actual content dimensions
//
// Widget-specific settings key: 'aida-clock-settings'
//
// Import depth: widgets/clock-weather/ → depth 3 → ../../../
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import ClockWeatherWidget        from './Widget'
import type { GlobalSettings }   from '../../../types/settings'
import { defaultSettings }       from '../../../types/settings'
import { loadGlobalSettings }    from '../../../services/settingsDb'
import { loadWidgetSettings }    from '../../../services/settingsDb'
import { useGlobal }             from '../../../global/useGlobal'
import { SETTINGS_KEYS }         from '../../../services/settingsDb'

// ─── Clock widget settings shape ─────────────────────────────────────────────
// Defined in types.ts — kept separate for Vite Fast Refresh compatibility.

import type { ClockSettings }   from './types'
import { defaultClockSettings } from './types'
import WidgetContextMenu         from './ContextMenu'
export type { ClockSettings }
export { defaultClockSettings }

// ─── Component ────────────────────────────────────────────────────────────────

export default function Window() {
  const [settings,      setSettings]      = useState<GlobalSettings>(defaultSettings)
  const [clockSettings, setClockSettings] = useState<ClockSettings>(defaultClockSettings)
  const containerRef  = useRef<HTMLDivElement>(null)
  const measureTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  useGlobal(settings)

  // ── Measure and fit — AIDA-1 proven approach ───────────────────────────────
  function measure() {
    if (measureTimer.current) clearTimeout(measureTimer.current)
    measureTimer.current = setTimeout(() => {
      const el = containerRef.current
      if (!el) return
      const { width, height } = el.getBoundingClientRect()
      if (width > 0 && height > 0) {
        window.electron?.send('window:fit', {
          name:   'clock-weather-widget',
          width:  Math.ceil(width)  + 2,
          height: Math.ceil(height) + 2,
        })
      } else {
        measure()
      }
    }, 50)
  }

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      loadGlobalSettings(),
      loadWidgetSettings(SETTINGS_KEYS.CLOCK, defaultClockSettings),
    ]).then(([global, clock]) => {
      setSettings(global)
      setClockSettings(clock as ClockSettings)
      setTimeout(() => measure(), 100)
    })
  }, [])

  useEffect(() => {
    if (menuPos) setTimeout(() => measure(), 50)
    else measure()
  }, [menuPos])

  // ── Settings updates ───────────────────────────────────────────────────────
  // Widgets listen for settings:updated to keep global settings in sync.
  // They do NOT listen for window:focus — widgets use showInactive()
  // and should never need to reload on focus.

  useEffect(() => {
    const offGlobal = window.electron?.on(
      'settings:updated',
      (_: unknown, updated: GlobalSettings) => {
        setSettings(prev => ({ ...prev, ...updated }))
      }
    )
    const offClock = window.electron?.on(
      'clock-settings:updated',
      (_: unknown, updated: ClockSettings) => {
        setClockSettings(prev => ({ ...prev, ...updated }))
        setTimeout(() => measure(), 200)
      }
    )
    return () => {
      offGlobal?.()
      offClock?.()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ display: 'inline-block', position: 'relative' }}
      onClick={() => setMenuPos(null)}
    >
      <ClockWeatherWidget
        settings={settings}
        clockSettings={clockSettings}
        onMeasure={measure}
        onContextMenu={(x, y) => setMenuPos({ x, y })}
      />

      {menuPos && (
        <WidgetContextMenu
          x={menuPos.x}
          y={menuPos.y}
          settings={settings}
          accentColor={settings.accentColor}
          label="Settings"
          onOpen={() => window.electron?.send('clock-weather-settings:open')}
          onClose={() => setMenuPos(null)}
        />
      )}
    </div>
  )
}
