// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: AIDA Chat Window
// AIDA-2 — src/components/apps/aida-chat/Window.tsx
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Send, PanelLeft, Search, FolderOpen, ChevronRight,
  Plus, Folder, FolderPlus, Pencil, Trash2, Archive, MoreHorizontal, MessageSquare
} from 'lucide-react'
import type { GlobalSettings }  from '../../../types/settings'
import { defaultSettings }      from '../../../types/settings'
import { loadGlobalSettings }   from '../../../services/settingsDb'
import { useGlobal }             from '../../../global/useGlobal'
import AppTitleBar              from '../../shared/AppTitleBar'
import { getAppWindowStyle }    from '../../../themes/app'
import {
  getAidaSidebarStyle,
  getAidaSidebarToggleStyle,
  getAidaSidebarMenuStyle,
  getAidaSidebarItemStyle,
  getAidaSidebarSeparatorStyle,
  getAidaSidebarConvListStyle,
  getAidaSidebarConvItemStyle,
  getAidaBodyStyle,
  getAidaMainStyle,
  getAidaMessageListStyle,
  getAidaUserBubbleWrapStyle,
  getAidaAidaBubbleWrapStyle,
  getAidaUserBubbleStyle,
  getAidaAidaBubbleStyle,
  getAidaStreamingCursorStyle,
  getAidaInputBarStyle,
  getAidaInputStyle,
  getAidaSendButtonStyle,
  getAidaEmptyStateStyle,
  getAidaEmptyStateLabelStyle,
  getAidaSidebarSectionHeaderStyle,
  getAidaSidebarSectionHeaderLabelStyle,
  getAidaSidebarSectionActionStyle,
  getAidaFolderItemStyle,
  getAidaFolderChevronStyle,
  getAidaFolderConvIndentStyle,
  getAidaContextMenuStyle,
  getAidaContextMenuItemStyle,
  getAidaContextMenuItemHoverStyle,
  getAidaContextMenuSeparatorStyle,
  getAidaSearchInputStyle,
  getAidaSearchResultItemStyle,
  getAidaSearchResultSubtitleStyle,
  getAidaConvTitleStyle,
  getAidaSearchWrapperStyle,
  getAidaSubtleLabelStyle,
  getAidaInlineSeparatorStyle,
  getAidaNewFolderInputWrapStyle,
  getAidaInlineInputStyle,
  getAidaDragOverFolderStyle,
  getAidaFolderRowStyle,
} from '../../../themes/app'

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'user' | 'aida'

interface Message {
  id:        string
  role:      Role
  content:   string
  streaming: boolean
}

interface Conversation {
  id:         number
  title:      string
  folder_id:  number | null
  updated_at: string
}

interface Folder {
  id:   number
  name: string
}

interface ContextMenu {
  x:    number
  y:    number
  type: 'folder' | 'chat'
  id:   number
  name: string
  folderId?: number | null
}

// ─── Ollama config ────────────────────────────────────────────────────────────

const OLLAMA_URL   = 'http://localhost:11434/api/chat'
const OLLAMA_MODEL = 'phi3mini:latest'

// ─── System context builder ──────────────────────────────────────────────────
// Detects system-related keywords in the user's message and fetches only the
// relevant live data. Injected as context before sending to Ollama.
// Nothing runs in background — fetched strictly on demand, per message.

const SYSTEM_KEYWORDS = {
  stats:     ['cpu', 'ram', 'memory', 'gpu', 'temperature', 'temp', 'load', 'usage', 'performance', 'spec', 'config', 'hardware', 'system'],
  disk:      ['disk', 'drive', 'storage', 'space', 'free', 'ssd', 'hdd'],
  processes: ['process', 'processes', 'running', 'task', 'tasks', 'program', 'programs', 'app', 'apps'],
  os:        ['os', 'operating system', 'windows', 'linux', 'kernel', 'hostname', 'uptime', 'version'],
}

async function buildSystemContext(message: string): Promise<string> {
  const lower   = message.toLowerCase()
  const needed  = {
    stats:     SYSTEM_KEYWORDS.stats.some(k     => lower.includes(k)),
    disk:      SYSTEM_KEYWORDS.disk.some(k      => lower.includes(k)),
    processes: SYSTEM_KEYWORDS.processes.some(k => lower.includes(k)),
    os:        SYSTEM_KEYWORDS.os.some(k        => lower.includes(k)),
  }

  if (!Object.values(needed).some(Boolean)) return ''

  const parts: string[] = ['[Live system data fetched on demand:]']

  try {
    const [stats, disk, procs, os] = await Promise.all([
      needed.stats     ? window.electron?.aidaTools.getSystemStats()      : null,
      needed.disk      ? window.electron?.aidaTools.getDiskInfo()         : null,
      needed.processes ? window.electron?.aidaTools.getRunningProcesses() : null,
      needed.os        ? window.electron?.aidaTools.getOsInfo()           : null,
    ])

    if (stats && !('error' in stats)) {
      parts.push(`CPU: ${stats.cpu.brand}, ${stats.cpu.cores} cores, ${stats.cpu.loadPercent}% load${stats.cpu.tempCelsius ? `, ${stats.cpu.tempCelsius}°C` : ''}`)
      parts.push(`RAM: ${stats.ram.usedGB}GB used of ${stats.ram.totalGB}GB (${stats.ram.usedPercent}%)`)
      if (stats.gpu.length) parts.push(`GPU: ${stats.gpu.map(g => `${g.model} ${g.vram}`).join(', ')}`)
    }
    if (disk && !('error' in disk)) {
      parts.push(`Drives: ${disk.drives.map(d => `${d.mount} ${d.usedGB}/${d.totalGB}GB used`).join(', ')}`)
    }
    if (procs && !('error' in procs)) {
      parts.push(`Top processes: ${procs.top.slice(0, 5).map(p => `${p.name} (${p.cpuPercent}% CPU)`).join(', ')}`)
    }
    if (os && !('error' in os)) {
      parts.push(`OS: ${os.distro} ${os.release}, kernel ${os.kernel}, uptime ${os.uptimeHours}h, host: ${os.hostname}`)
    }
  } catch (err) {
    parts.push(`(System data unavailable: ${(err as Error).message})`)
  }

  return parts.join('\n')
}

const SYSTEM_PROMPT = `You are AIDA — the AI intelligence layer of ENGIOS, a Linux-based operating system.
You are a calm, capable, and private assistant. You are not a chatbot — you are a kernel-adjacent custodian of the user's hardware and workflow.
You never act without confirmation. You respect user autonomy absolutely. You are concise and direct. You do not pad responses.
You refer to yourself as AIDA, never as an AI model or language model.
Never open a response by describing yourself or your role. Just answer.`

// ─── Streaming helper ─────────────────────────────────────────────────────────

async function streamFromOllama(
  messages: { role: string; content: string }[],
  onToken:  (token: string) => void,
  onDone:   () => void,
  onError:  (err: string) => void,
  signal:   AbortSignal,
  systemContext = '',
): Promise<void> {
  try {
    // Build system messages — base prompt + optional live data as a second system message
    const systemMessages: { role: string; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(systemContext ? [{ role: 'system', content: systemContext }] : []),
    ]
    const res = await fetch(OLLAMA_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:    OLLAMA_MODEL,
        messages: [...systemMessages, ...messages],
        stream:   true,
      }),
      signal,
    })
    if (!res.ok) { onError(`Ollama error: ${res.status} ${res.statusText}`); return }
    const reader  = res.body?.getReader()
    const decoder = new TextDecoder()
    if (!reader) { onError('No response body'); return }
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean)
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line)
          const token  = parsed?.message?.content
          if (token) onToken(token)
          if (parsed?.done) { onDone(); return }
        } catch { /* partial JSON */ }
      }
    }
    onDone()
  } catch (err: unknown) {
    if ((err as Error).name === 'AbortError') return
    onError('Could not reach Ollama. Is it running?')
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Window() {
  const [settings,       setSettings]       = useState<GlobalSettings>(defaultSettings)
  const [sidebarOpen,    setSidebarOpen]    = useState(false)

  // Sidebar data
  const [folders,        setFolders]        = useState<Folder[]>([])
  const [conversations,  setConversations]  = useState<Conversation[]>([])
  const [openFolders,    setOpenFolders]    = useState<Set<number>>(new Set())
  const [folderConvs,    setFolderConvs]    = useState<Record<number, Conversation[]>>({})
  const [projectsOpen,   setProjectsOpen]   = useState(true)
  const [chatsOpen,      setChatsOpen]      = useState(true)

  // Chat state
  const [activeConvId,   setActiveConvId]   = useState<number | null>(null)
  const [messages,       setMessages]       = useState<Message[]>([])
  const [input,          setInput]          = useState('')
  const [streaming,      setStreaming]       = useState(false)

  // Search
  const [searchActive,  setSearchActive]  = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState<Conversation[]>([])
  const [hoveredSearch, setHoveredSearch] = useState<number | null>(null)
  const searchInputRef  = useRef<HTMLTextAreaElement>(null)

  // Inline folder/rename input
  const [newFolderInput,   setNewFolderInput]   = useState(false)
  const [newFolderName,    setNewFolderName]    = useState('')
  const [renamingFolder,   setRenamingFolder]   = useState<number | null>(null)
  const [renameFolderName, setRenameFolderName] = useState('')
  const newFolderInputRef  = useRef<HTMLInputElement>(null)
  const renameFolderInputRef = useRef<HTMLInputElement>(null)

  // Context menu
  const [contextMenu,    setContextMenu]    = useState<ContextMenu | null>(null)
  const [hoveredCtx,     setHoveredCtx]     = useState<string | null>(null)

  // Drag state
  const [dragConvId,     setDragConvId]     = useState<number | null>(null)
  const [dragOverFolder, setDragOverFolder] = useState<number | null>(null)

  const bottomRef      = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)
  const abortRef       = useRef<AbortController | null>(null)
  const historyRef     = useRef<{ role: string; content: string }[]>([])
  const sendMessageRef = useRef<(text: string) => void>(() => {})
  const messagesRef    = useRef<Message[]>([])
  messagesRef.current  = messages

  useGlobal(settings)

  // ── Settings ──────────────────────────────────────────────────────────────

  useEffect(() => { loadGlobalSettings().then(setSettings) }, [])
  useEffect(() => {
    const off = window.electron?.on('settings:updated',
      (_: unknown, updated: GlobalSettings) => setSettings(prev => ({ ...prev, ...updated })))
    return () => off?.()
  }, [])

  // ── Close context menu on outside click ───────────────────────────────────

  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [contextMenu])

  // ── Search ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      const results = (await window.electron?.db.chat.conversations.search(searchQuery.trim()) ?? []) as Conversation[]
      setSearchResults(results)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const activateSearch = () => {
    setSearchActive(true)
    setSearchQuery('')
    setSearchResults([])
    setTimeout(() => searchInputRef.current?.focus(), 50)
  }

  const clearSearch = () => {
    setSearchActive(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleSearchKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') clearSearch()
  }

  // Auto-grow search textarea
  const handleSearchChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSearchQuery(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  // ── Load sidebar data ─────────────────────────────────────────────────────

  const loadSidebar = useCallback(async () => {
    const [foldersRaw, convsRaw] = await Promise.all([
      window.electron?.db.chat.folders.get(),
      window.electron?.db.chat.conversations.get({}),
    ])
    const allFolders = (foldersRaw ?? []) as Folder[]
    const allConvs   = (convsRaw  ?? []) as Conversation[]
    setFolders(allFolders)
    setConversations(allConvs)
    // Build per-folder conversation map
    const map: Record<number, Conversation[]> = {}
    for (const f of allFolders) {
      map[f.id] = allConvs.filter(c => c.folder_id === f.id)
    }
    setFolderConvs(map)
  }, [])

  useEffect(() => { loadSidebar() }, [loadSidebar])

  // ── Unfoldered chats (5 most recent) ──────────────────────────────────────

  const unfolderedChats = conversations
    .filter(c => !c.folder_id)
    .slice(0, 5)

  // ── Load conversation ─────────────────────────────────────────────────────

  const loadConversation = useCallback(async (convId: number) => {
    setActiveConvId(convId)
    type DbMsg = { id: number; role: string; content: string }
    const dbMessages = (await window.electron?.db.chat.messages.get(convId) ?? []) as DbMsg[]
    setMessages(dbMessages.map(m => ({
      id:        String(m.id),
      role:      m.role === 'user' ? 'user' : 'aida',
      content:   m.content,
      streaming: false,
    })))
    historyRef.current = dbMessages.map(m => ({
      role:    m.role === 'aida' ? 'assistant' : m.role,
      content: m.content,
    }))
  }, [])

  // ── Initial query from ProductivityBar ───────────────────────────────────

  useEffect(() => {
    const off = window.electron?.on('aida-chat:query',
      (_: unknown, query: string) => {
        if (query?.trim() && messagesRef.current.length === 0) {
          sendMessageRef.current(query.trim())
        }
      })
    return () => off?.()
  }, [])

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── New chat ──────────────────────────────────────────────────────────────

  const startNewChat = useCallback(() => {
    abortRef.current?.abort()
    setActiveConvId(null)
    setMessages([])
    setInput('')
    setStreaming(false)
    historyRef.current = []
    inputRef.current?.focus()
  }, [])

  // ── Create project folder ─────────────────────────────────────────────────

  const createFolder = useCallback(() => {
    setNewFolderInput(true)
    setNewFolderName('')
    setTimeout(() => newFolderInputRef.current?.focus(), 50)
  }, [])

  const submitNewFolder = useCallback(async () => {
    if (!newFolderName.trim()) { setNewFolderInput(false); return }
    await window.electron?.db.chat.folders.create({ name: newFolderName.trim(), position: 0, starred: 0 })
    setNewFolderInput(false)
    setNewFolderName('')
    loadSidebar()
  }, [newFolderName, loadSidebar])

  // ── Delete folder ─────────────────────────────────────────────────────────

  const deleteFolder = useCallback(async (folderId: number) => {
    await window.electron?.db.chat.folders.delete(folderId)
    loadSidebar()
    setContextMenu(null)
  }, [loadSidebar])

  // ── Archive folder ────────────────────────────────────────────────────────

  const archiveFolder = useCallback(async (folderId: number, folderName: string) => {
    setContextMenu(null)
    const result = await window.electron?.fs.project.archive(folderId, folderName) as { success?: boolean; path?: string; error?: string } | undefined
    if (result?.success) {
      window.electron?.send('toast:show', {
        variant:  'success',
        title:    'Project archived',
        message:  `"${folderName}" saved to Documents/ENGIOS/Archives`,
        duration: 8000,
        action:   { label: 'Open Folder', ipc: 'project:openArchiveDir' },
      })
    } else {
      window.electron?.send('toast:show', {
        variant:  'error',
        title:    'Archive failed',
        message:  result?.error ?? 'Unknown error',
        duration: 8000,
      })
    }
  }, [])

  // ── Rename folder ─────────────────────────────────────────────────────────

  const renameFolder = useCallback((folderId: number, currentName: string) => {
    setRenamingFolder(folderId)
    setRenameFolderName(currentName)
    setContextMenu(null)
    setTimeout(() => renameFolderInputRef.current?.focus(), 50)
  }, [])

  const submitRenameFolder = useCallback(async () => {
    if (!renameFolderName.trim() || !renamingFolder) { setRenamingFolder(null); return }
    await window.electron?.db.chat.folders.update(renamingFolder, { name: renameFolderName.trim() })
    setRenamingFolder(null)
    setRenameFolderName('')
    loadSidebar()
  }, [renamingFolder, renameFolderName, loadSidebar])

  // ── Move chat to folder ───────────────────────────────────────────────────

  const moveToFolder = useCallback(async (convId: number, folderId: number | null) => {
    await window.electron?.db.chat.conversations.update(convId, { folder_id: folderId })
    loadSidebar()
    setContextMenu(null)
  }, [loadSidebar])

  // ── Delete chat ───────────────────────────────────────────────────────────

  const deleteChat = useCallback(async (convId: number) => {
    await window.electron?.db.chat.conversations.delete(convId)
    if (activeConvId === convId) startNewChat()
    loadSidebar()
    setContextMenu(null)
  }, [loadSidebar, activeConvId, startNewChat])

  // ── Toggle folder open ────────────────────────────────────────────────────

  const toggleFolder = (folderId: number) => {
    setOpenFolders(prev => {
      const next = new Set(prev)
      next.has(folderId) ? next.delete(folderId) : next.add(folderId)
      return next
    })
  }

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return

    let convId = activeConvId
    if (!convId) {
      const created = await window.electron?.db.chat.conversations.create({
        title: text.trim().slice(0, 60), model: OLLAMA_MODEL, provider: 'ollama',
      })
      convId = (created as { id: number } | undefined)?.id ?? null
      if (convId) { setActiveConvId(convId); loadSidebar() }
    }

    if (convId) await window.electron?.db.chat.messages.add({ conversation_id: convId, role: 'user', content: text.trim() })

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user',  content: text.trim(), streaming: false }
    const aidaMsg: Message = { id: crypto.randomUUID(), role: 'aida',  content: '',          streaming: true  }

    setMessages(prev => [...prev, userMsg, aidaMsg])
    setStreaming(true)
    setInput('')
    // Fetch live system data if the message contains system-related keywords
    const systemContext = await buildSystemContext(text.trim())

    historyRef.current = [...historyRef.current, { role: 'user', content: text.trim() }]

    const controller     = new AbortController()
    abortRef.current     = controller
    const aidaId         = aidaMsg.id
    const capturedConvId = convId

    streamFromOllama(
      historyRef.current,
      (token) => setMessages(prev => prev.map(m => m.id === aidaId ? { ...m, content: m.content + token } : m)),
      async () => {
        setMessages(prev => {
          const finalMsg = prev.find(m => m.id === aidaId)
          if (finalMsg && capturedConvId) {
            historyRef.current = [...historyRef.current, { role: 'assistant', content: finalMsg.content }]
            window.electron?.db.chat.messages.add({ conversation_id: capturedConvId, role: 'assistant', content: finalMsg.content, model_used: OLLAMA_MODEL })
            loadSidebar()
          }
          return prev.map(m => m.id === aidaId ? { ...m, streaming: false } : m)
        })
        setStreaming(false)
        inputRef.current?.focus()
      },
      (err) => { setMessages(prev => prev.map(m => m.id === aidaId ? { ...m, content: err, streaming: false } : m)); setStreaming(false) },
      controller.signal,
      systemContext,
    )
  }, [streaming, activeConvId, loadSidebar])

  sendMessageRef.current = sendMessage

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  // ── Context menu handlers ─────────────────────────────────────────────────

  const openFolderMenu = (e: React.MouseEvent, folder: Folder) => {
    e.preventDefault(); e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'folder', id: folder.id, name: folder.name })
  }

  const openChatMenu = (e: React.MouseEvent, conv: Conversation) => {
    e.preventDefault(); e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'chat', id: conv.id, name: conv.title, folderId: conv.folder_id })
  }

  // ── Drag handlers ─────────────────────────────────────────────────────────

  const onDragStart = (convId: number) => setDragConvId(convId)
  const onDragOver  = (e: React.DragEvent, folderId: number) => { e.preventDefault(); setDragOverFolder(folderId) }
  const onDragLeave = () => setDragOverFolder(null)
  const onDrop      = (folderId: number) => {
    if (dragConvId) moveToFolder(dragConvId, folderId)
    setDragConvId(null)
    setDragOverFolder(null)
  }

  // ── Conversation item ─────────────────────────────────────────────────────

  const ConvItem = ({ conv }: { conv: Conversation }) => (
    <button
      draggable
      onDragStart={() => onDragStart(conv.id)}
      onClick={() => loadConversation(conv.id)}
      onContextMenu={e => openChatMenu(e, conv)}
      style={getAidaSidebarConvItemStyle(settings, conv.id === activeConvId)}
      title={conv.title}
    >
      <MessageSquare size={12} style={{ flexShrink: 0, opacity: 0.6 }} />
      <span style={getAidaConvTitleStyle()}>{conv.title}</span>
    </button>
  )

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes aida-cursor-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>

      <div style={{ ...getAppWindowStyle(settings), display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppTitleBar title="AIDA" settings={settings} onClose={() => window.electron?.send('window:hide', 'aida-chat')} />

        <div style={getAidaBodyStyle()}>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <div style={getAidaSidebarStyle(settings, sidebarOpen)}>

            {/* Toggle */}
            <button onClick={() => setSidebarOpen(p => !p)} style={getAidaSidebarToggleStyle(settings)} title={sidebarOpen ? 'Collapse' : 'Expand'}>
              <PanelLeft size={16} />
            </button>

            {sidebarOpen && (
              <>
                {/* Search */}
                <div style={getAidaSearchWrapperStyle()}>
                  {searchActive ? (
                    <textarea
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleSearchKey}
                      placeholder="Search chats…"
                      rows={1}
                      style={getAidaSearchInputStyle(settings)}
                    />
                  ) : (
                    <button onClick={activateSearch} style={getAidaSidebarItemStyle(settings)}>
                      <Search size={14} style={{ flexShrink: 0 }} />
                      Search Chats
                    </button>
                  )}
                </div>

                {/* Search results — replaces sidebar content when active */}
                {searchActive && (
                  <div style={{ ...getAidaSidebarConvListStyle(), flex: searchResults.length > 0 ? 1 : 'none' }}>
                    {searchQuery.trim() && searchResults.length === 0 && (
                      <span style={getAidaSubtleLabelStyle(settings)}>No results</span>
                    )}
                    {searchResults.map(conv => (
                      <button
                        key={conv.id}
                        onMouseEnter={() => setHoveredSearch(conv.id)}
                        onMouseLeave={() => setHoveredSearch(null)}
                        onClick={() => { loadConversation(conv.id); clearSearch() }}
                        style={getAidaSearchResultItemStyle(settings, hoveredSearch === conv.id)}
                      >
                        <span style={getAidaConvTitleStyle()}>{conv.title}</span>
                        <span style={getAidaSearchResultSubtitleStyle(settings)}>
                          {new Date(conv.updated_at).toLocaleDateString()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {!searchActive && (
                  <>
                    <div style={getAidaInlineSeparatorStyle()} />

                    {/* ── PROJECTS section ──────────────────────────── */}
                    <div style={getAidaSidebarSectionHeaderStyle(settings)}>
                      <button onClick={() => setProjectsOpen(p => !p)} style={getAidaSidebarSectionHeaderLabelStyle(settings)}>
                        <ChevronRight size={12} style={getAidaFolderChevronStyle(projectsOpen)} />
                        Projects
                      </button>
                      <button onClick={createFolder} style={getAidaSidebarSectionActionStyle(settings)} title="New project">
                        <Plus size={13} />
                      </button>
                    </div>

                    {projectsOpen && (
                      <div style={{ ...getAidaSidebarConvListStyle(), flex: 'none', maxHeight: '240px' }}>
                        {folders.length === 0 && (
                          <span style={getAidaSubtleLabelStyle(settings)}>No projects yet</span>
                        )}
                        {newFolderInput && (
                          <div style={getAidaNewFolderInputWrapStyle()}>
                            <input
                              ref={newFolderInputRef}
                              value={newFolderName}
                              onChange={e => setNewFolderName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') submitNewFolder(); if (e.key === 'Escape') { setNewFolderInput(false); setNewFolderName('') } }}
                              onBlur={submitNewFolder}
                              placeholder="Project name…"
                              style={getAidaInlineInputStyle()}
                            />
                          </div>
                        )}
                        {folders.map(folder => (
                          <div
                            key={folder.id}
                            onDragOver={e => onDragOver(e, folder.id)}
                            onDragLeave={onDragLeave}
                            onDrop={() => onDrop(folder.id)}
                            style={getAidaDragOverFolderStyle(dragOverFolder === folder.id)}
                          >
                            <div style={getAidaFolderRowStyle()}>
                              <button onClick={() => toggleFolder(folder.id)} style={{ ...getAidaFolderItemStyle(settings, false), flex: 1 }}>
                                <ChevronRight size={12} style={getAidaFolderChevronStyle(openFolders.has(folder.id))} />
                                <Folder size={13} style={{ flexShrink: 0 }} />
                                {renamingFolder === folder.id ? (
                                  <input
                                    ref={renameFolderInputRef}
                                    value={renameFolderName}
                                    onChange={e => setRenameFolderName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') submitRenameFolder(); if (e.key === 'Escape') setRenamingFolder(null) }}
                                    onBlur={submitRenameFolder}
                                    onClick={e => e.stopPropagation()}
                                    style={getAidaInlineInputStyle()}
                                  />
                                ) : (
                                  <span style={getAidaConvTitleStyle()}>{folder.name}</span>
                                )}
                              </button>
                              <button onClick={e => openFolderMenu(e, folder)} style={{ ...getAidaSidebarSectionActionStyle(settings), padding: '4px' }}>
                                <MoreHorizontal size={13} />
                              </button>
                            </div>
                            {openFolders.has(folder.id) && (
                              <div style={getAidaFolderConvIndentStyle()}>
                                {(folderConvs[folder.id] ?? []).length === 0 && (
                                  <span style={getAidaSubtleLabelStyle(settings)}>Empty</span>
                                )}
                                {(folderConvs[folder.id] ?? []).map(conv => <ConvItem key={conv.id} conv={conv} />)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={getAidaInlineSeparatorStyle()} />

                    {/* ── CHATS section ─────────────────────────────── */}
                    <div style={getAidaSidebarSectionHeaderStyle(settings)}>
                      <button onClick={() => setChatsOpen(p => !p)} style={getAidaSidebarSectionHeaderLabelStyle(settings)}>
                        <ChevronRight size={12} style={getAidaFolderChevronStyle(chatsOpen)} />
                        Chats
                      </button>
                      <button onClick={startNewChat} style={getAidaSidebarSectionActionStyle(settings)} title="New chat">
                        <Plus size={13} />
                      </button>
                    </div>

                    {chatsOpen && (
                      <div style={getAidaSidebarConvListStyle()}>
                        {unfolderedChats.length === 0 && (
                          <span style={getAidaSubtleLabelStyle(settings)}>No chats yet</span>
                        )}
                        {unfolderedChats.map(conv => <ConvItem key={conv.id} conv={conv} />)}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* ── Main chat area ───────────────────────────────────────── */}
          <div style={getAidaMainStyle()}>
            {messages.length === 0 ? (
              <div style={getAidaEmptyStateStyle()}>
                <span style={getAidaEmptyStateLabelStyle(settings)}>Ask AIDA anything.</span>
              </div>
            ) : (
              <div style={getAidaMessageListStyle()}>
                {messages.map(msg => (
                  <div key={msg.id} style={msg.role === 'user' ? getAidaUserBubbleWrapStyle() : getAidaAidaBubbleWrapStyle()}>
                    <div style={msg.role === 'user' ? getAidaUserBubbleStyle(settings) : getAidaAidaBubbleStyle(settings)}>
                      {msg.content}
                      {msg.streaming && <span style={getAidaStreamingCursorStyle(settings)} />}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
            <div style={getAidaInputBarStyle(settings)}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AIDA…"
                rows={1}
                style={getAidaInputStyle(settings)}
              />
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || streaming} style={getAidaSendButtonStyle(settings, !input.trim() || streaming)}>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Context menu ───────────────────────────────────────────────── */}
      {contextMenu && (
        <div style={{ ...getAidaContextMenuStyle(settings), left: contextMenu.x, top: contextMenu.y }} onClick={e => e.stopPropagation()}>
          {contextMenu.type === 'folder' && (
            <>
              <button
                onMouseEnter={() => setHoveredCtx('rename')}
                onMouseLeave={() => setHoveredCtx(null)}
                onClick={() => renameFolder(contextMenu.id, contextMenu.name)}
                style={{ ...getAidaContextMenuItemStyle(settings), ...(hoveredCtx === 'rename' ? getAidaContextMenuItemHoverStyle(settings) : {}) }}
              >
                <Pencil size={13} /> Rename
              </button>
              <button
                onMouseEnter={() => setHoveredCtx('archive')}
                onMouseLeave={() => setHoveredCtx(null)}
                onClick={() => archiveFolder(contextMenu.id, contextMenu.name)}
                style={{ ...getAidaContextMenuItemStyle(settings), ...(hoveredCtx === 'archive' ? getAidaContextMenuItemHoverStyle(settings) : {}) }}
              >
                <Archive size={13} /> Archive
              </button>
              <div style={getAidaContextMenuSeparatorStyle(settings)} />
              <button
                onMouseEnter={() => setHoveredCtx('delete-folder')}
                onMouseLeave={() => setHoveredCtx(null)}
                onClick={() => deleteFolder(contextMenu.id)}
                style={{ ...getAidaContextMenuItemStyle(settings, true), ...(hoveredCtx === 'delete-folder' ? getAidaContextMenuItemHoverStyle(settings, true) : {}) }}
              >
                <Trash2 size={13} /> Delete
              </button>
            </>
          )}
          {contextMenu.type === 'chat' && (
            <>
              {/* Move to other folders — excludes the folder this chat already belongs to */}
              {folders.filter(f => f.id !== contextMenu.folderId).map(f => (
                <button
                  key={f.id}
                  onMouseEnter={() => setHoveredCtx(`move-${f.id}`)}
                  onMouseLeave={() => setHoveredCtx(null)}
                  onClick={() => moveToFolder(contextMenu.id, f.id)}
                  style={{ ...getAidaContextMenuItemStyle(settings), ...(hoveredCtx === `move-${f.id}` ? getAidaContextMenuItemHoverStyle(settings) : {}) }}
                >
                  <FolderPlus size={13} /> Move to {f.name}
                </button>
              ))}
              {/* Remove from project — only shown when chat is inside a folder */}
              {contextMenu.folderId && (
                <button
                  onMouseEnter={() => setHoveredCtx('move-none')}
                  onMouseLeave={() => setHoveredCtx(null)}
                  onClick={() => moveToFolder(contextMenu.id, null)}
                  style={{ ...getAidaContextMenuItemStyle(settings), ...(hoveredCtx === 'move-none' ? getAidaContextMenuItemHoverStyle(settings) : {}) }}
                >
                  <FolderOpen size={13} /> Remove from project
                </button>
              )}
              {(folders.filter(f => f.id !== contextMenu.folderId).length > 0 || contextMenu.folderId) && (
                <div style={getAidaContextMenuSeparatorStyle(settings)} />
              )}
              <button
                onMouseEnter={() => setHoveredCtx('delete-chat')}
                onMouseLeave={() => setHoveredCtx(null)}
                onClick={() => deleteChat(contextMenu.id)}
                style={{ ...getAidaContextMenuItemStyle(settings, true), ...(hoveredCtx === 'delete-chat' ? getAidaContextMenuItemHoverStyle(settings, true) : {}) }}
              >
                <Trash2 size={13} /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
