// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 6 — DATA: Settings DB Service
// AIDA-2 — src/services/settingsDb.ts
//
// Responsibility:
//   The ONLY place GlobalSettings are read and written from React.
//   All windows call loadGlobalSettings() on mount and saveGlobalSettings()
//   on change. Nothing bypasses this file.
//
// Rules:
//   - Never calls window.electron directly — all DB access via window.electron.db
//   - Never uses localStorage — everything goes through the DB
//   - On failure — falls through to defaultSettings silently
//   - Widget-specific settings follow the same pattern with their own keys
//
// DB keys:
//   'aida-settings'         → GlobalSettings
//   'aida-clock-settings'   → Clock widget settings (type passed by caller)
//   'aida-today-settings'   → Today panel settings (type passed by caller)
// ═══════════════════════════════════════════════════════════════════════════════

import type { GlobalSettings, TodaySettings } from '../types/settings'
import { defaultTodaySettings }             from '../types/settings'
import { defaultSettings }     from '../types/settings'

// ─── DB key constants ─────────────────────────────────────────────────────────
// Single source of truth for all settings DB keys.
// If a key changes — change it here only.

export const SETTINGS_KEYS = {
  GLOBAL:  'aida-settings',
  CLOCK:   'aida-clock-settings',
  TODAY:   'aida-today-settings',
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

// ── loadGlobalSettings ────────────────────────────────────────────────────────
// Reads GlobalSettings from the DB.
// Merges with defaultSettings so any new keys added to the interface
// are always present even if the saved value predates them.

export async function loadGlobalSettings(): Promise<GlobalSettings> {
  try {
    const map = await window.electron!.db.settings.get([SETTINGS_KEYS.GLOBAL])
    const raw = map[SETTINGS_KEYS.GLOBAL]
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    // DB unavailable or corrupt value — fall through to defaults
  }
  return { ...defaultSettings }
}

// ── saveGlobalSettings ────────────────────────────────────────────────────────
// Writes the full GlobalSettings object to the DB.
// Stringifies to JSON — the DB stores all settings as strings.

export async function saveGlobalSettings(settings: GlobalSettings): Promise<void> {
  await window.electron!.db.settings.set(
    SETTINGS_KEYS.GLOBAL,
    JSON.stringify(settings),
  )
}

// ── updateGlobalSettings ──────────────────────────────────────────────────────
// Convenience function — reads current settings, merges changes, saves, returns.
// Used when only a subset of settings are changing (e.g. a single toggle).

export async function updateGlobalSettings(
  changes: Partial<GlobalSettings>,
): Promise<GlobalSettings> {
  const current = await loadGlobalSettings()
  const updated = { ...current, ...changes }
  await saveGlobalSettings(updated)
  return updated
}

// ═══════════════════════════════════════════════════════════════════════════════
// WIDGET & PANEL SETTINGS
// Generic functions for widget/panel-specific settings.
// The caller provides the type T and the default value.
// ═══════════════════════════════════════════════════════════════════════════════

// ── loadWidgetSettings ────────────────────────────────────────────────────────
// Reads settings for a specific widget or panel from the DB.
// Merges with provided defaults so new keys are always present.

export async function loadWidgetSettings<T extends object>(
  key:      string,
  defaults: T,
): Promise<T> {
  try {
    const map = await window.electron!.db.settings.get([key])
    const raw = map[key]
    if (raw) return { ...defaults, ...JSON.parse(raw) }
  } catch {
    // Fall through to defaults
  }
  return { ...defaults }
}

// ── saveWidgetSettings ────────────────────────────────────────────────────────
// Writes widget/panel settings to the DB under the given key.

export async function saveWidgetSettings<T>(
  key:      string,
  settings: T,
): Promise<void> {
  await window.electron!.db.settings.set(key, JSON.stringify(settings))
}

// ── updateWidgetSettings ──────────────────────────────────────────────────────
// Convenience — reads, merges, saves, returns.

export async function updateWidgetSettings<T extends object>(
  key:      string,
  defaults: T,
  changes:  Partial<T>,
): Promise<T> {
  const current = await loadWidgetSettings(key, defaults)
  const updated = { ...current, ...changes }
  await saveWidgetSettings(key, updated)
  return updated
}

// ── loadTodaySettings ─────────────────────────────────────────────────────────

export async function loadTodaySettings(): Promise<TodaySettings> {
  try {
    const map = await window.electron!.db.settings.get([SETTINGS_KEYS.TODAY])
    const raw = map[SETTINGS_KEYS.TODAY]
    if (raw) return { ...defaultTodaySettings, ...JSON.parse(raw) }
  } catch {
    // fall through to defaults
  }
  return { ...defaultTodaySettings }
}

// ── saveTodaySettings ─────────────────────────────────────────────────────────

export async function saveTodaySettings(settings: TodaySettings): Promise<void> {
  await window.electron!.db.settings.set(
    SETTINGS_KEYS.TODAY,
    JSON.stringify(settings),
  )
}
