/**
 * AIDA Z-Index Layer System
 * Centralized z-index values to prevent stacking conflicts.
 * Higher numbers = closer to user (on top).
 */

export const Z = {
  CLOCK_WIDGET:      10,
  SYSTEM_MONITOR:    20,
  MENU_BAR:          30,
  MENU_HANDLE:       40,
  MENU_DROPDOWN:     50,
  SETTINGS_BACKDROP: 100,
  SETTINGS_PANEL:    101,
} as const
