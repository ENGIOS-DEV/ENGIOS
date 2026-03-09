// AIDA Theme System
// Single source of truth for all styling

import type { GlobalSettings } from './types/settings'

// ─── Menu Bar ────────────────────────────────────────────────────────────────
export function getMenuStyle(settings: GlobalSettings): React.CSSProperties {
  const blur = settings.blurIntensity * 0.4
  const opacity = (100 - settings.transparency) / 100

  return {
    backgroundColor: `rgba(0, 0, 0, ${opacity * 0.8})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
  }
}

// ─── Widget ──────────────────────────────────────────────────────────────────
export function getWidgetStyle(settings: GlobalSettings): React.CSSProperties {
  const blur = settings.blurIntensity * 0.4
  const opacity = (100 - settings.transparency) / 100

  return {
    backgroundColor: `rgba(0, 0, 0, ${opacity * 0.8})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    fontSize: `${settings.widgetFontSize}px`,
    fontFamily: settings.widgetFontFamily,
    left: `${settings.widgetPosition.x}px`,
    top: `${settings.widgetPosition.y}px`,
  }
}

// ─── Accent Color ────────────────────────────────────────────────────────────
export function getAccentStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    backgroundColor: settings.accentColor,
  }
}

// ─── Animation Speed ─────────────────────────────────────────────────────────
export function getTransitionDuration(settings: GlobalSettings): string {
  const durations = {
    fast:   '150ms',
    normal: '300ms',
    slow:   '500ms',
  }
  return durations[settings.animationSpeed]
}
