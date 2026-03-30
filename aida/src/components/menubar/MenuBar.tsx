// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: MenuBar
// AIDA-2 — src/components/menubar/MenuBar.tsx
//
// Responsibility:
//   The AIDA pull-down menubar surface.
//   Pure consumer of src/themes/menubar.ts — zero style definitions here.
//
// Import depth: menubar/ → depth 2 → ../../
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import { FileText, CheckSquare, Calendar, Settings, SlidersHorizontal, Check } from 'lucide-react'
import type { GlobalSettings, TodaySettings } from '../../types/settings'
import { defaultSettings, defaultTodaySettings } from '../../types/settings'
import { loadGlobalSettings, loadTodaySettings } from '../../services/settingsDb'
import { useGlobal }             from '../../global/useGlobal'
import ProductivityBar                from './ProductivityBar'
import ToastStack, { ToastItem }      from './ToastStack'
import {
  getMenuBarStyle,
  getMenuBarWrapperStyle,
  getMenuBarGridStyle,
  getMenuBarColumnStyle,
  getMenuBarSettingsButtonStyle,
  getMenuBarSettingsButtonHoverStyle,
  getMenuBarSectionHeaderStyle,
  getMenuBarSectionHeaderRowStyle,
  getMenuBarTodayButtonStyle,
  getMenuBarTaskRowStyle,
  getMenuBarTaskPriorityDotStyle,
  getMenuBarTaskTitleStyle,
  getMenuBarTaskDueStyle,
  getMenuBarTaskCircleStyle,
  getMenuBarTaskOpenButtonStyle,
  getMenuBarBodyTextStyle,
  getMenuBarSystemRowStyle,
  getMenuBarQuickActionsListStyle,
  getMenuBarSystemSectionStyle,
  getMenuBarQuickActionItemStyle,
  getMenuBarQuickActionIconStyle,
  getMenuBarQuickActionPlusStyle,
  getProductivityBarStyle,
  getMenuBarGreetingWrapperStyle,
  getMenuBarGreetingTextStyle,
  getMenuBarGreetingSubtitleStyle,
  MENUBAR_FONT_SCALE,
  MENUBAR_ACTION_COLOURS,
  MENUBAR_LAYOUT,
} from '../../themes/menubar'

// ─── Greeting helpers ─────────────────────────────────────────────────────────

function getGreeting(): { text: string; subtitle: string } {
  const h = new Date().getHours()
  if (h >= 5  && h < 9)  return { text: 'Good morning',              subtitle: 'Early bird! The day is yours. 🐦'       }
  if (h >= 9  && h < 12) return { text: 'Good morning',              subtitle: 'Hope your coffee is strong. ☕'         }
  if (h >= 12 && h < 14) return { text: 'Good afternoon',            subtitle: 'Halfway there — keep going! 🚀'         }
  if (h >= 14 && h < 17) return { text: 'Good afternoon',            subtitle: 'Afternoon grind in full swing. 💪'      }
  if (h >= 17 && h < 20) return { text: 'Good evening',              subtitle: 'Golden hour — wrap it up nicely. ✨'    }
  if (h >= 20 && h < 23) return { text: 'Good evening',              subtitle: 'Winding down? You earned it. 🌙'        }
  return                         { text: 'Burning the midnight oil',  subtitle: 'Night owl mode activated. 🦉'           }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MenuBar() {
  const [settings,        setSettings]        = useState<GlobalSettings>(defaultSettings)
  const [toasts,          setToasts]          = useState<ToastItem[]>([])
  const [osUsername,      setOsUsername]      = useState('')
  const [settingsHovered, setSettingsHovered] = useState(false)
  const settingsThrottle = useRef<ReturnType<typeof setTimeout> | null>(null)



  // ── Today tasks ────────────────────────────────────────────────────────────
  interface TodayTask { id: number; title: string; completed: number; priority: string; due_date: string | null; due_time: string | null; completed_date: string | null }
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([])
  const [todaySettings, setTodaySettings] = useState<TodaySettings>(defaultTodaySettings)
  const loadTasksRef   = useRef<() => void>(() => {})
  const taskClickGuard = useRef<Set<number>>(new Set())

  useEffect(() => {
    loadTasksRef.current = () => {
      window.electron?.db?.tasks?.get().then((all: unknown) => {
        const tasks = all as TodayTask[] | undefined
        if (!tasks) return
        const todayStr = new Date().toISOString().slice(0, 10)
        setTodayTasks(tasks.filter(t => !t.completed && (!t.due_date || t.due_date === todayStr)))
      })
    }
  })

  function loadTasks() { loadTasksRef.current() }
  const [isMenuOpen,      setIsMenuOpen]      = useState(false)
  const containerRef      = useRef<HTMLDivElement>(null)
  useGlobal(settings)

  // ── window:fit — fires once on mount only ────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || !window.electron) return
    // Small delay to let content render fully
    const timer = setTimeout(() => {
      const height = containerRef.current?.offsetHeight ?? 0
      if (height > 10) {
        window.electron!.send('window:fit', {
          name:   'menubar',
          width:  window.screen.availWidth,
          height,
          anchor: 'top',
        })
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [])  // ← empty deps: fires once on mount only

  // ── Mouse position tracking — transparent passthrough ───────────────────────
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      // If DOM is mid-render, elementFromPoint can return null — skip to avoid
      // incorrectly setting setIgnoreMouseEvents(true) over visible content
      if (!el) return
      let node = el as HTMLElement | null
      let over = false
      while (node) {
        if (node.dataset?.menubarContent !== undefined) { over = true; break }
        node = node.parentElement
      }
      window.electron?.send(over ? 'menubar:mouse-over-content' : 'menubar:mouse-over-transparent')
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  // ── Load + listen ─────────────────────────────────────────────────────────
  useEffect(() => {
    loadGlobalSettings().then(setSettings)
    window.electron?.send('menubar:ready')
    loadTodaySettings().then(setTodaySettings)
    loadTasks()
    window.electron?.getOsUsername().then(setOsUsername).catch(() => {})
  }, [])

  useEffect(() => {
    const offSettings = window.electron?.on(
      'settings:updated',
      (_: unknown, updated: GlobalSettings) => {
        // Throttle re-renders — max once per 100ms
        if (settingsThrottle.current) clearTimeout(settingsThrottle.current)
        settingsThrottle.current = setTimeout(() => {
          setSettings(prev => ({ ...prev, ...updated }))
        }, 100)
      }
    )
    const offState    = window.electron?.on('menubar:state', (_: unknown, open: boolean) => {
      setIsMenuOpen(open)
      if (open) {
        loadTasks()

      }
    })
    const offTasks    = window.electron?.on('tasks:updated', () => loadTasks())
    const offToday    = window.electron?.on('today-settings:updated', (_: unknown, updated: TodaySettings) => setTodaySettings(prev => ({ ...prev, ...updated })))
    const offToast = window.electron?.on('toast:show', (_: unknown, toast: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
      setToasts(prev => [...prev.slice(-2), { ...toast, id }])
    })
    return () => { offSettings?.(); offState?.(); offTasks?.(); offToday?.(); offToast?.() }
  }, [])

  // ── Derived ───────────────────────────────────────────────────────────────
  const ac    = settings.accentColor
  const scale = MENUBAR_FONT_SCALE[settings.fontSize]

  const quickActions = [
    { label: 'Notes',  icon: <FileText    size={16} />, color: MENUBAR_ACTION_COLOURS.note  },
    { label: 'Tasks',  icon: <CheckSquare size={16} />, color: MENUBAR_ACTION_COLOURS.task  },
    { label: 'Events', icon: <Calendar    size={16} />, color: MENUBAR_ACTION_COLOURS.event },
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div ref={containerRef} className="fixed top-0 left-0 right-0 bottom-0">

        {/* ── Background surface — wraps all visible content ──────────── */}
        <div data-menubar-content style={getMenuBarStyle(settings)}>

        {/* ── Centering wrapper ──────────────────────────────────────────── */}
        <div style={getMenuBarWrapperStyle()}>

          {/* ── Settings button ─────────────────────────────────────────── */}
          <button
            onClick={() => window.electron?.send('settings:open')}
            onMouseEnter={() => setSettingsHovered(true)}
            onMouseLeave={() => setSettingsHovered(false)}
            style={{
              ...getMenuBarSettingsButtonStyle(settings),
              ...(settingsHovered ? getMenuBarSettingsButtonHoverStyle(settings) : {}),
            }}
          >
            <Settings size={18} />
          </button>

          {/* ── Main grid ───────────────────────────────────────────────── */}
          <div style={getMenuBarGridStyle()}>

            {/* Quick Actions */}
            <div style={getMenuBarColumnStyle()}>
              <h3 className={`${scale.heading} uppercase tracking-widest`} style={getMenuBarSectionHeaderStyle(settings)}>
                Quick Actions
              </h3>
              <div style={getMenuBarQuickActionsListStyle()}>
                {quickActions.map(action => (
                  <div key={action.label} style={getMenuBarQuickActionItemStyle(settings)}>
                    <div style={getMenuBarQuickActionIconStyle(action.color)}>{action.icon}</div>
                    {action.label}
                    {action.label === 'Tasks' ? (
                      <button
                        style={{ ...getMenuBarQuickActionPlusStyle(settings), pointerEvents: 'all', cursor: 'pointer' }}
                        onClick={() => window.electron?.send('tasks:open')}
                      >+</button>
                    ) : (
                      <div style={getMenuBarQuickActionPlusStyle(settings)}>+</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Today */}
            <div style={getMenuBarColumnStyle()}>
              <div style={getMenuBarSectionHeaderRowStyle()}>
                <h3 className={`${scale.heading} uppercase tracking-widest`} style={getMenuBarSectionHeaderStyle(settings)}>
                  Today
                </h3>
                <button onClick={() => window.electron?.send('today-settings:open')} style={getMenuBarTodayButtonStyle(settings)}>
                  <SlidersHorizontal size={11} />
                </button>
              </div>
              {todayTasks.length === 0 ? (
                <p className={`${scale.body}`} style={getMenuBarBodyTextStyle(settings)}>All clear for today!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {todayTasks
                    .filter(t => todaySettings.showCompleted ? true : !t.completed)
                    .slice(0, todaySettings.maxVisible)
                    .map(task => (
                    <div key={task.id} style={getMenuBarTaskRowStyle()}>
                      <div style={getMenuBarTaskPriorityDotStyle(task.priority, !!task.completed)} />
                      <span style={getMenuBarTaskTitleStyle(settings, !!task.completed)}>
                        {task.title}
                      </span>
                      {task.due_time && (
                        <span style={getMenuBarTaskDueStyle(settings)}>{task.due_time}</span>
                      )}
                      <button
                        style={getMenuBarTaskCircleStyle(!!task.completed, settings.accentColor)}
                        onClick={(e) => {
                          if (e.detail > 1) return
                          if (taskClickGuard.current.has(task.id)) return
                          taskClickGuard.current.add(task.id)
                          setTimeout(() => taskClickGuard.current.delete(task.id), 600)
                          const nowCompleted = !task.completed
                          setTodayTasks(prev => prev.map(t =>
                            t.id === task.id ? { ...t, completed: nowCompleted ? 1 : 0 } : t
                          ))
                          window.electron?.db?.tasks?.update(task.id, {
                            completed:      nowCompleted ? 1 : 0,
                            completed_date: nowCompleted ? new Date().toISOString().slice(0, 10) : null,
                          })
                        }}
                        title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {!!task.completed && <Check size={8} strokeWidth={3} />}
                      </button>
                    </div>
                  ))}
                  <button
                    style={getMenuBarTaskOpenButtonStyle(settings)}
                    onClick={() => window.electron?.send('tasks:open')}
                  >
                    View all tasks →
                  </button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div style={getMenuBarColumnStyle()}>
              <h3 className={`${scale.heading} uppercase tracking-widest`} style={getMenuBarSectionHeaderStyle(settings)}>
                Notifications
              </h3>
              <p className={`${scale.body}`} style={getMenuBarBodyTextStyle(settings)}>No new notifications</p>
            </div>

            {/* System */}
            <div style={getMenuBarColumnStyle()}>
              <h3 className={`${scale.heading} uppercase tracking-widest`} style={getMenuBarSectionHeaderStyle(settings)}>
                System
              </h3>
              <div style={getMenuBarSystemSectionStyle()}>
                <div>
                  <div className={`${scale.body}`} style={getMenuBarSystemRowStyle(settings)}>
                    <span style={{ opacity: 0.7 }}>🔊</span>
                    <span>Volume</span>
                  </div>
                  <input
                    type="range" min="0" max="100" defaultValue={75}
                    className="w-full rounded-full"
                    style={{ accentColor: ac, height: MENUBAR_LAYOUT.rangeTrackH } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>{/* end centering wrapper */}

        {/* ── Greeting ──────────────────────────────────────────────────── */}
        {settings.showWelcome && (() => {
          const { text, subtitle } = getGreeting()
          const name = settings.userName || osUsername || 'there'
          return (
            <div style={getMenuBarGreetingWrapperStyle()}>
              <span style={getMenuBarGreetingTextStyle(settings)}>{text}, {name}!</span>
              <span style={getMenuBarGreetingSubtitleStyle(settings)}>{subtitle}</span>
            </div>
          )
        })()}

        {/* ── Productivity bar ──────────────────────────────────────────── */}
        <div style={getProductivityBarStyle()}>
          <ProductivityBar settings={settings} isMenuOpen={isMenuOpen} />
        </div>

        </div>{/* end background surface */}

      </div>

      {/* ── Toast stack — fixed bottom-right, outside menubar surface ── */}
      <ToastStack
        toasts={toasts}
        settings={settings}
        onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))}
      />
    </>
  )
}
