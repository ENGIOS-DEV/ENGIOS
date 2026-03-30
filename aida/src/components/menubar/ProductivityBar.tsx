// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: ProductivityBar
// AIDA-2 — src/components/menubar/ProductivityBar.tsx
//
// Adapted from AIDA-1 ProductivityBar.tsx.
// Search + provider dropdown + file/chat dropdown.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, CornerDownLeft, FileText, Folder, MessageSquare } from 'lucide-react'
import type { GlobalSettings }    from '../../types/settings'
import { FILE_ICON_COLOURS }      from '../../themes/app'
import { FileSearchService }      from '../../services/fileSearchService'
import type { SearchResult }      from '../../services/fileSearchService'
import {
  getMenuBarSearchStyle,
  getMenuBarSearchInputStyle,
  getMenuBarSearchDividerStyle,
  getMenuBarSearchSubtitleStyle,
  getMenuBarSearchResultsStyle,
  getMenuBarDropdownStyle,
  getMenuBarDropdownItemStyle,
  getMenuBarDropdownItemHoverStyle,
  getMenuBarDropdownSeparatorStyle,
  getMenuBarProviderIconButtonStyle,
  getMenuBarProviderChevronStyle,
  getMenuBarSearchResultPathStyle,
  getMenuBarSearchResultNameStyle,
  getMenuBarInputAreaStyle,
  getMenuBarSubmitButtonStyle,
  getMenuBarSearchingStyle,
  getMenuBarProviderIconStyle,
  MENUBAR_LAYOUT,
  Z,
} from '../../themes/menubar'

import geminiIcon  from '../../assets/icons/aiproviders/gemini.svg'
import claudeIcon  from '../../assets/icons/aiproviders/claude.svg'
import groqIcon    from '../../assets/icons/aiproviders/groq.svg'
import metaIcon    from '../../assets/icons/aiproviders/meta.svg'
import openaiIcon  from '../../assets/icons/aiproviders/openai.svg'
import googleIcon  from '../../assets/icons/aiproviders/google.svg'
import braveIcon   from '../../assets/icons/aiproviders/brave.svg'

const AI_PROVIDERS = [
  { id: 'gemini',  label: 'Gemini',  icon: geminiIcon,  url: 'https://gemini.google.com/app' },
  { id: 'claude',  label: 'Claude',  icon: claudeIcon,  url: 'https://claude.ai'             },
  { id: 'groq',    label: 'Groq',    icon: groqIcon,    url: 'https://chat.groq.com'          },
  { id: 'meta',    label: 'Meta AI', icon: metaIcon,    url: 'https://www.meta.ai'            },
  { id: 'openai',  label: 'ChatGPT', icon: openaiIcon,  url: 'https://chatgpt.com'            },
]

const WEB_PROVIDERS = [
  { id: 'google', label: 'Google', icon: googleIcon, url: 'https://www.google.com'   },
  { id: 'brave',  label: 'Brave',  icon: braveIcon,  url: 'https://search.brave.com' },
]

interface ProductivityBarProps {
  settings:   GlobalSettings
  isMenuOpen: boolean
}

export default function ProductivityBar({ settings, isMenuOpen }: ProductivityBarProps) {

  const [input,             setInput]             = useState('')
  const [showLeftDropdown,  setShowLeftDropdown]  = useState(false)
  const [showRightDropdown, setShowRightDropdown] = useState(false)
  const [fileResults,       setFileResults]       = useState<SearchResult[]>([])
  const [showFileResults,   setShowFileResults]   = useState(false)
  const [isSearching,       setIsSearching]       = useState(false)
  const [hoveredItem,       setHoveredItem]       = useState<string | null>(null)

  const wrapperRef     = useRef<HTMLDivElement>(null)
  const inputAreaRef   = useRef<HTMLDivElement>(null)
  const rightDropRef   = useRef<HTMLButtonElement>(null)
  const fileResultsRef = useRef<HTMLDivElement>(null)

  // ── Close everything when menu closes ─────────────────────────────────────
  useEffect(() => {
    if (!isMenuOpen) {
      setShowLeftDropdown(false)
      setShowRightDropdown(false)
      setShowFileResults(false)
      setInput('')
    }
  }, [isMenuOpen])

  // ── Close on any click outside wrapper ────────────────────────────────────
  useEffect(() => {
    if (!showLeftDropdown && !showRightDropdown && !showFileResults) return
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowLeftDropdown(false)
        setShowRightDropdown(false)
        setShowFileResults(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showLeftDropdown, showRightDropdown, showFileResults])

  // ── Close file results on window blur (click outside Electron window) ────────
  useEffect(() => {
    if (!showFileResults) return
    function onBlur() { setShowFileResults(false) }
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [showFileResults])

  // ── Close dropdowns when window loses focus (click on desktop) ──────────────
  useEffect(() => {
    if (!showLeftDropdown && !showRightDropdown) return
    function onBlur() {
      setShowLeftDropdown(false)
      setShowRightDropdown(false)
    }
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [showLeftDropdown, showRightDropdown])

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    const text = input.trim()
    if (!text) return
    if (text.startsWith('?')) {
      setInput('')
      window.electron?.send('aida-chat:open', text.slice(1).trim())
      return
    }
    setIsSearching(true)
    const results = await FileSearchService.search(text)
    setFileResults(results)
    setShowFileResults(results.length > 0)
    setIsSearching(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter')  handleSubmit()
    if (e.key === 'Escape') {
      setShowLeftDropdown(false)
      setShowRightDropdown(false)
      setShowFileResults(false)
      window.electron?.send('menubar:hide')
    }
  }

  const defaultProvider = AI_PROVIDERS.find(p => p.id === settings.aiProvider) ?? AI_PROVIDERS[0]

  return (
    // Outer wrapper — position:relative so ALL dropdowns are anchored here
    <div ref={wrapperRef} style={{ width: '100%', position: 'relative' }}>

      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <div style={getMenuBarSearchStyle(settings)}>

        {/* Left — provider icon + chevron */}
        <button
          onClick={() => window.electron?.openProvider(defaultProvider.url, defaultProvider.id + '|' + defaultProvider.label, settings.providerKeepSession)}
          style={getMenuBarProviderIconButtonStyle(settings)}
          title={`Open ${defaultProvider.label}`}
        >
          <img src={defaultProvider.icon} alt={defaultProvider.label} style={getMenuBarProviderIconStyle(false)} />
        </button>
        <button
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowRightDropdown(false); setShowFileResults(false); setShowLeftDropdown(p => !p) }}
          style={getMenuBarProviderChevronStyle(settings)}
          title="More providers"
        >
          <ChevronDown size={13} />
        </button>

        <div style={getMenuBarSearchDividerStyle(settings)} />

        {/* Input area — position:relative so results align separator-to-separator */}
        <div ref={inputAreaRef} style={{ ...getMenuBarInputAreaStyle(), position: 'relative' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          onFocus={() => { setShowLeftDropdown(false); setShowRightDropdown(false) }}
            placeholder="Search files & folders — or start with ? to ask AIDA..."
            style={{ ...getMenuBarSearchInputStyle(settings), flex: 1 }}
          />

          {isSearching && (
            <span style={getMenuBarSearchingStyle(settings)}>searching...</span>
          )}

          {input && (
            <button onClick={handleSubmit} style={getMenuBarSubmitButtonStyle()}>
              <CornerDownLeft size={14} />
            </button>
          )}

        </div>

        <div style={getMenuBarSearchDividerStyle(settings)} />

        {/* Right — folder icon + chevron */}
        <button
          onClick={() => window.electron?.send('explorer:open')}
          style={getMenuBarProviderIconButtonStyle(settings)}
          title="File Decks"
        >
          <Folder size={16} />
        </button>
        <button
          ref={rightDropRef}
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowLeftDropdown(false); setShowFileResults(false); setShowRightDropdown(p => !p) }}
          style={getMenuBarProviderChevronStyle(settings)}
          title="More"
        >
          <ChevronDown size={13} />
        </button>

      </div>

      {/* ── Left dropdown — anchored to outer wrapper left edge ─────────── */}
      {showLeftDropdown && (
        <div data-menubar-content style={{ ...getMenuBarDropdownStyle(settings), position: 'absolute', top: MENUBAR_LAYOUT.dropdownOffset, left: 0, zIndex: Z.MENU_DROPDOWN }}>
          {AI_PROVIDERS.filter(p => p.id !== settings.aiProvider).map(p => (
            <button key={p.id}
              onMouseEnter={() => setHoveredItem(p.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => { window.electron?.openProvider(p.url, p.id + '|' + p.label, settings.providerKeepSession); setShowLeftDropdown(false) }}
              style={{ ...getMenuBarDropdownItemStyle(settings), ...(hoveredItem === p.id ? getMenuBarDropdownItemHoverStyle(settings) : {}) }}
            >
              <img src={p.icon} alt={p.label} style={getMenuBarProviderIconStyle()} />
              <span>{p.label}</span>
            </button>
          ))}
          <div style={getMenuBarDropdownSeparatorStyle(settings)} />
          {WEB_PROVIDERS.map(p => (
            <button key={p.id}
              onMouseEnter={() => setHoveredItem(p.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => { window.electron?.openProvider(p.url, p.id + '|' + p.label, false); setShowLeftDropdown(false) }}
              style={{ ...getMenuBarDropdownItemStyle(settings), ...(hoveredItem === p.id ? getMenuBarDropdownItemHoverStyle(settings) : {}) }}
            >
              <img src={p.icon} alt={p.label} style={getMenuBarProviderIconStyle()} />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Right dropdown — anchored to outer wrapper right edge ────────── */}
      {showRightDropdown && (
        <div data-menubar-content style={{ ...getMenuBarDropdownStyle(settings), position: 'absolute', top: MENUBAR_LAYOUT.dropdownOffset, right: 0, left: 'auto', zIndex: Z.MENU_DROPDOWN }}>
          <button
            onMouseEnter={() => setHoveredItem('aida-chat')}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => { window.electron?.send('aida-chat:open'); setShowRightDropdown(false) }}
            style={{ ...getMenuBarDropdownItemStyle(settings), ...(hoveredItem === 'aida-chat' ? getMenuBarDropdownItemHoverStyle(settings) : {}) }}
          >
            <MessageSquare size={14} style={{ flexShrink: 0 }} />
            <span>AIDA Chat</span>
          </button>
        </div>
      )}


      {/* ── File results — same top as dropdowns, input-width ─────────── */}
      {showFileResults && (
        <div ref={fileResultsRef} data-menubar-content style={{ ...getMenuBarSearchResultsStyle(settings), position: 'absolute', top: MENUBAR_LAYOUT.dropdownOffset, left: inputAreaRef.current?.offsetLeft ?? 0, right: wrapperRef.current && inputAreaRef.current ? wrapperRef.current.offsetWidth - (inputAreaRef.current.offsetLeft + inputAreaRef.current.offsetWidth) : 0, zIndex: Z.MENU_DROPDOWN - 50 }}>
          {fileResults.map((file, i) => (
            <div key={i}>
              {i > 0 && <div style={getMenuBarDropdownSeparatorStyle(settings)} />}
              <button
                onMouseEnter={() => setHoveredItem(`file-${i}`)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={async () => { await FileSearchService.openFile(file.path); setShowFileResults(false); setInput('') }}
                style={{ ...getMenuBarDropdownItemStyle(settings), ...(hoveredItem === `file-${i}` ? getMenuBarDropdownItemHoverStyle(settings) : {}), width: '100%', textAlign: 'left' as const }}
              >
                {file.isDir
                  ? <Folder   size={13} style={{ color: FILE_ICON_COLOURS.search, flexShrink: 0 }} />
                  : <FileText size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                }
                <div style={{ minWidth: 0 }}>
                  <div style={getMenuBarSearchResultNameStyle()}>{file.name}</div>
                  <div style={getMenuBarSearchResultPathStyle(settings)}>{file.path}</div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Subtitle — always in DOM to preserve layout height ────────── */}
      <div style={{ ...getMenuBarSearchSubtitleStyle(settings), visibility: showFileResults ? 'hidden' : 'visible' }}>
        Select your favourite AI provider for current events &amp; online access.
      </div>

    </div>
  )
}
