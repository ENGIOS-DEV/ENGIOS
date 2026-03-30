// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: File Decks Window
// AIDA-2 — src/components/apps/file-decks/Window.tsx
//
// Responsibility:
//   Settings loader and global CSS variable injector for this window.
//   This is the standard Window.tsx pattern — every app window follows it.
//
//   1. Load GlobalSettings from DB on mount
//   2. Call useGlobal(settings) to inject CSS variables into :root
//   3. Listen for settings:updated — re-apply when settings change
//   4. Listen for window:focus — reload settings from DB on re-focus
//   5. Render the actual component inside the correct window style
//
// Rules:
//   - No UI logic here — only settings loading and theme injection
//   - Imports getAppWindowElevatedStyle — File Decks floats on the desktop
//   - Import depth: apps/file-decks/ → depth 3 → ../../../
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect }    from 'react'
import FileDecks                  from './FileDecks'
import type { GlobalSettings }    from '../../../types/settings'
import { defaultSettings }        from '../../../types/settings'
import { loadGlobalSettings }     from '../../../services/settingsDb'
import { getAppWindowElevatedStyle } from '../../../themes/app'
import { useGlobal }             from '../../../global/useGlobal'

export default function Window() {
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings)
  useGlobal(settings)

  // ── Initial load + signal ready ──────────────────────────────────────────
  useEffect(() => {
    loadGlobalSettings().then(setSettings)
    window.electron?.send('renderer:ready', 'file-decks')
  }, [])

  // ── Settings updates + focus reload ───────────────────────────────────────
  useEffect(() => {
    const offUpdated = window.electron?.on(
      'settings:updated',
      (_: unknown, updated: GlobalSettings) => {
        setSettings(prev => ({ ...prev, ...updated }))
      }
    )
    const offFocus = window.electron?.on('window:focus', () => {
      loadGlobalSettings().then(setSettings)
    })
    return () => {
      offUpdated?.()
      offFocus?.()
    }
  }, [])

  return (
    <div style={getAppWindowElevatedStyle(settings)}>
      <FileDecks
        isOpen={true}
        onClose={() => window.electron?.send('window:hide', 'file-decks')}
        accentColor={settings.accentColor}
        settings={settings}
      />
    </div>
  )
}
