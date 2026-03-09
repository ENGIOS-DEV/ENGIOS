import { useState } from 'react'
import type { GlobalSettings } from '../types/settings'
import { SettingsShell, SectionHeader, SliderRow, ToggleRow, ButtonGroup } from './SettingsShell'

interface GlobalSettingsProps {
  isOpen: boolean
  settings: GlobalSettings
  onClose: () => void
  onUpdate: (changes: Partial<GlobalSettings>) => void
}

function GlobalSettingsPanel({ isOpen, settings, onClose, onUpdate }: GlobalSettingsProps) {
  const [activeTab, setActiveTab] = useState('appearance')

  const tabs = [
    { id: 'appearance', label: 'Appearance' },
    { id: 'behavior',   label: 'Behavior'   },
    { id: 'monitors',   label: 'Monitors'   },
    { id: 'system',     label: 'System'     },
  ]

  return (
    <SettingsShell
      title="AIDA Settings"
      isOpen={isOpen}
      onClose={onClose}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      accentColor={settings.accentColor}
    >
      {/* ── Appearance ──────────────────────────────────────────────────── */}
      {activeTab === 'appearance' && (
        <div>
          <SectionHeader title="Transparency & Blur" />
          <SliderRow label="Transparency"   value={settings.transparency}  onChange={val => onUpdate({ transparency: val })}  accentColor={settings.accentColor} />
          <SliderRow label="Blur Intensity" value={settings.blurIntensity} onChange={val => onUpdate({ blurIntensity: val })} accentColor={settings.accentColor} />

          <SectionHeader title="Accent Color" />
          <div className="grid grid-cols-6 gap-2">
            {['#8B5EF4', '#3982F4', '#178e53', '#EE4442', '#c0682a', '#EB4797'].map(color => (
              <button
                key={color}
                onClick={() => onUpdate({ accentColor: color })}
                className="transition-transform hover:scale-105"
                style={{
                  height: '28px', borderRadius: '6px', backgroundColor: color,
                  outline: settings.accentColor === color ? '2px solid white' : '2px solid transparent',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>

          <SectionHeader title="Font Size" />
          <ButtonGroup
            options={[{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }]}
            value={settings.fontSize}
            onChange={val => onUpdate({ fontSize: val })}
            accentColor={settings.accentColor}
          />
        </div>
      )}

      {/* ── Behavior ────────────────────────────────────────────────────── */}
      {activeTab === 'behavior' && (
        <div>
          <SectionHeader title="Menu" />
          <ToggleRow
            label="Auto-hide menu" description="Hide after inactivity"
            value={settings.autoHideMenu}
            onChange={val => onUpdate({ autoHideMenu: val })}
            accentColor={settings.accentColor}
          />
          {settings.autoHideMenu && (
            <SliderRow
              label="Hide delay (sec)" value={settings.autoHideDelay} min={1} max={20}
              onChange={val => onUpdate({ autoHideDelay: val })}
              accentColor={settings.accentColor}
            />
          )}
          <SectionHeader title="Default Menu State" />
          <ButtonGroup
            options={[{ label: 'Open', value: 'open' }, { label: 'Closed', value: 'closed' }]}
            value={settings.defaultMenuState}
            onChange={val => onUpdate({ defaultMenuState: val })}
            accentColor={settings.accentColor}
          />
          <SectionHeader title="Animation Speed" />
          <ButtonGroup
            options={[{ label: 'Fast', value: 'fast' }, { label: 'Normal', value: 'normal' }, { label: 'Slow', value: 'slow' }]}
            value={settings.animationSpeed}
            onChange={val => onUpdate({ animationSpeed: val })}
            accentColor={settings.accentColor}
          />
        </div>
      )}

      {/* ── Monitors ────────────────────────────────────────────────────── */}
      {activeTab === 'monitors' && (
        <div>
          <SectionHeader title="System Monitor" />
          <ToggleRow
            label="Show System Monitor" description="Display performance metrics"
            value={settings.systemMonitorEnabled}
            onChange={val => onUpdate({ systemMonitorEnabled: val })}
            accentColor={settings.accentColor}
          />
          {settings.systemMonitorEnabled && (
            <>
              <SectionHeader title="Monitor Components" />
              {(Object.keys(settings.monitorComponents) as Array<keyof typeof settings.monitorComponents>).map(key => (
                <ToggleRow
                  key={key} label={key.toUpperCase()}
                  value={settings.monitorComponents[key]}
                  onChange={val => onUpdate({ monitorComponents: { ...settings.monitorComponents, [key]: val } })}
                  accentColor={settings.accentColor}
                />
              ))}
              <SectionHeader title="Monitor Position" />
              <ButtonGroup
                options={[
                  { label: 'Top Left',     value: 'top-left'     },
                  { label: 'Top Right',    value: 'top-right'    },
                  { label: 'Bottom Left',  value: 'bottom-left'  },
                  { label: 'Bottom Right', value: 'bottom-right' },
                ]}
                value={settings.monitorPosition}
                onChange={val => onUpdate({ monitorPosition: val })}
                accentColor={settings.accentColor}
              />
            </>
          )}
        </div>
      )}

      {/* ── System ──────────────────────────────────────────────────────── */}
      {activeTab === 'system' && (
        <div>
          <SectionHeader title="Startup" />
          <ToggleRow
            label="Auto Start"
            description="Launch AIDA automatically when Windows starts"
            value={settings.autoStart}
            onChange={val => {
              onUpdate({ autoStart: val })
              window.electron?.setAutoStart(val)
            }}
            accentColor={settings.accentColor}
          />
        </div>
      )}
    </SettingsShell>
  )
}

export default GlobalSettingsPanel
