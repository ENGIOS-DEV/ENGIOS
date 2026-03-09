import { useState, useRef, useEffect } from 'react'
import { CornerDownLeft, Circle } from 'lucide-react'
import { sendMessage } from '../helpers/aiProvider'
import type { Message } from '../helpers/aiProvider'
import { Z } from '../zIndex'

// ─── Props ────────────────────────────────────────────────────────────────────
interface AidaChatProps {
  isOpen:      boolean
  onClose:     () => void
  accentColor: string
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AidaChat({ isOpen, onClose, accentColor }: AidaChatProps) {
  const [messages,    setMessages]    = useState<Message[]>([])
  const [input,       setInput]       = useState('')
  const [isThinking,  setIsThinking]  = useState(false)
  const messagesEndRef                = useRef<HTMLDivElement>(null)
  const inputRef                      = useRef<HTMLInputElement>(null)

  // ── Auto scroll to bottom on new messages ───────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Focus input when opened ──────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [isOpen])

  // ── Send message ─────────────────────────────────────────────────────────────
  async function handleSend() {
    const text = input.trim()
    if (!text || isThinking) return

    const userMessage: Message = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsThinking(true)

    // Add empty assistant message to stream into
    const assistantMessage: Message = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMessage])

    try {
      await sendMessage(updatedMessages, (chunk) => {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      })
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'I encountered an error. Please check that Ollama is running.',
        }
        return updated
      })
    }

    setIsThinking(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 flex flex-col rounded-xl overflow-hidden"
      style={{
        top:               '100%',
        marginTop:         '8px',
        width:             '80%',
        height:            '60vh',
        zIndex:            Z.AIDA_CHAT,
        backgroundColor:   'rgba(13,17,23,0.97)',
        backdropFilter:    'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border:            '1px solid rgba(255,255,255,0.08)',
        boxShadow:         '0 24px 64px rgba(0,0,0,0.6)',
      }}
    >

      {/* ── Title Bar ───────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: accentColor, fontFamily: 'DM Mono, monospace' }}
        >
          AIDA
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded transition-colors hover:bg-white/10"
          style={{ color: accentColor }}
        >
          <Circle size={10} />
        </button>
      </div>

      {/* ── Messages ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <span
              className="text-xs text-center"
              style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono, monospace' }}
            >
              How can I help you today?
            </span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[75%] px-4 py-3 rounded-xl text-sm leading-relaxed"
              style={msg.role === 'user' ? {
                backgroundColor: accentColor + '33',
                border:          `1px solid ${accentColor}44`,
                color:           'rgba(255,255,255,0.9)',
              } : {
                backgroundColor: 'rgba(255,255,255,0.05)',
                border:          '1px solid rgba(255,255,255,0.08)',
                color:           'rgba(255,255,255,0.8)',
              }}
            >
              {msg.content || (
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>
                  thinking...
                </span>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar ───────────────────────────────────────────────────────── */}
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
          placeholder="Ask AIDA anything..."
          disabled={isThinking}
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30"
        />
        <button
          onClick={handleSend}
          disabled={isThinking || !input.trim()}
          className="shrink-0 transition-colors"
          style={{ color: input.trim() && !isThinking ? accentColor : 'rgba(255,255,255,0.2)' }}
        >
          <CornerDownLeft size={16} />
        </button>
      </div>

    </div>
  )
}
