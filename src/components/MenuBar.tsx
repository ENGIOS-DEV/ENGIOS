import { useState, useEffect } from 'react'
import { FileText, CheckSquare, Calendar, Settings, SlidersHorizontal } from 'lucide-react'
import type { GlobalSettings } from '../types/settings'
import type { Task } from '../services/db'
import { Tasks } from '../services/db'
import ProductivityBar from './ProductivityBar'
import TasksPanel from './TasksPanel'
import TodaySettings, { loadTodayConfig } from './TodaySettings'
import type { TodayConfig } from './TodaySettings'
import { getMenuStyle, getTransitionDuration } from '../theme'
import { Z } from '../zIndex'

interface MenuBarProps {
  isOpen: boolean
  settings: GlobalSettings
  onOpenSettings: () => void
}

const notifications = [
  { text: 'Price drop on your wishlist item!', dot: 'bg-red-400'   },
  { text: 'New video from favorite creator',   dot: 'bg-green-400' },
  { text: 'Package out for delivery',          dot: 'bg-blue-400'  },
]

const fontScales = {
  small:  { heading: 'text-[10px]', body: 'text-xs',   subtext: 'text-[10px]' },
  medium: { heading: 'text-xs',     body: 'text-sm',   subtext: 'text-xs'     },
  large:  { heading: 'text-sm',     body: 'text-base', subtext: 'text-xs'     },
}

const PRIORITY_DOT: Record<string, string> = {
  low:    'bg-yellow-300',
  medium: 'bg-blue-400',
  high:   'bg-red-400',
}

function MenuBar({ isOpen, settings, onOpenSettings }: MenuBarProps) {
  const menuStyle        = getMenuStyle(settings)
  const transitionDuration = getTransitionDuration(settings)
  const scale            = fontScales[settings.fontSize]
  const textColor        = 'text-white/60'
  const subtextColor     = 'text-white/60'
  const ac               = settings.accentColor

  const [volume, setVolume]                     = useState(75)
  const [showTasksPanel, setShowTasksPanel]     = useState(false)
  const [showTodaySettings, setShowTodaySettings] = useState(false)
  const [todayTasks, setTodayTasks]             = useState<Task[]>([])
  const [todayConfig, setTodayConfig]           = useState<TodayConfig>(loadTodayConfig)

  // Load today's tasks whenever menu opens
  useEffect(() => {
    if (isOpen) loadTodayTasks()
  }, [isOpen])

  async function loadTodayTasks() {
    const all   = await Tasks.getAll()
    const today = new Date().toISOString().slice(0, 10)
    const relevant = all
      .filter(t => todayConfig.showCompleted ? true : !t.completed)
      .filter(t => !t.due_date || t.due_date <= today)
      .slice(0, todayConfig.maxVisible)
    setTodayTasks(relevant)
  }

  const quickActions = [
    {
      label: 'New Note',  icon: <FileText size={20} />,    color: 'text-pink-400',
      onClick: () => {},
    },
    {
      label: 'New Task',  icon: <CheckSquare size={20} />, color: 'text-green-400',
      onClick: () => setShowTasksPanel(true),
    },
    {
      label: 'New Event', icon: <Calendar size={20} />,    color: 'text-blue-400',
      onClick: () => {},
    },
  ]

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 transition-transform ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}
        style={{ ...menuStyle, transitionDuration, zIndex: Z.MENU_BAR }}
      >
        {/* ── Centering Wrapper ───────────────────────────────────────── */}
        <div className="flex justify-center pt-6 py-6 pb-2 relative">

          {/* ── Settings Button ─────────────────────────────────────── */}
          <button
            onClick={onOpenSettings}
            className="absolute right-4 top-4 flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:scale-110"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
          >
            <Settings size={18} />
          </button>

          {/* ── Main Grid ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-4 min-h-[220px] w-[70%]">

            {/* ── Quick Actions ───────────────────────────────────────── */}
            <div className="px-4 py-8 min-w-0 w-full">
              <h3 className={`${scale.heading} font-semibold uppercase tracking-widest mb-4 ${subtextColor}`}>
                Quick Actions
              </h3>
              <div className="flex flex-col gap-2.5">
                {quickActions.map(action => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left w-full ${textColor}`}
                  >
                    <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 ${action.color}`}>
                      {action.icon}
                    </div>
                    <span className={`${scale.body} font-medium`}>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Today ───────────────────────────────────────────────── */}
            <div className="px-4 py-8 min-w-0 w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${scale.heading} font-semibold uppercase tracking-widest ${subtextColor}`}>
                  Today
                </h3>
                <button
                  onClick={() => setShowTodaySettings(true)}
                  className="text-white/25 hover:text-white/60 transition-colors p-1 rounded-md hover:bg-white/5"
                >
                  <SlidersHorizontal size={11} />
                </button>
              </div>

              {todayTasks.length === 0 ? (
                <p className={`${scale.body} text-white/25 italic`}>All clear for today!</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {todayTasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/8 transition-colors cursor-pointer"
                      onClick={() => setShowTasksPanel(true)}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
                      <div className="min-w-0">
                        <div className={`${scale.body} text-white/80 truncate`}>{task.title}</div>
                        {task.due_date && (
                          <div className={`${scale.subtext} text-white/30`}>
                            {new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            {task.due_time && ` · ${task.due_time}`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Notifications ───────────────────────────────────────── */}
            <div className="px-4 py-8 min-w-0 w-full">
              <h3 className={`${scale.heading} font-semibold uppercase tracking-widest mb-4 ${subtextColor}`}>
                Notifications
              </h3>
              <div className="flex flex-col gap-3.5">
                {notifications.map(n => (
                  <div key={n.text} className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${n.dot}`} />
                    <span className={`${scale.body} ${textColor}`}>{n.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── System ──────────────────────────────────────────────── */}
            <div className="px-4 py-8 min-w-0 w-full">
              <h3 className={`${scale.heading} font-semibold uppercase tracking-widest mb-4 ${subtextColor}`}>
                System
              </h3>
              <div className="flex flex-col gap-5">
                <div>
                  <div className={`flex items-center gap-2.5 mb-2 ${scale.body} ${textColor}`}>
                    <span className="opacity-70">🔊</span>
                    <span>Volume</span>
                  </div>
                  <input
                    type="range" min="0" max="100"
                    value={volume}
                    onChange={e => setVolume(Number(e.target.value))}
                    className="w-full h-2.5 rounded-full cursor-pointer"
                    style={{ accentColor: ac }}
                  />
                </div>
              </div>
            </div>

          </div>
          {/* ── End Main Grid ─────────────────────────────────────────── */}

        </div>
        {/* ── End Centering Wrapper ─────────────────────────────────── */}

        {/* ── Productivity Bar ──────────────────────────────────────────── */}
        <ProductivityBar settings={settings} isMenuOpen={isOpen} />

        {/* ── Bottom handle indicator ───────────────────────────────────── */}
        <div className="flex justify-center py-2">
          <div className="w-8 h-1 rounded-full bg-white/20" />
        </div>

      </div>

      {/* ── Tasks Panel ───────────────────────────────────────────────────── */}
      <TasksPanel
        isOpen={showTasksPanel}
        onClose={() => { setShowTasksPanel(false); loadTodayTasks() }}
        settings={settings}
      />

      {/* ── Today Settings ────────────────────────────────────────────────── */}
      <TodaySettings
        isOpen={showTodaySettings}
        onClose={() => { setShowTodaySettings(false); loadTodayTasks() }}
        accentColor={settings.accentColor}
        onChange={cfg => { setTodayConfig(cfg); loadTodayTasks() }}
      />
    </>
  )
}

export default MenuBar
