// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: Provider Window
// AIDA-2 — src/components/apps/provider/Window.tsx
//
// Responsibility:
//   The AI/Search provider browser window.
//   Receives provider:load IPC → renders ProviderTitleBar + webview.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import type { GlobalSettings }   from '../../../types/settings'
import { defaultSettings }       from '../../../types/settings'
import { loadGlobalSettings }    from '../../../services/settingsDb'
import { useGlobal }             from '../../../global/useGlobal'
import ProviderTitleBar          from '../../shared/ProviderTitleBar'
import { getAppWindowStyle }     from '../../../themes/app'

// ─── Provider icon imports ────────────────────────────────────────────────────

import claudeIcon  from '../../../assets/icons/aiproviders/claude.svg'
import geminiIcon  from '../../../assets/icons/aiproviders/gemini.svg'
import groqIcon    from '../../../assets/icons/aiproviders/groq.svg'
import metaIcon    from '../../../assets/icons/aiproviders/meta.svg'
import openaiIcon  from '../../../assets/icons/aiproviders/openai.svg'
import googleIcon  from '../../../assets/icons/aiproviders/google.svg'
import braveIcon   from '../../../assets/icons/aiproviders/brave.svg'

const PROVIDER_ICONS: Record<string, string> = {
  claude:  claudeIcon,
  gemini:  geminiIcon,
  groq:    groqIcon,
  meta:    metaIcon,
  openai:  openaiIcon,
  google:  googleIcon,
  brave:   braveIcon,
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Window() {
  const [settings,  setSettings]  = useState<GlobalSettings>(defaultSettings)
  const [url,       setUrl]       = useState('')
  const [label,     setLabel]     = useState('')
  const [providerId, setProviderId] = useState('')
  useGlobal(settings)

  useEffect(() => {
    loadGlobalSettings().then(setSettings)
    // Signal main process that React is mounted and ready for provider:load
    window.electron?.send('renderer:ready', 'provider')
  }, [])

  useEffect(() => {
    const off = window.electron?.on(
      'settings:updated',
      (_: unknown, updated: GlobalSettings) => setSettings(prev => ({ ...prev, ...updated }))
    )
    return () => off?.()
  }, [])

  // Listen for provider:load from main process
  useEffect(() => {
    const off = window.electron?.on(
      'provider:load',
      (_: unknown, data: { url: string; label: string; keepSession: boolean }) => {
        setUrl(data.url)
        setLabel(data.label)
        // Normalise label to icon key — 'Meta AI' → 'meta', 'ChatGPT' → 'openai'
        // label is sent as 'id|Display Name' — split to get reliable icon key
        const [id, displayName] = data.label.includes('|')
          ? data.label.split('|')
          : [data.label.toLowerCase(), data.label]
        setProviderId(id)
        setLabel(displayName)
      }
    )
    return () => off?.()
  }, [])

  const icon       = PROVIDER_ICONS[providerId] ?? openaiIcon
  const webviewRef = useRef<HTMLElement & { insertCSS: (css: string) => Promise<void> }>(null)

  // Inject scrollbar CSS into the webview after it loads
  useEffect(() => {
    const wv = webviewRef.current
    if (!wv) return

    const SCROLLBAR_CSS = `
      *, *::before, *::after {
        scrollbar-width: thin !important;
        scrollbar-color: rgba(255,255,255,0.15) transparent !important;
      }
      ::-webkit-scrollbar { width: 6px !important; height: 6px !important; }
      ::-webkit-scrollbar-track { background: transparent !important; border: none !important; box-shadow: none !important; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15) !important; border-radius: 9999px !important; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15) !important; }
      ::-webkit-scrollbar-corner { background: transparent !important; }
      ::-webkit-scrollbar-button { display: none !important; }
      [class*="scroll"] ::-webkit-scrollbar-track,
      [class*="Scroll"] ::-webkit-scrollbar-track,
      [class*="overflow"] ::-webkit-scrollbar-track { background: transparent !important; }
    `

    function injectCSS() {
      webviewRef.current?.insertCSS(SCROLLBAR_CSS).catch(() => {})
    }

    wv.addEventListener('dom-ready', injectCSS)
    wv.addEventListener('did-finish-load', injectCSS)
    return () => {
      wv.removeEventListener('dom-ready', injectCSS)
      wv.removeEventListener('did-finish-load', injectCSS)
    }
  }, [])

  return (
    <div style={{ ...getAppWindowStyle(settings), display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <ProviderTitleBar
        title={label || 'Provider'}
        icon={icon}
        settings={settings}
        onClose={() => window.electron?.send('window:close')}
      />
      <webview
        ref={webviewRef as React.RefObject<HTMLElement>}
        src={url || 'about:blank'}
        partition="persist:provider"
        allowpopups
        style={{ flex: 1, width: '100%', height: '100%' }}
      />
    </div>
  )
}
