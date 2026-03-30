// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 3 — GLOBAL: useGlobal Hook
// AIDA-2 — src/global/useGlobal.ts
//
// Responsibility:
//   React hook. Called ONCE per window at the Window.tsx level.
//   Applies all global CSS variables via applyGlobal() whenever
//   theme-relevant settings change.
//
// Usage — every Window.tsx follows this exact pattern:
//
//   const [settings, setSettings] = useState<GlobalSettings>(defaultSettings)
//   useGlobal(settings)
//
//   That's it. All components in the window update automatically.
//
// Why targeted dependencies and not [settings]:
//   Using the full settings object as a dependency would re-fire on every
//   settings change — including ones that don't affect the global CSS
//   variables (e.g. autoHideMenu, providerKeepSession).
//   Targeted dependencies mean applyGlobal only runs when it needs to.
//   The initial DB load always triggers because the loaded values for
//   theme/accentColor/fontSize/animationSpeed will differ from the
//   compile-time defaultSettings at least once.
//
// Replaces: useTheme.ts from AIDA-1
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect } from 'react'
import type { GlobalSettings } from '../types/settings'
import { applyGlobal } from './applyGlobal'

export function useGlobal(settings: GlobalSettings): void {
  useEffect(() => {
    applyGlobal(settings)
  }, [
    settings.theme,
    settings.accentColor,
    settings.fontSize,
    settings.animationSpeed,
  ])
}
