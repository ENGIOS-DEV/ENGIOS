// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4 — THEME: Shared Picker Styles
// AIDA-2 — src/themes/app/pickers.ts
//
// DatePicker, TimePicker, FloatyMenu, RepeatPicker — shared across all apps.
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings } from '../../types/settings'
import { getPalette, getAccent } from '../../global/palette'
import { FONT_SIZE_MAP, COLOR, SIZE, WEIGHT } from '../../global/typography'
import { SPACING, RADIUS, MOTION_SPEED_MAP, EASING, INTERACTION, getDarkerAccent, Z } from '../../global/tokens'

export const DATE_PICKER = {
  cellSize:    32,    // px — day cell width & height
  headerH:     36,    // px — month/year header height
  gridGap:      4,    // px — gap between cells
  borderRadius: RADIUS.lg,
  popupW:      256,   // px
} as const

export function getDatePickerHeaderStyle(): React.CSSProperties {
  return {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   SPACING[2],
    height:         `${DATE_PICKER.headerH}px`,
  }
}

export function getDatePickerNavButtonStyle(): React.CSSProperties {
  return {
    background:   'none',
    border:       'none',
    cursor:       'pointer',
    color:        COLOR.secondary,
    display:      'flex',
    alignItems:   'center',
    padding:      `0 ${SPACING[1]}`,
    borderRadius: RADIUS.sm,
    transition:   'color 0.15s',
  }
}

export function getDatePickerMonthLabelStyle(): React.CSSProperties {
  return {
    fontSize:   SIZE.sm,
    fontWeight: WEIGHT.semibold,
    color:      COLOR.primary,
    cursor:     'pointer',
  }
}

export function getDatePickerWeekdayStyle(): React.CSSProperties {
  return {
    fontSize:   SIZE.xs,
    fontWeight: WEIGHT.medium,
    color:      COLOR.muted,
    textAlign:  'center' as const,
    width:      `${DATE_PICKER.cellSize}px`,
    height:     `${DATE_PICKER.cellSize}px`,
    display:    'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}

export function getDatePickerCellStyle(
  isToday:    boolean,
  isSelected: boolean,
  isOtherMonth: boolean,
  accentColor: string,
): React.CSSProperties {
  return {
    width:           `${DATE_PICKER.cellSize}px`,
    height:          `${DATE_PICKER.cellSize}px`,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    borderRadius:    RADIUS.md,
    fontSize:        SIZE.sm,
    cursor:          'pointer',
    border:          'none',
    backgroundColor: isSelected ? accentColor : 'transparent',
    color:           isSelected ? '#ffffff'
                   : isToday   ? accentColor
                   : isOtherMonth ? COLOR.muted
                   : COLOR.secondary,
    fontWeight:      isSelected || isToday ? WEIGHT.semibold : WEIGHT.regular,
    transition:      'background-color 0.1s',
  }
}

export function getDatePickerFooterStyle(): React.CSSProperties {
  return {
    display:      'flex',
    justifyContent: 'space-between',
    marginTop:    SPACING[2],
    paddingTop:   SPACING[2],
    borderTop:    '1px solid var(--color-border-subtle)',
  }
}

export function getDatePickerFooterButtonStyle(): React.CSSProperties {
  return {
    background:   'none',
    border:       'none',
    cursor:       'pointer',
    fontSize:     SIZE.xs,
    color:        COLOR.info,
    padding:      `${SPACING[1]} ${SPACING[2]}`,
    borderRadius: RADIUS.sm,
  }
}

export function getDatePickerTriggerStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:         'flex',
    alignItems:      'center',
    gap:             SPACING[1],
    padding:         `${SPACING[1]} ${SPACING[2]}`,
    fontSize:        FONT_SIZE_MAP[settings.fontSize],
    color:           COLOR.secondary,
    backgroundColor: p.backgroundSubtle,
    border:          `1px solid ${p.borderSubtle}`,
    borderRadius:    RADIUS.sm,
    cursor:          'pointer',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIME PICKER
// Shared custom time picker styles — used across all app windows.
// ═══════════════════════════════════════════════════════════════════════════════

export const TIME_PICKER = {
  columnW: 56,    // px — width of each scroll column
  rowH:    32,    // px — height of each time row
  visibleRows: 5, // how many rows visible at once
} as const

export function getTimePickerColumnStyle(): React.CSSProperties {
  return {
    display:   'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    height:    `${TIME_PICKER.rowH * TIME_PICKER.visibleRows}px`,
    scrollbarWidth: 'none',
  }
}

export function getTimePickerRowStyle(
  isSelected: boolean,
  isHovered:  boolean,
  accentColor: string,
): React.CSSProperties {
  return {
    height:          `${TIME_PICKER.rowH}px`,
    minHeight:       `${TIME_PICKER.rowH}px`,
    width:           `${TIME_PICKER.columnW}px`,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    borderRadius:    RADIUS.md,
    fontSize:        SIZE.sm,
    fontWeight:      isSelected ? WEIGHT.semibold : WEIGHT.regular,
    cursor:          'pointer',
    border:          'none',
    backgroundColor: isSelected ? accentColor
                   : isHovered  ? 'var(--color-bg-elevated)'
                   : 'transparent',
    color:           isSelected ? '#ffffff' : COLOR.secondary,
    transition:      'background-color 0.1s',
  }
}

export function getTimePickerSeparatorStyle(): React.CSSProperties {
  return {
    fontSize:   SIZE.lg,
    fontWeight: WEIGHT.bold,
    color:      COLOR.muted,
    display:    'flex',
    alignItems: 'center',
    paddingBottom: SPACING[1],
  }
}

export function getTimePickerHeaderStyle(): React.CSSProperties {
  return {
    fontSize:   SIZE.xs,
    fontWeight: WEIGHT.medium,
    color:      COLOR.muted,
    textAlign:  'center' as const,
    width:      `${TIME_PICKER.columnW}px`,
  }
}

export function getTimePickerTriggerStyle(settings: GlobalSettings): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:         'flex',
    alignItems:      'center',
    gap:             SPACING[1],
    padding:         `${SPACING[1]} ${SPACING[2]}`,
    fontSize:        FONT_SIZE_MAP[settings.fontSize],
    color:           COLOR.secondary,
    backgroundColor: p.backgroundSubtle,
    border:          `1px solid ${p.borderSubtle}`,
    borderRadius:    RADIUS.sm,
    cursor:          'pointer',
    fontVariantNumeric: 'tabular-nums',
  }
}

export function getTimePickerFooterStyle(): React.CSSProperties {
  return {
    display:        'flex',
    justifyContent: 'space-between',
    paddingTop:     SPACING[2],
    borderTop:      '1px solid var(--color-border-subtle)',
  }
}

export function getTimePickerFooterButtonStyle(): React.CSSProperties {
  return {
    background:   'none',
    border:       'none',
    cursor:       'pointer',
    fontSize:     SIZE.xs,
    color:        COLOR.info,
    padding:      `${SPACING[1]} ${SPACING[2]}`,
    borderRadius: RADIUS.sm,
  }
}

// ─── FloatyMenu ───────────────────────────────────────────────────────────────

export function getFloatyMenuStyle(top: number, left: number): React.CSSProperties {
  return {
    position:        'fixed',
    top,
    left,
    backgroundColor: 'var(--color-bg-subtle)',
    borderRadius:    RADIUS.lg,
    padding:         SPACING[1],
    zIndex:          Z.MENU_DROPDOWN,
    boxShadow:       '0 8px 32px rgba(0,0,0,0.4)',
  }
}

// ─── RepeatPicker ─────────────────────────────────────────────────────────────

export function getRepeatPickerOptionStyle(
  isSelected:  boolean,
  accentColor: string,
): React.CSSProperties {
  return {
    padding:         `${SPACING[1]} ${SPACING[3]}`,
    borderRadius:    RADIUS.md,
    backgroundColor: isSelected ? accentColor : 'transparent',
    color:           isSelected ? '#ffffff' : COLOR.secondary,
    border:          'none',
    cursor:          'pointer',
    fontSize:        SIZE.sm,
    fontWeight:      isSelected ? WEIGHT.semibold : WEIGHT.regular,
    textAlign:       'center' as const,
    width:           '100%',
    transition:      'background-color 0.1s',
  }
}
