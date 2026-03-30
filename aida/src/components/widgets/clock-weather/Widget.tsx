// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: Clock & Weather Widget
// AIDA-2 — src/components/widgets/clock-weather/Widget.tsx
//
// Responsibility:
//   Clock and weather display widget.
//   Draggable. Right-click context menu for settings and position lock.
//   Sends window:fit after every render so Electron keeps the window
//   sized to match actual content.
//
// Adapted from AIDA-1 ClockWeatherWidget — weather fetch + display logic
// ported directly. Style functions from widget.ts (Layer 4).
//
// Rules:
//   - Zero style definitions — all from src/themes/widget.ts
//   - No hardcoded colours, sizes, or spacing
//   - Sends window:fit on every size change — never a fixed window size
//
// Import depth: widgets/clock-weather/ → depth 3 → ../../../
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react'
import type { GlobalSettings }                       from '../../../types/settings'
import type { ClockSettings }                        from './types'
import {
  getWidgetWindowStyle,
  getWidgetContainerStyle,
  getWidgetColumnStyle,
  getWidgetRowStyle,
  getWidgetPrimaryTextStyle,
  getWidgetSecondaryTextStyle,
  getWidgetSupportingTextStyle,
  getWidgetDragStyle,
  WIDGET_LAYOUT,
  WIDGET_FONT_SIZE_MAP,
} from '../../../themes/widget'

// ─── Weather icon imports — from @bybas/weather-icons ────────────────────────

import clearDay          from '@bybas/weather-icons/production/fill/all/clear-day.svg?url'
import clearNight        from '@bybas/weather-icons/production/fill/all/clear-night.svg?url'
import partlyCloudyDay   from '@bybas/weather-icons/production/fill/all/partly-cloudy-day.svg?url'
import partlyCloudyNight from '@bybas/weather-icons/production/fill/all/partly-cloudy-night.svg?url'
import overcastDay       from '@bybas/weather-icons/production/fill/all/overcast-day.svg?url'
import overcastNight     from '@bybas/weather-icons/production/fill/all/overcast-night.svg?url'
import drizzle           from '@bybas/weather-icons/production/fill/all/drizzle.svg?url'
import fogDay            from '@bybas/weather-icons/production/fill/all/fog-day.svg?url'
import fogNight          from '@bybas/weather-icons/production/fill/all/fog-night.svg?url'
import rain              from '@bybas/weather-icons/production/fill/all/rain.svg?url'
import snow              from '@bybas/weather-icons/production/fill/all/snow.svg?url'
import sleet             from '@bybas/weather-icons/production/fill/all/sleet.svg?url'
import thunderstormsRain from '@bybas/weather-icons/production/fill/all/thunderstorms-rain.svg?url'
import notAvailable      from '@bybas/weather-icons/production/fill/all/not-available.svg?url'

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClockWeatherWidgetProps {
  settings:      GlobalSettings
  clockSettings: ClockSettings
  onMeasure:     () => void
  onContextMenu: (x: number, y: number) => void
}

// ─── Weather types ────────────────────────────────────────────────────────────

interface WeatherData {
  temp:      number
  condition: string
  high:      number
  low:       number
  icon:      string
}

// ─── Weather helpers — ported from AIDA-1 ────────────────────────────────────

function getWeatherIcon(code: number, isDay: boolean): string {
  if (code === 0)  return isDay ? clearDay : clearNight
  if (code <= 2)   return isDay ? partlyCloudyDay : partlyCloudyNight
  if (code === 3)  return isDay ? overcastDay : overcastNight
  if (code <= 48)  return isDay ? fogDay : fogNight
  if (code <= 55)  return drizzle
  if (code <= 65)  return rain
  if (code <= 75)  return snow
  if (code <= 82)  return rain
  if (code <= 84)  return sleet
  if (code <= 99)  return thunderstormsRain
  return notAvailable
}

function getCondition(code: number): string {
  if (code === 0)  return 'Clear Sky'
  if (code <= 3)   return 'Partly Cloudy'
  if (code <= 48)  return 'Foggy'
  if (code <= 55)  return 'Drizzle'
  if (code <= 65)  return 'Rain'
  if (code <= 75)  return 'Snow'
  if (code <= 82)  return 'Rain Showers'
  if (code <= 84)  return 'Sleet'
  if (code <= 99)  return 'Thunderstorm'
  return 'Unknown'
}

// ─── Clock helpers ────────────────────────────────────────────────────────────

function padTwo(n: number): string {
  return String(n).padStart(2, '0')
}

function formatTime(date: Date, use24Hour: boolean, showSeconds: boolean, showAmPmUpper: boolean): string {
  if (use24Hour) {
    const h = padTwo(date.getHours())
    const m = padTwo(date.getMinutes())
    const s = padTwo(date.getSeconds())
    return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`
  }
  let hours = date.getHours()
  const ampmRaw = hours >= 12 ? 'PM' : 'AM'
  const ampm    = showAmPmUpper ? ampmRaw : ampmRaw.toLowerCase()
  hours = hours % 12 || 12
  const m = padTwo(date.getMinutes())
  const s = padTwo(date.getSeconds())
  return showSeconds ? `${hours}:${m}:${s} ${ampm}` : `${hours}:${m} ${ampm}`
}

function formatDay(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'long' })
}

function formatDate(date: Date, format: 'DD/MM' | 'MM/DD'): string {
  if (format === 'MM/DD') {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClockWeatherWidget({
  settings,
  clockSettings,
  onMeasure,
  onContextMenu,
}: ClockWeatherWidgetProps) {

  const [now,         setNow]         = useState(new Date())
  const [weather,     setWeather]     = useState<WeatherData | null>(null)
  const [dragging,    setDragging]    = useState(false)
  const dragOffset   = useRef({ x: 0, y: 0 })
  const ac           = settings.accentColor

  // ── Clock tick ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // ── Weather fetch — ported from AIDA-1 ────────────────────────────────────
  const fetchWeather = useCallback(async () => {
    try {
      let lat: number, lon: number

      if (clockSettings.weatherCity) {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(clockSettings.weatherCity)}&format=json&limit=1`
        )
        const d = await r.json()
        if (!d?.length) return
        lat = parseFloat(d[0].lat)
        lon = parseFloat(d[0].lon)
      } else {
        // Auto-detect location from IP
        try {
          const geo = await fetch('https://ipapi.co/json/')
          const loc = await geo.json()
          lat = parseFloat(loc.latitude)
          lon = parseFloat(loc.longitude)
        } catch {
          // Oslo fallback
          lat = 59.9139
          lon = 10.7522
        }
      }

      const unit = clockSettings.weatherUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius'
      const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${unit}`
      )
      const d   = await r.json()
      const cur = d.current_weather

      setWeather({
        temp:      Math.round(cur.temperature),
        condition: getCondition(cur.weathercode),
        high:      Math.round(d.daily.temperature_2m_max[0]),
        low:       Math.round(d.daily.temperature_2m_min[0]),
        icon:      getWeatherIcon(cur.weathercode, cur.is_day === 1),
      })
    } catch (_) {}
  }, [clockSettings.weatherCity, clockSettings.weatherUnit])

  useEffect(() => {
    if (!clockSettings.showWeather) return
    fetchWeather()
    const interval = setInterval(fetchWeather, 600_000) // refresh every 10 min
    return () => clearInterval(interval)
  }, [clockSettings.showWeather, fetchWeather])

  // ── Trigger measure on weather load ──────────────────────────────────────
  useEffect(() => {
    if (weather) onMeasure()
  }, [weather, onMeasure])

  // ── Drag ───────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (clockSettings.positionLocked) return
    if (e.button !== 0) return
    setDragging(true)
    dragOffset.current = { x: e.screenX, y: e.screenY }
  }, [clockSettings.positionLocked])

  useEffect(() => {
    if (!dragging) return
    let lastX = dragOffset.current.x
    let lastY = dragOffset.current.y

    const onMove = (e: MouseEvent) => {
      const dx = e.screenX - lastX
      const dy = e.screenY - lastY
      lastX = e.screenX
      lastY = e.screenY
      window.electron?.send('window:dragBy', { dx, dy, name: 'clock-weather-widget' })
    }
    const onUp = () => {
      setDragging(false)
      // Delay so window:fit settles before we read the final position
      setTimeout(() => {
        window.electron?.send('window:savePosition', { name: 'clock-weather-widget' })
      }, 150)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [dragging])

  // ── Derived display values ─────────────────────────────────────────────────
  const timeStr = formatTime(now, clockSettings.use24Hour, clockSettings.showSeconds, clockSettings.showAmPmUpper)
  const dayStr  = formatDay(now)
  const dateStr = formatDate(now, clockSettings.dateFormat)
  const tempUnit  = clockSettings.weatherUnit === 'fahrenheit' ? 'F' : 'C'
  const textColor = `rgba(245,245,245,${clockSettings.textOpacity / 100})`

  return (
    <>
      {/* ── Widget body ───────────────────────────────────────────────────── */}
      <div
        style={{
          ...getWidgetWindowStyle(settings, clockSettings),
          ...getWidgetDragStyle(dragging),
        }}
        onMouseDown={onMouseDown}
        onContextMenu={e => { e.preventDefault(); onContextMenu(e.clientX, e.clientY) }}
      >
        <div style={getWidgetContainerStyle()}>
          <div style={getWidgetRowStyle()}>

            {/* ── Clock column ────────────────────────────────────────────── */}
            <div style={getWidgetColumnStyle()}>
              {/* Time row — min-height matches weather icon row for even gaps */}
              <div style={{ display: 'flex', alignItems: 'center', minHeight: WIDGET_LAYOUT.weatherIconSize }}>
                <span style={{ ...getWidgetPrimaryTextStyle(settings, clockSettings.fontWeight, clockSettings.fontSize), color: textColor }}>
                  {timeStr}
                </span>
              </div>
              {clockSettings.showDay && (
                <span style={{ ...getWidgetSecondaryTextStyle(settings, clockSettings.fontWeight, clockSettings.fontSize), color: textColor }}>
                  {dayStr}
                </span>
              )}
              {clockSettings.showDate && (
                <span style={{ ...getWidgetSecondaryTextStyle(settings, clockSettings.fontWeight, clockSettings.fontSize), color: textColor }}>
                  {dateStr}
                </span>
              )}
            </div>

            {/* ── Weather column ──────────────────────────────────────────── */}
            {clockSettings.showWeather && weather && (
              <div style={{ ...getWidgetColumnStyle(), paddingLeft: WIDGET_LAYOUT.weatherGap }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: WIDGET_LAYOUT.weatherIconGap }}>
                  <img
                    src={weather.icon}
                    alt={weather.condition}
                    draggable={false}
                    style={{ width: WIDGET_LAYOUT.weatherIconSize, height: WIDGET_LAYOUT.weatherIconSize, opacity: clockSettings.textOpacity / 100 }}
                  />
                  <span style={{ ...getWidgetPrimaryTextStyle(settings, clockSettings.fontWeight, clockSettings.fontSize), color: textColor }}>
                    {weather.temp}°{tempUnit}
                  </span>
                </div>
                <span style={{ ...getWidgetSecondaryTextStyle(settings, clockSettings.fontWeight, clockSettings.fontSize), color: textColor }}>
                  {weather.condition}
                </span>
                {clockSettings.showHighLow && (
                  <span style={{ ...getWidgetSupportingTextStyle(settings, clockSettings.fontWeight, clockSettings.fontSize), color: textColor }}>
                    H: {weather.high}° · L: {weather.low}°
                  </span>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

    </>
  )
}
