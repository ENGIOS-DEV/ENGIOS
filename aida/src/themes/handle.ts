// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4 — THEME: Handle Convention File
// AIDA-2 — src/themes/handle.ts
//
// Responsibility:
//   Complete style specification for the AIDA handle pill.
//   The handle is its own surface type — always visible, always on top,
//   fixed at the top-centre of the screen.
//
// The handle is NOT part of the menubar surface.
// It lives in its own Electron window. It has its own theme file.
//
// Rules:
//   - Imports from src/global/ only — never defines its own global values
//   - No hardcoded colours — always from palette or tokens
//   - No hardcoded sizes — always from named constants
//   - Components import from here — never from src/global/ directly
//
// Anatomy of the pill:
//   [ • · ● ]   three dots — left dim, centre mid, right accent
//   The pill sits flush with the top screen edge, rounded bottom corners only.
//   Background shifts slightly on open/hover to signal state.
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings } from '../types/settings'
import { COLOR } from '../global/typography'
import { getPalette, getAccent } from '../global/palette'
import { MOTION_SPEED_MAP, EASING, SPACING } from '../global/tokens'

// ═══════════════════════════════════════════════════════════════════════════════
// DIMENSIONS
// Mirrored in electron/main.cjs — must stay in sync if changed.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Dimensions — single source of truth is handle.dimensions.json ───────────
// JSON is the one place dimensions are defined.
// handle.constants.cjs reads it for electron/main.cjs.
// This file imports it directly via Vite's native JSON support.
// ONE change to handle.dimensions.json updates both Electron and React.

import dims from './handle.dimensions.json'

export const HANDLE_DIMENSIONS = {
  width:  dims.width  as number,
  height: dims.height as number,
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const HANDLE = {
  paddingX:     SPACING[4],        // 16px — comfortable padding
  paddingY:     SPACING[1],        // 4px  — tight top/bottom
  gap:          SPACING[2],        // 8px  — dot spacing
  borderRadius: '0 0 12px 12px',  // top flush with screen edge — visual shape, not spacing
  dotSize:      6,                 // px   — visual dot size, not a spacing value
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Pill container ────────────────────────────────────────────────────────────
// Background uses palette border tokens — subtle when closed,
// slightly more opaque when open or hovered.

export function getHandleStyle(
  settings:   GlobalSettings,
  isActive:   boolean,           // true when menu is open OR pill is hovered
): React.CSSProperties {
  const p = getPalette(settings)
  return {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             HANDLE.gap,
    padding:         `${HANDLE.paddingY} ${HANDLE.paddingX}`,
    borderRadius:    HANDLE.borderRadius,
    backgroundColor: isActive ? p.borderStrong : p.borderSubtle,
    border:          'none',
    userSelect:      'none',
    transition:      `background-color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
    width:           '100%',
    height:          '100%',
  } as React.CSSProperties
}

// ── Dot ───────────────────────────────────────────────────────────────────────
// Individual dot within the pill. Colour is passed by the component
// based on position and alert state.

export function getDotStyle(
  size:     number,
  color:    string,
  settings: GlobalSettings,
): React.CSSProperties {
  return {
    width:           `${size}px`,
    height:          `${size}px`,
    borderRadius:    '50%',
    backgroundColor: color,
    flexShrink:      0,
    transition:      `background-color ${MOTION_SPEED_MAP[settings.animationSpeed]} ${EASING.standard}`,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOT COLOUR HELPERS
// Named colour functions — components never define dot colours inline.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Breathing animation ───────────────────────────────────────────────────────
// Applied on hover. Keyframe defined in src/index.css.
// Returns a style object — Handle.tsx spreads this when hovered.

// Breathing cycle duration scales with the user's animationSpeed setting.
// Cycle is 12× the base motion speed — slow enough to feel organic.
const BREATHING_MULTIPLIER = 12

const BREATHING_DURATION: Record<GlobalSettings['animationSpeed'], string> = {
  fast:   `${parseInt(MOTION_SPEED_MAP.fast)   * BREATHING_MULTIPLIER}ms`,
  normal: `${parseInt(MOTION_SPEED_MAP.normal) * BREATHING_MULTIPLIER}ms`,
  slow:   `${parseInt(MOTION_SPEED_MAP.slow)   * BREATHING_MULTIPLIER}ms`,
}

export function getHandleBreathingStyle(settings: GlobalSettings): React.CSSProperties {
  return {
    animation: `handle-breathe ${BREATHING_DURATION[settings.animationSpeed]} ${EASING.standard} infinite`,
  }
}

export function getDotColorDim(settings: GlobalSettings): string {
  const p = getPalette(settings)
  return p.borderStrong   // subtle — inactive left dot
}

export function getDotColorCenter(settings: GlobalSettings): string {
  const p = getPalette(settings)
  return COLOR.muted      // mid-brightness — always centre dot
}

export function getDotColorAccent(settings: GlobalSettings): string {
  return getAccent(settings)  // accent — right dot, always brand colour
}
