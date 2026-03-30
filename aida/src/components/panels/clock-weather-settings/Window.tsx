// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: Clock & Weather Settings Panel
// AIDA-2 — src/components/panels/clock-weather-settings/Window.tsx
//
// Responsibility:
//   Settings panel for the Clock & Weather widget.
//   Tabs: Time · Weather · Appearance
//
// Adapted from AIDA-1 clock-weather-settings/Window.tsx.
// All styles from SettingsShell components and panel.ts (Layer 4).
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect }      from 'react'
import type { GlobalSettings }      from '../../../types/settings'
import { defaultSettings }          from '../../../types/settings'
import { loadGlobalSettings }       from '../../../services/settingsDb'
import { loadWidgetSettings }       from '../../../services/settingsDb'
import { SETTINGS_KEYS }            from '../../../services/settingsDb'
import { useGlobal }             from '../../../global/useGlobal'
import type { ClockSettings }       from '../../widgets/clock-weather/types'
import { defaultClockSettings }     from '../../widgets/clock-weather/types'
import {
  SettingsShell,
  SectionHeader,
  ToggleRow,
  ButtonGroup,
  InputRow,
  SliderRow,
} from '../../shared/SettingsShell'

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = ['Time', 'Weather', 'Appearance']

// ─── Font options ─────────────────────────────────────────────────────────────

const FONTS = [
  { label: 'Inter',   value: 'Inter, system-ui'   },
  { label: 'Mono',    value: 'DM Mono, monospace'  },
  { label: 'Rounded', value: 'Nunito, system-ui'   },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function Window() {
  const [settings,  setSettings]  = useState<GlobalSettings>(defaultSettings)
  const [ws,        setWs]        = useState<ClockSettings>(defaultClockSettings)
  const [activeTab, setTab]       = useState(0)
  const [cityInput, setCityInput] = useState('')
  useGlobal(settings)

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadGlobalSettings().then(setSettings)
    loadWidgetSettings(SETTINGS_KEYS.CLOCK, defaultClockSettings).then(s => {
      const loaded = s as ClockSettings
      setWs(loaded)
      setCityInput(loaded.weatherCity)
    })
  }, [])

  useEffect(() => {
    const offSettings = window.electron?.on(
      'settings:updated',
      (_: unknown, updated: GlobalSettings) => setSettings(prev => ({ ...prev, ...updated }))
    )
    const offFocus = window.electron?.on('window:focus', () => {
      loadGlobalSettings().then(setSettings)
      loadWidgetSettings(SETTINGS_KEYS.CLOCK, defaultClockSettings).then(s => {
        const loaded = s as ClockSettings
        setWs(loaded)
        setCityInput(loaded.weatherCity)
      })
    })
    return () => { offSettings?.(); offFocus?.() }
  }, [])

  // ── Update & broadcast ─────────────────────────────────────────────────────
  function update(changes: Partial<ClockSettings>) {
    setWs(prev => {
      const next = { ...prev, ...changes }
      // main saves to DB and broadcasts clock-settings:updated to all windows
      window.electron?.send('clock-settings:update', next)
      return next
    })
  }

  const ac = settings.accentColor

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}>
      <SettingsShell
        title="Clock & Weather"
        onClose={() => window.electron?.send('window:hide', 'clock-weather-settings')}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(i) => setTab(i)}
        settings={settings}
      >

        {/* ── Time ──────────────────────────────────────────────────────── */}
        {activeTab === 0 && <>
          <SectionHeader title="Hour Format" />
          <ButtonGroup
            options={[{ label: '24 Hour', value: 'true' }, { label: '12 Hour', value: 'false' }]}
            value={String(ws.use24Hour)}
            onChange={v => update({ use24Hour: v === 'true' })}
            accentColor={ac} settings={settings}
          />

          {!ws.use24Hour && <>
            <SectionHeader title="AM / PM Style" />
            <ButtonGroup
              options={[{ label: 'am/pm', value: 'false' }, { label: 'AM/PM', value: 'true' }]}
              value={String(ws.showAmPmUpper)}
              onChange={v => update({ showAmPmUpper: v === 'true' })}
              accentColor={ac} settings={settings}
            />
          </>}

          <SectionHeader title="Display" />
          <ToggleRow label="Show Seconds" value={ws.showSeconds} onChange={v => update({ showSeconds: v })} accentColor={ac} settings={settings} />
          <ToggleRow label="Show Day"     value={ws.showDay}     onChange={v => update({ showDay: v })}     accentColor={ac} settings={settings} />
          <ToggleRow label="Show Date"    value={ws.showDate}    onChange={v => update({ showDate: v })}    accentColor={ac} settings={settings} />

          {ws.showDate && <>
            <SectionHeader title="Date Format" />
            <ButtonGroup
              options={[{ label: 'DD/MM', value: 'DD/MM' }, { label: 'MM/DD', value: 'MM/DD' }]}
              value={ws.dateFormat}
              onChange={v => update({ dateFormat: v as ClockSettings['dateFormat'] })}
              accentColor={ac} settings={settings}
            />
          </>}
        </>}

        {/* ── Weather ───────────────────────────────────────────────────── */}
        {activeTab === 1 && <>
          <SectionHeader title="Display" />
          <ToggleRow label="Show Weather"    value={ws.showWeather} onChange={v => update({ showWeather: v })} accentColor={ac} settings={settings} />
          <ToggleRow label="Show High / Low" value={ws.showHighLow} onChange={v => update({ showHighLow: v })} accentColor={ac} settings={settings} />

          <SectionHeader title="Temperature Unit" />
          <ButtonGroup
            options={[{ label: '°C  Celsius', value: 'celsius' }, { label: '°F  Fahrenheit', value: 'fahrenheit' }]}
            value={ws.weatherUnit}
            onChange={v => update({ weatherUnit: v as ClockSettings['weatherUnit'] })}
            accentColor={ac} settings={settings}
          />

          <SectionHeader title="Location" />
          <InputRow
            label="City Override"
            value={cityInput}
            placeholder="Leave blank for auto-detect"
            onChange={v => { setCityInput(v); update({ weatherCity: v }) }}
            settings={settings}
          />
        </>}

        {/* ── Appearance ────────────────────────────────────────────────── */}
        {activeTab === 2 && <>
          <SectionHeader title="Position" />
          <ToggleRow
            label="Lock Position"
            description="Prevent accidental dragging"
            value={ws.positionLocked}
            onChange={v => update({ positionLocked: v })}
            accentColor={ac} settings={settings}
          />

          <SectionHeader title="Font" />
          <ButtonGroup
            options={FONTS}
            value={ws.fontFamily}
            onChange={v => update({ fontFamily: v })}
            accentColor={ac} settings={settings}
          />

          <SectionHeader title="Font Weight" />
          <ButtonGroup
            options={[{ label: 'Light', value: '300' }, { label: 'Regular', value: '400' }, { label: 'Medium', value: '500' }]}
            value={ws.fontWeight}
            onChange={v => update({ fontWeight: v as ClockSettings['fontWeight'] })}
            accentColor={ac} settings={settings}
          />

          <SectionHeader title="Font Size" />
          <ButtonGroup
            options={[{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }]}
            value={ws.fontSize}
            onChange={v => update({ fontSize: v as ClockSettings['fontSize'] })}
            accentColor={ac} settings={settings}
          />

          <SectionHeader title="Text Opacity" />
          <SliderRow
            label="Opacity" value={ws.textOpacity} min={10} max={100}
            onChange={v => update({ textOpacity: v })}
            accentColor={ac} settings={settings}
          />

          <SectionHeader title="Alignment" />
          <ButtonGroup
            options={[{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }]}
            value={ws.textAlign}
            onChange={v => update({ textAlign: v as ClockSettings['textAlign'] })}
            accentColor={ac} settings={settings}
          />

          <SectionHeader title="Background" />
          <SliderRow
            label="Transparency" value={ws.bgOpacity} min={0} max={100}
            onChange={v => update({ bgOpacity: v })}
            accentColor={ac} settings={settings}
          />

          <SectionHeader title="Border" />
          <SliderRow
            label="Transparency" value={ws.borderOpacity} min={0} max={100}
            onChange={v => update({ borderOpacity: v })}
            accentColor={ac} settings={settings}
          />
        </>}

      </SettingsShell>
    </div>
  )
}
