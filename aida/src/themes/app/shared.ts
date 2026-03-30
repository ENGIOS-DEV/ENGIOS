// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4 — THEME: App Shared Styles
// AIDA-2 — src/themes/app/shared.ts
//
// Window chrome, title bar, content layout — used by ALL apps.
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings } from '../../types/settings'
import { getPalette, getAccent } from '../../global/palette'
import { FONT_SIZE_MAP, COLOR, SIZE, WEIGHT } from '../../global/typography'
import { SPACING, RADIUS, MOTION_SPEED_MAP, EASING, INTERACTION, getDarkerAccent, Z } from '../../global/tokens'
export { Z } from '../../global/tokens'

export const FILE_ICON_COLOURS = {
  image:       '#f472b6',          // pink   — images (no COLOR equivalent)
  video:       '#a78bfa',          // violet — video  (no COLOR equivalent)
  audio:       COLOR.success,      // emerald green — audio (#4ADE80)
  code:        COLOR.info,         // blue — code files (#60A5FA)
  archive:     COLOR.warning,      // amber — archives (#FBBF24)
  spreadsheet: COLOR.success,      // emerald — spreadsheets
  folder:      '#f59e0b',          // amber — folders (no COLOR equivalent)
  search:      '#f59e0b',          // amber — folders in search results
  mediaBg:     '#000000',          // black — video player background
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — WINDOW
// ═══════════════════════════════════════════════════════════════════════════════

export const APP_WINDOW = {
  borderRadius: RADIUS.lg,   // matches the window chrome on transparent windows
} as const

// Base — backgroundBase — for full-OS-window apps (Tasks, Terminal)
export function getAppWindowStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    width:           '100vw',
    height:          '100vh',
    display:         'flex',
    flexDirection:   'column',
    overflow:        'hidden',
    backgroundColor: p.backgroundBase,
    color:           COLOR.primary,
    fontSize:        'var(--font-size-base)',
    fontFamily:      'var(--font-family-main)',
  }
}

// Elevated — backgroundElevated — for frameless app windows that float
// above the desktop. transparent: false in Electron, OS paints background.
export function getAppBodyStyle(): React.CSSProperties {
  return {
    flex:            1,
    overflow:        'hidden',
    display:         'flex',
    flexDirection:   'column',
    WebkitAppRegion: 'no-drag',
  } as React.CSSProperties
}

export function getAppWindowElevatedStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    width:           '100vw',
    height:          '100vh',
    display:         'flex',
    flexDirection:   'column',
    overflow:        'hidden',
    backgroundColor: p.backgroundElevated,
    color:           COLOR.primary,
    fontSize:        'var(--font-size-base)',
    fontFamily:      'var(--font-family-main)',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — TITLE BAR
//
// Pattern: [logo?] [title]  ···  [children?] [↓] [↑] [●]
// Drag region: entire bar — WebkitAppRegion: drag
// No-drag zone: controls group — WebkitAppRegion: no-drag
// ═══════════════════════════════════════════════════════════════════════════════

export const APP_TITLE_BAR = {
  height:      SPACING[12],     // 48px
  paddingX:    SPACING[5],      // 20px
  logoSize:    16,
  logoRadius:  RADIUS.xs,
  titleGap:    SPACING[2],      // 8px
  controlSize: '28px',
  controlGap:  SPACING[1],      // 4px
  closeGap:    SPACING[2],      // 8px extra left margin before close
  chevronSize: 18,
  circleSize:  14,
} as const

export function getAppTitleBarStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'space-between',
    padding:         `0 ${APP_TITLE_BAR.paddingX}`,
    height:          APP_TITLE_BAR.height,
    borderBottom:    `1px solid ${p.borderSubtle}`,
    flexShrink:      0,
    userSelect:      'none',
    WebkitAppRegion: 'drag' as const,
  } as React.CSSProperties
}

export function getAppTitleBarLeftStyle(): React.CSSProperties {
  return {
    display:    'flex',
    alignItems: 'center',
    gap:        APP_TITLE_BAR.titleGap,
  }
}

export function getAppTitleBarLogoStyle(): React.CSSProperties {
  return {
    width:        APP_TITLE_BAR.logoSize,
    height:       APP_TITLE_BAR.logoSize,
    objectFit:    'contain',
    borderRadius: APP_TITLE_BAR.logoRadius,
    flexShrink:   0,
  } as React.CSSProperties
}

export function getAppTitleBarTitleStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    color:         COLOR.primary,
    fontSize:      FONT_SIZE_MAP[settings.fontSize],
    fontWeight:    400,
    letterSpacing: '0.015em',
    lineHeight:    1.2,
  }
}

export function getAppTitleBarControlsStyle(): React.CSSProperties {
  return {
    display:         'flex',
    alignItems:      'center',
    gap:             APP_TITLE_BAR.controlGap,
    WebkitAppRegion: 'no-drag' as const,
  } as React.CSSProperties
}

function getAppTitleBarControlStyle(): React.CSSProperties {
  return {
    flexShrink:      0,
    width:           '28px',
    height:          '28px',
    borderRadius:    RADIUS.full,
    border:          'none',
    cursor:          'pointer',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: 'transparent',
    color:           COLOR.muted,
    transition:      `background-color ${MOTION_SPEED_MAP['normal']} ${EASING.standard}`,
  }
}

export function getAppMinimiseButtonStyle(): React.CSSProperties {
  return { ...getAppTitleBarControlStyle() }
}

export function getAppMaximiseButtonStyle(): React.CSSProperties {
  return { ...getAppTitleBarControlStyle() }
}

export function getAppControlHoverStyle(accentColor: string): React.CSSProperties {
  return {
    color: getDarkerAccent(accentColor, 40),
  }
}

export function getAppCloseButtonStyle(): React.CSSProperties {
  return {
    ...getAppTitleBarControlStyle(),
    marginLeft: APP_TITLE_BAR.closeGap,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════════════════════

export const APP_TYPE = {
  windowTitle: {
    fontWeight:    600,
    letterSpacing: '0.015em',
    lineHeight:    1.2,
  },
  sectionHeader: {
    fontWeight:    700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    lineHeight:    1,
  },
  sidebarItem: {
    fontWeight: 400,
    lineHeight: 1.4,
  },
  sidebarItemActive: {
    fontWeight: 500,
    lineHeight: 1.4,
  },
  body: {
    fontWeight: 400,
    lineHeight: 1.6,
  },
  mono: {
    fontWeight:  400,
    lineHeight:  1.5,
    fontFamily:  'var(--font-family-mono)',
  },
  label: {
    fontWeight: 500,
    lineHeight: 1,
  },
  caption: {
    fontWeight: 400,
    lineHeight: 1.4,
  },
  badge: {
    fontWeight: 700,
    lineHeight: 1,
  },
  inputText: {
    fontWeight: 400,
    lineHeight: 1.4,
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════

export const APP_LAYOUT = {
  sidebarWidth:       '240px',
  sidebarMinWidth:    '180px',
  sidebarMaxWidth:    '360px',
  sidebarPaddingX:    SPACING[3],
  sidebarPaddingY:    SPACING[3],
  sidebarItemHeight:  '32px',
  sidebarItemPadding: SPACING[2],
  sidebarItemRadius:  RADIUS.sm,
  sidebarItemGap:     '1px',
  contentPaddingX:    SPACING[6],
  contentPaddingY:    SPACING[6],
  toolbarHeight:      '40px',
  toolbarPaddingX:    SPACING[3],
  resizerWidth:       '12px',
  inputBarPaddingX:   SPACING[4],
  inputBarPaddingY:   SPACING[3],
  inputRadius:        RADIUS.md,
  bubbleMaxWidth:     '75%',
  bubblePaddingX:     SPACING[4],
  bubblePaddingY:     SPACING[3],
  bubbleRadius:       RADIUS.lg,
} as const

export function getAppContentStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    flex:            1,
    display:         'flex',
    flexDirection:   'column',
    overflow:        'hidden',
    backgroundColor: p.backgroundBase,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — CONTROLS
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6 — BEHAVIOURS
// Transition strings pre-built for common use cases.
// Convention files and components use these — no raw duration strings.
// ═══════════════════════════════════════════════════════════════════════════════

export const APP_BEHAVIOUR = {
  hoverOpacity:    INTERACTION.hoverOpacity,
  activeScale:     INTERACTION.activeScale,
  disabledOpacity: INTERACTION.disabledOpacity,
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7 — STATES
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
