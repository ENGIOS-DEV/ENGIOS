// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 3 — GLOBAL: Colour Palette
// AIDA-2 — src/global/palette.ts
//
// Responsibility:
//   The two complete colour palettes — dark and light.
//   Every colour token used anywhere in the system is defined here.
//   Nothing is defined twice. Nothing is hardcoded anywhere else.
//
// Rules:
//   - Accent colour is NEVER defined here — it is always user-chosen
//     via GlobalSettings and passed at runtime
//   - Adding a new colour token: add to ThemePalette interface first,
//     then to both dark and light palettes
//   - Convention files (Layer 4) import getPalette() — never raw palettes
//   - Components (Layer 5) never import from this file directly
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings } from '../types/settings'

// ─── Palette shape ────────────────────────────────────────────────────────────
// Every palette must satisfy this interface completely.
// This is the contract — if it's not here, it doesn't exist as a token.

export interface ThemePalette {
  // ── Backgrounds — three levels of elevation ──────────────────────────────
  backgroundBase:     string   // the desktop/base layer — darkest
  backgroundElevated: string   // windows and panels sitting above the base
  backgroundSubtle:   string   // inset areas, secondary sections within a surface

  // ── Text — three levels of emphasis ─────────────────────────────────────

  // ── Borders ──────────────────────────────────────────────────────────────
  borderSubtle:  string        // dividers, panel edges, input outlines
  borderStrong:  string        // stronger dividers, active outlines
}

// ─── Dark palette ─────────────────────────────────────────────────────────────
// Built from the ENGIOS brand. #0D1117 is the canonical ENGIOS background.
// Cool blue-grey darks — not pure black.

const dark: ThemePalette = {
  backgroundBase:     '#0D1117',
  backgroundElevated: '#161B22',
  backgroundSubtle:   '#1C2128',


  borderSubtle:       'rgba(255, 255, 255, 0.08)',
  borderStrong:       'rgba(255, 255, 255, 0.16)',
}

// ─── Light palette ────────────────────────────────────────────────────────────
// Same brand character as dark — cool blue-grey whites, not stark pure white.
// #0D1117 inverts its role: from background to text.

const light: ThemePalette = {
  backgroundBase:     '#F0F4F8',
  backgroundElevated: '#FFFFFF',
  backgroundSubtle:   '#E8EDF2',


  borderSubtle:       'rgba(0, 0, 0, 0.08)',
  borderStrong:       'rgba(0, 0, 0, 0.16)',
}

// ─── Palette resolver ─────────────────────────────────────────────────────────
// The only way to access a palette. Takes settings so the theme choice
// is always respected. Convention files call this — never access
// dark/light directly.

export function getPalette(settings: GlobalSettings): ThemePalette {
  return settings.theme === 'light' ? light : dark
}

// ─── Accent colour accessor ───────────────────────────────────────────────────
// Convenience function — keeps accent access consistent with palette access.
// Never returns a hardcoded colour — always from user settings.

export function getAccent(settings: GlobalSettings): string {
  return settings.accentColor
}
