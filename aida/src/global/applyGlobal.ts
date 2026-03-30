// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 3 — GLOBAL: Apply Global
// AIDA-2 — src/global/applyGlobal.ts
//
// Responsibility:
//   Writes ALL global tokens as CSS custom properties on :root.
//   This is the ONLY place CSS variables are written in the entire system.
//   Called once per window via useGlobal() whenever settings change.
//
// Sources:
//   typography.ts → all text colours, families, sizes
//   palette.ts    → background colours, border colours, accent
//   tokens.ts     → spacing, motion, radius, interaction, z-index
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings } from '../types/settings'
import { getPalette, getAccent } from './palette'
import { FAMILIES, SIZE, FONT_SIZE_MAP, LINE_HEIGHT, COLOR, COLOR_LIGHT } from './typography'
import {
  SPACING_BASE,
  SPACING,
  MOTION_SPEED_MAP,
  EASING,
  RADIUS,
  INTERACTION,
  Z,
} from './tokens'

export function applyGlobal(settings: GlobalSettings): void {
  const el = document.documentElement
  const p  = getPalette(settings)
  const tc = settings.theme === 'dark' ? COLOR : { ...COLOR, ...COLOR_LIGHT }

  // ── Background & border colours ────────────────────────────────────────────
  el.style.setProperty('--color-bg-base',       p.backgroundBase)
  el.style.setProperty('--color-bg-elevated',   p.backgroundElevated)
  el.style.setProperty('--color-bg-subtle',     p.backgroundSubtle)
  el.style.setProperty('--color-border-subtle', p.borderSubtle)
  el.style.setProperty('--color-border-strong', p.borderStrong)
  el.style.setProperty('--color-accent',        getAccent(settings))

  // ── Text colours — from typography.ts ─────────────────────────────────────
  el.style.setProperty('--color-text-primary',   tc.primary)
  el.style.setProperty('--color-text-secondary', tc.secondary)
  el.style.setProperty('--color-text-muted',     tc.muted)
  el.style.setProperty('--color-text-info',      tc.info)
  el.style.setProperty('--color-text-success',   tc.success)
  el.style.setProperty('--color-text-warning',   tc.warning)
  el.style.setProperty('--color-text-error',     tc.error)
  el.style.setProperty('--color-text-critical',  tc.critical)
  el.style.setProperty('--color-text-disabled',  tc.disabled)
  el.style.setProperty('--color-text-code',      tc.code)
  el.style.setProperty('--color-text-terminal',  tc.terminal)

  // ── Font families — from typography.ts ─────────────────────────────────────
  el.style.setProperty('--font-family-main',    FAMILIES.main)
  el.style.setProperty('--font-family-display', FAMILIES.display)
  el.style.setProperty('--font-family-mono',    FAMILIES.mono)

  // ── Font sizes — from typography.ts ────────────────────────────────────────
  el.style.setProperty('--font-size-base',  FONT_SIZE_MAP[settings.fontSize])
  el.style.setProperty('--font-size-xs',    SIZE.xs)
  el.style.setProperty('--font-size-sm',    SIZE.sm)
  el.style.setProperty('--font-size-md',    SIZE.md)
  el.style.setProperty('--font-size-lg',    SIZE.lg)
  el.style.setProperty('--font-size-xl',    SIZE.xl)
  el.style.setProperty('--font-size-xxl',   SIZE.xxl)
  el.style.setProperty('--font-size-hero',  SIZE.hero)

  // ── Line heights — from typography.ts ──────────────────────────────────────
  el.style.setProperty('--line-height-tight',   String(LINE_HEIGHT.tight))
  el.style.setProperty('--line-height-normal',  String(LINE_HEIGHT.normal))
  el.style.setProperty('--line-height-relaxed', String(LINE_HEIGHT.relaxed))

  // ── Spacing ────────────────────────────────────────────────────────────────
  el.style.setProperty('--spacing-base', SPACING_BASE)
  el.style.setProperty('--spacing-1',    SPACING[1])
  el.style.setProperty('--spacing-2',    SPACING[2])
  el.style.setProperty('--spacing-3',    SPACING[3])
  el.style.setProperty('--spacing-4',    SPACING[4])
  el.style.setProperty('--spacing-5',    SPACING[5])
  el.style.setProperty('--spacing-6',    SPACING[6])
  el.style.setProperty('--spacing-8',    SPACING[8])
  el.style.setProperty('--spacing-10',   SPACING[10])
  el.style.setProperty('--spacing-12',   SPACING[12])

  // ── Motion ─────────────────────────────────────────────────────────────────
  el.style.setProperty('--motion-speed',  MOTION_SPEED_MAP[settings.animationSpeed])
  el.style.setProperty('--motion-ease',   EASING.standard)
  el.style.setProperty('--motion-enter',  EASING.enter)
  el.style.setProperty('--motion-exit',   EASING.exit)
  el.style.setProperty('--motion-sharp',  EASING.sharp)

  // ── Radius ─────────────────────────────────────────────────────────────────
  el.style.setProperty('--radius-none', RADIUS.none)
  el.style.setProperty('--radius-xs',   RADIUS.xs)
  el.style.setProperty('--radius-sm',   RADIUS.sm)
  el.style.setProperty('--radius-md',   RADIUS.md)
  el.style.setProperty('--radius-lg',   RADIUS.lg)
  el.style.setProperty('--radius-xl',   RADIUS.xl)
  el.style.setProperty('--radius-full', RADIUS.full)

  // ── Interaction ────────────────────────────────────────────────────────────
  el.style.setProperty('--interaction-hover-opacity',     String(INTERACTION.hoverOpacity))
  el.style.setProperty('--interaction-active-scale',      String(INTERACTION.activeScale))
  el.style.setProperty('--interaction-disabled-opacity',  String(INTERACTION.disabledOpacity))
  el.style.setProperty('--interaction-focus-ring-width',  INTERACTION.focusRingWidth)
  el.style.setProperty('--interaction-focus-ring-offset', INTERACTION.focusRingOffset)

  // ── Z-index ────────────────────────────────────────────────────────────────
  el.style.setProperty('--z-widget',       String(Z.WIDGET))
  el.style.setProperty('--z-menubar',      String(Z.MENUBAR))
  el.style.setProperty('--z-app',          String(Z.APP))
  el.style.setProperty('--z-panel',        String(Z.PANEL))
  el.style.setProperty('--z-toast',        String(Z.TOAST))
  el.style.setProperty('--z-context-menu', String(Z.CONTEXT_MENU))
}
