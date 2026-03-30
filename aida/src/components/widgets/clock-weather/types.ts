// ─── Clock & Weather Widget Types ─────────────────────────────────────────────
// AIDA-2 — src/components/widgets/clock-weather/types.ts
//
// Separated from Window.tsx for Vite Fast Refresh compatibility.
// Adapted from AIDA-1 — extended with all appearance settings.
// ─────────────────────────────────────────────────────────────────────────────

export interface ClockSettings {
  // ── Time ───────────────────────────────────────────────────────────────────
  use24Hour:      boolean
  showAmPmUpper:  boolean          // AM/PM vs am/pm
  showSeconds:    boolean
  showDate:       boolean
  showDay:        boolean
  dateFormat:     'DD/MM' | 'MM/DD'

  // ── Weather ────────────────────────────────────────────────────────────────
  showWeather:    boolean
  showHighLow:    boolean
  weatherCity:    string           // blank = auto-detect from IP
  weatherUnit:    'celsius' | 'fahrenheit'

  // ── Appearance ─────────────────────────────────────────────────────────────
  fontFamily:     string
  fontWeight:     '300' | '400' | '500'
  fontSize:       'small' | 'medium' | 'large'
  textOpacity:    number           // 0–100
  textAlign:      'left' | 'center' | 'right'
  bgOpacity:      number           // 0–100
  borderOpacity:  number           // 0–100

  // ── Position ───────────────────────────────────────────────────────────────
  positionLocked: boolean
}

export const defaultClockSettings: ClockSettings = {
  // Time
  use24Hour:      true,
  showAmPmUpper:  false,
  showSeconds:    false,
  showDate:       true,
  showDay:        true,
  dateFormat:     'DD/MM',

  // Weather
  showWeather:    true,
  showHighLow:    true,
  weatherCity:    '',
  weatherUnit:    'celsius',

  // Appearance
  fontFamily:     'Inter, system-ui',
  fontWeight:     '300',
  fontSize:       'medium',
  textOpacity:    100,
  textAlign:      'center',
  bgOpacity:      30,
  borderOpacity:  10,

  // Position
  positionLocked: false,
}
