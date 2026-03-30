// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 3 — GLOBAL: Design Tokens
// AIDA-2 — src/global/tokens.ts
//
// Responsibility:
//   ALL values that are truly global across the entire system.
//   Every surface — apps, panels, widgets, menubar — reads from here.
//   User preferences that affect the whole system are mapped here.
//
// Rules:
//   - If it doesn't apply to EVERY surface — it doesn't belong here
//   - If it's window-type-specific — it belongs in Layer 4 (themes/)
//   - If it's component-specific — it belongs in Layer 4 (themes/)
//   - No hardcoded colours — those are in palette.ts
//   - Maps are used for user preference values so TypeScript enforces
//     valid values at compile time
//
// Sections:
//   1. TYPOGRAPHY   — font sizes, font families, line height
//   2. SPACING      — base unit and scale
//   3. MOTION       — animation duration and easing
//   4. RADIUS       — border radius scale
//   5. INTERACTION  — hover, focus, active states
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings } from '../types/settings'

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════════════════════

// ── Font size map ─────────────────────────────────────────────────────────────
// Maps GlobalSettings.fontSize to a base px value.
// Written as --font-size-base CSS variable by applyGlobal().
// All UI text is sized relative to this — never absolute px values.

// Typography moved to src/global/typography.ts
// FONT_SIZE_MAP, FONT_FAMILIES, LINE_HEIGHT — all in typography.ts

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — SPACING
// ═══════════════════════════════════════════════════════════════════════════════

// ── Base spacing unit ─────────────────────────────────────────────────────────
// All spacing in the system is a multiple of this value.
// Written as --spacing-base CSS variable by applyGlobal().
// Usage: calc(var(--spacing-base) * 4) = 16px at default.

export const SPACING_BASE = '4px'

// ── Spacing scale ─────────────────────────────────────────────────────────────
// Named scale built on the base unit.
// Convention files use these values — never raw px numbers.

export const SPACING = {
  1:  '4px',    // xs  — tight inline gaps
  2:  '8px',    // sm  — compact padding
  3:  '12px',   // md  — standard gaps
  4:  '16px',   // lg  — comfortable padding
  5:  '20px',   // xl  — section spacing
  6:  '24px',   // 2xl — generous padding
  8:  '32px',   // 3xl — large gaps
  10: '40px',   // 4xl — major section breaks
  12: '48px',   // 5xl — page-level spacing
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — MOTION
// ═══════════════════════════════════════════════════════════════════════════════

// ── Animation speed map ───────────────────────────────────────────────────────
// Maps GlobalSettings.animationSpeed to a duration in ms.
// Written as --motion-speed CSS variable by applyGlobal().
// All transitions use this — no hardcoded durations in components.

export const MOTION_SPEED_MAP: Record<GlobalSettings['animationSpeed'], string> = {
  fast:   '100ms',
  normal: '200ms',
  slow:   '400ms',
} as const

// ── Easing ────────────────────────────────────────────────────────────────────
// Standard easing curves used throughout the system.

export const EASING = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',  // material standard — smooth in/out
  enter:    'cubic-bezier(0.0, 0, 0.2, 1)',   // decelerate — things arriving
  exit:     'cubic-bezier(0.4, 0, 1, 1)',     // accelerate — things leaving
  sharp:    'cubic-bezier(0.4, 0, 0.6, 1)',   // quick, decisive movements
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — RADIUS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Border radius scale ───────────────────────────────────────────────────────
// Written as CSS variables by applyGlobal().
// Convention files use these — never raw px values for border-radius.

export const RADIUS = {
  none: '0px',
  xs:   '3px',    // subtle rounding — icons, small chips
  sm:   '6px',    // buttons, inputs, small cards
  md:   '8px',    // standard cards, dropdowns
  lg:   '12px',   // panels, app windows, large cards
  xl:   '16px',   // modals, large surfaces
  full: '9999px', // pills, tags, circular buttons
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — INTERACTION
// ═══════════════════════════════════════════════════════════════════════════════

// ── Hover, active, disabled, focus ───────────────────────────────────────────
// Consistent interaction feedback across all interactive elements.
// Convention files apply these — components never define their own.

export const INTERACTION = {
  hoverOpacity:    0.75,    // opacity of elements on hover
  activeScale:     0.97,    // scale transform on press/click
  disabledOpacity: 0.35,    // opacity of disabled elements

  focusRingWidth:  '2px',
  focusRingOffset: '2px',
  // Focus ring colour comes from accent — never hardcoded here

  // Overlay backgrounds for hover states (applied as background-color)
  hoverOverlayLight: 'rgba(255, 255, 255, 0.06)',
  hoverOverlayDark:  'rgba(0, 0, 0, 0.06)',
} as const

// ── Z-index scale ─────────────────────────────────────────────────────────────
// Centralised z-index system. Every layer of the UI has a named slot.
// Nothing uses a raw z-index number anywhere in the codebase.

export const Z = {
  WIDGET:        10,   // desktop widgets — below everything interactive
  MENUBAR:       20,   // the AIDA pull-down bar
  APP:           30,   // app windows (File Decks, Tasks, AIDA Chat)
  PANEL:         40,   // settings panels
  MENU_DROPDOWN: 50,   // dropdowns within the menubar surface
  TOAST:         60,   // toast notifications — always on top
  CONTEXT_MENU:  70,   // context menus — above everything
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSPARENCY UTILITY
// ═══════════════════════════════════════════════════════════════════════════════

// ── alphaFromTransparency ────────────────────────────────────────────────────
// Converts the 0–100 transparency slider value to a CSS alpha (0.0–1.0).
// Rule: 0 = fully solid, 100 = fully invisible. Always. No exceptions.
// Use this everywhere transparency is needed — never invert the logic locally.

export function alphaFromTransparency(transparency: number): number {
  return 1 - Math.max(0, Math.min(100, transparency)) / 100
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOUR UTILITIES
// Helper functions for deriving colours from a base value.
// Used by convention files — never by components directly.
// ═══════════════════════════════════════════════════════════════════════════════

// ── getDarkerAccent ───────────────────────────────────────────────────────────
// Returns a darkened version of the given hex colour.
// amount: 0–100 — how much to darken (default 20)
// Used for hover states on accent-coloured controls.

export function getDarkerAccent(hex: string, amount = 20): string {
  const clean = hex.replace('#', '')
  const r = Math.max(0, parseInt(clean.slice(0, 2), 16) - amount)
  const g = Math.max(0, parseInt(clean.slice(2, 4), 16) - amount)
  const b = Math.max(0, parseInt(clean.slice(4, 6), 16) - amount)
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

// ── getLighterAccent ──────────────────────────────────────────────────────────
// Returns a lightened version of the given hex colour.
// Reserved for future use — focus rings, active states.

export function getLighterAccent(hex: string, amount = 20): string {
  const clean = hex.replace('#', '')
  const r = Math.min(255, parseInt(clean.slice(0, 2), 16) + amount)
  const g = Math.min(255, parseInt(clean.slice(2, 4), 16) + amount)
  const b = Math.min(255, parseInt(clean.slice(4, 6), 16) + amount)
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

