import { useState, useEffect } from 'react'
import type { GlobalSettings } from '../types/settings'
import { Z } from '../zIndex'

interface SystemMonitorProps {
  settings: GlobalSettings
}

interface SystemStats {
  cpu: number
  ram: number
  gpu: number
  temp: number
  disk: number
  networkUp: number
  networkDown: number
  battery: number
  vram: number
}

function SystemMonitor({ settings }: SystemMonitorProps) {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0, ram: 0, gpu: 0, temp: 0, disk: 0,
    networkUp: 0, networkDown: 0, battery: 0, vram: 0,
  })

  useEffect(() => {
    const updateStats = () => {
      setStats({
        cpu:         Math.random() * 100,
        ram:         Math.random() * 100,
        gpu:         Math.random() * 100,
        temp:        45 + Math.random() * 30,
        disk:        60 + Math.random() * 30,
        networkUp:   Math.random() * 10,
        networkDown: Math.random() * 50,
        battery:     70 + Math.random() * 30,
        vram:        Math.random() * 100,
      })
    }
    updateStats()
    const interval = setInterval(updateStats, 2000)
    return () => clearInterval(interval)
  }, [])

  const positionStyle: React.CSSProperties = { position: 'fixed', zIndex: Z.SYSTEM_MONITOR }
  const pad = 20
  if (settings.monitorPosition === 'top-left')     { positionStyle.top = pad;    positionStyle.left  = pad }
  if (settings.monitorPosition === 'top-right')    { positionStyle.top = pad;    positionStyle.right = pad }
  if (settings.monitorPosition === 'bottom-left')  { positionStyle.bottom = pad; positionStyle.left  = pad }
  if (settings.monitorPosition === 'bottom-right') { positionStyle.bottom = pad; positionStyle.right = pad }

  const CircularProgress = ({ value, label }: { value: number; label: string }) => {
    const size = 80
    const strokeWidth = 6
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (value / 100) * circumference

    return (
      <div className="flex flex-col items-center" style={{ width: `${size}px`, opacity: (100 - settings.transparency) / 100 }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="none" />
          <circle
            cx={size/2} cy={size/2} r={radius}
            stroke={settings.accentColor} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
          <text
            x={size/2} y={size/2} textAnchor="middle" dy="0.3em"
            className="transform rotate-90"
            style={{ fontSize: '14px', fontWeight: 'bold', fill: 'white', transformOrigin: 'center' }}
          >
            {Math.round(value)}%
          </text>
        </svg>
        <div className="text-xs text-white/60 mt-1 font-medium">{label}</div>
      </div>
    )
  }

  const components = settings.monitorComponents
  const active: { label: string; value: number }[] = []
  if (components.cpu)     active.push({ label: 'CPU',  value: stats.cpu })
  if (components.ram)     active.push({ label: 'RAM',  value: stats.ram })
  if (components.gpu)     active.push({ label: 'GPU',  value: stats.gpu })
  if (components.temp)    active.push({ label: 'TEMP', value: (stats.temp / 100) * 100 })
  if (components.disk)    active.push({ label: 'DISK', value: stats.disk })
  if (components.network) active.push({ label: 'NET',  value: (stats.networkDown / 50) * 100 })
  if (components.battery) active.push({ label: 'BAT',  value: stats.battery })
  if (components.vram)    active.push({ label: 'VRAM', value: stats.vram })

  if (!settings.systemMonitorEnabled || active.length === 0) return null

  return (
    <div style={positionStyle}>
      <div className="flex flex-col gap-3">
        {active.map(c => (
          <CircularProgress key={c.label} value={c.value} label={c.label} />
        ))}
      </div>
    </div>
  )
}

export default SystemMonitor
