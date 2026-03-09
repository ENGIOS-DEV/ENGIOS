import { useState, useEffect, useRef, useCallback } from 'react'
import type { GlobalSettings } from './types/settings'
import { defaultSettings } from './types/settings'
import MenuBarHandle from './components/MenuBarHandle'
import MenuBar from './components/MenuBar'
import GlobalSettingsPanel from './components/GlobalSettings'
import SystemMonitor from './components/SystemMonitor'
import ClockWeatherWidget from './components/ClockWeatherWidget'
import ToastNotification from './components/ToastNotification'
import Terminal from './components/Terminal'
import FileExplorer from './components/FileExplorer'
import AidaChat from './components/AidaChat'
import { loadTodayConfig } from './components/TodaySettings'
import {
  startNotificationService,
  stopNotificationService,
  onAlertChange,
  onToast,
} from './services/notificationService'
import type { AlertState, TaskAlert } from './services/notificationService'

const STORAGE_KEY = 'aida-settings'

function loadSettings(): GlobalSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) }
  } catch (e) {
    console.warn('Failed to load settings:', e)
  }
  return defaultSettings
}

function App() {
  const [settings,        setSettings]        = useState<GlobalSettings>(loadSettings)
  const [isMenuOpen,      setIsMenuOpen]      = useState(false)
  const [isSettingsOpen,  setIsSettingsOpen]  = useState(false)
  const [isTerminalOpen,  setIsTerminalOpen]  = useState(false)
  const [isExplorerOpen,  setIsExplorerOpen]  = useState(false)
  const [isAidaOpen,      setIsAidaOpen]      = useState(false)
  const [aidaInitialMsg,  setAidaInitialMsg]  = useState<string | undefined>(undefined)
  const [alerts,          setAlerts]          = useState<AlertState>({ low: false, medium: false, high: false })
  const [activeToast,     setActiveToast]     = useState<TaskAlert | null>(null)
  const autoHideTimer                          = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Terminal keyboard shortcut — CTRL+` ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') setIsTerminalOpen(prev => !prev)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── Persist settings ─────────────────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)) }
    catch (e) { console.warn('Failed to save settings:', e) }
  }, [settings])

  // ── Start notification service ───────────────────────────────────────────────
  useEffect(() => {
    onAlertChange(state => setAlerts({ ...state }))
    onToast(alert => {
      const cfg = loadTodayConfig()
      if (cfg.notificationsEnabled) setActiveToast(alert)
    })
    startNotificationService()
    return () => stopNotificationService()
  }, [])

  // ── Auto-hide logic ──────────────────────────────────────────────────────────
  const clearAutoHideTimer = useCallback(() => {
    if (autoHideTimer.current) { clearTimeout(autoHideTimer.current); autoHideTimer.current = null }
  }, [])

  const startAutoHideTimer = useCallback(() => {
    clearAutoHideTimer()
    if (settings.autoHideMenu) {
      autoHideTimer.current = setTimeout(() => setIsMenuOpen(false), settings.autoHideDelay * 1000)
    }
  }, [settings.autoHideMenu, settings.autoHideDelay, clearAutoHideTimer])

  useEffect(() => {
    if (isMenuOpen && settings.autoHideMenu) startAutoHideTimer()
    else clearAutoHideTimer()
    return () => clearAutoHideTimer()
  }, [isMenuOpen, settings.autoHideMenu, settings.autoHideDelay])

  function handleMenuMouseMove() {
    if (isMenuOpen && settings.autoHideMenu) startAutoHideTimer()
  }

  function updateSettings(changes: Partial<GlobalSettings>) {
    setSettings(prev => ({ ...prev, ...changes }))
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <div className="relative z-10 w-full h-full text-white">

        <div onMouseMove={handleMenuMouseMove}>
          <MenuBar
            isOpen={isMenuOpen}
            settings={settings}
            onOpenSettings={() => { setIsSettingsOpen(true); clearAutoHideTimer() }}
            onOpenTerminal={() => { setIsTerminalOpen(prev => !prev); setIsMenuOpen(false) }}
            onOpenExplorer={() => { setIsExplorerOpen(true); setIsMenuOpen(false) }}
            onOpenAida={(msg) => { setIsAidaOpen(true); setIsMenuOpen(false); if (msg) setAidaInitialMsg(msg) }}
          />
          <MenuBarHandle
            isMenuOpen={isMenuOpen}
            onToggle={() => setIsMenuOpen(prev => !prev)}
            accentColor={settings.accentColor}
            alerts={alerts}
          />
        </div>

        <GlobalSettingsPanel
          isOpen={isSettingsOpen}
          settings={settings}
          onClose={() => { setIsSettingsOpen(false); if (isMenuOpen && settings.autoHideMenu) startAutoHideTimer() }}
          onUpdate={updateSettings}
        />

        <SystemMonitor settings={settings} />
        <ClockWeatherWidget settings={settings} />

        <ToastNotification
          alert={activeToast}
          onDismiss={() => setActiveToast(null)}
          accentColor={settings.accentColor}
        />

        <Terminal
          isOpen={isTerminalOpen}
          onClose={() => setIsTerminalOpen(false)}
          accentColor={settings.accentColor}
        />

        <FileExplorer
          isOpen={isExplorerOpen}
          onClose={() => setIsExplorerOpen(false)}
          accentColor={settings.accentColor}
        />

        <AidaChat
          isOpen={isAidaOpen}
          onClose={() => setIsAidaOpen(false)}
          accentColor={settings.accentColor}
          initialMessage={aidaInitialMsg}
          onConsumeInitial={() => setAidaInitialMsg(undefined)}
        />

      </div>
    </div>
  )
}

export default App
