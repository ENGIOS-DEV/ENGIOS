// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: PanelTitleBar
// AIDA-2 — src/components/shared/PanelTitleBar.tsx
//
// Responsibility:
//   The standard title bar for ALL settings panels.
//   Pattern: [title]  ···  [children?] [●]
//
//   title     — panel name
//   children? — optional caller-supplied content (badges, action buttons)
//               rendered between the title and the close button
//   ●         — close (Circle, accent colour, darkens on hover)
//
// Rules:
//   - Zero style definitions here — all from src/themes/panel.ts
//   - No hardcoded colours, sizes, or spacing
//   - Entire bar is WebkitAppRegion: drag
//   - Close button is WebkitAppRegion: no-drag
//
// Import depth: src/components/shared/ → depth 2 → ../../
// ═══════════════════════════════════════════════════════════════════════════════

import { useState }   from 'react'
import { Circle }     from 'lucide-react'
import type { GlobalSettings } from '../../types/settings'
import {
  PANEL_TYPE,
  FONT_SIZE_MAP,
  getDarkerAccent,
  PANEL_LAYOUT,
  getPanelHeaderStyle,
  getPanelCloseButtonStyle,
  getPanelTitleBarRightStyle,
} from '../../themes/panel'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PanelTitleBarProps {
  title:     string
  settings:  GlobalSettings
  onClose:   () => void
  children?: React.ReactNode    // optional actions before close button
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PanelTitleBar({
  title,
  settings,
  onClose,
  children,
}: PanelTitleBarProps) {
  const ac = settings.accentColor
  const [closeHovered, setCloseHovered] = useState(false)

  return (
    <div style={getPanelHeaderStyle(settings)}>

      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <span style={{
        ...PANEL_TYPE.panelTitle,
        fontSize: FONT_SIZE_MAP[settings.fontSize],
        color:    'var(--color-text-primary)',
      }}>
        {title}
      </span>

      {/* ── Right — children + close ───────────────────────────────────────── */}
      <div style={getPanelTitleBarRightStyle()}>
        {children}
        <button
          onClick={onClose}
          onMouseEnter={() => setCloseHovered(true)}
          onMouseLeave={() => setCloseHovered(false)}
          style={getPanelCloseButtonStyle(settings)}
          title="Close"
        >
          <Circle
            size={PANEL_LAYOUT.circleSize}
            style={{ color: closeHovered ? getDarkerAccent(ac, 40) : ac }}
          />
        </button>
      </div>

    </div>
  )
}
