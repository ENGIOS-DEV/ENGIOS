// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4 — THEME: Menubar Convention File
// AIDA-2 — src/themes/menubar.ts
//
// Responsibility:
//   Complete style specification for the AIDA menubar pull-down surface.
//   The handle pill has its own convention file: src/themes/handle.ts
//
// Rules:
//   - Imports from src/global/ only
//   - No hardcoded values — all from tokens
//   - Blured glass + noise texture effect applied here
//   - One change here = global effect across the entire menubar
//
// Sections:
//   1. SURFACE      — background, blur, noise texture
//   2. LAYOUT       — dimensions, grid, spacing constants
//   3. TYPOGRAPHY   — text styles
//   4. CONTROLS     — search, buttons, quick actions, app launchers
//   5. BEHAVIOURS   — transitions
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings } from '../types/settings'
import { getPalette, getAccent } from '../global/palette'
import { FONT_SIZE_MAP, COLOR, OVERLINE, FAMILIES, WEIGHT, TRACKING, SIZE } from '../global/typography'

export { FONT_SIZE_MAP } from '../global/typography'
import { SPACING, RADIUS, MOTION_SPEED_MAP, EASING, Z, alphaFromTransparency } from '../global/tokens'

// Noise texture — imported as a Vite module asset.
// This is the single reference to the texture path in the entire codebase.
import noiseTexture from '../assets/textures/noise.png'

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — SURFACE
// ═══════════════════════════════════════════════════════════════════════════════

// ── Noise texture constants ───────────────────────────────────────────────────
const NOISE = {
  size:   SPACING[8] + ' ' + SPACING[8],  // 32px × 32px — tight noise grain
  repeat: 'repeat',
} as const

// ── Blured glass surface ─────────────────────────────────────────────────────
// Simulates backdrop blur (which doesn't work on transparent Electron windows
// on Windows). Blur lifts the background colour towards lighter tones as
// blurIntensity increases — visually mimicking blured glass.

export function getMenuBarStyle(settings: GlobalSettings): React.CSSProperties {
  const p           = getPalette(settings)
  const alpha       = alphaFromTransparency(settings.transparency)

  // Blur/frost layer disabled — pending proper OS blur implementation.
  // Transparency slider controls opacity only.

  const [r, g, b] = settings.theme === 'dark'
    ? [1,   4,   9  ]   // #010409
    : [240, 244, 248]

  return {
    backgroundColor:  `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`,
    color:            COLOR.primary,
    borderRadius:     0,
    border:           'none',
    boxShadow:        'none',
  }
}

// ── Control height ───────────────────────────────────────────────────────────
// Standard height for interactive controls — buttons, search bar, inputs.
// Not a spacing value — a named UI constant.
const CONTROL_H = '36px'

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════

export const MENUBAR_LAYOUT = {
  // Grid
  gridWidth:         '70%',
  gridColumns:       4,

  // Section padding
  sectionPaddingX:   SPACING[4],   // 16px
  sectionPaddingY:   SPACING[8],   // 32px — generous top/bottom per column

  // Gaps
  columnGap:         SPACING[3],   // 12px
  itemGap:           SPACING[2],   // 8px — gap between quick action items

  // Controls
  appIconSize:       SPACING[8],   // 32px
  appIconRadius:     RADIUS.sm,
  quickActionHeight: CONTROL_H,
  quickActionRadius: RADIUS.md,
  searchHeight:      CONTROL_H,
  searchRadius:      RADIUS.md,
  searchGap:         SPACING[2],   // 8px

  // Controls
  providerIconSize: '16px',   // provider icon size in dropdowns and search
  rangeTrackH:       '10px',   // height of range input track
  dropdownOffset:    '42px',   // distance from top of wrapper to below search bar (40px + 2px gap)

  // Productivity bar
  productivityBarH:  SPACING[12],  // 48px
  productivityBarPX: SPACING[6],   // 24px
  productivityBarGap:SPACING[3],   // 12px

  // Divider
  dividerMarginY:    SPACING[2],   // 8px

} as const

// ── Centering wrapper ─────────────────────────────────────────────────────────

export function getMenuBarWrapperStyle(): React.CSSProperties {
  return {
    display:        'flex',
    justifyContent: 'center',
    position:       'relative',
    padding:        `${SPACING[6]} ${SPACING[4]} ${SPACING[2]}`,
  }
}

// ── Main grid ─────────────────────────────────────────────────────────────────

export function getMenuBarGridStyle(): React.CSSProperties {
  return {
    display:             'grid',
    gridTemplateColumns: `repeat(${MENUBAR_LAYOUT.gridColumns}, 1fr)`,
    width:               MENUBAR_LAYOUT.gridWidth,
    minHeight:           '220px',
  }
}

// ── Column ────────────────────────────────────────────────────────────────────

export function getMenuBarColumnStyle(): React.CSSProperties {
  return {
    padding:  `${MENUBAR_LAYOUT.sectionPaddingY} ${MENUBAR_LAYOUT.sectionPaddingX}`,
    minWidth: 0,
    width:    '100%',
  }
}

// ── Divider ───────────────────────────────────────────────────────────────────

// ── Today section header row ─────────────────────────────────────────────────

export function getMenuBarSectionHeaderRowStyle(): React.CSSProperties {
  return {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'space-between',
    marginBottom:    SPACING[3],
  }
}

// ── Today settings button ─────────────────────────────────────────────────────

export function getMenuBarTodayButtonStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    background:  'none',
    border:      'none',
    cursor:      'pointer',
    color:       COLOR.muted,
    padding:     SPACING[1],
    flexShrink:  0,
    transition:  `color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

// ── Body text ─────────────────────────────────────────────────────────────────

export function getMenuBarBodyTextStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    color:      COLOR.muted,
    fontStyle:  'italic',
    fontSize:   FONT_SIZE_MAP[settings.fontSize],
  }
}

// ── System row ────────────────────────────────────────────────────────────────

export function getMenuBarSystemRowStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:    'flex',
    alignItems: 'center',
    gap:        SPACING[2],
    marginBottom: SPACING[2],
    color:      COLOR.secondary,
    fontSize:   FONT_SIZE_MAP[settings.fontSize],
  }
}

// ── Quick actions list ────────────────────────────────────────────────────────

export function getMenuBarQuickActionsListStyle(): React.CSSProperties {
  return {
    display:       'flex',
    flexDirection: 'column',
    gap:           SPACING[2],
  }
}

// ── System section ────────────────────────────────────────────────────────────

export function getMenuBarSystemSectionStyle(): React.CSSProperties {
  return {
    display:       'flex',
    flexDirection: 'column',
    gap:           SPACING[4],
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════════════════════

// ── Font scale map ────────────────────────────────────────────────────────────
// Maps GlobalSettings.fontSize to Tailwind text classes.
// Used for the menubar grid content only — not global typography.

export const MENUBAR_FONT_SCALE: Record<GlobalSettings['fontSize'], {
  heading: string
  body:    string
  subtext: string
}> = {
  small:  { heading: 'text-[10px]', body: 'text-xs',   subtext: 'text-[10px]' },
  medium: { heading: 'text-xs',     body: 'text-sm',   subtext: 'text-xs'     },
  large:  { heading: 'text-sm',     body: 'text-base', subtext: 'text-xs'     },
} as const

// ── Section header ────────────────────────────────────────────────────────────

export function getMenuBarSectionHeaderStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    ...OVERLINE,
    fontSize:     FONT_SIZE_MAP[settings.fontSize],
    marginBottom: SPACING[3],
  } as React.CSSProperties
}

// ── Quick action colours ──────────────────────────────────────────────────────
// Named colour tokens for quick action icons.
// Components never define these inline.

export const MENUBAR_ACTION_COLOURS = {
  note:  '#f472b6',   // pink
  task:  '#4ade80',   // green
  event: '#60a5fa',   // blue
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — CONTROLS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Settings button ───────────────────────────────────────────────────────────

export function getMenuBarSettingsButtonStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    position:        'absolute',
    right:           SPACING[4],
    top:             SPACING[4],
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    width:           CONTROL_H,
    height:          CONTROL_H,
    borderRadius:    RADIUS.md,
    backgroundColor: 'transparent',
    border:          'none',
    color:           COLOR.secondary,
    cursor:          'pointer',
    transition:      `color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

export function getMenuBarSettingsButtonHoverStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return { color: COLOR.primary }
}

// ── Quick action item ─────────────────────────────────────────────────────────

export function getMenuBarQuickActionItemStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:         'flex',
    alignItems:      'center',
    gap:             SPACING[3],
    padding:         `${SPACING[3]} ${SPACING[4]}`,
    borderRadius:    RADIUS.md,
    backgroundColor: p.backgroundSubtle,
    border:          'none',
    color:           COLOR.secondary,
    cursor:          'default',
    width:           '100%',
    textAlign:       'left' as const,
    fontSize:        SIZE.sm,
    fontWeight:      500,
  }
}

export function getMenuBarQuickActionPlusStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    marginLeft:      'auto',
    flexShrink:      0,
    width:           '20px',
    height:          '20px',
    borderRadius:    RADIUS.sm,
    backgroundColor: p.backgroundElevated,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    fontSize:        '14px',
    fontWeight:      600,
    color:           COLOR.secondary,
    lineHeight:      1,
    pointerEvents:   'none' as const,
  }
}

export function getMenuBarQuickActionIconStyle(color: string): React.CSSProperties {
  return {
    width:           SPACING[6],
    height:          SPACING[6],
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
    color,
  }
}

// ── Greeting ─────────────────────────────────────────────────────────────────

export function getMenuBarGreetingWrapperStyle(): React.CSSProperties {
  return {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    gap:            SPACING[1],
    paddingTop:     SPACING[3],
  }
}

export function getMenuBarGreetingTextStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    fontFamily:    FAMILIES.display,
    fontSize:      `calc(${FONT_SIZE_MAP[settings.fontSize]} + 2px)`,
    fontWeight:    WEIGHT.medium,
    color:         COLOR.primary,
    letterSpacing: TRACKING.tight,
  }
}

export function getMenuBarGreetingSubtitleStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    fontSize:   FONT_SIZE_MAP[settings.fontSize],
    color:      COLOR.muted,
    fontStyle:  'italic' as const,
  }
}

// ── Search subtitle ───────────────────────────────────────────────────────────

export function getMenuBarSearchSubtitleStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    fontSize:   FONT_SIZE_MAP[settings.fontSize],
    color:      COLOR.muted,
    textAlign:  'center' as const,
  }
}

// ── Search vertical divider ───────────────────────────────────────────────────

export function getMenuBarSearchDividerStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    width:           '1px',
    height:          '16px',
    backgroundColor: p.borderSubtle,
    flexShrink:      0,
  }
}

// ── Provider icon button — opens default provider directly ───────────────────

export function getMenuBarProviderIconButtonStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    display:    'flex',
    alignItems: 'center',
    background: 'none',
    border:     'none',
    cursor:     'pointer',
    color:      COLOR.secondary,
    flexShrink: 0,
    padding:    `0 ${SPACING[2]} 0 ${SPACING[3]}`,
    transition: `opacity ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

// ── Chevron button — opens provider dropdown ──────────────────────────────────

export function getMenuBarProviderChevronStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    display:    'flex',
    alignItems: 'center',
    background: 'none',
    border:     'none',
    cursor:     'pointer',
    color:      COLOR.muted,
    flexShrink: 0,
    padding:    `0 ${SPACING[3]} 0 0`,
    transition: `color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

// ── Search container ──────────────────────────────────────────────────────────

export function getMenuBarSearchStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:         'flex',
    alignItems:      'center',
    gap:             MENUBAR_LAYOUT.searchGap,
    height:          `calc(${MENUBAR_LAYOUT.searchHeight} + 4px)`,
    padding:         `2px ${SPACING[2]}`,
    borderRadius:    MENUBAR_LAYOUT.searchRadius,
    backgroundColor: p.backgroundSubtle,
    border:          `1px solid ${p.borderSubtle}`,
    width:           '100%',
  }
}

// ── Search input ──────────────────────────────────────────────────────────────

export function getMenuBarSearchInputStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    flex:       1,
    background: 'none',
    border:     'none',
    outline:    'none',
    color:      COLOR.primary,
    fontSize:   FONT_SIZE_MAP[settings.fontSize],
    fontWeight: 400,
    lineHeight: 1.4,
  }
}

// ── Productivity bar ──────────────────────────────────────────────────────────

export function getProductivityBarStyle(): React.CSSProperties {
  return {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    width:          '56%',   // 80% of the 70% grid
    margin:         '0 auto',
    padding:        `calc(${SPACING[3]} + 9px) 0 calc(${SPACING[3]} + 9px)`,
  }
}

// ── Provider icon ────────────────────────────────────────────────────────────

export function getMenuBarProviderIconStyle(flexShrink = true): React.CSSProperties {
  return {
    width:      MENUBAR_LAYOUT.providerIconSize,
    height:     MENUBAR_LAYOUT.providerIconSize,
    flexShrink: flexShrink ? 0 : undefined,
  }
}

// ── Search result path (secondary line) ──────────────────────────────────────

export function getMenuBarSearchResultPathStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    fontSize:     `calc(${FONT_SIZE_MAP[settings.fontSize]} - 1px)`,
    color:        COLOR.muted,
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
  }
}

// ── Search result name ───────────────────────────────────────────────────────

export function getMenuBarSearchResultNameStyle(): React.CSSProperties {
  return {
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
  }
}

// ── Input area wrapper ────────────────────────────────────────────────────────

export function getMenuBarInputAreaStyle(): React.CSSProperties {
  return {
    flex:        1,
    display:     'flex',
    alignItems:  'center',
    gap:         '8px',
  }
}

// ── Submit button ─────────────────────────────────────────────────────────────

export function getMenuBarSubmitButtonStyle(): React.CSSProperties {
  return {
    background:  'none',
    border:      'none',
    cursor:      'pointer',
    color:       COLOR.muted,
    flexShrink:  0,
    display:     'flex',
  }
}

// ── Searching indicator ───────────────────────────────────────────────────────

export function getMenuBarSearchingStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    fontSize:   FONT_SIZE_MAP[settings.fontSize],
    color:      COLOR.muted,
    flexShrink: 0,
  }
}

// ── Search results ───────────────────────────────────────────────────────────

export function getMenuBarSearchResultsStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    backgroundColor: p.backgroundElevated,
    border:          `1px solid ${p.borderSubtle}`,
    borderRadius:    RADIUS.md,
    boxShadow:       '0 8px 24px rgba(0,0,0,0.24)',
    maxHeight:       '60vh',
    overflowY:       'auto',
  }
}

// ── Dropdown Z levels ─────────────────────────────────────────────────────────
// Exported so ProductivityBar can use named Z values for its dropdowns.
export { Z } from '../global/tokens'

// ── Provider dropdown ────────────────────────────────────────────────────────

export function getMenuBarDropdownStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    minWidth:        '180px',
    backgroundColor: p.backgroundElevated,
    border:          `1px solid ${p.borderSubtle}`,
    borderRadius:    RADIUS.md,
    padding:         SPACING[1],
    boxShadow:       '0 8px 32px rgba(0,0,0,0.32)',
  }
}

export function getMenuBarDropdownItemStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    display:      'flex',
    alignItems:   'center',
    gap:          SPACING[3],
    padding:      `${SPACING[2]} ${SPACING[3]} ${SPACING[2]} calc(${SPACING[3]} + 2px)`,
    borderRadius: RADIUS.sm,
    cursor:       'pointer',
    background:   'none',
    border:       'none',
    width:        '100%',
    textAlign:    'left' as const,
    color:        COLOR.secondary,
    fontSize:     FONT_SIZE_MAP[settings.fontSize],
    transition:   `background-color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

export function getMenuBarDropdownItemHoverStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return { backgroundColor: p.backgroundSubtle, color: COLOR.primary }
}

export function getMenuBarDropdownSeparatorStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    height:          '1px',
    margin:          `${SPACING[1]} ${SPACING[2]}`,
    backgroundColor: p.borderSubtle,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TODAY — TASK LIST
// ═══════════════════════════════════════════════════════════════════════════════

export function getMenuBarTaskRowStyle(): React.CSSProperties {
  return {
    display:     'flex',
    alignItems:  'center',
    gap:         SPACING[2],
    padding:     `${SPACING[1]} 0`,
    cursor:      'pointer',
    background:  'none',
    border:      'none',
    width:       '100%',
    textAlign:   'left' as const,
  }
}

export function getMenuBarTaskPriorityDotStyle(priority: string, completed: boolean): React.CSSProperties {
  const COLORS: Record<string, string> = {
    low:    'var(--color-text-warning)',
    medium: 'var(--color-text-info)',
    high:   'var(--color-text-error)',
  }
  return {
    width:           '6px',
    height:          '6px',
    flexShrink:      0,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS[priority] ?? COLOR.muted,
    opacity:         completed ? 0.35 : 1,
  }
}

export function getMenuBarTaskTitleStyle(
  settings:  GlobalSettings,
  completed: boolean,
): React.CSSProperties {
  return {
    fontSize:       FONT_SIZE_MAP[settings.fontSize],
    color:          completed ? COLOR.muted : COLOR.primary,
    textDecoration: completed ? 'line-through' : 'none',
    overflow:       'hidden',
    textOverflow:   'ellipsis',
    whiteSpace:     'nowrap' as const,
    flex:           1,
    minWidth:       0,
  }
}

export function getMenuBarTaskDueStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    fontSize:   FONT_SIZE_MAP[settings.fontSize],
    color:      COLOR.muted,
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
  }
}

export function getMenuBarTaskCircleStyle(completed: boolean, accentColor: string): React.CSSProperties {
  return {
    flexShrink:      0,
    width:           '12px',
    height:          '12px',
    borderRadius:    RADIUS.full,
    border:          `1.5px solid ${COLOR.success}`,
    backgroundColor: 'transparent',
    color:           COLOR.success,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    cursor:          'pointer',
    padding:         0,
    transition:      `border-color ${MOTION_SPEED_MAP['normal']} ${EASING.standard}`,
  }
}

export function getMenuBarTaskOpenButtonStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    fontSize:        FONT_SIZE_MAP[settings.fontSize],
    color:           COLOR.muted,
    background:      'none',
    border:          'none',
    cursor:          'pointer',
    padding:         `0 0 0 ${SPACING[1]}`,
    display:         'flex',
    alignItems:      'center',
    flexShrink:      0,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'

export const TOAST_VARIANT_COLOR: Record<ToastVariant, string> = {
  info:    COLOR.info,
  success: COLOR.success,
  warning: COLOR.warning,
  error:   COLOR.error,
}

export const TOAST_DURATION = 5000  // ms before auto-dismiss

export function getToastStackStyle(): React.CSSProperties {
  return {
    position:      'fixed',
    bottom:        '16px',
    right:         '16px',
    zIndex:        Z.TOAST,
    display:       'flex',
    flexDirection: 'column',
    gap:           SPACING[2],
    alignItems:    'flex-end',
    pointerEvents: 'none',
  }
}

export function getToastStyle(variant: ToastVariant): React.CSSProperties {
  return {
    pointerEvents:   'all',
    width:           '320px',
    borderRadius:    RADIUS.lg,
    backgroundColor: 'var(--color-bg-elevated, #0d1117)',
    border:          `1px solid ${TOAST_VARIANT_COLOR[variant]}40`,
    boxShadow:       '0 8px 32px rgba(0,0,0,0.32)',
    overflow:        'hidden',
    display:         'flex',
    flexDirection:   'column',
  }
}

export function getToastBodyStyle(): React.CSSProperties {
  return {
    display:    'flex',
    alignItems: 'flex-start',
    gap:        SPACING[3],
    padding:    `${SPACING[3]} ${SPACING[3]}`,
  }
}

export function getToastIconStyle(variant: ToastVariant): React.CSSProperties {
  return {
    flexShrink:  0,
    color:       TOAST_VARIANT_COLOR[variant],
    marginTop:   '1px',
  }
}

export function getToastContentStyle(): React.CSSProperties {
  return {
    flex:    1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap:     SPACING[1],
  }
}

export function getToastTitleStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    fontSize:   FONT_SIZE_MAP[settings.fontSize],
    fontWeight: WEIGHT.semibold,
    color:      COLOR.primary,
    lineHeight: 1.3,
  }
}

export function getToastMessageStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    fontSize:   FONT_SIZE_MAP[settings.fontSize],
    color:      COLOR.secondary,
    lineHeight: 1.4,
  }
}

export function getToastActionStyle(variant: ToastVariant, settings: GlobalSettings): React.CSSProperties {
  return {
    background:   'none',
    border:       'none',
    cursor:       'pointer',
    fontSize:     FONT_SIZE_MAP[settings.fontSize],
    fontWeight:   WEIGHT.semibold,
    color:        TOAST_VARIANT_COLOR[variant],
    padding:      0,
    marginTop:    SPACING[1],
    textAlign:    'left' as const,
  }
}

export function getToastCloseStyle(): React.CSSProperties {
  return {
    flexShrink:      0,
    background:      'none',
    border:          'none',
    cursor:          'pointer',
    color:           COLOR.muted,
    padding:         0,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
  }
}

export function getToastProgressStyle(variant: ToastVariant, pct: number): React.CSSProperties {
  return {
    height:          '3px',
    width:           `${pct}%`,
    backgroundColor: TOAST_VARIANT_COLOR[variant],
    transition:      'width 100ms linear',
    borderRadius:    `0 0 ${RADIUS.lg} ${RADIUS.lg}`,
  }
}

// ─── Overdue toast pulse ──────────────────────────────────────────────────────
// Injected once into the document head. Breathes from priority colour → orange.

export function injectOverduePulseAnimation(fromColor: string): void {
  const cls = `toast-overdue-${fromColor.replace('#', '')}`
  if (document.querySelector(`#${cls}`)) return
  const style = document.createElement('style')
  style.id = cls
  style.textContent = `
    @keyframes ${cls} {
      0%   { border-color: ${fromColor}; box-shadow: 0 0 8px 1px ${fromColor}60; }
      50%  { border-color: #f97316;      box-shadow: 0 0 14px 3px #f9731660;     }
      100% { border-color: ${fromColor}; box-shadow: 0 0 8px 1px ${fromColor}60; }
    }
    .${cls} {
      border: 1px solid ${fromColor} !important;
      animation: ${cls} 2s ease-in-out infinite !important;
    }
  `
  document.head.appendChild(style)
}

// Static border in priority colour — no animation, calm reminder

export function getToastReminderTabsStyle(): React.CSSProperties {
  return {
    display:   'flex',
    borderTop: '1px solid var(--color-border-subtle)',
  }
}

export function getToastReminderButtonStyle(
  isComplete: boolean,
  isLast:     boolean,
): React.CSSProperties {
  return {
    flex:        1,
    padding:     `${SPACING[2]} 0`,
    background:  'transparent',
    border:      'none',
    borderRight: isLast ? 'none' : '1px solid var(--color-border-subtle)',
    color:       isComplete ? '#4ADE80' : COLOR.secondary,
    fontSize:    SIZE.sm,
    fontWeight:  isComplete ? WEIGHT.bold : WEIGHT.regular,
    cursor:      'pointer',
  }
}
