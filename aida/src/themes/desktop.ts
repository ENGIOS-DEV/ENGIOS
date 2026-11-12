// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4 — THEME: Desktop Background
// AIDA-2 — src/themes/desktop.ts
//
// Responsibility:
//   Paint wallpaper behind the continuous panel within the same desktop window.
//   Use the selected local image and existing theme fallback.
//   Cover preserves image proportions; it may crop edges to fill the display.
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings } from '../types/settings'
import { getPalette }         from '../global/palette'

// ─── Background surface ──────────────────────────────────────────────────────

export function getDesktopBackgroundStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    position:           'fixed',
    inset:              0,
    backgroundColor:    p.backgroundBase,
    backgroundImage:    settings.desktopBackgroundImage
      ? 'url(' + JSON.stringify(settings.desktopBackgroundImage) + ')'
      : 'none',
    backgroundSize:     'cover',
    backgroundPosition: 'center',
    backgroundRepeat:   'no-repeat',
  }
}
