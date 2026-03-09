import { useEffect, useRef } from 'react'
import { Z } from '../zIndex'
import type { AlertState } from '../services/notificationService'

interface MenuBarHandleProps {
  isMenuOpen: boolean
  onToggle:   () => void
  accentColor: string
  alerts:     AlertState
}

function MenuBarHandle({ isMenuOpen, onToggle, alerts }: MenuBarHandleProps) {
  // Refs for the three dot elements
  const leftRef   = useRef<HTMLSpanElement>(null)
  const centerRef = useRef<HTMLSpanElement>(null)
  const rightRef  = useRef<HTMLSpanElement>(null)

  // Radar rings canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)

  // ── Left dot: gentle fade in/out for low priority ─────────────────────
  useEffect(() => {
    const el = leftRef.current
    if (!el) return
    if (alerts.low) {
      el.style.backgroundColor = '#fde047'  // yellow-300
      el.style.animation = 'aida-breathe 2.5s ease-in-out infinite'
    } else {
      el.style.backgroundColor = 'rgba(255,255,255,0.3)'
      el.style.animation = 'none'
      el.style.opacity = '1'
    }
  }, [alerts.low])

  // ── Right dot: gentle fade in/out for medium priority ─────────────────
  useEffect(() => {
    const el = rightRef.current
    if (!el) return
    if (alerts.medium) {
      el.style.backgroundColor = '#60a5fa'  // blue-400
      el.style.animation = 'aida-breathe 2.5s ease-in-out infinite'
    } else {
      el.style.backgroundColor = 'rgba(255,255,255,0.3)'
      el.style.animation = 'none'
      el.style.opacity = '1'
    }
  }, [alerts.medium])

  // ── Center dot: radar rings for high priority ─────────────────────────
  useEffect(() => {
    const el     = centerRef.current
    const canvas = canvasRef.current
    if (!el || !canvas) return

    cancelAnimationFrame(rafRef.current)

    if (!alerts.high) {
      el.style.backgroundColor = 'rgba(255,255,255,0.3)'
      el.style.boxShadow = 'none'
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    el.style.backgroundColor = '#f87171'  // red-400
    el.style.boxShadow = '0 0 6px #f8717180'

    // Radar ring animation
    const ctx    = canvas.getContext('2d')!
    const W      = canvas.width  = 60
    const H      = canvas.height = 60
    const cx     = W / 2
    const cy     = H / 2
    const DOT_R  = 3
    const rings: { r: number; opacity: number }[] = [
      { r: 6,  opacity: 0 },
      { r: 14, opacity: 0 },
      { r: 22, opacity: 0 },
    ]

    let frame = 0

    function draw() {
      ctx.clearRect(0, 0, W, H)
      frame++

      rings.forEach((ring, i) => {
        // Each ring starts at a different phase offset
        const phase = (frame * 0.01 + i * 0.7) % 1
        ring.r       = DOT_R + phase * 20
        ring.opacity = (1 - phase) * 0.18  // max 25% opacity — very subtle

        ctx.beginPath()
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(248,113,113,${ring.opacity})`
        ctx.lineWidth   = 1.5
        ctx.stroke()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [alerts.high])

  return (
    <>
      {/* Breathe keyframe injected once */}
      <style>{`
        @keyframes aida-breathe {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 1;    }
        }
      `}</style>

      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 cursor-pointer group"
        style={{ zIndex: Z.MENU_HANDLE }}
        onClick={onToggle}
      >
        <div
          className="relative flex items-center justify-center gap-2 px-8 py-1.5 rounded-b-lg transition-all duration-300 group-hover:py-2.5"
          style={{
            backgroundColor:      'rgba(255,255,255,0.08)',
            backdropFilter:       'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Radar canvas — centered on the middle dot */}
          <canvas
            ref={canvasRef}
            style={{
              position:        'absolute',
              width:           '60px',
              height:          '60px',
              top:             '50%',
              left:            '50%',
              transform:       'translate(-50%, -50%)',
              pointerEvents:   'none',
            }}
          />

          <span ref={leftRef}   className="w-1.5 h-1.5 rounded-full transition-colors duration-500" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <span ref={centerRef} className="w-1.5 h-1.5 rounded-full transition-colors duration-500 relative z-10" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <span ref={rightRef}  className="w-1.5 h-1.5 rounded-full transition-colors duration-500" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
        </div>

        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {isMenuOpen ? 'click to close' : 'click to open'}
        </div>
      </div>
    </>
  )
}

export default MenuBarHandle
