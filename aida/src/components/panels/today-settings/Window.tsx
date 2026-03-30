// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: Today Settings Panel
// AIDA-2 — src/components/panels/today-settings/Window.tsx
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import {
  SettingsShell, SectionHeader, ToggleRow, SliderRow, ButtonGroup,
} from '../../../components/shared/SettingsShell'
import type { GlobalSettings, TodaySettings, NudgeInterval, PriorityInterval, RepeatEvery } from '../../../types/settings'
import { defaultSettings, defaultTodaySettings } from '../../../types/settings'
import { loadGlobalSettings, loadTodaySettings, saveTodaySettings } from '../../../services/settingsDb'
import { useGlobal } from '../../../global/useGlobal'

// ─── Window ───────────────────────────────────────────────────────────────────

export default function Window() {
  const [global,    setGlobal]    = useState<GlobalSettings>(defaultSettings)
  const [cfg,       setCfg]       = useState<TodaySettings>(defaultTodaySettings)
  const [activeTab, setActiveTab] = useState(0)
  useGlobal(global)

  const broadcastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadGlobalSettings().then(setGlobal)
    loadTodaySettings().then(setCfg)
  }, [])

  useEffect(() => {
    const offGlobal = window.electron?.on(
      'settings:updated',
      (_: unknown, u: GlobalSettings) => setGlobal(p => ({ ...p, ...u }))
    )
    const offFocus = window.electron?.on('window:focus', () => {
      loadGlobalSettings().then(setGlobal)
      loadTodaySettings().then(setCfg)
    })
    return () => { offGlobal?.(); offFocus?.() }
  }, [])

  function update(changes: Partial<TodaySettings>) {
    setCfg(prev => {
      const next = { ...prev, ...changes }
      saveTodaySettings(next)
      if (broadcastTimer.current) clearTimeout(broadcastTimer.current)
      broadcastTimer.current = setTimeout(() => {
        window.electron?.send('today-settings:broadcast', next)
      }, 80)
      return next
    })
  }

  const ac = global.accentColor

  return (
    <SettingsShell
      title="Today"
      settings={global}
      onClose={() => window.electron?.send('window:hide', 'today-settings')}
      tabs={['Alerts', 'Display']}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >

      {/* ── TAB 0 — ALERTS ─────────────────────────────────────────────────── */}
      {activeTab === 0 && (
        <>
          {/* ── OVERDUE NOTIFICATIONS ─────────────────────────────────────────── */}
          <SectionHeader title="OVERDUE NOTIFICATIONS" settings={global} />
          <ToggleRow
            label="Enabled"
            description="Show toast alerts for overdue tasks"
            value={cfg.notificationsEnabled}
            onChange={v => update({ notificationsEnabled: v })}
            accentColor={ac}
            settings={global}
          />
          {cfg.notificationsEnabled && (
            <ButtonGroup
              options={[
                { label: 'Once', value: 'startup-only' },
                { label: '15m',  value: '15min'        },
                { label: '30m',  value: '30min'        },
                { label: '1hr',  value: '1hr'          },
                { label: '4hr',  value: '4hr'          },
              ]}
              value={cfg.overdueRepeatInterval}
              onChange={v => update({ overdueRepeatInterval: v as NudgeInterval })}
              accentColor={ac}
              settings={global}
            />
          )}

          {/* ── REMINDERS ─────────────────────────────────────────────────────── */}
          <SectionHeader title="REMINDERS" settings={global} />
          <ToggleRow
            label="Enabled"
            description="Send reminder toasts before tasks are due"
            value={cfg.remindersEnabled}
            onChange={v => update({ remindersEnabled: v })}
            accentColor={ac}
            settings={global}
          />
          {cfg.remindersEnabled && (
            <>
              <SectionHeader title="HIGH PRIORITY" settings={global} />
              <ToggleRow
                label="Turn reminders on / off"
                value={cfg.highPriorityEnabled}
                onChange={v => update({ highPriorityEnabled: v })}
                accentColor={ac}
                settings={global}
              />
              <SectionHeader title="MEDIUM PRIORITY" settings={global} />
              <ToggleRow
                label="Turn reminders on / off"
                value={cfg.mediumPriorityEnabled}
                onChange={v => update({ mediumPriorityEnabled: v })}
                accentColor={ac}
                settings={global}
              />
              <SectionHeader title="LOW PRIORITY" settings={global} />
              <ToggleRow
                label="Turn reminders on / off"
                value={cfg.lowPriorityEnabled}
                onChange={v => update({ lowPriorityEnabled: v })}
                accentColor={ac}
                settings={global}
              />
            </>
          )}
        </>
      )}

      {/* ── TAB 1 — DISPLAY ────────────────────────────────────────────────── */}
      {activeTab === 1 && (
        <>
          <SectionHeader title="Task List" settings={global} />

          <ToggleRow
            label="Show completed"
            description="Include tasks completed today in the Today view"
            value={cfg.showCompleted}
            onChange={v => update({ showCompleted: v })}
            accentColor={ac}
            settings={global}
          />

          <SectionHeader title="Max Visible Tasks" settings={global} />

          <SliderRow
            label="Tasks shown"
            value={cfg.maxVisible}
            min={1}
            max={8}
            step={1}
            onChange={v => update({ maxVisible: v })}
            accentColor={ac}
            settings={global}
          />
        </>
      )}

    </SettingsShell>
  )
}
