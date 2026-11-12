// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: Main Panel Clock & Weather
// AIDA-2 — src/components/menubar/ClockWeatherSection.tsx
//
// Responsibility:
//   Embed the existing clock/weather display in the main panel's fourth column.
//   Load its existing settings and follow the shared settings broadcast.
//   No standalone window, dragging, resize IPC or duplicate weather fetch loop.
//   Layout and appearance remain in the menubar and widget theme modules.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { SlidersHorizontal }   from 'lucide-react'
import type { GlobalSettings } from '../../types/settings'
import { loadWidgetSettings, SETTINGS_KEYS } from '../../services/settingsDb'
import ClockWeatherWidget      from '../widgets/clock-weather/Widget'
import type { ClockSettings }  from '../widgets/clock-weather/types'
import { defaultClockSettings } from '../widgets/clock-weather/types'
import {
  getMenuBarColumnStyle,
  getMenuBarSectionHeaderRowStyle,
  getMenuBarSectionHeaderStyle,
  getMenuBarTodayButtonStyle,
  MENUBAR_FONT_SCALE,
} from '../../themes/menubar'

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClockWeatherSection({ settings }: { settings: GlobalSettings }) {
  const [clockSettings, setClockSettings] = useState<ClockSettings>(defaultClockSettings)
  const scale = MENUBAR_FONT_SCALE[settings.fontSize]

  useEffect(() => {
    let active = true
    loadWidgetSettings(SETTINGS_KEYS.CLOCK, defaultClockSettings).then(loaded => {
      if (active) setClockSettings(loaded)
    })
    const off = window.electron?.on(
      'clock-settings:updated',
      (_: unknown, updated: ClockSettings) => setClockSettings(prev => ({ ...prev, ...updated }))
    )
    return () => { active = false; off?.() }
  }, [])

  function openSettings() {
    window.electron?.send('clock-weather-settings:open')
  }

  return (
    <div style={getMenuBarColumnStyle()}>
      <div style={getMenuBarSectionHeaderRowStyle()}>
        <h3 className={scale.heading + ' uppercase tracking-widest'} style={getMenuBarSectionHeaderStyle(settings)}>
          Clock & Weather
        </h3>
        <button
          aria-label="Clock and weather settings"
          onClick={openSettings}
          style={getMenuBarTodayButtonStyle(settings)}
        >
          <SlidersHorizontal size={11} />
        </button>
      </div>
      {settings.showClockWidget && (
        <ClockWeatherWidget
          settings={settings}
          clockSettings={clockSettings}
          embedded
          onContextMenu={openSettings}
        />
      )}
    </div>
  )
}
