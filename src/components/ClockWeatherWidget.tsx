import { useState, useEffect, useRef } from 'react'
import { Settings } from 'lucide-react'
import { Z } from '../zIndex'
import type { GlobalSettings } from '../types/settings'
import { SettingsShell, SectionHeader, ToggleRow, ButtonGroup, InputRow, SliderRow } from './SettingsShell'

// ─── Animated SVG Weather Icons (fill/all) ────────────────────────────────────
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClockWeatherWidgetProps {
  settings: GlobalSettings
}

interface WeatherData {
  temp: number
  condition: string
  high: number
  low: number
  icon: string
}

interface WidgetSettings {
  hour12:        boolean
  ampmUpper:     boolean
  showDate:      boolean
  showDay:       boolean
  dateFormat:    'DD/MM' | 'MM/DD'
  tempUnit:      'C' | 'F'
  showHighLow:   boolean
  showWeather:   boolean
  city:          string
  fontFamily:    string
  fontWeight:    '100' | '200' | '300' | '400' | '500'
  fontSize:      'small' | 'medium' | 'large'
  textOpacity:   number
  textAlign:     'left' | 'center' | 'right'
  layout:        'side' | 'stacked'
  showBg:        boolean
  bgOpacity:     number
  showBorder:    boolean
  borderOpacity: number
  locked:        boolean
}

const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
  hour12:        false,
  ampmUpper:     false,
  showDate:      true,
  showDay:       true,
  dateFormat:    'DD/MM',
  tempUnit:      'C',
  showHighLow:   true,
  showWeather:   true,
  city:          '',
  fontFamily:    'system-ui',
  fontWeight:    '300',
  fontSize:      'medium',
  textOpacity:   100,
  textAlign:     'center',
  layout:        'side',
  showBg:        true,
  bgOpacity:     70,
  showBorder:    true,
  borderOpacity: 10,
  locked:        false,
}

const FONT_SIZE_MAP = { small: '0.85', medium: '1', large: '1.2' }

const FONTS = [
  { label: 'System',  value: 'system-ui'      },
  { label: 'Serif',   value: 'Georgia, serif'  },
  { label: 'Mono',    value: 'monospace'       },
  { label: 'Rounded', value: 'ui-rounded'      },
]

// ─── WMO code → icon (day/night aware) ───────────────────────────────────────
function getWeatherIcon(code: number, isDay: boolean): string {
  if (code === 0)        return isDay ? clearDay        : clearNight
  if (code <= 2)         return isDay ? partlyCloudyDay : partlyCloudyNight
  if (code === 3)        return isDay ? overcastDay     : overcastNight
  if (code <= 48)        return isDay ? fogDay          : fogNight
  if (code <= 55)        return drizzle
  if (code <= 65)        return rain
  if (code <= 75)        return snow
  if (code <= 82)        return rain
  if (code <= 84)        return sleet
  if (code <= 99)        return thunderstormsRain
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

// ─── Component ────────────────────────────────────────────────────────────────
function ClockWeatherWidget({ settings }: ClockWeatherWidgetProps) {
  const [ws, setWs] = useState<WidgetSettings>(() => {
    const saved = localStorage.getItem('aida-clock-settings')
    return saved ? { ...DEFAULT_WIDGET_SETTINGS, ...JSON.parse(saved) } : DEFAULT_WIDGET_SETTINGS
  })
  const [time, setTime]                 = useState(new Date())
  const [weather, setWeather]           = useState<WeatherData | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab]       = useState('time')
  const [cityInput, setCityInput]       = useState(ws.city)
  const [isDragging, setIsDragging]     = useState(false)
  const [position, setPosition]         = useState(() => {
    const saved = localStorage.getItem('aida-widget-position')
    return saved ? JSON.parse(saved) : { x: 40, y: 40 }
  })

  const widgetRef  = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const posRef     = useRef(position)
  useEffect(() => { posRef.current = position }, [position])

  function update(changes: Partial<WidgetSettings>) {
    setWs(prev => {
      const next = { ...prev, ...changes }
      localStorage.setItem('aida-clock-settings', JSON.stringify(next))
      return next
    })
  }

  // Clock tick
  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(i)
  }, [])

  // Weather fetch
  useEffect(() => {
    fetchWeather()
    const i = setInterval(fetchWeather, 600000)
    return () => clearInterval(i)
  }, [ws.city, ws.tempUnit])

  async function fetchWeather() {
    try {
      let lat: number, lon: number
      if (ws.city) {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(ws.city)}&format=json&limit=1`)
        const d = await r.json()
        if (!d?.length) return
        lat = parseFloat(d[0].lat); lon = parseFloat(d[0].lon)
      } else {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
          )
          lat = pos.coords.latitude; lon = pos.coords.longitude
        } catch { lat = 51.5074; lon = -0.1278 }
      }
      const unit = ws.tempUnit === 'F' ? 'fahrenheit' : 'celsius'
      const r    = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${unit}`)
      const d    = await r.json()
      const cur  = d.current_weather
      setWeather({
        temp:      Math.round(cur.temperature),
        condition: getCondition(cur.weathercode),
        high:      Math.round(d.daily.temperature_2m_max[0]),
        low:       Math.round(d.daily.temperature_2m_min[0]),
        icon:      getWeatherIcon(cur.weathercode, cur.is_day === 1),
      })
    } catch (e) { console.warn('Weather fetch failed:', e) }
  }

  // Time formatting
  const rawTime = time.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: ws.hour12,
  })
  const timeStr = ws.hour12
    ? (ws.ampmUpper ? rawTime.toUpperCase() : rawTime.toLowerCase())
    : rawTime
  const dayStr  = time.toLocaleDateString('en-GB', { weekday: 'long' })
  const dateStr = ws.dateFormat === 'DD/MM'
    ? time.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
    : time.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  // Dragging
  function handleMouseDown(e: React.MouseEvent) {
    if (showSettings || ws.locked) return
    const rect = widgetRef.current?.getBoundingClientRect()
    if (!rect) return
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return
    function onMove(e: MouseEvent) {
      setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y })
    }
    function onUp() {
      setIsDragging(false)
      localStorage.setItem('aida-widget-position', JSON.stringify(posRef.current))
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  }, [isDragging])

  // Styles
  const globalOpacity = (100 - settings.transparency) / 100
  const blur          = settings.blurIntensity * 0.4
  const scale         = parseFloat(FONT_SIZE_MAP[ws.fontSize])
  const textColor     = `rgba(255,255,255,${ws.textOpacity / 100})`

  const widgetStyle: React.CSSProperties = {
    position:             'fixed',
    left:                 position.x,
    top:                  position.y,
    zIndex:               Z.CLOCK_WIDGET,
    cursor:               ws.locked ? 'default' : isDragging ? 'grabbing' : 'grab',
    fontFamily:           ws.fontFamily,
    fontWeight:           ws.fontWeight,
    fontSize:             `${scale}rem`,
    textAlign:            ws.textAlign,
    padding:              '1.25rem 1.75rem',
    borderRadius:         '1rem',
    backgroundColor:      ws.showBg ? `rgba(0,0,0,${(ws.bgOpacity / 100) * globalOpacity})` : 'transparent',
    backdropFilter:       ws.showBg ? `blur(${blur}px)` : 'none',
    WebkitBackdropFilter: ws.showBg ? `blur(${blur}px)` : 'none',
    border:               ws.showBorder ? `1px solid rgba(255,255,255,${ws.borderOpacity / 100})` : 'none',
    userSelect:           'none',
  }

  const tabs = [
    { id: 'time',       label: 'Time'       },
    { id: 'weather',    label: 'Weather'    },
    { id: 'appearance', label: 'Appearance' },
  ]

  return (
    <>
      {/* ── Widget ────────────────────────────────────────────────────────── */}
      <div ref={widgetRef} onMouseDown={handleMouseDown} className="group" style={widgetStyle}>

        {/* Gear — visible on hover */}
        <button
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10"
          onClick={e => { e.stopPropagation(); setShowSettings(true) }}
          onMouseDown={e => e.stopPropagation()}
        >
          <Settings size={12} style={{ color: textColor }} />
        </button>

        {/* Content */}
        <div className={`flex ${ws.layout === 'stacked' ? 'flex-col gap-4' : 'flex-row items-center gap-8'}`}>

          {/* Clock */}
          <div>
            <div style={{ fontSize: '3em', fontWeight: ws.fontWeight, color: textColor, lineHeight: 1 }}>
              {timeStr}
            </div>
            {ws.showDay  && <div style={{ fontSize: '0.9em', color: textColor, opacity: 0.6, marginTop: '0.3em' }}>{dayStr}</div>}
            {ws.showDate && <div style={{ fontSize: '0.9em', color: textColor, opacity: 0.6 }}>{dateStr}</div>}
          </div>

          {/* Weather */}
          {ws.showWeather && weather && (
          <div style={{
            paddingLeft: ws.layout === 'side' ? '2rem' : '0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: ws.textAlign === 'center' ? 'center' : 'flex-start' }}>
              <img src={weather.icon} alt={weather.condition} style={{ width: '3em', height: '3em', opacity: ws.textOpacity / 100 }} />
              <span style={{ fontSize: '3em', fontWeight: ws.fontWeight, color: textColor, lineHeight: 1 }}>
                {weather.temp}°{ws.tempUnit}
              </span>
            </div>
            <div style={{ fontSize: '0.9em', color: textColor, opacity: 0.6, marginTop: '0.3em' }}>{weather.condition}</div>
            {ws.showHighLow && (
              <div style={{ fontSize: '0.9em', color: textColor, opacity: 0.6 }}>
                H: {weather.high}° L: {weather.low}°
              </div>
            )}
            </div>
          )}
        </div>
      </div>

      {/* ── Settings Panel ────────────────────────────────────────────────── */}
      <SettingsShell
        title="Clock & Weather"
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={settings.accentColor}
      >
        {activeTab === 'time' && (
          <div>
            <SectionHeader title="Format" />
            <ButtonGroup
              options={[{ label: '24 Hour', value: 'false' }, { label: '12 Hour', value: 'true' }]}
              value={String(ws.hour12)}
              onChange={v => update({ hour12: v === 'true' })}
              accentColor={settings.accentColor}
            />
            {ws.hour12 && <>
              <SectionHeader title="AM / PM Style" />
              <ButtonGroup
                options={[{ label: 'am/pm', value: 'false' }, { label: 'AM/PM', value: 'true' }]}
                value={String(ws.ampmUpper)}
                onChange={v => update({ ampmUpper: v === 'true' })}
                accentColor={settings.accentColor}
              />
            </>}
            <SectionHeader title="Date" />
            <ToggleRow label="Show Day"  value={ws.showDay}  onChange={v => update({ showDay: v })}  accentColor={settings.accentColor} />
            <ToggleRow label="Show Date" value={ws.showDate} onChange={v => update({ showDate: v })} accentColor={settings.accentColor} />
            <SectionHeader title="Date Format" />
            <ButtonGroup
              options={[{ label: 'DD/MM', value: 'DD/MM' }, { label: 'MM/DD', value: 'MM/DD' }]}
              value={ws.dateFormat}
              onChange={v => update({ dateFormat: v })}
              accentColor={settings.accentColor}
            />
          </div>
        )}

        {activeTab === 'weather' && (
          <div>
            <SectionHeader title="Display" />
            <ToggleRow label="Show Weather"  value={ws.showWeather}  onChange={v => update({ showWeather: v })}  accentColor={settings.accentColor} />
            <ToggleRow label="Show High/Low" value={ws.showHighLow} onChange={v => update({ showHighLow: v })} accentColor={settings.accentColor} />
            <SectionHeader title="Temperature Unit" />
            <ButtonGroup
              options={[{ label: '°C Celsius', value: 'C' }, { label: '°F Fahrenheit', value: 'F' }]}
              value={ws.tempUnit}
              onChange={v => update({ tempUnit: v })}
              accentColor={settings.accentColor}
            />
            <SectionHeader title="Location" />
            <InputRow
              label="City Override"
              value={cityInput}
              placeholder="Leave blank for auto-detect"
              onChange={setCityInput}
              onConfirm={() => update({ city: cityInput })}
              accentColor={settings.accentColor}
            />
          </div>
        )}

        {activeTab === 'appearance' && (
          <div>
            <SectionHeader title="Position" />
            <ToggleRow label="Lock Position" description="Prevent accidental dragging" value={ws.locked} onChange={v => update({ locked: v })} accentColor={settings.accentColor} />
            <SectionHeader title="Font" />
            <ButtonGroup options={FONTS} value={ws.fontFamily} onChange={v => update({ fontFamily: v })} accentColor={settings.accentColor} />
            <SectionHeader title="Font Weight" />
            <ButtonGroup
              options={[{ label: 'Thin', value: '100' }, { label: 'Light', value: '300' }, { label: 'Regular', value: '400' }, { label: 'Medium', value: '500' }]}
              value={ws.fontWeight}
              onChange={v => update({ fontWeight: v })}
              accentColor={settings.accentColor}
            />
            <SectionHeader title="Font Size" />
            <ButtonGroup
              options={[{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }]}
              value={ws.fontSize}
              onChange={v => update({ fontSize: v })}
              accentColor={settings.accentColor}
            />
            <SectionHeader title="Text" />
            <SliderRow label="Text Opacity" value={ws.textOpacity} onChange={v => update({ textOpacity: v })} accentColor={settings.accentColor} />
            <SectionHeader title="Alignment" />
            <ButtonGroup
              options={[{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }]}
              value={ws.textAlign}
              onChange={v => update({ textAlign: v })}
              accentColor={settings.accentColor}
            />
            <SectionHeader title="Layout" />
            <ButtonGroup
              options={[{ label: 'Side by Side', value: 'side' }, { label: 'Stacked', value: 'stacked' }]}
              value={ws.layout}
              onChange={v => update({ layout: v })}
              accentColor={settings.accentColor}
            />
            <SectionHeader title="Background" />
            <ToggleRow label="Show Background" value={ws.showBg} onChange={v => update({ showBg: v })} accentColor={settings.accentColor} />
            {ws.showBg && <SliderRow label="BG Opacity" value={ws.bgOpacity} onChange={v => update({ bgOpacity: v })} accentColor={settings.accentColor} />}
            <SectionHeader title="Border" />
            <ToggleRow label="Show Border" value={ws.showBorder} onChange={v => update({ showBorder: v })} accentColor={settings.accentColor} />
            {ws.showBorder && <SliderRow label="Border Opacity" value={ws.borderOpacity} onChange={v => update({ borderOpacity: v })} accentColor={settings.accentColor} />}
          </div>
        )}
      </SettingsShell>
    </>
  )
}

export default ClockWeatherWidget
