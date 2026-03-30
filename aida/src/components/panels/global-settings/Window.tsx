// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: Global Settings Panel
// AIDA-2 — src/components/panels/global-settings/Window.tsx
//
// Responsibility:
//   The AIDA Global Settings panel.
//   Settings that apply to the ENTIRE system live here.
//
// Tabs:
//   Appearance  — theme, accent colour, font size, animation speed,
//                 transparency, blur
//   Behaviour   — menu bar auto-hide, default state, provider session
//   Widgets     — clock/weather on/off
//   System      — auto-start
//
// Rules:
//   - Zero style definitions — all from src/themes/panel.ts via SettingsShell
//   - Saves via saveGlobalSettings → broadcasts via settings:broadcast
//   - Debounced broadcast — prevents slider spam flooding IPC
//
// Import depth: panels/global-settings/ → depth 3 → ../../../
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import { SettingsShell, SectionHeader, SliderRow, ToggleRow, ButtonGroup, ColourSwatch, ItemRow, InputRow } from '../../../components/shared/SettingsShell'
import { getColourSwatchRowStyle, getQuickPicksWrapperStyle, getQuickPicksLabelStyle, getRGBPreviewRowStyle, getRGBPreviewSwatchStyle, getRGBHexStyle } from '../../../themes/panel'
import type { GlobalSettings }    from '../../../types/settings'
import { defaultSettings }        from '../../../types/settings'
import { loadGlobalSettings, saveGlobalSettings } from '../../../services/settingsDb'
import { useGlobal }              from '../../../global/useGlobal'

// ─── Provider icon imports ────────────────────────────────────────────────────


// ─── Accent colour presets ────────────────────────────────────────────────────

const ACCENT_PRESETS = [
  '#3982F4', // ENGIOS blue (default)
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#ef4444', // red
  '#8b5cf6', // violet
]

// ─── RGB helpers ─────────────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Window() {
  const [settings,  setSettings]  = useState<GlobalSettings>(defaultSettings)
  const [activeTab, setActiveTab] = useState(0)
  useGlobal(settings)

  const broadcastTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isBroadcasting  = useRef(false)

  // ── RGB state — derived from accentColor, kept in sync ────────────────────
  const [rgb, setRgb] = useState(() => hexToRgb(defaultSettings.accentColor))

  // Sync RGB when settings load or accent changes externally
  useEffect(() => {
    setRgb(hexToRgb(settings.accentColor))
  }, [settings.accentColor])

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    loadGlobalSettings().then(setSettings)
  }, [])

  // ── Settings updates ───────────────────────────────────────────────────────
  useEffect(() => {
    const off = window.electron?.on(
      'settings:updated',
      (_: unknown, updated: GlobalSettings) => {
        if (isBroadcasting.current) return
        setSettings(prev => ({ ...prev, ...updated }))
      }
    )
    return () => off?.()
  }, [])

  // ── Update helper ──────────────────────────────────────────────────────────
  // Uses functional setSettings to always operate on latest state.
  // Saves to DB and debounces broadcast to prevent slider spam.

  function update(changes: Partial<GlobalSettings>) {
    setSettings(prev => {
      const updated = { ...prev, ...changes }

      saveGlobalSettings(updated)

      if (broadcastTimer.current) clearTimeout(broadcastTimer.current)
      broadcastTimer.current = setTimeout(() => {
        isBroadcasting.current = true
        window.electron?.send('settings:broadcast', updated)
        setTimeout(() => { isBroadcasting.current = false }, 300)
      }, 80)

      return updated
    })
  }

  const ac = settings.accentColor

  return (
    <SettingsShell
      title="AIDA Settings"
      settings={settings}
      onClose={() => window.electron?.send('window:hide', 'settings')}
      tabs={['Appearance', 'Behaviour', 'Widgets', 'System']}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >

      {/* ════════════════════════════════════════════════════════════════════
          TAB 0 — APPEARANCE
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 0 && (
        <>
          <SectionHeader title="Transparency" settings={settings} />

          <SliderRow
            label="Transparency"
            value={settings.transparency}
            onChange={v => update({ transparency: v })}
            accentColor={ac}
            settings={settings}
          />

          <SectionHeader title="Accent Colour" settings={settings} />

          {/* ── HEX Value ───────────────────────────────────────────────── */}
          <ItemRow label="HEX Value" settings={settings}>
            <div style={getRGBPreviewRowStyle()}>
              <span style={getRGBHexStyle(settings)}>{settings.accentColor.toUpperCase()}</span>
              <div style={getRGBPreviewSwatchStyle(settings.accentColor)} />
            </div>
          </ItemRow>

          {/* ── RGB sliders ──────────────────────────────────────────────── */}
          <SliderRow
            label="Red"
            value={rgb.r}
            min={0} max={255} step={1}
            onChange={r => {
              setRgb(prev => {
                const next = rgbToHex(r, prev.g, prev.b)
                update({ accentColor: next })
                return { ...prev, r }
              })
            }}
            accentColor={ac}
            settings={settings}
          />

          <SliderRow
            label="Green"
            value={rgb.g}
            min={0} max={255} step={1}
            onChange={g => {
              setRgb(prev => {
                const next = rgbToHex(prev.r, g, prev.b)
                update({ accentColor: next })
                return { ...prev, g }
              })
            }}
            accentColor={ac}
            settings={settings}
          />

          <SliderRow
            label="Blue"
            value={rgb.b}
            min={0} max={255} step={1}
            onChange={b => {
              setRgb(prev => {
                const next = rgbToHex(prev.r, prev.g, b)
                update({ accentColor: next })
                return { ...prev, b }
              })
            }}
            accentColor={ac}
            settings={settings}
          />

          {/* ── Quick Picks ──────────────────────────────────────────────── */}
          <div style={getQuickPicksWrapperStyle()}>
            <span style={getQuickPicksLabelStyle(settings)}>Quick Picks</span>
            <div style={getColourSwatchRowStyle()}>
              {ACCENT_PRESETS.map(color => (
                <ColourSwatch
                  key={color}
                  color={color}
                  isSelected={settings.accentColor === color}
                  onClick={() => update({ accentColor: color })}
                  settings={settings}
                />
              ))}
            </div>
          </div>

          <SectionHeader title="Font Size" settings={settings} />

          <ButtonGroup
            options={[
              { label: 'Small',  value: 'small'  },
              { label: 'Medium', value: 'medium' },
              { label: 'Large',  value: 'large'  },
            ]}
            value={settings.fontSize}
            onChange={v => update({ fontSize: v })}
            accentColor={ac}
            settings={settings}
          />

          <SectionHeader title="Theme" settings={settings} />

          <ButtonGroup
            options={[
              { label: 'Dark',  value: 'dark'  },
              { label: 'Light', value: 'light' },
            ]}
            value={settings.theme}
            onChange={v => update({ theme: v })}
            accentColor={ac}
            settings={settings}
          />

          <SectionHeader title="Animation Speed" settings={settings} />

          <ButtonGroup
            options={[
              { label: 'Fast',   value: 'fast'   },
              { label: 'Normal', value: 'normal' },
              { label: 'Slow',   value: 'slow'   },
            ]}
            value={settings.animationSpeed}
            onChange={v => update({ animationSpeed: v })}
            accentColor={ac}
            settings={settings}
          />
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 1 — BEHAVIOUR
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 1 && (
        <>
          <SectionHeader title="Menu Bar" settings={settings} />
          <ToggleRow
            label="Auto-hide menu"
            description="Hide the menu bar after inactivity"
            value={settings.autoHideMenu}
            onChange={v => update({ autoHideMenu: v })}
            accentColor={ac}
            settings={settings}
          />
          <SliderRow
            label="Hide delay"
            value={settings.autoHideDelay}
            min={1}
            max={10}
            step={1}
            onChange={v => update({ autoHideDelay: v })}
            accentColor={ac}
            settings={settings}
          />
          <SectionHeader title="Default State" settings={settings} />
          <ButtonGroup
            options={[
              { label: 'Open',   value: 'open'   },
              { label: 'Closed', value: 'closed' },
            ]}
            value={settings.defaultMenuState}
            onChange={v => update({ defaultMenuState: v })}
            accentColor={ac}
            settings={settings}
          />
          <SectionHeader title="AI Provider" settings={settings} />
          <ButtonGroup
            options={[
              { label: 'Gemini',  value: 'gemini' },
              { label: 'Claude',  value: 'claude' },
              { label: 'Groq',    value: 'groq'   },
              { label: 'Meta',    value: 'meta'   },
              { label: 'ChatGPT', value: 'openai' },
            ]}
            value={settings.aiProvider}
            onChange={v => update({ aiProvider: v as GlobalSettings['aiProvider'] })}
            accentColor={ac}
            settings={settings}
          />
          <SectionHeader title="Provider Session" settings={settings} />
          <ToggleRow
            label="Keep provider session"
            description="Remember your provider login between sessions"
            value={settings.providerKeepSession}
            onChange={v => update({ providerKeepSession: v })}
            accentColor={ac}
            settings={settings}
          />
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 2 — WIDGETS
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 2 && (
        <>
          <SectionHeader title="Desktop Widgets" settings={settings} />

          <ToggleRow
            label="Clock & Weather"
            description="Show the clock and weather widget on the desktop"
            value={settings.showClockWidget}
            onChange={v => update({ showClockWidget: v })}
            accentColor={ac}
            settings={settings}
          />
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 3 — SYSTEM
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 3 && (
        <>
          <SectionHeader title="Identity" settings={settings} />

          <InputRow
            label="Display Name"
            description="Your name or nickname — shown in the menubar greeting"
            value={settings.userName}
            onChange={v => update({ userName: v })}
            placeholder="Enter your name..."
            settings={settings}
          />

          <SectionHeader title="Menu Bar" settings={settings} />

          <ToggleRow
            label="Show welcome message"
            description="Display greeting and date in the menu bar"
            value={settings.showWelcome}
            onChange={v => update({ showWelcome: v })}
            accentColor={ac}
            settings={settings}
          />

          <SectionHeader title="Startup" settings={settings} />

          <ToggleRow
            label="Launch at startup"
            description="Start AIDA automatically when you log in"
            value={settings.autoStart}
            onChange={v => {
              update({ autoStart: v })
              window.electron?.send('set-auto-start', v)
            }}
            accentColor={ac}
            settings={settings}
          />
        </>
      )}

    </SettingsShell>
  )
}
