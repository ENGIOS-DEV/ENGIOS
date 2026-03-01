import { useState, useRef, useEffect } from 'react'
import { CornerDownLeft, ChevronDown, FileText, Folder } from 'lucide-react'
import type { GlobalSettings } from '../types/settings'
import type { SearchResult } from '../services/fileSearchService'
import { FileSearchService } from '../services/fileSearchService'

// ─── Extend Window type for Electron bridge ───────────────────────────────────
declare global {
  interface Window {
    electron?: {
      searchFiles: (query: string, maxResults?: number) => Promise<SearchResult[]>
      openFile: (filePath: string) => Promise<void>
      openProvider: (url: string, label: string) => Promise<void>
      setAutoStart: (enabled: boolean) => Promise<void>
      db: {
        notes:  { get: () => Promise<any[]>; create: (d: any) => Promise<any>; update: (id: number, c: any) => Promise<any>; delete: (id: number) => Promise<any> }
        tasks:  { get: () => Promise<any[]>; create: (d: any) => Promise<any>; update: (id: number, c: any) => Promise<any>; delete: (id: number) => Promise<any> }
        events: { get: (r?: any) => Promise<any[]>; create: (d: any) => Promise<any>; update: (id: number, c: any) => Promise<any>; delete: (id: number) => Promise<any> }
      }
      isElectron: boolean
    }
  }
}

// ─── Provider Definitions ─────────────────────────────────────────────────────
const aiProviders = [
  { id: 'gemini', label: 'Gemini',  icon: '/src/assets/icons/gemini.svg', url: 'https://gemini.google.com/app' },
  { id: 'meta',   label: 'Meta AI', icon: '/src/assets/icons/meta.svg',   url: 'https://www.meta.ai'          },
  { id: 'groq',   label: 'Groq',    icon: '/src/assets/icons/groq.svg',   url: 'https://chat.groq.com'        },
  { id: 'claude', label: 'Claude',  icon: '/src/assets/icons/claude.svg', url: 'https://claude.ai'            },
  { id: 'openai', label: 'ChatGPT', icon: '/src/assets/icons/openai.svg', url: 'https://chatgpt.com'          },
]

const webProviders = [
  { id: 'google', label: 'Google', icon: '/src/assets/icons/google.svg', url: 'https://www.google.com'   },
  { id: 'brave',  label: 'Brave',  icon: '/src/assets/icons/brave.svg',  url: 'https://search.brave.com' },
]

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProductivityBarProps {
  settings: GlobalSettings
  isMenuOpen: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────
function ProductivityBar({ isMenuOpen }: ProductivityBarProps) {
  const [input, setInput] = useState('')
  const [activeProvider, setActiveProvider] = useState(aiProviders[0])
  const [showDropdown, setShowDropdown] = useState(false)
  const [fileResults, setFileResults] = useState<SearchResult[]>([])
  const [showFileResults, setShowFileResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const fileResultsRef = useRef<HTMLDivElement>(null)

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

  // Close everything when menu closes
  useEffect(() => {
    if (!isMenuOpen) {
      setShowDropdown(false)
      setShowFileResults(false)
      setInput('')
    }
  }, [isMenuOpen])

  // Close dropdown when clicking outside
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

  // ── File search only ───────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!input.trim()) return
    setIsSearching(true)
    const results = await FileSearchService.search(input.trim())
    setFileResults(results)
    setShowFileResults(results.length > 0)
    setIsSearching(false)
  }

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
              backgroundColor: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* ── Provider Icon + Dropdown ───────────────────────────── */}
            <div className="relative flex-shrink-0" ref={dropdownRef}>
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
                  className="absolute top-full left-0 mt-2 rounded-lg overflow-hidden z-50 min-w-[160px]"
                  style={{
                    backgroundColor: 'rgba(20,20,25,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {/* AI Providers */}
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

                  {/* Web Providers */}
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
            <div className="w-px h-5 bg-white/10 flex-shrink-0" />

            {/* ── Input ─────────────────────────────────────────────── */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search files and folders..."
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30"
            />

            {/* ── Searching indicator ───────────────────────────────── */}
            {isSearching && (
              <span className="text-xs text-white/30 flex-shrink-0">searching...</span>
            )}

            {/* ── Enter icon ────────────────────────────────────────── */}
            <button
              onClick={handleSubmit}
              className="flex-shrink-0 text-white/30 hover:text-white/70 transition-colors"
            >
              <CornerDownLeft size={16} />
            </button>
          </div>

          {/* ── File Results Dropdown ──────────────────────────────────── */}
          {showFileResults && (
            <div ref={fileResultsRef} 
              className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-50"
              style={{
                backgroundColor: 'rgba(15,15,20,0.97)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
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
                    ? <Folder size={14} className="text-yellow-400 flex-shrink-0" />
                    : <FileText size={14} className="text-blue-400 flex-shrink-0" />
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
          Select an AI Chat provider to launch in a Private Window.
        </p>

      </div>
    </>
  )
}

export default ProductivityBar
