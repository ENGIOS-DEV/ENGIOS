// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4 — THEME: Notes App Styles
// AIDA-2 — src/themes/app/notes.ts
//
// All style functions specific to the Notes app.
// No hardcoded colours, sizes, or spacing — all from tokens and typography.
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings } from '../../types/settings'
import { COLOR, SIZE, WEIGHT, FAMILIES } from '../../global/typography'
import { SPACING, RADIUS, INTERACTION }  from '../../global/tokens'
import { getPalette, getAccent }         from '../../global/palette'

// ─── Layout ───────────────────────────────────────────────────────────────────

export function getNotesBodyStyle(): React.CSSProperties {
  return {
    display:  'flex',
    flex:     1,
    overflow: 'hidden',
  }
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function getNotesSidebarStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    width:           '220px',
    flexShrink:      0,
    display:         'flex',
    flexDirection:   'column',
    background:      p.backgroundSubtle,
    borderRight:     `1px solid ${p.borderSubtle}`,
    overflow:        'hidden',
  }
}

export function getNotesSidebarHeaderStyle(): React.CSSProperties {
  return {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        `${SPACING[2]} ${SPACING[3]}`,
    flexShrink:     0,
  }
}

export function getNotesSidebarTitleStyle(): React.CSSProperties {
  return {
    fontSize:   SIZE.xs,
    fontWeight: WEIGHT.semibold,
    color:      COLOR.tertiary,
    fontFamily: FAMILIES.main,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
  }
}

export function getNotesNewButtonStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '20px',
    height:         '20px',
    borderRadius:   RADIUS.sm,
    border:         'none',
    background:     p.backgroundElevated,
    color:          COLOR.secondary,
    cursor:         'pointer',
    flexShrink:     0,
    fontSize:       '14px',
    fontWeight:     600,
    lineHeight:     1,
    transition:     'opacity var(--motion-speed) var(--motion-ease)',
  }
}

export function getNotesSidebarListStyle(): React.CSSProperties {
  return {
    flex:      1,
    overflowY: 'auto' as const,
    padding:   `${SPACING[1]} ${SPACING[2]}`,
    display:   'flex',
    flexDirection: 'column',
    gap:       SPACING[1],
  }
}

export function getNotesSidebarItemStyle(settings: GlobalSettings, active: boolean, pinned: boolean): React.CSSProperties {
  const p      = getPalette(settings)
  const accent = getAccent(settings)
  return {
    display:         'flex',
    flexDirection:   'column',
    gap:             '2px',
    width:           '100%',
    padding:         `${SPACING[2]} ${SPACING[2]}`,
    borderRadius:    RADIUS.md,
    border:          active ? `1px solid ${accent}33` : '1px solid transparent',
    background:      active ? `${accent}18` : 'transparent',
    cursor:          'pointer',
    textAlign:       'left' as const,
    transition:      'background var(--motion-speed) var(--motion-ease)',
    opacity:         pinned ? 1 : undefined,
  }
}

export function getNotesSidebarItemTitleStyle(active: boolean): React.CSSProperties {
  return {
    fontSize:     SIZE.sm,
    fontWeight:   active ? WEIGHT.semibold : WEIGHT.regular,
    color:        active ? COLOR.primary : COLOR.secondary,
    fontFamily:   FAMILIES.main,
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap' as const,
  }
}

export function getNotesSidebarItemMetaStyle(): React.CSSProperties {
  return {
    fontSize:  SIZE.xs,
    color:     COLOR.tertiary,
    fontFamily: FAMILIES.main,
  }
}

export function getNotesEmptySidebarStyle(): React.CSSProperties {
  return {
    padding:   `${SPACING[3]} ${SPACING[2]}`,
    fontSize:  SIZE.xs,
    color:     COLOR.tertiary,
    fontFamily: FAMILIES.main,
    textAlign: 'center' as const,
  }
}

// ─── Main editor area ─────────────────────────────────────────────────────────

export function getNotesMainStyle(): React.CSSProperties {
  return {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
  }
}

export function getNotesEditorHeaderStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:       'flex',
    flexDirection: 'column',
    gap:           SPACING[1],
    padding:       `${SPACING[3]} ${SPACING[4]}`,
    borderBottom:  `1px solid ${p.borderSubtle}`,
    flexShrink:    0,
  }
}

export function getNotesTitleInputStyle(): React.CSSProperties {
  return {
    width:       '100%',
    background:  'transparent',
    border:      'none',
    outline:     'none',
    fontSize:    SIZE.xl,
    fontWeight:  WEIGHT.bold,
    color:       COLOR.primary,
    fontFamily:  FAMILIES.display,
    padding:     0,
  }
}

export function getNotesMetaRowStyle(): React.CSSProperties {
  return {
    display:    'flex',
    alignItems: 'center',
    gap:        SPACING[3],
  }
}

export function getNotesMetaLabelStyle(): React.CSSProperties {
  return {
    fontSize:   SIZE.xs,
    color:      COLOR.tertiary,
    fontFamily: FAMILIES.main,
  }
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

export function getNotesToolbarStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:      'flex',
    alignItems:   'center',
    gap:          SPACING[1],
    padding:      `${SPACING[1]} ${SPACING[4]}`,
    borderBottom: `1px solid ${p.borderSubtle}`,
    flexShrink:   0,
    flexWrap:     'wrap' as const,
    minHeight:    '38px',
  }
}

export function getNotesToolbarSeparatorStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    width:     '1px',
    height:    '16px',
    background: p.borderSubtle,
    flexShrink: 0,
    margin:    `0 ${SPACING[1]}`,
  }
}

export function getNotesToolbarButtonStyle(settings: GlobalSettings, active = false): React.CSSProperties {
  const p      = getPalette(settings)
  const accent = getAccent(settings)
  return {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    minWidth:       '26px',
    height:         '26px',
    padding:        `0 ${SPACING[1]}`,
    borderRadius:   RADIUS.sm,
    border:         'none',
    background:     active ? `${accent}22` : 'transparent',
    color:          active ? accent : COLOR.secondary,
    cursor:         'pointer',
    fontSize:       SIZE.sm,
    fontFamily:     FAMILIES.main,
    fontWeight:     WEIGHT.medium,
    transition:     'background var(--motion-speed) var(--motion-ease)',
    flexShrink:     0,
  }
}

// ─── Colour swatch — see getNotesColourSwatchStyle below ──────────────────────

// ─── Quill editor container ───────────────────────────────────────────────────

export function getNotesEditorBodyStyle(): React.CSSProperties {
  return {
    flex:     1,
    overflow: 'hidden',
    display:  'flex',
    flexDirection: 'column',
  }
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export function getNotesEmptyStateStyle(): React.CSSProperties {
  return {
    flex:           1,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
  }
}

export function getNotesEmptyStateLabelStyle(): React.CSSProperties {
  return {
    fontSize:  SIZE.sm,
    color:     COLOR.tertiary,
    fontFamily: FAMILIES.main,
  }
}

export function getNotesToolbarDropdownButtonStyle(settings: GlobalSettings, active = false): React.CSSProperties {
  const p      = getPalette(settings)
  const accent = getAccent(settings)
  return {
    display:        'flex',
    alignItems:     'center',
    gap:            '4px',
    height:         '26px',
    padding:        `0 ${SPACING[2]}`,
    borderRadius:   RADIUS.sm,
    border:         `1px solid ${active ? accent + '44' : p.borderSubtle}`,
    background:     active ? `${accent}18` : p.backgroundSubtle,
    color:          active ? accent : COLOR.secondary,
    cursor:         'pointer',
    fontSize:       SIZE.xs,
    fontFamily:     FAMILIES.main,
    fontWeight:     WEIGHT.medium,
    whiteSpace:     'nowrap' as const,
    flexShrink:     0,
    transition:     'background var(--motion-speed) var(--motion-ease)',
  }
}

export function getNotesFloatyItemStyle(settings: GlobalSettings, active = false): React.CSSProperties {
  const accent = getAccent(settings)
  return {
    display:      'block',
    width:        '100%',
    padding:      `${SPACING[1]} ${SPACING[3]}`,
    borderRadius: RADIUS.sm,
    border:       'none',
    background:   active ? `${accent}22` : 'transparent',
    color:        active ? accent : COLOR.secondary,
    cursor:       'pointer',
    fontSize:     SIZE.sm,
    fontFamily:   FAMILIES.main,
    fontWeight:   active ? WEIGHT.semibold : WEIGHT.regular,
    textAlign:    'left' as const,
    transition:   'background var(--motion-speed) var(--motion-ease)',
  }
}

export function getNotesColourSwatchStyle(color: string, active: boolean): React.CSSProperties {
  return {
    width:        '18px',
    height:       '18px',
    borderRadius: RADIUS.sm,
    background:   color,
    border:       active ? '2px solid var(--color-accent)' : '2px solid transparent',
    cursor:       'pointer',
    flexShrink:   0,
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    padding:      0,
  }
}

// ─── Pin button ───────────────────────────────────────────────────────────────

export function getNotesPinButtonStyle(settings: GlobalSettings, pinned: boolean): React.CSSProperties {
  const accent = getAccent(settings)
  return {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '26px',
    height:         '26px',
    borderRadius:   RADIUS.sm,
    border:         'none',
    background:     'transparent',
    color:          pinned ? accent : COLOR.tertiary,
    cursor:         'pointer',
    transition:     'color var(--motion-speed) var(--motion-ease)',
    flexShrink:     0,
  }
}

// ─── Delete button ────────────────────────────────────────────────────────────

export function getNotesDeleteButtonStyle(): React.CSSProperties {
  return {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '26px',
    height:         '26px',
    borderRadius:   RADIUS.sm,
    border:         'none',
    background:     'transparent',
    color:          'var(--color-text-error)',
    cursor:         'pointer',
    opacity:        INTERACTION.disabledOpacity,
    transition:     `opacity var(--motion-speed) var(--motion-ease)`,
    flexShrink:     0,
  }
}

export function getNotesDeleteButtonHoverStyle(): React.CSSProperties {
  return { opacity: 1 }
}
