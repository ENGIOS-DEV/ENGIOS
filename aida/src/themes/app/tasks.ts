// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4 — THEME: Tasks App Styles
// AIDA-2 — src/themes/app/tasks.ts
//
// All style functions specific to the Tasks app.
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings } from '../../types/settings'
import { COLOR, SIZE, WEIGHT } from '../../global/typography'
import { SPACING, RADIUS }     from '../../global/tokens'

// ─── Row ──────────────────────────────────────────────────────────────────────

export function getTaskRowStyle(): React.CSSProperties {
  return {
    display:      'flex',
    alignItems:   'flex-start',
    gap:          SPACING[2],
    padding:      `${SPACING[2]} ${SPACING[3]}`,
    borderRadius: RADIUS.md,
    transition:   'background-color var(--motion-speed) var(--motion-ease)',
    cursor:       'default',
  }
}

export function getTaskRowHoverStyle(): React.CSSProperties {
  return { backgroundColor: 'var(--color-bg-subtle)' }
}

export function getTaskRowEditStyle(): React.CSSProperties {
  return {
    ...getTaskRowStyle(),
    ...getTaskRowHoverStyle(),
    flexDirection: 'column',
    gap:           SPACING[2],
  }
}

// ─── Edit input ───────────────────────────────────────────────────────────────

export function getTaskEditInputStyle(accentColor: string): React.CSSProperties {
  return {
    width:        '100%',
    boxSizing:    'border-box' as const,
    background:   'var(--color-bg-base)',
    border:       `1px solid ${accentColor}`,
    borderRadius: RADIUS.sm,
    padding:      `${SPACING[1]} ${SPACING[2]}`,
    fontSize:     SIZE.sm,
    color:        COLOR.primary,
    outline:      'none',
  }
}

// ─── New task form input ───────────────────────────────────────────────────────

export function getTaskFormInputStyle(accentColor: string, hasValue: boolean): React.CSSProperties {
  return {
    width:        '100%',
    boxSizing:    'border-box' as const,
    background:   'var(--color-bg-elevated)',
    border:       `1px solid ${hasValue ? accentColor : 'var(--color-border-subtle)'}`,
    borderRadius: RADIUS.sm,
    padding:      `${SPACING[2]} ${SPACING[3]}`,
    fontSize:     SIZE.base,
    color:        COLOR.primary,
    outline:      'none',
    marginBottom: SPACING[3],
  }
}

// ─── Priority group ───────────────────────────────────────────────────────────

export function getTaskPriorityGroupStyle(elevated = false): React.CSSProperties {
  return {
    display:         'flex',
    gap:             SPACING[1],
    padding:         SPACING[1],
    borderRadius:    RADIUS.sm,
    backgroundColor: elevated ? 'var(--color-bg-elevated)' : 'var(--color-bg-base)',
  }
}

export function getTaskPriorityButtonStyle(
  isActive:    boolean,
  accentColor: string,
): React.CSSProperties {
  return {
    padding:         `${SPACING[0]} ${SPACING[2]}`,
    fontSize:        SIZE.xs,
    borderRadius:    RADIUS.xs,
    border:          'none',
    cursor:          'pointer',
    backgroundColor: isActive ? accentColor : 'transparent',
    color:           isActive ? '#fff' : COLOR.muted,
    textTransform:   'capitalize' as const,
  }
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

export function getTaskCancelButtonStyle(): React.CSSProperties {
  return {
    display:      'flex',
    alignItems:   'center',
    padding:      `${SPACING[1]} ${SPACING[2]}`,
    fontSize:     SIZE.xs,
    borderRadius: RADIUS.sm,
    border:       'none',
    cursor:       'pointer',
    background:   'none',
    color:        COLOR.muted,
  }
}

export function getTaskSaveButtonStyle(accentColor: string): React.CSSProperties {
  return {
    display:         'flex',
    alignItems:      'center',
    gap:             SPACING[1],
    padding:         `${SPACING[1]} ${SPACING[3]}`,
    fontSize:        SIZE.xs,
    borderRadius:    RADIUS.sm,
    border:          'none',
    cursor:          'pointer',
    backgroundColor: accentColor,
    color:           '#fff',
  }
}

export function getTaskAddButtonStyle(accentColor: string, disabled: boolean): React.CSSProperties {
  return {
    display:         'flex',
    alignItems:      'center',
    padding:         `5px ${SPACING[4]}`,
    fontSize:        SIZE.xs,
    borderRadius:    RADIUS.sm,
    border:          'none',
    cursor:          'pointer',
    backgroundColor: accentColor,
    color:           '#fff',
    opacity:         disabled ? 0.35 : 1,
  }
}

export function getTaskNewButtonStyle(accentColor: string): React.CSSProperties {
  return {
    display:         'flex',
    alignItems:      'center',
    gap:             SPACING[1],
    fontSize:        SIZE.xs,
    padding:         `5px ${SPACING[3]}`,
    borderRadius:    RADIUS.sm,
    border:          'none',
    cursor:          'pointer',
    backgroundColor: accentColor,
    color:           '#fff',
    marginRight:     SPACING[2],
  }
}

export function getTaskIconButtonStyle(): React.CSSProperties {
  return {
    background: 'none',
    border:     'none',
    cursor:     'pointer',
    color:      COLOR.muted,
    padding:    SPACING[0],
  }
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function getTaskBadgeStyle(accentColor: string): React.CSSProperties {
  return {
    fontSize:        SIZE.xs,
    padding:         `${SPACING[0]} ${SPACING[2]}`,
    borderRadius:    'var(--radius-full)',
    backgroundColor: accentColor,
    color:           '#fff',
    fontWeight:      WEIGHT.medium,
    marginRight:     SPACING[2],
  }
}

// ─── Task content ─────────────────────────────────────────────────────────────

export function getTaskTitleStyle(completed: boolean): React.CSSProperties {
  return {
    fontSize:       SIZE.base,
    color:          completed ? COLOR.muted : COLOR.primary,
    textDecoration: completed ? 'line-through' : 'none',
    overflow:       'hidden',
    textOverflow:   'ellipsis',
    whiteSpace:     'nowrap' as const,
  }
}

export function getTaskMetaRowStyle(): React.CSSProperties {
  return {
    display:    'flex',
    alignItems: 'center',
    gap:        SPACING[1],
    marginTop:  SPACING[0],
  }
}

export function getTaskPriorityDotStyle(color: string): React.CSSProperties {
  return {
    width:           '6px',
    height:          '6px',
    borderRadius:    '50%',
    flexShrink:      0,
    backgroundColor: color,
  }
}

export function getTaskPriorityLabelStyle(color: string): React.CSSProperties {
  return {
    fontSize:      SIZE.xs,
    color,
    textTransform: 'capitalize' as const,
  }
}

export function getTaskDueLabelStyle(): React.CSSProperties {
  return {
    fontSize: SIZE.xs,
    color:    COLOR.muted,
  }
}

// ─── Form container ───────────────────────────────────────────────────────────

export function getTaskFormContainerStyle(): React.CSSProperties {
  return {
    padding:         `${SPACING[4]} ${SPACING[5]}`,
    borderBottom:    '1px solid var(--color-border-subtle)',
    flexShrink:      0,
    backgroundColor: 'var(--color-bg-subtle)',
  }
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export function getTaskTabBarStyle(): React.CSSProperties {
  return {
    display:     'flex',
    borderBottom: '1px solid var(--color-border-subtle)',
    flexShrink:  0,
  }
}

export function getTaskTabStyle(active: boolean, accentColor: string): React.CSSProperties {
  return {
    flex:          1,
    padding:       `${SPACING[2]} 0`,
    fontSize:      SIZE.xs,
    fontWeight:    WEIGHT.medium,
    border:        'none',
    borderBottom:  `2px solid ${active ? accentColor : 'transparent'}`,
    background:    'none',
    cursor:        'pointer',
    color:         active ? COLOR.primary : COLOR.muted,
    textTransform: 'capitalize' as const,
    transition:    'color var(--motion-speed) var(--motion-ease)',
  }
}

// ─── List ─────────────────────────────────────────────────────────────────────

export function getTaskListStyle(): React.CSSProperties {
  return {
    flex:      1,
    overflowY: 'auto' as const,
    padding:   SPACING[2],
  }
}

export function getTaskListInnerStyle(): React.CSSProperties {
  return {
    display:       'flex',
    flexDirection: 'column' as const,
    gap:           SPACING[0],
  }
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export function getTaskEmptyStateStyle(): React.CSSProperties {
  return {
    display:        'flex',
    flexDirection:  'column' as const,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        `${SPACING[12]} 0`,
    color:          COLOR.muted,
  }
}

export function getTaskEmptyLabelStyle(): React.CSSProperties {
  return {
    fontSize: SIZE.sm,
    margin:   0,
  }
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export function getTaskFooterStyle(): React.CSSProperties {
  return {
    padding:         `${SPACING[2]} ${SPACING[5]}`,
    borderTop:       '1px solid var(--color-border-subtle)',
    flexShrink:      0,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'space-between' as const,
  }
}

export function getTaskFooterTextStyle(): React.CSSProperties {
  return {
    fontSize: SIZE.xs,
    color:    COLOR.muted,
  }
}

export function getTaskFooterButtonStyle(): React.CSSProperties {
  return {
    fontSize:   SIZE.xs,
    color:      COLOR.muted,
    background: 'none',
    border:     'none',
    cursor:     'pointer',
  }
}

// ─── Toggle button ────────────────────────────────────────────────────────────

export function getTaskToggleStyle(accentColor: string, completed: boolean): React.CSSProperties {
  return {
    flexShrink: 0,
    background: 'none',
    border:     'none',
    cursor:     'pointer',
    color:      completed ? accentColor : COLOR.muted,
    padding:    0,
    marginTop:  SPACING[0],
  }
}
