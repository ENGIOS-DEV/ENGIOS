// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4 — THEME: AIDA Chat App Styles
// AIDA-2 — src/themes/app/aida-chat.ts
//
// Responsibility:
//   All style specifications for the AIDA Chat app window.
//   Sidebar, bubble layout, input bar, streaming cursor, empty state.
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings } from '../../types/settings'
import { getPalette, getAccent } from '../../global/palette'
import { FONT_SIZE_MAP, COLOR, WEIGHT } from '../../global/typography'
import { SPACING, RADIUS, MOTION_SPEED_MAP, EASING } from '../../global/tokens'
import { APP_LAYOUT } from './shared'

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════════

export const SIDEBAR_W_EXPANDED  = '220px'
export const SIDEBAR_W_COLLAPSED = '44px'

export function getAidaSidebarStyle(settings: GlobalSettings, expanded: boolean): React.CSSProperties {
  const p = getPalette(settings)
  return {
    width:           expanded ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED,
    minWidth:        expanded ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED,
    borderRight:     `1px solid ${p.borderSubtle}`,
    display:         'flex',
    flexDirection:   'column',
    overflow:        'hidden',
    transition:      `width ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard},
                      min-width ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
    flexShrink:      0,
  }
}

export function getAidaSidebarToggleStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    width:           SIDEBAR_W_COLLAPSED,
    minWidth:        SIDEBAR_W_COLLAPSED,
    height:          '44px',
    flexShrink:      0,
    background:      'none',
    border:          'none',
    color:           COLOR.muted,
    transition:      `color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

export function getAidaSidebarMenuStyle(): React.CSSProperties {
  return {
    display:       'flex',
    flexDirection: 'column',
    padding:       `${SPACING[1]} ${SPACING[2]}`,
    gap:           '2px',
    flexShrink:    0,
  }
}

export function getAidaSidebarItemStyle(settings: GlobalSettings, active = false): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:         'flex',
    alignItems:      'center',
    gap:             SPACING[2],
    padding:         `${SPACING[2]} ${SPACING[2]}`,
    borderRadius:    RADIUS.sm,
    background:      active ? p.backgroundSubtle : 'none',
    border:          'none',
    color:           active ? COLOR.primary : COLOR.secondary,
    fontSize:        FONT_SIZE_MAP[settings.fontSize],
    fontWeight:      active ? WEIGHT.medium : WEIGHT.regular,
    width:           '100%',
    textAlign:       'left' as const,
    whiteSpace:      'nowrap' as const,
    overflow:        'hidden',
    textOverflow:    'ellipsis',
    transition:      `background ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard},
                      color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
    flexShrink:      0,
  }
}

export function getAidaSidebarSeparatorStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    height:     '1px',
    background: p.borderSubtle,
    margin:     `${SPACING[2]} ${SPACING[2]}`,
    flexShrink: 0,
  }
}

export function getAidaSidebarConvListStyle(): React.CSSProperties {
  return {
    flex:      1,
    overflowY: 'auto' as const,
    display:   'flex',
    flexDirection: 'column' as const,
    gap:       '1px',
    padding:   `0 ${SPACING[2]} ${SPACING[2]}`,
  }
}

export function getAidaSidebarConvItemStyle(settings: GlobalSettings, active: boolean): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:      'flex',
    alignItems:   'center',
    gap:          SPACING[2],
    padding:      `${SPACING[2]} ${SPACING[2]}`,
    borderRadius: RADIUS.sm,
    background:   active ? getAccent(settings) + '22' : 'none',
    border:       'none',
    color:        active ? getAccent(settings) : COLOR.secondary,
    fontSize:     FONT_SIZE_MAP[settings.fontSize],
    fontWeight:   active ? WEIGHT.medium : WEIGHT.regular,
    width:        '100%',
    textAlign:    'left' as const,
    whiteSpace:   'nowrap' as const,
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    cursor:       'default',
    transition:   `background ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — BODY LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════

export function getAidaBodyStyle(): React.CSSProperties {
  return {
    flex:          1,
    display:       'flex',
    flexDirection: 'row',
    overflow:      'hidden',
  }
}

export function getAidaMainStyle(): React.CSSProperties {
  return {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — MESSAGE LIST
// ═══════════════════════════════════════════════════════════════════════════════

export function getAidaMessageListStyle(): React.CSSProperties {
  return {
    flex:          1,
    overflowY:     'auto',
    display:       'flex',
    flexDirection: 'column',
    padding:       `${SPACING[5]} ${SPACING[6]}`,
    gap:           SPACING[4],
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — BUBBLES
// ═══════════════════════════════════════════════════════════════════════════════

export function getAidaUserBubbleWrapStyle(): React.CSSProperties {
  return { display: 'flex', justifyContent: 'flex-end' }
}

export function getAidaAidaBubbleWrapStyle(): React.CSSProperties {
  return { display: 'flex', justifyContent: 'flex-start' }
}

export function getAidaUserBubbleStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    maxWidth:        APP_LAYOUT.bubbleMaxWidth,
    padding:         `${APP_LAYOUT.bubblePaddingY} ${APP_LAYOUT.bubblePaddingX}`,
    borderRadius:    `${APP_LAYOUT.bubbleRadius} ${APP_LAYOUT.bubbleRadius} ${RADIUS.xs} ${APP_LAYOUT.bubbleRadius}`,
    backgroundColor: getAccent(settings),
    color:           COLOR.onAccent,
    fontSize:        FONT_SIZE_MAP[settings.fontSize],
    fontWeight:      WEIGHT.regular,
    lineHeight:      1.6,
    wordBreak:       'break-word' as const,
  }
}

export function getAidaAidaBubbleStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    maxWidth:        APP_LAYOUT.bubbleMaxWidth,
    padding:         `${APP_LAYOUT.bubblePaddingY} ${APP_LAYOUT.bubblePaddingX}`,
    borderRadius:    `${APP_LAYOUT.bubbleRadius} ${APP_LAYOUT.bubbleRadius} ${APP_LAYOUT.bubbleRadius} ${RADIUS.xs}`,
    backgroundColor: p.backgroundElevated,
    border:          `1px solid ${p.borderSubtle}`,
    color:           COLOR.primary,
    fontSize:        FONT_SIZE_MAP[settings.fontSize],
    fontWeight:      WEIGHT.regular,
    lineHeight:      1.6,
    wordBreak:       'break-word' as const,
    whiteSpace:      'pre-wrap' as const,
  }
}

export function getAidaStreamingCursorStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    display:         'inline-block',
    width:           '2px',
    height:          '1em',
    backgroundColor: getAccent(settings),
    marginLeft:      '2px',
    verticalAlign:   'text-bottom',
    animation:       `aida-cursor-blink 800ms ${EASING.standard} infinite`,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — INPUT BAR
// ═══════════════════════════════════════════════════════════════════════════════

export function getAidaInputBarStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:         'flex',
    alignItems:      'center',
    gap:             SPACING[2],
    padding:         `${APP_LAYOUT.inputBarPaddingY} ${APP_LAYOUT.inputBarPaddingX}`,
    borderTop:       `1px solid ${p.borderSubtle}`,
    backgroundColor: p.backgroundBase,
    flexShrink:      0,
  }
}

export function getAidaInputStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    flex:            1,
    backgroundColor: p.backgroundElevated,
    border:          `1px solid ${p.borderSubtle}`,
    borderRadius:    APP_LAYOUT.inputRadius,
    padding:         `${SPACING[2]} ${SPACING[3]}`,
    color:           COLOR.primary,
    fontSize:        FONT_SIZE_MAP[settings.fontSize],
    outline:         'none',
    resize:          'none' as const,
    lineHeight:      1.5,
    fontFamily:      'var(--font-family-main)',
    minHeight:       '36px',
    maxHeight:       '120px',
    overflowY:       'auto' as const,
  }
}

export function getAidaSendButtonStyle(settings: GlobalSettings, disabled: boolean): React.CSSProperties {
  const accent = getAccent(settings)
  return {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    width:           '32px',
    height:          '32px',
    borderRadius:    RADIUS.full,
    border:          'none',
    backgroundColor: disabled ? 'rgba(255,255,255,0.08)' : accent,
    color:           disabled ? COLOR.muted : COLOR.onAccent,
    flexShrink:      0,
    transition:      `background-color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard},
                      color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
    opacity:         disabled ? 0.5 : 1,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6 — EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════

export function getAidaEmptyStateStyle(): React.CSSProperties {
  return {
    flex:           1,
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            SPACING[3],
    color:          COLOR.muted,
  }
}

export function getAidaEmptyStateLabelStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    fontSize:   FONT_SIZE_MAP[settings.fontSize],
    color:      COLOR.muted,
    fontWeight: WEIGHT.regular,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7 — SIDEBAR HEADERS (Projects / Chats collapsible sections)
// ═══════════════════════════════════════════════════════════════════════════════

export function getAidaSidebarSectionHeaderStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        `${SPACING[2]} ${SPACING[2]} ${SPACING[1]}`,
    flexShrink:     0,
  }
}

export function getAidaSidebarSectionHeaderLabelStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    display:       'flex',
    alignItems:    'center',
    gap:           SPACING[1],
    fontSize:      `calc(${FONT_SIZE_MAP[settings.fontSize]} - 2px)`,
    color:         COLOR.muted,
    fontWeight:    WEIGHT.medium,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    background:    'none',
    border:        'none',
    padding:       0,
  }
}

export function getAidaSidebarSectionActionStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    display:    'flex',
    alignItems: 'center',
    background: 'none',
    border:     'none',
    color:      COLOR.muted,
    padding:    `0 ${SPACING[1]}`,
    borderRadius: RADIUS.xs,
    transition: `color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8 — PROJECT FOLDER ITEMS
// ═══════════════════════════════════════════════════════════════════════════════

export function getAidaFolderItemStyle(settings: GlobalSettings, active: boolean): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:      'flex',
    alignItems:   'center',
    gap:          SPACING[2],
    padding:      `${SPACING[2]} ${SPACING[2]}`,
    borderRadius: RADIUS.sm,
    background:   active ? p.backgroundSubtle : 'none',
    border:       'none',
    color:        active ? COLOR.primary : COLOR.secondary,
    fontSize:     FONT_SIZE_MAP[settings.fontSize],
    fontWeight:   active ? WEIGHT.medium : WEIGHT.regular,
    width:        '100%',
    textAlign:    'left' as const,
    cursor:       'default',
    flexShrink:   0,
  }
}

export function getAidaFolderChevronStyle(open: boolean): React.CSSProperties {
  return {
    flexShrink:  0,
    transition:  'transform 150ms ease',
    transform:   open ? 'rotate(90deg)' : 'rotate(0deg)',
  }
}

export function getAidaFolderConvIndentStyle(): React.CSSProperties {
  return {
    paddingLeft: SPACING[5],
    display:     'flex',
    flexDirection: 'column' as const,
    gap:         '1px',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9 — CONTEXT MENU
// ═══════════════════════════════════════════════════════════════════════════════

export function getAidaContextMenuStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    position:        'fixed' as const,
    backgroundColor: p.backgroundElevated,
    border:          `1px solid ${p.borderSubtle}`,
    borderRadius:    RADIUS.md,
    boxShadow:       '0 8px 24px rgba(0,0,0,0.32)',
    padding:         `${SPACING[1]} 0`,
    minWidth:        '160px',
    zIndex:          9999,
  }
}

export function getAidaContextMenuItemStyle(settings: GlobalSettings, danger = false): React.CSSProperties {
  return {
    display:     'flex',
    alignItems:  'center',
    gap:         SPACING[2],
    padding:     `${SPACING[2]} ${SPACING[3]}`,
    background:  'none',
    border:      'none',
    width:       '100%',
    textAlign:   'left' as const,
    fontSize:    FONT_SIZE_MAP[settings.fontSize],
    color:       danger ? COLOR.error : COLOR.primary,
    fontWeight:  WEIGHT.regular,
    cursor:      'default',
    whiteSpace:  'nowrap' as const,
    transition:  `background ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

export function getAidaContextMenuItemHoverStyle(settings: GlobalSettings, danger = false): React.CSSProperties {
  const p = getPalette(settings)
  return {
    background: danger ? COLOR.error + '1a' : p.backgroundSubtle,
  }
}

export function getAidaContextMenuSeparatorStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    height:  '1px',
    background: p.borderSubtle,
    margin:  `${SPACING[1]} 0`,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10 — SEARCH
// ═══════════════════════════════════════════════════════════════════════════════

export function getAidaSearchInputStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    width:       '100%',
    background:  p.backgroundSubtle,
    border:      `1px solid ${p.borderSubtle}`,
    borderRadius: RADIUS.sm,
    padding:     `${SPACING[2]} ${SPACING[2]}`,
    color:       COLOR.primary,
    fontSize:    FONT_SIZE_MAP[settings.fontSize],
    outline:     'none',
    resize:      'none' as const,
    lineHeight:  1.5,
    fontFamily:  'var(--font-family-main)',
    minHeight:   '32px',
    overflowY:   'hidden' as const,
    boxSizing:   'border-box' as const,
  }
}

export function getAidaSearchResultItemStyle(settings: GlobalSettings, active: boolean): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:      'flex',
    flexDirection: 'column' as const,
    gap:          '2px',
    padding:      `${SPACING[2]} ${SPACING[2]}`,
    borderRadius: RADIUS.sm,
    background:   active ? p.backgroundSubtle : 'none',
    border:       'none',
    color:        COLOR.primary,
    fontSize:     FONT_SIZE_MAP[settings.fontSize],
    fontWeight:   WEIGHT.regular,
    width:        '100%',
    textAlign:    'left' as const,
    cursor:       'default',
    transition:   `background ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

export function getAidaSearchResultSubtitleStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    fontSize:     `calc(${FONT_SIZE_MAP[settings.fontSize]} - 2px)`,
    color:        COLOR.muted,
    whiteSpace:   'nowrap' as const,
    overflow:     'hidden',
    textOverflow: 'ellipsis',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 11 — INLINE STYLE REPLACEMENTS
// Styles previously defined inline in Window.tsx — moved here for compliance.
// ═══════════════════════════════════════════════════════════════════════════════

export function getAidaConvTitleStyle(): React.CSSProperties {
  return {
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap' as const,
  }
}

export function getAidaSearchWrapperStyle(): React.CSSProperties {
  return { padding: `${SPACING[1]} ${SPACING[2]} 2px` }
}

export function getAidaSubtleLabelStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    fontSize:  `calc(${FONT_SIZE_MAP[settings.fontSize]} - 2px)`,
    color:     COLOR.muted,
    padding:   `${SPACING[1]} ${SPACING[2]}`,
  }
}

export function getAidaInlineSeparatorStyle(): React.CSSProperties {
  return {
    height:     '1px',
    background: 'var(--color-border-subtle)',
    margin:     `${SPACING[1]} ${SPACING[2]}`,
  }
}

export function getAidaNewFolderInputWrapStyle(): React.CSSProperties {
  return {
    display:    'flex',
    alignItems: 'center',
    gap:        SPACING[1],
    padding:    `2px ${SPACING[1]}`,
  }
}

export function getAidaInlineInputStyle(): React.CSSProperties {
  return {
    flex:        1,
    background:  'var(--color-bg-subtle)',
    border:      '1px solid var(--color-border-subtle)',
    borderRadius: RADIUS.xs,
    padding:     `${SPACING[1]} ${SPACING[2]}`,
    color:       'var(--color-text-primary)',
    fontSize:    'var(--font-size-base)',
    outline:     'none',
    fontFamily:  'var(--font-family-main)',
  }
}

export function getAidaDragOverFolderStyle(active: boolean): React.CSSProperties {
  return {
    outline:      active ? '2px solid var(--color-accent)' : 'none',
    borderRadius: RADIUS.sm,
  }
}

export function getAidaFolderRowStyle(): React.CSSProperties {
  return { display: 'flex', alignItems: 'center', width: '100%' }
}
