// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 3 — GLOBAL: Typography
// AIDA-2 — src/global/typography.ts
//
// Responsibility:
//   Single source of truth for ALL typography in AIDA / ENGIOS.
//   Every font family, size, weight, colour, and named text role lives here.
//   Nothing typography-related is defined anywhere else in the codebase.
//
// Usage:
//   import { HEADING, SYS_WARNING, OVERLINE } from '../global/typography'
//   style={{ ...HEADING }}
//
// Searching:
//   Search 'SUBHEADING'   → find the subheading role
//   Search 'SYS_WARNING'  → find the system warning role
//   Search 'PLACEHOLDER'  → find the placeholder role
//   Search 'SECTION 4'    → find all system roles
//
// Rules:
//   - No typography defined anywhere else — ever
//   - Convention files import roles directly — no hardcoded values
//   - Adding a new role: add it here, export it, done
//   - Changing a font/size/weight: change it here, updates everywhere
//
// Sections:
//   1. FAMILIES     — font stacks
//   2. SCALE        — sizes, weights, line heights, tracking
//   3. COLOURS      — text colour roles (moved from palette.ts)
//   4. UI ROLES     — heading, subheading, body, label, caption, overline
//   5. SYSTEM ROLES — info, success, warning, error, critical
//   6. INPUT ROLES  — input, placeholder, helper, disabled
//   7. CODE ROLES   — code, terminal, clock
//   8. SPECIAL ROLES— tooltip, badge, tag, shortcut
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings } from '../types/settings'

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — FAMILIES
// The three AIDA/ENGIOS brand fonts.
// Archivo Black is reserved for the ENGIOS logo only — never used in UI.
// ═══════════════════════════════════════════════════════════════════════════════

export const FAMILIES = {
  main:    "'Inter', system-ui, sans-serif",       // UI body — labels, inputs, body text
  display: "'Nunito', system-ui, sans-serif",      // headings, titles, display text
  mono:    "'DM Mono', ui-monospace, monospace",   // code, terminal, clock, numeric
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — SCALE
// Base values. All roles are built from these — never use raw values in roles.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Font sizes ────────────────────────────────────────────────────────────────

export const SIZE = {
  xs:   '11px',   // captions, badges, shortcuts
  sm:   '13px',   // labels, helpers, small body
  md:   '15px',   // standard body text
  lg:   '17px',   // subheadings, emphasis
  xl:   '20px',   // headings
  xxl:  '24px',   // large headings, display
  hero: '32px',   // clock, hero display values
} as const

// ── Font size map — user preference ──────────────────────────────────────────
// Maps GlobalSettings.fontSize to the base size used across the UI.
// sm = SIZE.sm, md = SIZE.md, lg = SIZE.lg

export const FONT_SIZE_MAP: Record<GlobalSettings['fontSize'], string> = {
  small:  SIZE.sm,
  medium: SIZE.md,
  large:  SIZE.lg,
} as const

// ── Weights ───────────────────────────────────────────────────────────────────

export const WEIGHT = {
  light:    300,
  regular:  400,
  medium:   500,
  semibold: 600,
  bold:     700,
} as const

// ── Line heights ──────────────────────────────────────────────────────────────

export const LINE_HEIGHT = {
  tight:   1.2,
  normal:  1.5,
  relaxed: 1.8,
} as const

// ── Letter spacing ────────────────────────────────────────────────────────────

export const TRACKING = {
  tight:  '-0.02em',
  normal: '0em',
  wide:   '0.04em',
  wider:  '0.08em',   // uppercase labels, overlines
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — COLOURS
// ALL text colours live here. palette.ts handles backgrounds and borders only.
// These are the DARK theme values. Light theme overrides defined at the bottom.
// ═══════════════════════════════════════════════════════════════════════════════

export const COLOR = {
  // ── Standard text hierarchy ────────────────────────────────────────────────
  primary:   '#CFCFD0',   // headings, active labels, primary content — near white
  secondary: '#A8B3C4',   // body text, inactive labels — blue-grey mid
  muted:     '#606B7A',   // hints, placeholders, disabled — darker blue-grey

  // ── System message colours ─────────────────────────────────────────────────
  info:     '#60A5FA',    // blue   — informational messages
  success:  '#4ADE80',    // green  — confirmations, success states
  warning:  '#FBBF24',    // amber  — warnings, caution
  error:    '#F87171',    // red    — errors, problems
  critical: '#FF3B30',    // bright red — critical errors, emergencies

  // ── Input colours ──────────────────────────────────────────────────────────
  input:       '#F5F5F5',  // user-typed text — same as primary
  placeholder: '#606B7A',  // placeholder text — same as muted
  helper:      '#A8B3C4',  // helper/hint text below inputs
  disabled:    '#3D4550',  // disabled text — very dim

  // ── Code colours ───────────────────────────────────────────────────────────
  code:     '#E2B96F',    // inline code — warm amber
  terminal: '#4ADE80',    // terminal output — green
  clock:    '#F5F5F5',    // clock/numeric display — same as primary

  // ── Special colours ────────────────────────────────────────────────────────
  onAccent: '#ffffff',    // text/icons rendered ON an accent-coloured surface
  tooltip:  '#F5F5F5',    // tooltip text
  badge:    '#F5F5F5',    // badge/counter text
  tag:      '#A8B3C4',    // tag/chip text
  shortcut: '#606B7A',    // keyboard shortcut labels
} as const

// ── Light theme overrides ─────────────────────────────────────────────────────

export const COLOR_LIGHT = {
  primary:   '#0D1117',
  secondary: '#3D4550',
  muted:     '#8B95A1',
  input:     '#0D1117',
  placeholder: '#8B95A1',
  helper:    '#3D4550',
  disabled:  '#C4CBD4',
  tag:       '#3D4550',
  shortcut:  '#8B95A1',
} as const

// ── Helper — get correct colour set for current theme ─────────────────────────

export function getTextColors(settings: GlobalSettings) {
  return settings.theme === 'dark' ? COLOR : { ...COLOR, ...COLOR_LIGHT }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — UI ROLES
// Standard interface text roles. Used across all windows.
// ═══════════════════════════════════════════════════════════════════════════════

// ── HEADING ───────────────────────────────────────────────────────────────────
// Window titles, panel titles, major section names.

export const HEADING = {
  fontFamily:    FAMILIES.display,
  fontSize:      SIZE.xl,
  fontWeight:    WEIGHT.bold,
  lineHeight:    LINE_HEIGHT.tight,
  letterSpacing: TRACKING.tight,
  color:         COLOR.primary,
} as const

// ── SUBHEADING ────────────────────────────────────────────────────────────────
// Sub-section titles, card headers, group labels.

export const SUBHEADING = {
  fontFamily:    FAMILIES.display,
  fontSize:      SIZE.lg,
  fontWeight:    WEIGHT.semibold,
  lineHeight:    LINE_HEIGHT.tight,
  letterSpacing: TRACKING.normal,
  color:         COLOR.primary,
} as const

// ── BODY ──────────────────────────────────────────────────────────────────────
// Standard body text. The default for most readable content.

export const BODY = {
  fontFamily:    FAMILIES.main,
  fontSize:      SIZE.md,
  fontWeight:    WEIGHT.regular,
  lineHeight:    LINE_HEIGHT.normal,
  letterSpacing: TRACKING.normal,
  color:         COLOR.secondary,
} as const

// ── LABEL ─────────────────────────────────────────────────────────────────────
// Form labels, button text, nav items, list items.

export const LABEL = {
  fontFamily:    FAMILIES.main,
  fontSize:      SIZE.sm,
  fontWeight:    WEIGHT.medium,
  lineHeight:    LINE_HEIGHT.tight,
  letterSpacing: TRACKING.normal,
  color:         COLOR.secondary,
} as const

// ── CAPTION ───────────────────────────────────────────────────────────────────
// Small supporting text — file sizes, dates, counts.

export const CAPTION = {
  fontFamily:    FAMILIES.main,
  fontSize:      SIZE.xs,
  fontWeight:    WEIGHT.regular,
  lineHeight:    LINE_HEIGHT.normal,
  letterSpacing: TRACKING.normal,
  color:         COLOR.muted,
} as const

// ── OVERLINE ──────────────────────────────────────────────────────────────────
// Uppercase category labels — "NOTIFICATIONS", "QUICK ACTIONS", section headers.

export const OVERLINE = {
  fontFamily:    FAMILIES.main,
  fontSize:      SIZE.md,
  fontWeight:    WEIGHT.regular,
  lineHeight:    LINE_HEIGHT.tight,
  letterSpacing: TRACKING.wider,
  textTransform: 'uppercase' as const,
  color:         COLOR.primary,
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — SYSTEM ROLES
// OS-level communication — messages, alerts, status indicators.
// ═══════════════════════════════════════════════════════════════════════════════

// ── SYS_INFO ──────────────────────────────────────────────────────────────────
// General informational system messages.

export const SYS_INFO = {
  fontFamily:    FAMILIES.main,
  fontSize:      SIZE.sm,
  fontWeight:    WEIGHT.regular,
  lineHeight:    LINE_HEIGHT.normal,
  letterSpacing: TRACKING.normal,
  color:         COLOR.info,
} as const

// ── SYS_SUCCESS ───────────────────────────────────────────────────────────────
// Confirmations — saved, connected, completed.

export const SYS_SUCCESS = {
  fontFamily:    FAMILIES.main,
  fontSize:      SIZE.sm,
  fontWeight:    WEIGHT.medium,
  lineHeight:    LINE_HEIGHT.normal,
  letterSpacing: TRACKING.normal,
  color:         COLOR.success,
} as const

// ── SYS_WARNING ───────────────────────────────────────────────────────────────
// Caution states — low disk, high CPU, slow network.

export const SYS_WARNING = {
  fontFamily:    FAMILIES.main,
  fontSize:      SIZE.sm,
  fontWeight:    WEIGHT.medium,
  lineHeight:    LINE_HEIGHT.normal,
  letterSpacing: TRACKING.normal,
  color:         COLOR.warning,
} as const

// ── SYS_ERROR ─────────────────────────────────────────────────────────────────
// Error states — failed operations, connection errors.

export const SYS_ERROR = {
  fontFamily:    FAMILIES.main,
  fontSize:      SIZE.sm,
  fontWeight:    WEIGHT.semibold,
  lineHeight:    LINE_HEIGHT.normal,
  letterSpacing: TRACKING.normal,
  color:         COLOR.error,
} as const

// ── SYS_CRITICAL ──────────────────────────────────────────────────────────────
// Critical system errors — requires immediate attention.

export const SYS_CRITICAL = {
  fontFamily:    FAMILIES.display,
  fontSize:      SIZE.md,
  fontWeight:    WEIGHT.bold,
  lineHeight:    LINE_HEIGHT.tight,
  letterSpacing: TRACKING.wide,
  textTransform: 'uppercase' as const,
  color:         COLOR.critical,
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6 — INPUT ROLES
// Text within form controls and interactive inputs.
// ═══════════════════════════════════════════════════════════════════════════════

// ── INPUT ─────────────────────────────────────────────────────────────────────
// Text the user types into fields, search bars, text areas.

export const INPUT = {
  fontFamily:    FAMILIES.main,
  fontSize:      SIZE.sm,
  fontWeight:    WEIGHT.regular,
  lineHeight:    LINE_HEIGHT.normal,
  letterSpacing: TRACKING.normal,
  color:         COLOR.input,
} as const

// ── PLACEHOLDER ───────────────────────────────────────────────────────────────
// Ghost text shown when an input is empty.

export const PLACEHOLDER = {
  fontFamily:    FAMILIES.main,
  fontSize:      SIZE.sm,
  fontWeight:    WEIGHT.regular,
  lineHeight:    LINE_HEIGHT.normal,
  letterSpacing: TRACKING.normal,
  color:         COLOR.placeholder,
} as const

// ── HELPER ────────────────────────────────────────────────────────────────────
// Hint text below inputs — format guidance, character counts.

export const HELPER = {
  fontFamily:    FAMILIES.main,
  fontSize:      SIZE.xs,
  fontWeight:    WEIGHT.regular,
  lineHeight:    LINE_HEIGHT.normal,
  letterSpacing: TRACKING.normal,
  color:         COLOR.helper,
} as const

// ── DISABLED ──────────────────────────────────────────────────────────────────
// Text in disabled inputs and inactive controls.

export const DISABLED = {
  fontFamily:    FAMILIES.main,
  fontSize:      SIZE.sm,
  fontWeight:    WEIGHT.regular,
  lineHeight:    LINE_HEIGHT.normal,
  letterSpacing: TRACKING.normal,
  color:         COLOR.disabled,
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7 — CODE ROLES
// Monospaced text for technical content.
// ═══════════════════════════════════════════════════════════════════════════════

// ── CODE ──────────────────────────────────────────────────────────────────────
// Inline code snippets within body text.

export const CODE = {
  fontFamily:    FAMILIES.mono,
  fontSize:      SIZE.sm,
  fontWeight:    WEIGHT.regular,
  lineHeight:    LINE_HEIGHT.normal,
  letterSpacing: TRACKING.normal,
  color:         COLOR.code,
} as const

// ── TERMINAL ──────────────────────────────────────────────────────────────────
// Terminal/shell output text.

export const TERMINAL = {
  fontFamily:    FAMILIES.mono,
  fontSize:      SIZE.sm,
  fontWeight:    WEIGHT.regular,
  lineHeight:    LINE_HEIGHT.relaxed,
  letterSpacing: TRACKING.normal,
  color:         COLOR.terminal,
} as const

// ── CLOCK ─────────────────────────────────────────────────────────────────────
// Clock, timer, and large numeric display values.

export const CLOCK = {
  fontFamily:    FAMILIES.mono,
  fontSize:      SIZE.hero,
  fontWeight:    WEIGHT.bold,
  lineHeight:    LINE_HEIGHT.tight,
  letterSpacing: TRACKING.tight,
  color:         COLOR.clock,
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8 — SPECIAL ROLES
// ═══════════════════════════════════════════════════════════════════════════════

// ── TOOLTIP ───────────────────────────────────────────────────────────────────
// Hover tooltips and contextual help text.

export const TOOLTIP = {
  fontFamily:    FAMILIES.main,
  fontSize:      SIZE.xs,
  fontWeight:    WEIGHT.regular,
  lineHeight:    LINE_HEIGHT.tight,
  letterSpacing: TRACKING.normal,
  color:         COLOR.tooltip,
} as const

// ── BADGE ─────────────────────────────────────────────────────────────────────
// Notification counts, status badges.

export const BADGE = {
  fontFamily:    FAMILIES.mono,
  fontSize:      SIZE.xs,
  fontWeight:    WEIGHT.bold,
  lineHeight:    LINE_HEIGHT.tight,
  letterSpacing: TRACKING.normal,
  color:         COLOR.badge,
} as const

// ── TAG ───────────────────────────────────────────────────────────────────────
// Tags, chips, category labels.

export const TAG = {
  fontFamily:    FAMILIES.main,
  fontSize:      SIZE.xs,
  fontWeight:    WEIGHT.medium,
  lineHeight:    LINE_HEIGHT.tight,
  letterSpacing: TRACKING.normal,
  color:         COLOR.tag,
} as const

// ── SHORTCUT ──────────────────────────────────────────────────────────────────
// Keyboard shortcut labels — ⌘K, Ctrl+S, etc.

export const SHORTCUT = {
  fontFamily:    FAMILIES.mono,
  fontSize:      SIZE.xs,
  fontWeight:    WEIGHT.medium,
  lineHeight:    LINE_HEIGHT.tight,
  letterSpacing: TRACKING.normal,
  color:         COLOR.shortcut,
} as const
