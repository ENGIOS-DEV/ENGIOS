// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4 — THEME: File Decks App Styles
// AIDA-2 — src/themes/app/file-decks.ts
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings } from '../../types/settings'
import { getPalette, getAccent } from '../../global/palette'
import { FONT_SIZE_MAP, COLOR, SIZE, WEIGHT } from '../../global/typography'
import { SPACING, RADIUS, MOTION_SPEED_MAP, EASING, INTERACTION, getDarkerAccent, Z } from '../../global/tokens'
import { APP_TYPE } from './shared'

// SECTION 8 — FILE DECKS
// All style functions specific to the File Decks app.
// ═══════════════════════════════════════════════════════════════════════════════

export function getFileDeckSubBarStyle(
  settings:    GlobalSettings,
  accentColor: string,
): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:         'flex',
    alignItems:      'center',
    gap:             SPACING[2],
    padding:         `0 ${SPACING[4]}`,
    height:          '36px',
    flexShrink:      0,
    borderBottom:    `1px solid ${p.borderSubtle}`,
    backgroundColor: `${accentColor}22`,
  }
}

export function getFileDeckSubBarMenuButtonStyle(
  settings:    GlobalSettings,
  isActive:    boolean,
  accentColor: string,
): React.CSSProperties {
  const p = getPalette(settings)
  return {
    padding:       `${SPACING[1]} ${SPACING[3]}`,
    borderRadius:  RADIUS.sm,
    background:    isActive ? `${accentColor}22` : 'none',
    border:        `1px solid ${isActive ? accentColor + '50' : 'transparent'}`,
    color:         isActive ? accentColor : COLOR.muted,
    cursor:        'pointer',
    fontSize:      FONT_SIZE_MAP[settings.fontSize],
    fontWeight:    500,
    transition:    `color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard},
                    background ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
    letterSpacing: '0.02em',
  }
}

export function getFileDeckPathTextStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    ...APP_TYPE.mono,
    fontSize:     FONT_SIZE_MAP[settings.fontSize],
    color:        COLOR.secondary,
    flex:         1,
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap' as const,
  }
}

export function getFileDeckCopyButtonStyle(
  settings:    GlobalSettings,
  copied:      boolean,
  accentColor: string,
): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:      'flex',
    alignItems:   'center',
    gap:          SPACING[1],
    padding:      `${SPACING[1]} ${SPACING[2]}`,
    borderRadius: RADIUS.sm,
    background:   copied ? `${accentColor}22` : 'none',
    border:       `1px solid ${copied ? accentColor + '50' : p.borderSubtle}`,
    color:        copied ? accentColor : COLOR.muted,
    cursor:       'pointer',
    fontSize:     FONT_SIZE_MAP[settings.fontSize],
    fontWeight:   500,
    transition:   `color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard},
                   background ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
    flexShrink:   0,
  }
}

export function getFileDeckSearchInputStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    ...APP_TYPE.mono,
    fontSize:   FONT_SIZE_MAP[settings.fontSize],
    flex:       1,
    background: 'none',
    border:     'none',
    outline:    'none',
    color:      COLOR.primary,
  }
}

export function getFileDeckSearchClearStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:      'flex',
    alignItems:   'center',
    background:   'none',
    border:       'none',
    cursor:       'pointer',
    color:        COLOR.muted,
    padding:      '2px',
    borderRadius: RADIUS.xs,
    flexShrink:   0,
  }
}

export function getFileDeckBackButtonStyle(
  settings: GlobalSettings,
  disabled: boolean,
): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:         'flex',
    alignItems:      'center',
    padding:         SPACING[1],
    borderRadius:    RADIUS.xs,
    background:      'none',
    border:          'none',
    cursor:          disabled ? 'not-allowed' : 'pointer',
    color:           disabled ? COLOR.muted : COLOR.secondary,
    opacity:         disabled ? INTERACTION.disabledOpacity : 1,
    WebkitAppRegion: 'no-drag' as const,
  } as React.CSSProperties
}

export function getFileDeckTreeNodeStyle(
  settings:    GlobalSettings,
  isSelected:  boolean,
  accentColor: string,
  depth:       number,
): React.CSSProperties {
  const p = getPalette(settings)
  return {
    paddingLeft:     `${8 + depth * 14}px`,
    fontSize:        FONT_SIZE_MAP[settings.fontSize],
    color:           isSelected ? 'white' : COLOR.secondary,
    backgroundColor: isSelected ? `${accentColor}22` : 'transparent',
  }
}

export function getFileDeckHomeButtonStyle(
  settings:    GlobalSettings,
  isSelected:  boolean,
  accentColor: string,
): React.CSSProperties {
  const p = getPalette(settings)
  return {
    fontSize:        FONT_SIZE_MAP[settings.fontSize],
    color:           isSelected ? 'white' : COLOR.secondary,
    backgroundColor: isSelected ? `${accentColor}22` : 'transparent',
  }
}

export function getFileDeckFileRowStyle(
  settings:    GlobalSettings,
  isSelected:  boolean,
  accentColor: string,
): React.CSSProperties {
  const p = getPalette(settings)
  return {
    fontSize:        FONT_SIZE_MAP[settings.fontSize],
    color:           isSelected ? 'white' : COLOR.secondary,
    backgroundColor: isSelected ? `${accentColor}22` : 'transparent',
  }
}

export function getFileDeckToolbarGroupStyle(): React.CSSProperties {
  return {
    display:         'flex',
    alignItems:      'center',
    gap:             SPACING[1],
    marginRight:     SPACING[2],
    WebkitAppRegion: 'no-drag',
  } as React.CSSProperties
}

export function getFileDeckSidebarStyle(width: number): React.CSSProperties {
  return {
    width:   `${width}px`,
    padding: `${SPACING[2]} ${SPACING[1]}`,
    flexShrink: 0,
  }
}

export function getFileDeckSeparatorStyle(): React.CSSProperties {
  return {
    borderBottom: '1px solid var(--color-border-subtle)',
    margin:       `${SPACING[1]} 0 ${SPACING[2]}`,
  }
}

export function getFileDeckResizeHandleStyle(
  isResizing: boolean,
  accentColor: string,
  side: 'left' | 'right',
): React.CSSProperties {
  const borderProp = side === 'left' ? 'borderLeft' : 'borderRight'
  return {
    width:           SPACING[1],
    flexShrink:      0,
    cursor:          'col-resize',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    position:        'relative',
    zIndex:          Z.WIDGET,
    backgroundColor: isResizing ? `${accentColor}12` : 'transparent',
    [borderProp]:    `1px solid ${isResizing ? accentColor + '40' : 'var(--color-border-subtle)'}`,
    transition:      'background-color 0.15s, border-color 0.15s',
    userSelect:      'none',
  }
}

export function getFileDeckResizeHandleIconStyle(
  isResizing: boolean,
  accentColor: string,
): React.CSSProperties {
  return {
    fontSize:      '9px',
    color:         isResizing ? accentColor : 'var(--color-border-subtle)',
    letterSpacing: '-1px',
    lineHeight:    1,
    userSelect:    'none',
    pointerEvents: 'none',
  }
}

export function getFileDeckDetailPrimaryStyle(): React.CSSProperties {
  return {
    color:      'var(--color-text-primary)',
    fontWeight: 500,
    marginBottom: SPACING[1],
  }
}

export function getFileDeckDetailSecondaryStyle(): React.CSSProperties {
  return {
    color:    'var(--color-text-secondary)',
    fontSize: 'var(--font-size-base)',
  }
}

export function getFileDeckDetailMonoStyle(): React.CSSProperties {
  return {
    color:      'var(--color-text-secondary)',
    fontFamily: 'var(--font-family-mono)',
    fontSize:   'var(--font-size-base)',
  }
}

export function getFileDeckPreviewImageStyle(): React.CSSProperties {
  return {
    maxWidth:     '100%',
    maxHeight:    '260px',
    borderRadius: RADIUS.sm,
    objectFit:    'contain' as const,
  }
}

export function getFileDeckIconStyle(muted = false): React.CSSProperties {
  return {
    color:     muted ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
    flexShrink: 0,
  }
}

export function getFileDeckEmptyStyle(): React.CSSProperties {
  return {
    color:    'var(--color-border-subtle)',
    flexShrink: 0,
  }
}

export function getFileDeckBreadcrumbIconStyle(isDisabled = false): React.CSSProperties {
  return {
    color:     'var(--color-text-muted)',
    flexShrink: 0,
    opacity:   isDisabled ? INTERACTION.disabledOpacity : 1,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATE PICKER
// Shared custom date picker styles — used across all app windows.
// ═══════════════════════════════════════════════════════════════════════════════
