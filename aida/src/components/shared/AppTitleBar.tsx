// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: AppTitleBar
// AIDA-2 — src/components/shared/AppTitleBar.tsx
//
// Responsibility:
//   The standard title bar for ALL app windows.
//   Pattern: [logo?] [title]  ···  [children?] [↓] [↑] [●]
//
//   logo?     — optional image shown left of the title
//   title     — window name, always textPrimary
//   children? — optional caller-supplied content (badges, action buttons)
//               rendered between the title area and the window controls
//   ↓         — minimise (ChevronDown, accent colour)
//   ↑         — maximise (ChevronUp, accent colour)
//   ●         — close (Circle, accent colour)
//
// Rules:
//   - Zero style definitions here — all from src/themes/app.ts
//   - No hardcoded colours, sizes, or spacing
//   - Entire bar is WebkitAppRegion: drag
//   - Controls group is WebkitAppRegion: no-drag
//   - IPC calls go through window.electron — never direct Electron imports
//
// Import depth: src/components/shared/ → depth 2 → ../../themes/
// ═══════════════════════════════════════════════════════════════════════════════

import { useState }                               from 'react'
import { ChevronDown, ChevronUp, Circle } from 'lucide-react'
import type { GlobalSettings }            from '../../types/settings'
import {
  APP_TITLE_BAR,
  getAppTitleBarStyle,
  getAppTitleBarLeftStyle,
  getAppTitleBarLogoStyle,
  getAppTitleBarTitleStyle,
  getAppTitleBarControlsStyle,
  getAppMinimiseButtonStyle,
  getAppMaximiseButtonStyle,
  getAppCloseButtonStyle,
  getAppControlHoverStyle,
} from '../../themes/app'

// ─── Props ────────────────────────────────────────────────────────────────────

interface AppTitleBarProps {
  title:     string
  settings:  GlobalSettings
  onClose:   () => void
  icon?:     string               // optional logo src — rendered 16×16
  children?: React.ReactNode      // optional actions before window controls
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppTitleBar({
  title,
  settings,
  onClose,
  icon,
  children,
}: AppTitleBarProps) {
  const ac = settings.accentColor
  const [hoveredControl, setHoveredControl] = useState<'min' | 'max' | 'close' | null>(null)
  const hoverColour = getAppControlHoverStyle(ac)

  function handleMinimise() {
    window.electron?.send('window:minimise')
  }

  function handleMaximise() {
    window.electron?.send('window:maximise')
  }

  return (
    <div style={getAppTitleBarStyle(settings)}>

      {/* ── Left — logo + title ─────────────────────────────────────────── */}
      <div style={getAppTitleBarLeftStyle()}>
        {icon && (
          <img
            src={icon}
            alt={title}
            style={getAppTitleBarLogoStyle()}
          />
        )}
        <span style={getAppTitleBarTitleStyle(settings)}>
          {title}
        </span>
      </div>

      {/* ── Right — children + window controls ──────────────────────────── */}
      <div style={getAppTitleBarControlsStyle()}>

        {/* Caller-supplied content — badges, action buttons, etc. */}
        {children}

        {/* Minimise */}
        <button
          onClick={handleMinimise}
          onMouseEnter={() => setHoveredControl('min')}
          onMouseLeave={() => setHoveredControl(null)}
          style={getAppMinimiseButtonStyle()}
          title="Minimise"
        >
          <ChevronDown
            size={APP_TITLE_BAR.chevronSize}
            style={{ color: hoveredControl === 'min' ? hoverColour.color : ac }}
          />
        </button>

        {/* Maximise */}
        <button
          onClick={handleMaximise}
          onMouseEnter={() => setHoveredControl('max')}
          onMouseLeave={() => setHoveredControl(null)}
          style={getAppMaximiseButtonStyle()}
          title="Maximise"
        >
          <ChevronUp
            size={APP_TITLE_BAR.chevronSize}
            style={{ color: hoveredControl === 'max' ? hoverColour.color : ac }}
          />
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          onMouseEnter={() => setHoveredControl('close')}
          onMouseLeave={() => setHoveredControl(null)}
          style={getAppCloseButtonStyle()}
          title="Close"
        >
          <Circle
            size={APP_TITLE_BAR.circleSize}
            style={{ color: hoveredControl === 'close' ? hoverColour.color : ac }}
          />
        </button>

      </div>
    </div>
  )
}
