// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: Desktop Background Picker
// AIDA-2 — src/components/panels/global-settings/DesktopBackgroundPicker.tsx
//
// Responsibility:
//   Request local image selection through the bridge and delegate preference
//   changes to the existing Global Settings update/persistence mechanism.
//   Shared controls and panel theme functions own all presentation.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react'
import type { GlobalSettings } from '../../../types/settings'
import { ButtonGroup, ItemRow, SectionHeader } from '../../shared/SettingsShell'
import { getPanelItemDescriptionStyle } from '../../../themes/panel'

// ─── Props ───────────────────────────────────────────────────────────────────

interface DesktopBackgroundPickerProps {
  settings: GlobalSettings
  onChange: (changes: Partial<GlobalSettings>) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DesktopBackgroundPicker({ settings, onChange }: DesktopBackgroundPickerProps) {
  const [busy,  setBusy]  = useState(false)
  const [error, setError] = useState('')

  async function act(action: string) {
    if (busy) return
    setError('')
    if (action === 'remove') {
      onChange({ desktopBackgroundImage: '' })
      return
    }
    setBusy(true)
    try {
      const result = await window.electron?.chooseDesktopBackground()
      if (result?.error) setError(result.error)
      if (result?.imageUrl) onChange({ desktopBackgroundImage: result.imageUrl })
    } catch {
      setError('The image picker could not be opened. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SectionHeader title="Desktop Background" settings={settings} />
      <ItemRow label={settings.desktopBackgroundImage ? 'Custom image' : 'Theme background'} settings={settings}>
        <ButtonGroup
          options={[{ label: 'Choose image', value: 'choose' }, { label: 'Remove image', value: 'remove' }]}
          value=""
          onChange={action => { void act(action) }}
          accentColor={settings.accentColor}
          settings={settings}
        />
      </ItemRow>
      {(busy || error) && (
        <p role="status" style={getPanelItemDescriptionStyle(settings)}>
          {error || 'Choosing image…'}
        </p>
      )}
    </>
  )
}
