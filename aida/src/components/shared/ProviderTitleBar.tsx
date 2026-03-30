// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: ProviderTitleBar
// AIDA-2 — src/components/shared/ProviderTitleBar.tsx
//
// Responsibility:
//   Title bar for AI/Search provider windows.
//   Pattern: [icon] [title]  ···  [↓] [↑] [●]
//
//   icon  — provider logo (SVG, 16×16)
//   title — provider name, left-aligned
//   ↓     — minimise
//   ↑     — maximise
//   ●     — close (darkens on hover)
//
// Import depth: src/components/shared/ → depth 2 → ../../
// ═══════════════════════════════════════════════════════════════════════════════

import { useState }                        from 'react'
import { ChevronDown, ChevronUp, Circle }  from 'lucide-react'
import type { GlobalSettings }             from '../../types/settings'
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

interface ProviderTitleBarProps {
  title:    string
  icon:     string          // SVG import — provider logo
  settings: GlobalSettings
  onClose:  () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProviderTitleBar({
  title,
  icon,
  settings,
  onClose,
}: ProviderTitleBarProps) {
  const ac = settings.accentColor
  const [hoveredControl, setHoveredControl] = useState<'min' | 'max' | 'close' | null>(null)
  const hoverColour = getAppControlHoverStyle(ac)

  return (
    <div style={getAppTitleBarStyle(settings)}>

      {/* ── Left — icon + title ───────────────────────────────────────────── */}
      <div style={getAppTitleBarLeftStyle()}>
        <img
          src={icon}
          alt={title}
          style={getAppTitleBarLogoStyle()}
        />
        <span style={getAppTitleBarTitleStyle(settings)}>
          {title}
        </span>
      </div>

      {/* ── Right — window controls ───────────────────────────────────────── */}
      <div style={getAppTitleBarControlsStyle()}>

        <button
          onClick={() => window.electron?.send('window:minimise')}
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

        <button
          onClick={() => window.electron?.send('window:maximise')}
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
