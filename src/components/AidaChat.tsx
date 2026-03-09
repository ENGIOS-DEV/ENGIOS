import { useState, useEffect, useRef, useCallback } from 'react'
import {
  CornerDownLeft, Circle, Plus, Folder, FolderOpen, Star,
  MessageSquare, Trash2, Pencil, Search, X,
  ChevronRight, ChevronDown, Pin,
} from 'lucide-react'
import { sendMessage } from '../helpers/aiProvider'
import type { Message } from '../helpers/aiProvider'
import { Z } from '../zIndex'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatFolder {
  id:       number
  name:     string
  position: number
  starred:  number
}

interface ChatConversation {
  id:         number
  folder_id:  number | null
  title:      string
  model:      string
  pinned:     number
  updated_at: string
}

interface AidaChatProps {
  isOpen:           boolean
  onClose:          () => void
  accentColor:      string
  initialMessage?:  string
  onConsumeInitial: () => void
}

// ─── IPC shorthand ────────────────────────────────────────────────────────────
const chat = () => (window as any).electron?.db?.chat

// ─── Component ────────────────────────────────────────────────────────────────
export default function AidaChat({
  isOpen, onClose, accentColor, initialMessage, onConsumeInitial,
}: AidaChatProps) {

  // ── Data ─────────────────────────────────────────────────────────────────────
  const [folders,          setFolders]          = useState<ChatFolder[]>([])
  const [conversations,    setConversations]    = useState<ChatConversation[]>([])
  const [activeConvId,     setActiveConvId]     = useState<number | null>(null)
  const [messages,         setMessages]         = useState<Message[]>([])
  const [expandedFolders,  setExpandedFolders]  = useState<Set<number>>(new Set())

  // ── UI ───────────────────────────────────────────────────────────────────────
  const [input,             setInput]             = useState('')
  const [thinking,          setThinking]          = useState(false)
  const [searchQuery,       setSearchQuery]       = useState('')
  const [searchResults,     setSearchResults]     = useState<ChatConversation[] | null>(null)
  const [renamingConvId,    setRenamingConvId]    = useState<number | null>(null)
  const [renameConvValue,   setRenameConvValue]   = useState('')
  const [renamingFolderId,  setRenamingFolderId]  = useState<number | null>(null)
  const [renameFolderValue, setRenameFolderValue] = useState('')

  // ── Drag ─────────────────────────────────────────────────────────────────────
  const [pos,      setPos]      = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOffset              = useRef({ x: 0, y: 0 })

  // Sidebar resize
  const SIDEBAR_MIN               = 160
  const SIDEBAR_MAX               = 360
  const [sidebarW,        setSidebarW]        = useState(220)
  const [resizingSidebar, setResizingSidebar] = useState(false)
  const resizeStartX = useRef(0)
  const resizeStartW = useRef(220)

  // Conv drag-to-folder
  const [draggedConvId, setDraggedConvId] = useState<number | null>(null)
  const [dropTarget,    setDropTarget]    = useState<{ type: 'folder'; id: number } | { type: 'unfiled' } | null>(null)
  const convDragRef = useRef({ startY: 0, moved: false })

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const inputRef        = useRef<HTMLInputElement>(null)
  const messagesEndRef  = useRef<HTMLDivElement>(null)
  const renameConvRef   = useRef<HTMLInputElement>(null)
  const renameFolderRef = useRef<HTMLInputElement>(null)
  const messagesRef     = useRef<Message[]>([])

  // keep messagesRef in sync for streaming closures
  useEffect(() => { messagesRef.current = messages }, [messages])

  // ── Load on open ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    loadFolders()
    loadConversations()
  }, [isOpen])

  // ── Handle initial message from ? trigger ────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !initialMessage) return
    onConsumeInitial()
    handleCreateConversation(initialMessage)
  }, [isOpen, initialMessage])

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Focus input when conversation active ─────────────────────────────────────
  useEffect(() => {
    if (isOpen && activeConvId !== null) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen, activeConvId])

  // ── Focus rename inputs ───────────────────────────────────────────────────────
  useEffect(() => {
    if (renamingConvId   !== null) setTimeout(() => renameConvRef.current?.focus(),   30)
  }, [renamingConvId])
  useEffect(() => {
    if (renamingFolderId !== null) setTimeout(() => renameFolderRef.current?.focus(), 30)
  }, [renamingFolderId])

  // ── Drag ─────────────────────────────────────────────────────────────────────
  const WIN_W = 800
  const WIN_H = 560

  // Reset to safe centred position every time the window opens
  useEffect(() => {
    if (isOpen) {
      setPos({
        x: Math.max(0, Math.round(window.innerWidth  / 2 - WIN_W / 2)),
        y: Math.max(0, Math.min(80, window.innerHeight - WIN_H)),
      })
    }
  }, [isOpen])

  const onTitleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true)
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      const x = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth  - WIN_W))
      const y = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - WIN_H))
      setPos({ x, y })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging])

  // Sidebar resize mouse handlers
  useEffect(() => {
    if (!resizingSidebar) return
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeStartX.current
      const next  = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, resizeStartW.current + delta))
      setSidebarW(next)
    }
    const onUp = () => setResizingSidebar(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [resizingSidebar])

  // Conv drag-to-folder mouse handlers
  useEffect(() => {
    if (draggedConvId === null) return
    const onMove = (e: MouseEvent) => {
      if (Math.abs(e.clientY - convDragRef.current.startY) > 4) convDragRef.current.moved = true
    }
    const onUp = async () => {
      if (convDragRef.current.moved && dropTarget) {
        const newFolderId = dropTarget.type === 'folder' ? dropTarget.id : null
        await chat()?.conversations.update(draggedConvId, { folder_id: newFolderId })
        await loadConversations()
        if (dropTarget.type === 'folder') {
          setExpandedFolders(prev => new Set([...prev, dropTarget.id]))
        }
      }
      setDraggedConvId(null)
      setDropTarget(null)
      convDragRef.current.moved = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [draggedConvId, dropTarget])


  // ── Data loaders ─────────────────────────────────────────────────────────────
  async function loadFolders() {
    const f = await chat()?.folders.get()
    if (f) setFolders(f)
  }

  async function loadConversations() {
    const c = await chat()?.conversations.get()
    if (c) setConversations(c)
  }

  async function loadMessages(convId: number) {
    const rows = await chat()?.messages.get(convId)
    if (rows) setMessages(rows.map((r: any) => ({ role: r.role as 'user' | 'assistant', content: r.content })))
  }

  // ── Select conversation ───────────────────────────────────────────────────────
  async function selectConversation(convId: number) {
    setActiveConvId(convId)
    setSearchQuery('')
    setSearchResults(null)
    await loadMessages(convId)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // ── Create conversation ───────────────────────────────────────────────────────
  async function handleCreateConversation(firstMessage?: string) {
    const conv = await chat()?.conversations.create({ title: 'New conversation' })
    if (!conv) return
    await loadConversations()
    setActiveConvId(conv.id)
    setMessages([])
    if (firstMessage) {
      // small delay lets state settle before send
      setTimeout(() => handleSend(firstMessage, conv.id, []), 80)
    } else {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  // ── Auto-title after first message ───────────────────────────────────────────
  async function autoTitle(convId: number, text: string) {
    const title = text.length > 52 ? text.slice(0, 49) + '...' : text
    await chat()?.conversations.update(convId, { title })
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, title } : c))
  }

  // ── Send ──────────────────────────────────────────────────────────────────────
  async function handleSend(
    overrideText?:    string,
    overrideConvId?:  number,
    overrideHistory?: Message[],
  ) {
    const text   = (overrideText ?? input).trim()
    const convId = overrideConvId ?? activeConvId
    if (!text || thinking || convId === null) return

    const snapshot         = overrideHistory ?? messagesRef.current
    const userMsg: Message = { role: 'user', content: text }
    const history          = [...snapshot, userMsg]

    setMessages([...history, { role: 'assistant', content: '' }])
    if (!overrideText) setInput('')
    setThinking(true)

    await chat()?.messages.add({ conversation_id: convId, role: 'user', content: text })
    if (snapshot.length === 0) autoTitle(convId, text)

    let accumulated = ''
    try {
      await sendMessage(history, (chunk: string) => {
        accumulated += chunk
        setMessages([...history, { role: 'assistant', content: accumulated }])
      })
    } catch {
      accumulated = 'Error — check Ollama is running.'
      setMessages([...history, { role: 'assistant', content: accumulated }])
    }

    await chat()?.messages.add({ conversation_id: convId, role: 'assistant', content: accumulated })
    await loadConversations()
    setThinking(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    if (e.key === 'Escape') onClose()
  }

  // ── Conversation actions ──────────────────────────────────────────────────────
  async function deleteConversation(id: number, e: React.MouseEvent) {
    e.stopPropagation()
    await chat()?.conversations.delete(id)
    if (activeConvId === id) { setActiveConvId(null); setMessages([]) }
    await loadConversations()
  }

  async function togglePin(conv: ChatConversation, e: React.MouseEvent) {
    e.stopPropagation()
    await chat()?.conversations.update(conv.id, { pinned: conv.pinned ? 0 : 1 })
    await loadConversations()
  }

  function startRenameConv(conv: ChatConversation, e: React.MouseEvent) {
    e.stopPropagation()
    setRenamingConvId(conv.id)
    setRenameConvValue(conv.title)
  }

  async function commitRenameConv() {
    if (renamingConvId === null) return
    const title = renameConvValue.trim() || 'Untitled'
    await chat()?.conversations.update(renamingConvId, { title })
    setConversations(prev => prev.map(c => c.id === renamingConvId ? { ...c, title } : c))
    setRenamingConvId(null)
  }

  // ── Folder actions ────────────────────────────────────────────────────────────
  async function createFolder() {
    const f = await chat()?.folders.create({ name: 'New folder', position: folders.length })
    if (!f) return
    await loadFolders()
    setExpandedFolders(prev => new Set([...prev, f.id]))
    setRenamingFolderId(f.id)
    setRenameFolderValue('New folder')
  }

  async function commitRenameFolder() {
    if (renamingFolderId === null) return
    const name = renameFolderValue.trim() || 'Untitled'
    await chat()?.folders.update(renamingFolderId, { name })
    setFolders(prev => prev.map(f => f.id === renamingFolderId ? { ...f, name } : f))
    setRenamingFolderId(null)
  }

  async function deleteFolder(id: number, e: React.MouseEvent) {
    e.stopPropagation()
    await chat()?.folders.delete(id)
    await loadFolders()
    await loadConversations()
  }

  async function toggleFolderStar(folder: ChatFolder, e: React.MouseEvent) {
    e.stopPropagation()
    await chat()?.folders.update(folder.id, { starred: folder.starred ? 0 : 1 })
    await loadFolders()
  }

  function toggleFolderExpand(id: number) {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Search ────────────────────────────────────────────────────────────────────
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults(null); return }
    const results = await chat()?.conversations.search(q)
    setSearchResults(results ?? [])
  }, [])

  useEffect(() => {
    const t = setTimeout(() => doSearch(searchQuery), 250)
    return () => clearTimeout(t)
  }, [searchQuery, doSearch])

  // ── Derived lists ─────────────────────────────────────────────────────────────
  const displayList  = searchResults ?? conversations
  const unfiledConvs = displayList.filter((c: ChatConversation) => c.folder_id === null)

  // ── Conversation row ──────────────────────────────────────────────────────────
  function ConvItem({ conv, indent = false }: { conv: ChatConversation; indent?: boolean }) {
    const isActive  = conv.id === activeConvId
    const isDragged = conv.id === draggedConvId
    return (
      <div
        className="group flex items-center gap-1.5 rounded-lg transition-all"
        style={{
          padding:         '5px 8px',
          paddingLeft:     indent ? '22px' : '8px',
          backgroundColor: isActive ? `${accentColor}20` : 'transparent',
          opacity:         isDragged ? 0.35 : 1,
          cursor:          draggedConvId !== null ? 'grabbing' : 'grab',
          userSelect:      'none',
        }}
        onMouseDown={e => {
          if ((e.target as HTMLElement).closest('button')) return
          convDragRef.current = { startY: e.clientY, moved: false }
          setDraggedConvId(conv.id)
        }}
        onClick={() => { if (!convDragRef.current.moved) selectConversation(conv.id) }}
      >
        {conv.pinned
          ? <Pin          size={10} style={{ color: '#facc15',                     flexShrink: 0 }} />
          : <MessageSquare size={10} style={{ color: isActive ? accentColor : 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
        }

        {renamingConvId === conv.id ? (
          <input
            ref={renameConvRef}
            value={renameConvValue}
            onChange={e => setRenameConvValue(e.target.value)}
            onBlur={commitRenameConv}
            onKeyDown={e => { if (e.key === 'Enter') commitRenameConv(); if (e.key === 'Escape') setRenamingConvId(null) }}
            className="flex-1 bg-transparent outline-none min-w-0 text-white"
            style={{ fontSize: 12 }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span
            className="flex-1 truncate select-none"
            style={{ fontSize: 12, color: isActive ? 'white' : 'rgba(255,255,255,0.5)' }}
          >
            {conv.title}
          </span>
        )}

        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <button
            onClick={e => togglePin(conv, e)}
            className="p-0.5 rounded hover:bg-white/10 transition-colors"
            style={{ color: conv.pinned ? '#facc15' : 'rgba(255,255,255,0.25)' }}
            title={conv.pinned ? 'Unpin' : 'Pin'}
          >
            <Pin size={9} />
          </button>
          <button
            onClick={e => startRenameConv(conv, e)}
            className="p-0.5 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            title="Rename"
          >
            <Pencil size={9} />
          </button>
          <button
            onClick={e => deleteConversation(conv.id, e)}
            className="p-0.5 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            title="Delete"
          >
            <Trash2 size={9} />
          </button>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0"
        style={{ zIndex: Z.AIDA_CHAT - 1, backgroundColor: 'rgba(0,0,0,0.35)' }}
        onClick={onClose}
      />

      {/* ── Window ───────────────────────────────────────────────────────────── */}
      <div
        className="fixed flex flex-col rounded-xl overflow-hidden"
        style={{
          left:                 pos.x,
          top:                  pos.y,
          width:                '800px',
          height:               '560px',
          zIndex:               Z.AIDA_CHAT,
          backgroundColor:      'rgba(13,17,23,0.97)',
          backdropFilter:       'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border:               `1px solid ${accentColor}30`,
          boxShadow:            '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Title Bar ──────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0 cursor-grab active:cursor-grabbing select-none"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          onMouseDown={onTitleMouseDown}
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

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ══════════════════════════════════════════════════════════════════
              LEFT SIDEBAR
          ══════════════════════════════════════════════════════════════════ */}
          <div
            className="flex flex-col shrink-0 overflow-hidden"
            style={{ width: `${sidebarW}px` }}
          >

            {/* Search */}
            <div className="px-3 pt-3 pb-2 shrink-0">
              <div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <Search size={11} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 bg-transparent outline-none min-w-0 text-white placeholder:text-white/25"
                  style={{ fontSize: 12 }}
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setSearchResults(null) }}>
                    <X size={10} style={{ color: 'rgba(255,255,255,0.3)' }} />
                  </button>
                )}
              </div>
            </div>

            {/* New chat + New folder */}
            <div className="flex items-center gap-1.5 px-3 pb-2.5 shrink-0">
              <button
                onClick={() => handleCreateConversation()}
                className="flex flex-1 items-center justify-center gap-1.5 py-1.5 rounded-lg transition-colors hover:bg-white/10"
                style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Plus size={11} /> New chat
              </button>
              <button
                onClick={createFolder}
                className="flex items-center justify-center p-1.5 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
                title="New folder"
              >
                <Folder size={11} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-px">

              {/* Folders */}
              {folders.map(folder => {
                const isExpanded  = expandedFolders.has(folder.id)
                const folderConvs = displayList.filter((c: ChatConversation) => c.folder_id === folder.id)

                return (
                  <div key={folder.id}>
                    <div
                      className="group flex items-center gap-1 rounded-lg cursor-pointer transition-colors"
                      style={{
                        padding:         '5px 6px',
                        backgroundColor: dropTarget?.type === 'folder' && dropTarget.id === folder.id ? `${accentColor}22` : 'transparent',
                        outline:         dropTarget?.type === 'folder' && dropTarget.id === folder.id ? `1px solid ${accentColor}55` : 'none',
                        borderRadius:    8,
                      }}
                      onClick={() => toggleFolderExpand(folder.id)}
                      onMouseEnter={() => { if (draggedConvId !== null) setDropTarget({ type: 'folder', id: folder.id }) }}
                      onMouseLeave={() => { if (draggedConvId !== null && dropTarget?.type === 'folder' && dropTarget.id === folder.id) setDropTarget(null) }}
                    >
                      {isExpanded
                        ? <ChevronDown  size={10} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                        : <ChevronRight size={10} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                      }
                      {isExpanded
                        ? <FolderOpen size={12} style={{ color: accentColor,              flexShrink: 0 }} />
                        : <Folder     size={12} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                      }

                      {renamingFolderId === folder.id ? (
                        <input
                          ref={renameFolderRef}
                          value={renameFolderValue}
                          onChange={e => setRenameFolderValue(e.target.value)}
                          onBlur={commitRenameFolder}
                          onKeyDown={e => { if (e.key === 'Enter') commitRenameFolder(); if (e.key === 'Escape') setRenamingFolderId(null) }}
                          className="flex-1 bg-transparent outline-none min-w-0 text-white"
                          style={{ fontSize: 12 }}
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span className="flex-1 truncate select-none" style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                          {folder.name}
                        </span>
                      )}

                      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={e => toggleFolderStar(folder, e)}
                          className="p-0.5 rounded hover:bg-white/10"
                          style={{ color: folder.starred ? '#facc15' : 'rgba(255,255,255,0.25)' }}
                          title={folder.starred ? 'Unstar' : 'Star'}
                        >
                          <Star size={9} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setRenamingFolderId(folder.id); setRenameFolderValue(folder.name) }}
                          className="p-0.5 rounded hover:bg-white/10"
                          style={{ color: 'rgba(255,255,255,0.25)' }}
                          title="Rename"
                        >
                          <Pencil size={9} />
                        </button>
                        <button
                          onClick={e => deleteFolder(folder.id, e)}
                          className="p-0.5 rounded hover:bg-white/10"
                          style={{ color: 'rgba(255,255,255,0.25)' }}
                          title="Delete folder"
                        >
                          <Trash2 size={9} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && folderConvs.map((conv: ChatConversation) => (
                      <ConvItem key={conv.id} conv={conv} indent />
                    ))}
                    {isExpanded && folderConvs.length === 0 && (
                      <div style={{ paddingLeft: 28, paddingTop: 4, paddingBottom: 4 }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Empty</span>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Divider */}
              {folders.length > 0 && unfiledConvs.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '4px 2px' }} />
              )}

              {/* Unfiled — drop target */}
              <div
                onMouseEnter={() => { if (draggedConvId !== null) setDropTarget({ type: 'unfiled' }) }}
                onMouseLeave={() => { if (draggedConvId !== null && dropTarget?.type === 'unfiled') setDropTarget(null) }}
                style={{
                  borderRadius:    6,
                  outline:         dropTarget?.type === 'unfiled' ? `1px solid ${accentColor}40` : 'none',
                  backgroundColor: dropTarget?.type === 'unfiled' ? `${accentColor}10` : 'transparent',
                  minHeight:       draggedConvId !== null ? '24px' : undefined,
                }}
              >
                {unfiledConvs.map((conv: ChatConversation) => (
                  <ConvItem key={conv.id} conv={conv} />
                ))}
              </div>

              {conversations.length === 0 && !searchQuery && (
                <div className="flex items-center justify-center py-8">
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>No conversations yet</span>
                </div>
              )}
              {searchResults !== null && searchResults.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>No results</span>
                </div>
              )}

            </div>
          </div>

          {/* ── Divider / resize handle ──────────────────────────────────── */}
          <div
            onMouseDown={e => { e.preventDefault(); setResizingSidebar(true); resizeStartX.current = e.clientX; resizeStartW.current = sidebarW }}
            style={{
              width:           '12px',
              flexShrink:      0,
              cursor:          'col-resize',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              backgroundColor: resizingSidebar ? `${accentColor}12` : 'transparent',
              borderLeft:      `1px solid ${resizingSidebar ? accentColor + '40' : 'rgba(255,255,255,0.06)'}`,
              transition:      'background-color 0.15s, border-color 0.15s',
              userSelect:      'none',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.backgroundColor = `${accentColor}12`
              el.style.borderLeftColor  = `${accentColor}50`
            }}
            onMouseLeave={e => {
              if (resizingSidebar) return
              const el = e.currentTarget as HTMLDivElement
              el.style.backgroundColor = 'transparent'
              el.style.borderLeftColor  = 'rgba(255,255,255,0.06)'
            }}
          >
            <span style={{
              fontSize:      9,
              color:         resizingSidebar ? accentColor : 'rgba(255,255,255,0.18)',
              letterSpacing: '-1px',
              lineHeight:    1,
              userSelect:    'none',
              pointerEvents: 'none',
            }}>
              &#x2194;
            </span>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              RIGHT: CHAT AREA
          ══════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col flex-1 overflow-hidden">

            {activeConvId === null ? (

              /* ── Empty / welcome state ─────────────────────────────────── */
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <span
                  className="text-xs select-none text-center"
                  style={{ color: 'rgba(255,255,255,0.15)', fontFamily: 'DM Mono, monospace', lineHeight: 1.9 }}
                >
                  Select a conversation<br />or start a new one
                </span>
                <button
                  onClick={() => handleCreateConversation()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-colors"
                  style={{
                    backgroundColor: `${accentColor}18`,
                    color:           accentColor,
                    border:          `1px solid ${accentColor}35`,
                  }}
                >
                  <Plus size={13} /> New conversation
                </button>
              </div>

            ) : (
              <>
                {/* ── Messages ──────────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">

                  {messages.length === 0 && (
                    <div className="flex-1 flex items-center justify-center h-full">
                      <span
                        className="text-xs select-none"
                        style={{ color: 'rgba(255,255,255,0.15)', fontFamily: 'DM Mono, monospace' }}
                      >
                        How can I help you today?
                      </span>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="px-4 py-2.5 rounded-xl text-sm leading-relaxed"
                        style={msg.role === 'user' ? {
                          maxWidth:        '78%',
                          backgroundColor: accentColor + '20',
                          border:          `1px solid ${accentColor}30`,
                          color:           'rgba(255,255,255,0.9)',
                        } : {
                          maxWidth:        '84%',
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          border:          '1px solid rgba(255,255,255,0.07)',
                          color:           'rgba(255,255,255,0.75)',
                          whiteSpace:      'pre-wrap',
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

                {/* ── Input bar ────────────────────────────────────────────── */}
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
                    disabled={thinking}
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/20"
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
              </>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
