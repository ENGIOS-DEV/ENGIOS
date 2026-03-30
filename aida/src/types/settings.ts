// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: GlobalSettings
// AIDA-2 — src/types/settings.ts
//
// Responsibility:
//   The GlobalSettings interface and compile-time defaults.
//   This is the shape of the 'aida-settings' key in the settings DB table.
//
// Rules:
//   - Every window loads GlobalSettings from the DB on mount via settingsDb.ts
//   - defaultSettings are the compile-time fallback only — the DB value
//     always takes precedence once loaded
//   - defaultSettings must mirror the seed in database/seeds.cjs exactly
//   - Adding a new setting: add to interface, add to defaults, add to seeds.cjs
//   - Widget-specific settings have their own DB keys — they do not live here
//
// DB key: 'aida-settings'
// Loaded by: src/services/settingsDb.ts
// Applied by: src/global/useGlobal.ts → src/global/applyGlobal.ts
// ═══════════════════════════════════════════════════════════════════════════════

// ─── GlobalSettings interface ─────────────────────────────────────────────────

export interface GlobalSettings {

  // ── Theme ──────────────────────────────────────────────────────────────────
  theme:          'dark' | 'light'

  // ── Appearance ─────────────────────────────────────────────────────────────
  transparency:   number                        // 0–100
  blurIntensity:  number                        // 0–100
  accentColor:    string                        // hex colour string
  fontSize:       'small' | 'medium' | 'large'
  animationSpeed: 'fast'  | 'normal' | 'slow'

  // ── Menu bar ───────────────────────────────────────────────────────────────
  autoHideMenu:        boolean
  autoHideDelay:       number                   // seconds
  defaultMenuState:    'open' | 'closed'
  providerKeepSession: boolean

  // ── AI ─────────────────────────────────────────────────────────────────────
  aiProvider:   'gemini' | 'claude' | 'groq' | 'meta' | 'openai' | 'google' | 'brave'
  geminiApiKey: string

  // ── Widgets — master on/off for each desktop widget ────────────────────────
  showClockWidget:   boolean

  // ── System ─────────────────────────────────────────────────────────────────
  autoStart:    boolean
  userName:     string
  showWelcome:  boolean
}

// ─── TodaySettings ───────────────────────────────────────────────────────────

export type NudgeInterval    = 'startup-only' | '15min' | '30min' | '1hr' | '4hr'
export type PriorityInterval = '15min' | '30min' | '1hr' | '4hr' | 'repeat'
export type RepeatEvery      = '15min' | '30min' | '1hr' | '4hr'

export interface TodaySettings {
  notificationsEnabled:   boolean
  remindersEnabled:       boolean
  overdueRepeatInterval:  NudgeInterval
  highPriorityEnabled:    boolean
  highPriorityInterval:   PriorityInterval
  mediumPriorityEnabled:  boolean
  mediumPriorityInterval: PriorityInterval
  lowPriorityEnabled:     boolean
  lowPriorityInterval:    PriorityInterval
  highRepeatEvery:        RepeatEvery
  mediumRepeatEvery:      RepeatEvery
  lowRepeatEvery:         RepeatEvery
  showCompleted:          boolean
  maxVisible:             number
}

export const defaultTodaySettings: TodaySettings = {
  notificationsEnabled:   true,
  remindersEnabled:       true,
  overdueRepeatInterval:  '30min',
  highPriorityEnabled:    true,
  highPriorityInterval:   '15min',
  mediumPriorityEnabled:  true,
  mediumPriorityInterval: '1hr',
  lowPriorityEnabled:     true,
  lowPriorityInterval:    '4hr',
  highRepeatEvery:        '30min',
  mediumRepeatEvery:      '30min',
  lowRepeatEvery:         '30min',
  showCompleted:          false,
  maxVisible:             4,
}

// ─── Default settings ─────────────────────────────────────────────────────────
// Compile-time fallback. Used as the initial useState value in every Window.tsx
// before the DB load resolves.
//
// Must mirror the seed value in database/seeds.cjs exactly.
// If you change a default here — change it in seeds.cjs too.

export const defaultSettings: GlobalSettings = {
  // Theme
  theme:          'dark',

  // Appearance
  transparency:   20,
  blurIntensity:  40,
  accentColor:    '#3982F4',
  fontSize:       'medium',
  animationSpeed: 'normal',

  // Menu bar
  autoHideMenu:        false,
  autoHideDelay:       3,
  defaultMenuState:    'closed',
  providerKeepSession: false,

  // AI
  aiProvider:   'gemini',
  geminiApiKey: '',

  // Widgets
  showClockWidget:   true,

  // System
  autoStart:   false,
  userName:    '',
  showWelcome: true,
}
