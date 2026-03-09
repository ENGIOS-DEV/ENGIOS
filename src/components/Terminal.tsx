import { useEffect, useRef, useCallback } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { Circle } from 'lucide-react'
import { Z } from '../zIndex'
import 'xterm/css/xterm.css'

interface TerminalProps {
  isOpen: boolean
  onClose: () => void
  accentColor: string
}

const PTY_ID = 'aida-terminal'

export default function Terminal({ isOpen, onClose, accentColor }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const xtermRef    = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const activeRef   = useRef(false)

  const cleanup = useCallback(() => {
    if (activeRef.current) {
      window.electron?.pty.offData(PTY_ID)
      window.electron?.pty.kill(PTY_ID)
      activeRef.current = false
    }
    if (xtermRef.current) {
      xtermRef.current.dispose()
      xtermRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isOpen || !containerRef.current || !window.electron) return

    // Create xterm instance
    const term = new XTerm({
      fontFamily: 'DM Mono, monospace',
      fontSize: 13,
      allowProposedApi: true,
      theme: {
        background: '#0D1117',
        foreground: '#E6E6E6',
        cursor:     accentColor,
        black:      '#0D1117',
        brightBlack:'#4B5563',
      },
      cursorBlink: true,
      scrollback:  1000,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(containerRef.current)
    fitAddon.fit()

    xtermRef.current    = term
    fitAddonRef.current = fitAddon
    activeRef.current   = true

    // Create PTY and wire up
    window.electron.pty.create(PTY_ID).then(() => {
      window.electron!.pty.onData(PTY_ID, data => term.write(data))
      window.electron!.pty.onExit(PTY_ID, () => {
        term.write('\r\n[session ended]\r\n')
        activeRef.current = false
      })
    })

    // Send user input to PTY
    term.onData(data => {
      window.electron?.pty.write(PTY_ID, data)
    })

    // Resize handler
    const observer = new ResizeObserver(() => {
      fitAddon.fit()
      // Wire CTRL+SHIFT+C to system clipboard
    term.attachCustomKeyEventHandler((e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        const selection = term.getSelection()
        if (selection) navigator.clipboard.writeText(selection)
        return false
      }
      return true
    })
      const { cols, rows } = term
      window.electron?.pty.resize(PTY_ID, cols, rows)
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      cleanup()
    }
  }, [isOpen, accentColor, cleanup])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        height: '100vh',
        background: '#0D1117',
        borderTop: `1px solid ${accentColor}33`,
        zIndex: Z.MENU_BAR + 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px',
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
        flexShrink: 0,
      }}>
        <span style={{ color: accentColor, fontSize: 11, fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em' }}>
          TERMINAL
        </span>
        <button
          onClick={() => { cleanup(); onClose() }}
          style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          <Circle size={12} style={{ color: accentColor }} />
        </button>
      </div>

      {/* ── Terminal Canvas ── */}
      <div
        ref={containerRef}
        style={{ flex: 1, padding: '8px', overflow: 'hidden' }}
      />
    </div>
  )
}
