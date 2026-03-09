import { useState, useRef, useEffect } from 'react'
import { CornerDownLeft, ChevronDown, FileText, Folder, MessageSquare } from 'lucide-react'
import type { GlobalSettings } from '../types/settings'
import type { SearchResult } from '../services/fileSearchService'
import { FileSearchService } from '../services/fileSearchService'
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
        chat: {
          folders:       { get: () => Promise<any[]>; create: (d: any) => Promise<any>; update: (id: number, c: any) => Promise<any>; delete: (id: number) => Promise<any> }
          conversations: { get: (o?: any) => Promise<any[]>; create: (d: any) => Promise<any>; update: (id: number, c: any) => Promise<any>; delete: (id: number) => Promise<any>; search: (q: string) => Promise<any[]> }
          messages:      { get: (convId: number) => Promise<any[]>; add: (d: any) => Promise<any>; delete: (id: number) => Promise<any> }
        }
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
import geminiIcon from '../assets/icons/gemini.svg'
import metaIcon   from '../assets/icons/meta.svg'
import groqIcon   from '../assets/icons/groq.svg'
import claudeIcon from '../assets/icons/claude.svg'
import openaiIcon from '../assets/icons/openai.svg'
import googleIcon from '../assets/icons/google.svg'
import braveIcon  from '../assets/icons/brave.svg'

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
  onOpenAida:     (firstMessage?: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────
function ProductivityBar({ settings, isMenuOpen, onOpenExplorer, onOpenAida }: ProductivityBarProps) {
  const accentColor = settings.accentColor

  // ── Input & search state ─────────────────────────────────────────────────────
  const [input,          setInput]          = useState('')
  const [activeProvider, setActiveProvider] = useState(aiProviders[0])
  const [showDropdown,   setShowDropdown]   = useState(false)
  const [fileResults,    setFileResults]    = useState<SearchResult[]>([])
  const [showFileResults,  setShowFileResults]  = useState(false)
  const [showRightDropdown, setShowRightDropdown] = useState(false)
  const [isSearching,    setIsSearching]    = useState(false)

  // ── AIDA chat state (persists across open/close) ─────────────────────────────
  const inputRef        = useRef<HTMLInputElement>(null)
  const dropdownRef     = useRef<HTMLDivElement>(null)
  const fileResultsRef     = useRef<HTMLDivElement>(null)
  const rightDropdownRef   = useRef<HTMLDivElement>(null)

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
      setShowRightDropdown(false)
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

    // ? prefix → open AIDA chat
    if (text.startsWith('?')) {
      const question = text.slice(1).trim()
      setInput('')
      onOpenAida(question || undefined)
      return
    }

    // Otherwise → file search
    setIsSearching(true)
    const results = await FileSearchService.search(text)
    setFileResults(results)
    setShowFileResults(results.length > 0)
    setIsSearching(false)
  }





  // ── Keyboard handlers ────────────────────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') {
      setShowDropdown(false)
      setShowFileResults(false)
    }
  }




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
              placeholder="Search files and folders, or type ? to ask AIDA..."
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

            {/* ── Right Dropdown (Files + Chats) ────────────────────── */}
            <div className="relative shrink-0" ref={rightDropdownRef}>
              <button
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                onClick={(e) => { e.stopPropagation(); setShowRightDropdown(prev => !prev) }}
              >
                <Folder size={16} className="text-white/50" />
                <ChevronDown size={12} className="text-white/40" />
              </button>

              {showRightDropdown && (
                <div
                  className="absolute top-full right-0 mt-2 rounded-lg overflow-hidden"
                  style={{
                    zIndex:          Z.MENU_DROPDOWN,
                    backgroundColor: 'rgba(20,20,25,0.95)',
                    border:          '1px solid rgba(255,255,255,0.1)',
                    backdropFilter:  'blur(12px)',
                    minWidth:        '140px',
                  }}
                >
                  <button
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setShowRightDropdown(false); onOpenExplorer() }}
                  >
                    <Folder size={14} className="text-white/50 shrink-0" />
                    <span>Files</span>
                  </button>
                  <button
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setShowRightDropdown(false); onOpenAida() }}
                  >
                    <MessageSquare size={14} className="text-white/50 shrink-0" />
                    <span>Chats</span>
                  </button>
                </div>
              )}
            </div>
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
        </div>

        {/* ── Hint text ─────────────────────────────────────────────────── */}
        <p className="text-xs text-white/25 text-center">
          Select your favorite AI provider for current events & online access · type <span style={{ color: accentColor }}>?</span> to ask AIDA
        </p>

      </div>
    </>
  )
}

export default ProductivityBar
