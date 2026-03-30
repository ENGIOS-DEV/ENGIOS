// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4 — THEME: Panel Convention File
// AIDA-2 — src/themes/panel.ts
//
// Responsibility:
//   Complete style specification for ALL settings panels.
//   Panels: Global Settings, Clock/Weather Settings,
//           Today Settings.
//
// Panels are always:
//   - Standalone Electron windows, never inline modals
//   - Fixed size, centred on screen, non-resizable
//   - transparent: true — panel manages its own background + border radius
//   - skip taskbar, alwaysOnTop: false
//   - Closed via accent-colour circle in header
//
// Rules:
//   - Imports from src/global/ only
//   - No hardcoded values — all from tokens
//   - One change here = global effect across all panels
//
// Sections:
//   1. WINDOW     — size, background, shape
//   2. TYPOGRAPHY — every text style used in panels
//   3. LAYOUT     — header, tabs, content, spacing
//   4. CONTROLS   — buttons, toggles, sliders, inputs, colour pickers
//   5. BEHAVIOURS — transitions
//   6. STATES     — empty, loading
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings } from '../types/settings'
import { getPalette, getAccent } from '../global/palette'
import { FONT_SIZE_MAP, COLOR } from '../global/typography'
import { SPACING, RADIUS, MOTION_SPEED_MAP, EASING, INTERACTION, getDarkerAccent } from '../global/tokens'

// ─── Re-exports for Layer 5 consumers ────────────────────────────────────────
// Components import these from panel.ts — never directly from Layer 3.

export { FONT_SIZE_MAP } from '../global/typography'
export { getDarkerAccent } from '../global/tokens'

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — WINDOW
// ═══════════════════════════════════════════════════════════════════════════════

export const PANEL_SIZES = {
  widget:        { width: 480, height: 580 },
  globalSettings:{ width: 700, height: 500 },
} as const

export const PANEL_WINDOW = {
  borderRadius: RADIUS.lg,
} as const

export function getPanelWindowStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    width:           '100vw',
    height:          '100vh',
    display:         'flex',
    flexDirection:   'column',
    overflow:        'hidden',
    borderRadius:    PANEL_WINDOW.borderRadius,
    border:          `1px solid ${p.borderSubtle}`,
    backgroundColor: p.backgroundElevated,
    color:           COLOR.primary,
    fontSize:        FONT_SIZE_MAP[settings.fontSize],
    fontFamily:      'var(--font-family-main)',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════════════════════

export const PANEL_TYPE = {
  panelTitle: {
    fontWeight:    400,
    letterSpacing: '0.025em',
    lineHeight:    1.2,
  },
  tabLabel: {
    fontWeight: 500,
    lineHeight: 1,
  },
  sectionHeader: {
    fontWeight:    400,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    lineHeight:    1,
  },
  itemLabel: {
    fontWeight: 400,
    lineHeight: 1.4,
  },
  itemDescription: {
    fontWeight: 400,
    lineHeight: 1.4,
  },
  valueIndicator: {
    fontWeight:         400,
    lineHeight:         1,
    fontVariantNumeric: 'tabular-nums',
    color:              COLOR.secondary,
  },
  buttonLabel: {
    fontWeight: 500,
    lineHeight: 1,
  },
  inputText: {
    fontWeight: 400,
    lineHeight: 1.4,
  },
  helperText: {
    fontWeight: 400,
    lineHeight: 1.6,
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════

export const PANEL_LAYOUT = {
  headerHeight:         SPACING[12],   // 48px
  headerPaddingX:       SPACING[6],    // 24px
  tabBarHeight:         '40px',
  contentPaddingX:      SPACING[6],    // 24px
  contentPaddingY:      SPACING[5],    // 20px
  sectionSpacingTop:    SPACING[6],    // 24px
  sectionSpacingBottom: SPACING[5],    // 20px
  itemSpacingY:         SPACING[4],    // 16px
  sliderLabelWidth:     '128px',
  sliderValueWidth:     '28px',
  optionIconSize:       '14px',   // icon size in ButtonGroup options
  toggleWidth:          '40px',
  toggleHeight:         '22px',
  toggleRadius:         '11px',
  toggleThumb:          '14px',
  circleSize:           14,
} as const

// ── Accent swatch width ──────────────────────────────────────────────────────
// Panel content width (652px) minus 6 gaps of 6px = 616px / 7 swatches = 88px

const ACCENT_SWATCH_W = '88px'

export function getPanelHeaderStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        `0 ${PANEL_LAYOUT.headerPaddingX}`,
    height:         PANEL_LAYOUT.headerHeight,
    borderBottom:   `1px solid ${p.borderSubtle}`,
    flexShrink:     0,
  }
}

export function getPanelTabBarStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:      'flex',
    borderBottom: `1px solid ${p.borderSubtle}`,
    flexShrink:   0,
  }
}

export function getPanelContentStyle(): React.CSSProperties {
  return {
    flex:      1,
    overflowY: 'auto',
    paddingTop:    SPACING[2],
    paddingBottom: PANEL_LAYOUT.contentPaddingY,
    paddingLeft:   PANEL_LAYOUT.contentPaddingX,
    paddingRight:  PANEL_LAYOUT.contentPaddingX,
  }
}

// ── Section header row ────────────────────────────────────────────────────────

export function getPanelSectionHeaderStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    ...PANEL_TYPE.sectionHeader,
    fontSize:     FONT_SIZE_MAP[settings.fontSize],
    color:        COLOR.muted,
    marginTop:    PANEL_LAYOUT.sectionSpacingTop,
    marginBottom: PANEL_LAYOUT.sectionSpacingBottom,
  }
}

// ── Item row ──────────────────────────────────────────────────────────────────

export function getPanelItemRowStyle(): React.CSSProperties {
  return {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            SPACING[4],
    marginBottom:   PANEL_LAYOUT.itemSpacingY,
  }
}

export function getPanelItemLabelStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    ...PANEL_TYPE.itemLabel,
    fontSize: FONT_SIZE_MAP[settings.fontSize],
    color:    COLOR.primary,
  }
}

export function getPanelItemDescriptionStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    ...PANEL_TYPE.itemDescription,
    fontSize: FONT_SIZE_MAP[settings.fontSize],
    color:    COLOR.muted,
    marginTop: SPACING[1],
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — CONTROLS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Tab button ────────────────────────────────────────────────────────────────

export function getPanelTabStyle(
  settings:    GlobalSettings,
  isActive:    boolean,
  accentColor: string,
): React.CSSProperties {
  const p = getPalette(settings)
  return {
    flex:         1,
    height:       PANEL_LAYOUT.tabBarHeight,
    background:   'none',
    border:       'none',
    borderBottom: `2px solid ${isActive ? accentColor : 'transparent'}`,
    color:        isActive ? COLOR.primary : COLOR.muted,
    cursor:       'pointer',
    fontSize:     FONT_SIZE_MAP[settings.fontSize],
    transition:   `color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard},
                   border-color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
    ...PANEL_TYPE.tabLabel,
  }
}

// ── Button group (segmented control) ─────────────────────────────────────────

export function getButtonGroupContainerStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:         'flex',
    gap:             SPACING[1],
    padding:         SPACING[1],
    borderRadius:    RADIUS.md,
    backgroundColor: p.backgroundSubtle,
    marginBottom:    SPACING[2],
    width:           '100%',
    boxSizing:       'border-box' as const,
  }
}

export function getButtonGroupItemStyle(
  settings:    GlobalSettings,
  isActive:    boolean,
  accentColor: string,
  subtle       = false,
): React.CSSProperties {
  const p = getPalette(settings)
  return {
    flex:            1,
    padding:         `${SPACING[2]} 0`,
    borderRadius:    RADIUS.sm,
    backgroundColor: isActive
      ? subtle ? p.backgroundSubtle : accentColor
      : 'transparent',
    color:           isActive ? COLOR.primary : COLOR.secondary,
    border:          'none',
    cursor:          'pointer',
    fontSize:        FONT_SIZE_MAP[settings.fontSize],
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             SPACING[1],
    transition:      `background-color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard},
                      color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
    ...PANEL_TYPE.buttonLabel,
  }
}

// ── Toggle ────────────────────────────────────────────────────────────────────

export function getToggleTrackStyle(
  settings:    GlobalSettings,
  isOn:        boolean,
  accentColor: string,
): React.CSSProperties {
  const p = getPalette(settings)
  return {
    position:        'relative',
    flexShrink:      0,
    width:           PANEL_LAYOUT.toggleWidth,
    height:          PANEL_LAYOUT.toggleHeight,
    borderRadius:    PANEL_LAYOUT.toggleRadius,
    backgroundColor: isOn ? accentColor : p.backgroundSubtle,
    border:          `1px solid ${isOn ? accentColor : p.borderSubtle}`,
    cursor:          'pointer',
    padding:         0,
    transition:      `background-color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard},
                      border-color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

export function getToggleThumbStyle(
  settings: GlobalSettings,
  isOn:     boolean,
): React.CSSProperties {
  return {
    position:        'absolute',
    top:             '3px',
    left:            isOn ? '19px' : '3px',
    width:           PANEL_LAYOUT.toggleThumb,
    height:          PANEL_LAYOUT.toggleThumb,
    borderRadius:    '50%',
    backgroundColor: isOn ? COLOR.primary : COLOR.muted,
    boxShadow:       '0 1px 3px rgba(0,0,0,0.2)',
    transition:      `left ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

// ── Slider ────────────────────────────────────────────────────────────────────

export function getSliderRowStyle(): React.CSSProperties {
  return {
    display:      'flex',
    alignItems:   'center',
    gap:          SPACING[4],
    marginBottom: PANEL_LAYOUT.itemSpacingY,
  }
}

// ── Option icon ──────────────────────────────────────────────────────────────

export function getPanelOptionIconStyle(): React.CSSProperties {
  return {
    width:      PANEL_LAYOUT.optionIconSize,
    height:     PANEL_LAYOUT.optionIconSize,
    flexShrink: 0,
  }
}

// ── Input field ───────────────────────────────────────────────────────────────

export function getPanelInputWrapperStyle(): React.CSSProperties {
  return { marginTop: SPACING[1] }
}

export function getPanelInputStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    flex:            1,
    backgroundColor: p.backgroundSubtle,
    border:          `1px solid ${p.borderSubtle}`,
    borderRadius:    RADIUS.md,
    padding:         `${SPACING[2]} ${SPACING[3]}`,
    color:           COLOR.primary,
    outline:         'none',
    fontSize:        FONT_SIZE_MAP[settings.fontSize],
    ...PANEL_TYPE.inputText,
  }
}

// ── Colour picker swatch ──────────────────────────────────────────────────────

// ── Quick Picks block ────────────────────────────────────────────────────────

export function getQuickPicksWrapperStyle(): React.CSSProperties {
  return {
    display:       'flex',
    flexDirection: 'column',
    gap:           SPACING[2],
    width:         '100%',
  }
}

export function getQuickPicksLabelStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    fontSize:      FONT_SIZE_MAP[settings.fontSize],
    fontWeight:    500,
    color:         'var(--color-text-secondary)',
    textAlign:     'center' as const,
    width:         '100%',
  }
}

export function getColourSwatchRowStyle(): React.CSSProperties {
  return {
    display:        'flex',
    justifyContent: 'space-between',
    gap:            '6px',
    width:          '100%',
    marginTop:      SPACING[2],
  }
}

// ── RGB Colour Picker ────────────────────────────────────────────────────────

export function getRGBPreviewRowStyle(): React.CSSProperties {
  return {
    display:    'flex',
    alignItems: 'center',
    gap:        SPACING[2],
  }
}

export function getRGBPreviewSwatchStyle(color: string): React.CSSProperties {
  return {
    width:           ACCENT_SWATCH_W,
    height:          '28px',
    borderRadius:    RADIUS.sm,
    backgroundColor: color,
    flexShrink:      0,
    border:          '1px solid rgba(255,255,255,0.12)',
  }
}

export function getRGBHexStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    fontFamily:  "'DM Mono', monospace",
    fontSize:    FONT_SIZE_MAP[settings.fontSize],
    color:       'var(--color-text-secondary)',
    letterSpacing: '0.08em',
    userSelect:  'text' as const,
  }
}

export function getColourSwatchStyle(
  color:      string,
  isSelected: boolean,
  settings:   GlobalSettings,
): React.CSSProperties {
  return {
    height:          '28px',
    flex:            1,
    minWidth:        0,
    borderRadius:    RADIUS.sm,
    backgroundColor: color,
    outline:         isSelected ? '2px solid white' : '2px solid transparent',
    outlineOffset:   '2px',
    border:          'none',
    cursor:          'pointer',
    transition:      `transform ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard},
                      outline-color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

// ── Helper text ───────────────────────────────────────────────────────────────

export function getPanelHelperTextStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    ...PANEL_TYPE.helperText,
    fontSize: FONT_SIZE_MAP[settings.fontSize],
    color:    COLOR.muted,
    marginTop: SPACING[1],
  }
}

// ── Close button (accent circle) ──────────────────────────────────────────────

export function getPanelTitleBarRightStyle(): React.CSSProperties {
  return {
    display:    'flex',
    alignItems: 'center',
    gap:        SPACING[2],
  }
}

export function getPanelCloseButtonStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    background:     'none',
    border:         'none',
    cursor:         'pointer',
    padding:        SPACING[1],
    borderRadius:   RADIUS.full,
    color:          getAccent(settings),
    transition:     `opacity ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — BEHAVIOURS
// ═══════════════════════════════════════════════════════════════════════════════

export const PANEL_BEHAVIOUR = {
  hoverOpacity:    INTERACTION.hoverOpacity,
  activeScale:     INTERACTION.activeScale,
  disabledOpacity: INTERACTION.disabledOpacity,
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6 — STATES
// ═══════════════════════════════════════════════════════════════════════════════

