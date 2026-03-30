// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4 — THEME: Widget Convention File
// AIDA-2 — src/themes/widget.ts
//
// Responsibility:
//   Complete style specification for ALL desktop widgets.
//   Widgets: Clock/Weather.
//
// Widgets are always:
//   - Standalone Electron windows sitting on the desktop
//   - transparent: true — widget manages its own shape and background
//   - Never steal focus — showInactive() only, no focus() calls
//   - Draggable by the user — position persisted to DB
//   - Right-click context menu for settings and lock/unlock
//
// Rules:
//   - Imports from src/global/ only
//   - No hardcoded values — all from tokens
//   - transparency and blurIntensity come from GlobalSettings
//   - One change here = global effect across all widgets
//
// Sections:
//   1. WINDOW       — container, background, blur, shape
//   2. TYPOGRAPHY   — text styles used in widgets
//   3. LAYOUT       — padding, gaps
//   4. CONTROLS     — context menu
//   5. BEHAVIOURS   — transitions, hover states
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings }  from '../types/settings'
import type { ClockSettings }   from '../components/widgets/clock-weather/types'
import { getPalette, getAccent } from '../global/palette'
import { FONT_SIZE_MAP, COLOR } from '../global/typography'
export { COLOR } from '../global/typography'

export const WIDGET_FONT_SIZE_MAP: Record<string, string> = {
  small:  '0.85rem',
  medium: '1rem',
  large:  '1.2rem',
}
export { Z }     from '../global/tokens'
import { SPACING, RADIUS, MOTION_SPEED_MAP, EASING, INTERACTION, alphaFromTransparency } from '../global/tokens'

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — WINDOW
// ═══════════════════════════════════════════════════════════════════════════════

// ── Widget window container ───────────────────────────────────────────────────
// The root element of every widget.
// Background uses the user's transparency and blur settings.

export function getWidgetWindowStyle(settings: GlobalSettings, clockSettings?: ClockSettings): React.CSSProperties {
  const p     = getPalette(settings)
  const alpha = alphaFromTransparency(settings.transparency)

  // Parse backgroundElevated hex to rgba for transparency support
  // backgroundElevated is always a 6-digit hex in our palette
  // Transparency: 0=solid, 100=invisible (alphaFromTransparency handles this)
  const bgOpacity  = clockSettings?.bgOpacity   ?? 30
  const borderOp   = clockSettings?.borderOpacity ?? 10

  // Match menubar background exactly — #010409 dark, #F0F4F8 light
  const [r, g, b] = settings.theme === 'dark'
    ? [1,   4,   9  ]   // #010409
    : [240, 244, 248]   // #F0F4F8

  const bgAlpha     = alphaFromTransparency(bgOpacity) * alpha
  const borderAlpha = alphaFromTransparency(borderOp)

  return {
    display:              'inline-block',
    width:                'max-content',
    borderRadius:         RADIUS.lg,
    backgroundColor:      `rgba(${r}, ${g}, ${b}, ${bgAlpha.toFixed(2)})`,
    border:               `1px solid rgba(255, 255, 255, ${borderAlpha.toFixed(2)})`,
    backdropFilter:       `blur(${settings.blurIntensity / 10}px)`,
    WebkitBackdropFilter: `blur(${settings.blurIntensity / 10}px)`,
    color:                COLOR.primary,
    userSelect:           'none',
    fontFamily:           clockSettings?.fontFamily,
    fontWeight:           clockSettings?.fontWeight,
    textAlign:            clockSettings?.textAlign as React.CSSProperties['textAlign'],
  } as React.CSSProperties
}

// ── Widget border ─────────────────────────────────────────────────────────────
// Optional border — shown when the user enables it in widget settings.

export function getWidgetBorderStyle(
  settings:   GlobalSettings,
  showBorder: boolean,
): React.CSSProperties {
  const p = getPalette(settings)
  return showBorder
    ? { border: `1px solid ${p.borderSubtle}` }
    : { border: '1px solid transparent' }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════════════════════

export const WIDGET_TYPE = {
  // Primary display value — clock time, large metric
  primary: {
    fontWeight:    700,
    lineHeight:    1,
    letterSpacing: '-0.02em',
  },
  // Secondary display value — date, unit label
  secondary: {
    fontWeight: 400,
    lineHeight: 1,
  },
  // Supporting text — location, description
  supporting: {
    fontWeight: 400,
    lineHeight: 1,
  },
} as const

export function getWidgetPrimaryTextStyle(settings: GlobalSettings, fontWeight?: string, fontSize?: string): React.CSSProperties {
  const base = fontSize ? WIDGET_FONT_SIZE_MAP[fontSize] ?? FONT_SIZE_MAP[settings.fontSize] : FONT_SIZE_MAP[settings.fontSize]
  return {
    ...WIDGET_TYPE.primary,
    color:      COLOR.primary,
    fontSize:   `calc(${base} * 2.5)`,
    fontWeight: fontWeight ?? WIDGET_TYPE.primary.fontWeight,
  }
}

export function getWidgetSecondaryTextStyle(settings: GlobalSettings, fontWeight?: string, fontSize?: string): React.CSSProperties {
  const base = fontSize ? WIDGET_FONT_SIZE_MAP[fontSize] ?? FONT_SIZE_MAP[settings.fontSize] : FONT_SIZE_MAP[settings.fontSize]
  return {
    ...WIDGET_TYPE.secondary,
    color:      COLOR.secondary,
    fontSize:   base,
    fontWeight: fontWeight ?? WIDGET_TYPE.secondary.fontWeight,
  }
}

export function getWidgetSupportingTextStyle(settings: GlobalSettings, fontWeight?: string, fontSize?: string): React.CSSProperties {
  const p = getPalette(settings)
  return {
    ...WIDGET_TYPE.supporting,
    color:    COLOR.secondary,
    fontSize: FONT_SIZE_MAP[settings.fontSize],
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════

export const WIDGET_LAYOUT = {
  paddingX:        SPACING[4],   // 16px
  paddingY:        SPACING[3],   // 12px
  gap:             SPACING[2],   // 8px
  contextMenuIconSize: 16,        // px — icon size in context menu
  weatherGap:      SPACING[8],   // 32px — gap between clock and weather columns
  weatherIconSize: '3em',        // weather icon size — relative to widget font size
  weatherIconGap:  SPACING[2],   // 8px — gap between icon and temperature
  textGap:         SPACING[3],   // 12px — gap between text rows in both columns
} as const

export function getWidgetContainerStyle(): React.CSSProperties {
  return {
    display:   'flex',
    flexDirection: 'column',
    padding:   `${WIDGET_LAYOUT.paddingY} ${WIDGET_LAYOUT.paddingX}`,
    gap:       WIDGET_LAYOUT.gap,
  }
}


export function getWidgetRowStyle(): React.CSSProperties {
  return {
    display:    'flex',
    alignItems: 'center',
    gap:        WIDGET_LAYOUT.weatherGap,
  }
}

// ── Vertical widget layout ────────────────────────────────────────────────────

export function getWidgetColumnStyle(): React.CSSProperties {
  return {
    display:       'flex',
    flexDirection: 'column',
    gap:           WIDGET_LAYOUT.textGap,
  }
}

// ── Metric item ───────────────────────────────────────────────────────────────

export function getWidgetMetricItemStyle(): React.CSSProperties {
  return {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           SPACING[1],
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — CONTROLS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Context menu ──────────────────────────────────────────────────────────────

export function getWidgetContextMenuStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    backgroundColor: p.backgroundElevated,
    border:          `1px solid ${p.borderSubtle}`,
    borderRadius:    RADIUS.md,
  }
}

export function getWidgetContextMenuItemStyle(
  settings:  GlobalSettings,
  isDanger?: boolean,
): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:      'flex',
    alignItems:   'center',
    gap:          SPACING[2],
    padding:      `7px ${SPACING[3]}`,
    borderRadius: RADIUS.sm,
    cursor:       'pointer',
    fontSize:     FONT_SIZE_MAP[settings.fontSize],
    color:        isDanger ? COLOR.error : COLOR.secondary,
    transition:   `background-color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard},
                   color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

export function getWidgetContextMenuItemHoverStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return { backgroundColor: p.backgroundSubtle }
}

export function getWidgetContextMenuDividerStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    height:     '1px',
    margin:     `${SPACING[1]} ${SPACING[2]}`,
    backgroundColor: p.borderSubtle,
  }
}

// Returns stroke colour for the SVG progress ring.
// Inactive rings use the border colour. Active rings use accent.

export function getWidgetRingColour(
  settings:   GlobalSettings,
  isActive:   boolean,
): string {
  const p = getPalette(settings)
  return isActive ? getAccent(settings) : p.borderSubtle
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — BEHAVIOURS
// ═══════════════════════════════════════════════════════════════════════════════

export const WIDGET_BEHAVIOUR = {
  hoverOpacity:    INTERACTION.hoverOpacity,
  disabledOpacity: INTERACTION.disabledOpacity,
} as const

// ── Drag handle style ─────────────────────────────────────────────────────────
// The entire widget surface is draggable — cursor indicates this on hover.
// ENGIOS cursor rule: we do NOT change cursor shape.
// Draggability is communicated through the widget's visual design instead.

export function getWidgetDragStyle(isDragging: boolean): React.CSSProperties {
  return {
    opacity: isDragging ? 0.85 : 1,
    transition: isDragging ? 'none' : 'opacity 0.15s ease',
  }
}
