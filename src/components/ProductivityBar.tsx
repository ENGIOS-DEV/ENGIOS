import { useState, useRef, useEffect } from 'react'
import { CornerDownLeft, ChevronDown, ChevronUp, FileText, Folder } from 'lucide-react'
import geminiIcon from '../assets/icons/gemini.svg'
import metaIcon   from '../assets/icons/meta.svg'
import groqIcon   from '../assets/icons/groq.svg'
import claudeIcon from '../assets/icons/claude.svg'
import openaiIcon from '../assets/icons/openai.svg'
import googleIcon from '../assets/icons/google.svg'
import braveIcon  from '../assets/icons/brave.svg'
import type { GlobalSettings } from '../types/settings'
import type { SearchResult } from '../services/fileSearchService'
import { FileSearchService } from '../services/fileSearchService'
import { sendMessage } from '../helpers/aiProvider'
import type { Message } from '../helpers/aiProvider'
import { Z } from '../zIndex'

// ─── Extend Window type for Electron bridge ───────────────────────────────────
declare global {
  interface Window {
    electron?: {
      searchFiles:   (query: string, maxResults?: number) => Promise<SearchResult[]>
      openFile:      (filePath: string) => Promise<void>
      openProvider:  (url: string, label: string) => Promise<void>
      setAutoStart:  (enabled: boolean) => Promise<void>
      db: {
        notes:  { get: () => Promise<any[]>; create: (d: any) => Promise<any>; update: (id: number, c: any) => Promise<any>; delete: (id: number) => Promise<any> }
        tasks:  { get: () => Promise<any[]>; create: (d: any) => Promise<any>; update: (id: number, c: any) => Promise<any>; delete: (id: number) => Promise<any> }
        events: { get: (r?: any) => Promise<any[]>; create: (d: any) => Promise<any>; update: (id: number, c: any) => Promise<any>; delete: (id: number) => Promise<any> }
      }
      fs: {
        readdir: (dirPath: string) => Promise<Array<{ name: string; path: string; isDir: boolean; size: number; modified: Date }>>
        homedir: () => Promise<string>
      }
      pty: {
        create:  (id: string) => Promise<void>
        write:   (id: string, data: string) => Promise<void>
        resize:  (id: string, cols: number, rows: number) => Promise<void>
        kill:    (id: string) => Promise<void>
        onData:  (id: string, cb: (data: string) => void) => void
        onExit:  (id: string, cb: () => void) => void
        offData: (id: string) => void
      }
      isElectron: boolean
    }
  }
}

// ─── Provider Definitions ─────────────────────────────────────────────────────
const aiProviders = [
  { id: 'gemini', label: 'Gemini',  icon: geminiIcon, url: 'https://gemini.google.com/app' },
  { id: 'meta',   label: 'Meta AI', icon: metaIcon,   url: 'https://www.meta.ai'          },
  { id: 'groq',   label: 'Groq',    icon: groqIcon,   url: 'https://chat.groq.com'        },
  { id: 'claude', label: 'Claude',  icon: claudeIcon, url: 'https://claude.ai'            },
  { id: 'openai', label: 'ChatGPT', icon: openaiIcon, url: 'https://chatgpt.com'          },
]

const webProviders = [
  { id: 'google', label: 'Google', icon: googleIcon, url: 'https://www.google.com'   },
  { id: 'brave',  label: 'Brave',  icon: braveIcon,  url: 'https://search.brave.com' },
]

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProductivityBarProps {
  settings:       GlobalSettings
  isMenuOpen:     boolean
  onOpenExplorer: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────
function ProductivityBar({ settings, isMenuOpen, onOpenExplorer }: ProductivityBarProps) {
  const accentColor = settings.accentColor

  // ── Input & search state ─────────────────────────────────────────────────────
  const [input,          setInput]          = useState('')
  const [activeProvider, setActiveProvider] = useState(aiProviders[0])
  const [showDropdown,   setShowDropdown]   = useState(false)
  const [fileResults,    setFileResults]    = useState<SearchResult[]>([])
  const [showFileResults,setShowFileResults]= useState(false)
  const [isSearching,    setIsSearching]    = useState(false)

  // ── AIDA chat state (persists across open/close) ─────────────────────────────
  const [aidaMessages,   setAidaMessages]   = useState<Message[]>([])
  const [aidaInput,      setAidaInput]      = useState('')
  const [aidaOpen,       setAidaOpen]       = useState(false)
  const [aidaThinking,   setAidaThinking]   = useState(false)

  const inputRef        = useRef<HTMLInputElement>(null)
  const aidaInputRef    = useRef<HTMLInputElement>(null)
  const dropdownRef     = useRef<HTMLDivElement>(null)
  const fileResultsRef  = useRef<HTMLDivElement>(null)
  const messagesEndRef  = useRef<HTMLDivElement>(null)

  // ── Auto scroll AIDA messages ────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aidaMessages])

  // ── Focus AIDA input when chat opens ────────────────────────────────────────
  useEffect(() => {
    if (aidaOpen) setTimeout(() => aidaInputRef.current?.focus(), 50)
  }, [aidaOpen])

  // ── Close file results on outside click ─────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fileResultsRef.current && !fileResultsRef.current.contains(e.target as Node)) {
        setShowFileResults(false)
      }
    }
    if (showFileResults) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFileResults])

  // ── Close everything when menu closes (but preserve AIDA session) ────────────
  useEffect(() => {
    if (!isMenuOpen) {
      setShowDropdown(false)
      setShowFileResults(false)
      setInput('')
    }
  }, [isMenuOpen])

  // ── Close dropdown on outside click ─────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  // ── Handle main bar submit ───────────────────────────────────────────────────
  async function handleSubmit() {
    const text = input.trim()
    if (!text) return

    // ? prefix → open AIDA chat and send first message
    if (text.startsWith('?')) {
      const question = text.slice(1).trim()
      setInput('')
      setAidaOpen(true)
      if (question) sendToAida(question)
      return
    }

    // Otherwise → file search
    setIsSearching(true)
    const results = await FileSearchService.search(text)
    setFileResults(results)
    setShowFileResults(results.length > 0)
    setIsSearching(false)
  }

  // ── Send message to AIDA ─────────────────────────────────────────────────────
  async function sendToAida(text: string) {
    const userMessage: Message = { role: 'user', content: text }
    const updatedMessages = [...aidaMessages, userMessage]
    setAidaMessages(updatedMessages)
    setAidaThinking(true)

    const assistantMessage: Message = { role: 'assistant', content: '' }
    setAidaMessages(prev => [...prev, assistantMessage])

    try {
      await sendMessage(updatedMessages, (chunk) => {
        setAidaMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      })
    } catch {
      setAidaMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'I encountered an error. Please check that Ollama is running.',
        }
        return updated
      })
    }

    setAidaThinking(false)
  }

  // ── Handle AIDA follow-up input ──────────────────────────────────────────────
  async function handleAidaSubmit() {
    const text = aidaInput.trim()
    if (!text || aidaThinking) return
    setAidaInput('')
    await sendToAida(text)
  }

  // ── Keyboard handlers ────────────────────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') {
      setShowDropdown(false)
      setShowFileResults(false)
      setAidaOpen(false)
    }
  }

  function handleAidaKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAidaSubmit()
    }
    if (e.key === 'Escape') setAidaOpen(false)
  }

  // ── Dynamic placeholder ──────────────────────────────────────────────────────
  const placeholder = aidaOpen
    ? 'Search files, or type ? to ask AIDA...'
    : 'Search files and folders, or start with ? to ask AIDA...'

  return (
    <>
      <div style={{ width: '70%', margin: '0 auto' }} className="flex flex-col items-center py-4 gap-2">

        {/* ── Bar ───────────────────────────────────────────────────────── */}
        <div className="relative w-4/5">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full"
            style={{
              backgroundColor:      'rgba(255,255,255,0.07)',
              backdropFilter:       'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border:               '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* ── Provider Icon + Dropdown ───────────────────────────── */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                onClick={(e) => { e.stopPropagation(); setShowDropdown(prev => !prev) }}
              >
                <img src={activeProvider.icon} alt={activeProvider.label} className="w-5 h-5 object-contain" />
                <ChevronDown size={12} className="text-white/40" />
              </button>

              {/* ── Provider Dropdown ─────────────────────────────────── */}
              {showDropdown && (
                <div
                  className="absolute top-full left-0 mt-2 rounded-lg overflow-hidden min-w-40"
                  style={{
                    zIndex:           Z.MENU_DROPDOWN,
                    backgroundColor:  'rgba(20,20,25,0.95)',
                    border:           '1px solid rgba(255,255,255,0.1)',
                    backdropFilter:   'blur(12px)',
                  }}
                >
                  {aiProviders.map(provider => (
                    <button
                      key={provider.id}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => {
                        setActiveProvider(provider)
                        setShowDropdown(false)
                        if (window.electron?.openProvider) {
                          window.electron.openProvider(provider.url, provider.label)
                        } else {
                          window.open(provider.url, '_blank')
                        }
                      }}
                    >
                      <img src={provider.icon} alt={provider.label} className="w-4 h-4 object-contain" />
                      <span>{provider.label}</span>
                    </button>
                  ))}

                  <div className="border-t border-white/10 my-1" />

                  {webProviders.map(provider => (
                    <button
                      key={provider.id}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => {
                        setActiveProvider(provider)
                        setShowDropdown(false)
                        if (window.electron?.openProvider) {
                          window.electron.openProvider(provider.url, provider.label)
                        } else {
                          window.open(provider.url, '_blank')
                        }
                      }}
                    >
                      <img src={provider.icon} alt={provider.label} className="w-4 h-4 object-contain" />
                      <span>{provider.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Divider ───────────────────────────────────────────── */}
            <div className="w-px h-5 bg-white/10 shrink-0" />

            {/* ── Input ─────────────────────────────────────────────── */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30"
            />

            {/* ── Searching indicator ───────────────────────────────── */}
            {isSearching && (
              <span className="text-xs text-white/30 shrink-0">searching...</span>
            )}

            {/* ── Enter icon ────────────────────────────────────────── */}
            <button
              onClick={handleSubmit}
              className="shrink-0 text-white/30 hover:text-white/70 transition-colors"
            >
              <CornerDownLeft size={16} />
            </button>

            {/* ── Divider ───────────────────────────────────────────── */}
            <div className="w-px h-5 bg-white/10 shrink-0" />

            {/* ── Files Button ──────────────────────────────────────── */}
            <button
              className="flex items-center gap-1.5 shrink-0 hover:opacity-80 transition-opacity"
              onClick={(e) => { e.stopPropagation(); onOpenExplorer() }}
            >
              <Folder size={16} className="text-white/50" />
              <ChevronUp size={12} className="text-white/40" />
            </button>
          </div>

          {/* ── File Results Dropdown ──────────────────────────────────── */}
          {showFileResults && (
            <div
              ref={fileResultsRef}
              className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden"
              style={{
                zIndex:           Z.MENU_DROPDOWN,
                backgroundColor:  'rgba(15,15,20,0.97)',
                border:           '1px solid rgba(255,255,255,0.1)',
                backdropFilter:   'blur(12px)',
              }}
            >
              {fileResults.map((file, i) => (
                <button
                  key={i}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
                  onClick={() => {
                    FileSearchService.openFile(file.path)
                    setShowFileResults(false)
                    setInput('')
                  }}
                >
                  {file.type === 'folder'
                    ? <Folder size={14} className="text-yellow-400 shrink-0" />
                    : <FileText size={14} className="text-blue-400 shrink-0" />
                  }
                  <div className="min-w-0">
                    <div className="truncate">{file.name}</div>
                    <div className="text-xs text-white/25 truncate">{file.path}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── AIDA Chat Panel ───────────────────────────────────────────── */}
          {aidaOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-xl flex flex-col overflow-hidden"
              style={{
                zIndex:               Z.AIDA_CHAT,
                height:               '60vh',
                backgroundColor:      'rgba(13,17,23,0.97)',
                backdropFilter:       'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border:               `1px solid ${accentColor}33`,
                boxShadow:            `0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px ${accentColor}11`,
              }}
            >
              {/* ── Chat Title Bar ─────────────────────────────────────── */}
              <div
                className="flex items-center justify-between px-4 py-2.5 shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                {aidaMessages.length > 0 && (
                  <button
                    onClick={() => setAidaMessages([])}
                    className="text-xs text-white/20 hover:text-white/50 transition-colors"
                    style={{ fontFamily: 'DM Mono, monospace' }}
                  >
                    clear
                  </button>
                )}
              </div>

              {/* ── Messages ───────────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {aidaMessages.length === 0 && (
                  <div className="flex-1 flex items-center justify-center h-full">
                    <span
                      className="text-xs text-center"
                      style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono, monospace' }}
                    >
                      How can I help you today?
                    </span>
                  </div>
                )}

                {aidaMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
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
                      {msg.content || (
                        <span style={{ color: accentColor, opacity: 0.5 }}>thinking...</span>
                      )}
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>

              {/* ── AIDA Input ─────────────────────────────────────────── */}
              <div
                className="flex items-center gap-3 px-4 py-3 shrink-0"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <input
                  ref={aidaInputRef}
                  type="text"
                  value={aidaInput}
                  onChange={e => setAidaInput(e.target.value)}
                  onKeyDown={handleAidaKeyDown}
                  placeholder="Continue the conversation..."
                  disabled={aidaThinking}
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/25"
                />
                <button
                  onClick={handleAidaSubmit}
                  disabled={aidaThinking || !aidaInput.trim()}
                  className="shrink-0 transition-colors"
                  style={{ color: aidaInput.trim() && !aidaThinking ? accentColor : 'rgba(255,255,255,0.15)' }}
                >
                  <CornerDownLeft size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Hint text ─────────────────────────────────────────────────── */}
        <p className="text-xs text-white/25 text-center">
          Select your favorite AI provider for current events &amp; online access
        </p>

      </div>
    </>
  )
}

export default ProductivityBar
