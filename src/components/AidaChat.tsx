import { useState, useEffect, useRef } from 'react'
import { CornerDownLeft, Circle } from 'lucide-react'
import { sendMessage } from '../helpers/aiProvider'
import type { Message } from '../helpers/aiProvider'
import { Z } from '../zIndex'

// ─── Props ────────────────────────────────────────────────────────────────────
interface AidaChatProps {
  isOpen:      boolean
  onClose:     () => void
  accentColor: string
  messages:    Message[]
  onMessages:  (messages: Message[]) => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AidaChat({ isOpen, onClose, accentColor, messages, onMessages }: AidaChatProps) {
  const [input,    setInput]    = useState('')
  const [thinking, setThinking] = useState(false)

  // ── Draggable state (identical to FileExplorer) ──────────────────────────────
  const [pos,      setPos]      = useState({ x: 80, y: 80 })
  const [dragging, setDragging] = useState(false)
  const dragOffset               = useRef({ x: 0, y: 0 })

  const inputRef       = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ── Auto scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Focus input when opened ──────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [isOpen])

  // ── Drag (identical to FileExplorer) ─────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true)
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y })
    const onUp   = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging])

  // ── Send ─────────────────────────────────────────────────────────────────────
  const messagesRef = useRef<Message[]>(messages)
  useEffect(() => { messagesRef.current = messages }, [messages])

  // ── Auto-send when opened with a pre-filled unanswered message ──────────────
  useEffect(() => {
    if (!isOpen) return
    const last = messagesRef.current[messagesRef.current.length - 1]
    if (last?.role === 'user') handleSend(last.content)
  }, [isOpen])

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? input).trim()
    if (!text || thinking) return

    const snapshot         = overrideText ? messagesRef.current.slice(0, -1) : messagesRef.current
    const userMsg: Message = { role: 'user', content: text }
    const history          = [...snapshot, userMsg]
    onMessages([...history, { role: 'assistant', content: '' }])
    if (!overrideText) setInput('')
    setThinking(true)

    let accumulated = ''
    try {
      await sendMessage(history, (chunk) => {
        accumulated += chunk
        onMessages([...history, { role: 'assistant', content: accumulated }])
      })
    } catch {
      onMessages([...history, { role: 'assistant', content: 'Error — check Ollama is running.' }])
    }

    setThinking(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    if (e.key === 'Escape') onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* ── Backdrop (identical to FileExplorer) ─────────────────────────────── */}
      <div
        className="fixed inset-0"
        style={{ zIndex: Z.AIDA_CHAT - 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
      />

      {/* ── Window (identical shell to FileExplorer) ─────────────────────────── */}
      <div
        className="fixed flex flex-col rounded-xl overflow-hidden"
        style={{
          left:                 pos.x,
          top:                  pos.y,
          width:                '580px',
          height:               '520px',
          zIndex:               Z.AIDA_CHAT,
          backgroundColor:      'rgba(13,17,23,0.97)',
          backdropFilter:       'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border:               `1px solid ${accentColor}33`,
          boxShadow:            '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Title Bar (identical structure to FileExplorer) ──────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0 cursor-grab active:cursor-grabbing"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          onMouseDown={onMouseDown}
        >
          <span
            className="text-xs font-semibold uppercase tracking-widest select-none"
            style={{ color: accentColor, fontFamily: 'DM Mono, monospace' }}
          >
            AIDA
          </span>
          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <button
                onClick={() => onMessages([])}
                className="text-xs transition-colors select-none"
                style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono, monospace' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
              >
                clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded transition-colors hover:bg-white/10"
              style={{ color: accentColor }}
            >
              <Circle size={10} />
            </button>
          </div>
        </div>

        {/* ── Messages ─────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center h-full">
              <span
                className="text-xs text-center select-none"
                style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono, monospace' }}
              >
                How can I help you today?
              </span>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[75%] px-4 py-2.5 rounded-xl text-sm leading-relaxed"
                style={msg.role === 'user' ? {
                  backgroundColor: accentColor + '22',
                  border:          `1px solid ${accentColor}33`,
                  color:           'rgba(255,255,255,0.9)',
                } : {
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border:          '1px solid rgba(255,255,255,0.07)',
                  color:           'rgba(255,255,255,0.75)',
                }}
              >
                {msg.content || <span style={{ color: accentColor, opacity: 0.5 }}>thinking...</span>}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Bar ────────────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-4 py-3 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Continue the conversation..."
            disabled={thinking}
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/25"
          />
          <button
            onClick={() => handleSend()}
            disabled={thinking || !input.trim()}
            className="shrink-0 transition-colors"
            style={{ color: input.trim() && !thinking ? accentColor : 'rgba(255,255,255,0.15)' }}
          >
            <CornerDownLeft size={16} />
          </button>
        </div>

      </div>
    </>
  )
}
