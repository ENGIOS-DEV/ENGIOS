import { useState, useEffect } from 'react'
import { SettingsShell, SectionHeader, ToggleRow, SliderRow, ButtonGroup } from './SettingsShell'

interface TodayConfig {
  notificationsEnabled: boolean
  defaultReminderTime:  string   // 'HH:MM' for date-only tasks
  snoozeDefault:        string   // '10' | '30' | '60' | '1440'
  showCompleted:        boolean
  maxVisible:           number   // how many tasks to show in Today panel (1-8)
}

const DEFAULT: TodayConfig = {
  notificationsEnabled: true,
  defaultReminderTime:  '09:00',
  snoozeDefault:        '30',
  showCompleted:        false,
  maxVisible:           4,
}

const STORAGE_KEY = 'aida-today-settings'

export function loadTodayConfig(): TodayConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...DEFAULT, ...JSON.parse(saved) }
  } catch {}
  return DEFAULT
}

function saveTodayConfig(config: TodayConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

interface TodaySettingsProps {
  isOpen:      boolean
  onClose:     () => void
  accentColor: string
  onChange:    (config: TodayConfig) => void
}

function TodaySettings({ isOpen, onClose, accentColor, onChange }: TodaySettingsProps) {
  const [cfg, setCfg]       = useState<TodayConfig>(loadTodayConfig)
  const [activeTab, setActiveTab] = useState('alerts')

  function update(changes: Partial<TodayConfig>) {
    setCfg(prev => {
      const next = { ...prev, ...changes }
      saveTodayConfig(next)
      onChange(next)
      return next
    })
  }

  // Sync when opened
  useEffect(() => {
    if (isOpen) setCfg(loadTodayConfig())
  }, [isOpen])

  const tabs = [
    { id: 'alerts',   label: 'Alerts'   },
    { id: 'display',  label: 'Display'  },
  ]

  return (
    <SettingsShell
      title="Today"
      isOpen={isOpen}
      onClose={onClose}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      accentColor={accentColor}
    >
      {/* ── Alerts ────────────────────────────────────────────────────── */}
      {activeTab === 'alerts' && (
        <div>
          <SectionHeader title="Push Notifications" />
          <ToggleRow
            label="Enabled"
            description="Show toast alerts when tasks are due"
            value={cfg.notificationsEnabled}
            onChange={v => update({ notificationsEnabled: v })}
            accentColor={accentColor}
          />

          {cfg.notificationsEnabled && (
            <>
              <SectionHeader title="Default Reminder Time" />
              <p className="text-xs text-white/35 mb-3">
                Used for tasks with a date but no specific time set
              </p>
              <div className="flex gap-2">
                {['07:00','08:00','09:00','10:00'].map(t => (
                  <button
                    key={t}
                    onClick={() => update({ defaultReminderTime: t })}
                    className="flex-1 py-1.5 text-xs rounded-lg transition-colors font-medium"
                    style={{
                      backgroundColor: cfg.defaultReminderTime === t ? accentColor : 'rgba(255,255,255,0.06)',
                      color: cfg.defaultReminderTime === t ? 'white' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <SectionHeader title="Default Snooze" />
              <ButtonGroup
                options={[
                  { label: '10 min',   value: '10'   },
                  { label: '30 min',   value: '30'   },
                  { label: '1 hour',   value: '60'   },
                  { label: 'Tomorrow', value: '1440' },
                ]}
                value={cfg.snoozeDefault}
                onChange={v => update({ snoozeDefault: v })}
                accentColor={accentColor}
              />
            </>
          )}
        </div>
      )}

      {/* ── Display ───────────────────────────────────────────────────── */}
      {activeTab === 'display' && (
        <div>
          <SectionHeader title="Task List" />
          <ToggleRow
            label="Show Completed"
            description="Include completed tasks in Today view"
            value={cfg.showCompleted}
            onChange={v => update({ showCompleted: v })}
            accentColor={accentColor}
          />
          <SectionHeader title="Max Visible Tasks" />
          <SliderRow
            label="Tasks shown"
            value={cfg.maxVisible}
            min={1}
            max={8}
            onChange={v => update({ maxVisible: v })}
            accentColor={accentColor}
          />
        </div>
      )}
    </SettingsShell>
  )
}

export default TodaySettings
export type { TodayConfig }
