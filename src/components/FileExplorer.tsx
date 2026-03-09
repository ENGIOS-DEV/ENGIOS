import { useState, useEffect, useRef, useCallback } from 'react'
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown, Home, X, ArrowLeft, Image, Film, Music, Code, Archive, FileSpreadsheet } from 'lucide-react'
import { Z } from '../zIndex'

// ─── Types ────────────────────────────────────────────────────────────────────
interface FsEntry {
  name:     string
  path:     string
  isDir:    boolean
  size:     number
  modified: Date
}

interface TreeNode {
  name:     string
  path:     string
  children: TreeNode[]
  expanded: boolean
  loaded:   boolean
}

interface FileExplorerProps {
  isOpen:      boolean
  onClose:     () => void
  accentColor: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getFileIcon(name: string, size = 14) {
  const ext = name.split('.').pop()?.toLowerCase()
  const style = { flexShrink: 0 as const }
  switch (ext) {
    case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp': case 'svg':
      return <Image size={size} style={{ ...style, color: '#f472b6' }} />
    case 'mp4': case 'mkv': case 'avi': case 'mov': case 'webm':
      return <Film size={size} style={{ ...style, color: '#a78bfa' }} />
    case 'mp3': case 'flac': case 'wav': case 'ogg': case 'aac':
      return <Music size={size} style={{ ...style, color: '#34d399' }} />
    case 'js': case 'ts': case 'tsx': case 'jsx': case 'py': case 'sh': case 'css': case 'html': case 'json':
      return <Code size={size} style={{ ...style, color: '#60a5fa' }} />
    case 'zip': case 'tar': case 'gz': case 'rar': case '7z':
      return <Archive size={size} style={{ ...style, color: '#fbbf24' }} />
    case 'xlsx': case 'csv': case 'ods':
      return <FileSpreadsheet size={size} style={{ ...style, color: '#34d399' }} />
    default:
      return <FileText size={size} style={{ ...style, color: 'rgba(255,255,255,0.35)' }} />
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FileExplorer({ isOpen, onClose, accentColor }: FileExplorerProps) {
  const [tree,          setTree]          = useState<TreeNode[]>([])
  const [selectedDir,   setSelectedDir]   = useState<string>('')
  const [dirContents,   setDirContents]   = useState<FsEntry[]>([])
  const [selectedFile,  setSelectedFile]  = useState<FsEntry | null>(null)
  const [homedir,       setHomedir]       = useState<string>('')
  const [history,       setHistory]       = useState<string[]>([])

  // Draggable state
  const [pos,     setPos]     = useState({ x: 80, y: 80 })
  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !window.electron) return
    window.electron.fs.homedir().then(async home => {
      setHomedir(home)
      const entries = await window.electron!.fs.readdir(home)
      const dirs = entries.filter(e => e.isDir)
      const rootNodes: TreeNode[] = dirs.map(d => ({
        name: d.name, path: d.path, children: [], expanded: false, loaded: false,
      }))
      setTree(rootNodes)
      navigateTo(home)
    })
  }, [isOpen])

  // ── Navigation ──────────────────────────────────────────────────────────────
  const navigateTo = useCallback(async (dirPath: string) => {
    if (!window.electron) return
    const entries = await window.electron.fs.readdir(dirPath)
    setSelectedDir(dirPath)
    setDirContents(entries)
    setSelectedFile(null)
    setHistory(prev => [...prev, dirPath])
  }, [])

  const goBack = useCallback(() => {
    if (history.length < 2) return
    const newHistory = history.slice(0, -1)
    setHistory(newHistory)
    const prev = newHistory[newHistory.length - 1]
    if (window.electron && prev) {
      window.electron.fs.readdir(prev).then(entries => {
        setSelectedDir(prev)
        setDirContents(entries)
        setSelectedFile(null)
      })
    }
  }, [history])

  // ── Tree expansion ──────────────────────────────────────────────────────────
  const toggleNode = useCallback(async (node: TreeNode, nodes: TreeNode[], setNodes: (n: TreeNode[]) => void) => {
    if (!window.electron) return
    if (!node.loaded && !node.expanded) {
      const entries = await window.electron.fs.readdir(node.path)
      const children: TreeNode[] = entries
        .filter(e => e.isDir)
        .map(d => ({ name: d.name, path: d.path, children: [], expanded: false, loaded: false }))
      node.children = children
      node.loaded   = true
    }
    node.expanded = !node.expanded
    setNodes([...nodes])
    if (node.expanded) navigateTo(node.path)
  }, [navigateTo])

  // ── Drag ────────────────────────────────────────────────────────────────────
  const WIN_W = 820
  const WIN_H = 560

  // Reset to safe position on open
  useEffect(() => {
    if (isOpen) {
      setPos({
        x: Math.max(0, Math.round(window.innerWidth  / 2 - WIN_W / 2)),
        y: Math.max(0, Math.min(80, window.innerHeight - WIN_H)),
      })
    }
  }, [isOpen])

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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

  // ── Sidebar resize state ─────────────────────────────────────────────────────
  const LEFT_MIN  = 140
  const LEFT_MAX  = 360
  const RIGHT_MIN = 180
  const RIGHT_MAX = 420

  const [leftW,          setLeftW]          = useState(200)
  const [rightW,         setRightW]         = useState(280)
  const [resizingLeft,   setResizingLeft]   = useState(false)
  const [resizingRight,  setResizingRight]  = useState(false)
  const resizeLeftStartX  = useRef(0)
  const resizeLeftStartW  = useRef(200)
  const resizeRightStartX = useRef(0)
  const resizeRightStartW = useRef(280)

  useEffect(() => {
    if (!resizingLeft) return
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeLeftStartX.current
      setLeftW(Math.max(LEFT_MIN, Math.min(LEFT_MAX, resizeLeftStartW.current + delta)))
    }
    const onUp = () => setResizingLeft(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [resizingLeft])

  useEffect(() => {
    if (!resizingRight) return
    const onMove = (e: MouseEvent) => {
      // Right pane resizes in reverse — dragging left makes it bigger
      const delta = resizeRightStartX.current - e.clientX
      setRightW(Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, resizeRightStartW.current + delta)))
    }
    const onUp = () => setResizingRight(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [resizingRight])

  // ── Tree renderer ───────────────────────────────────────────────────────────
  function renderTree(nodes: TreeNode[], depth = 0): React.ReactNode {
    return nodes.map(node => (
      <div key={node.path}>
        <button
          onClick={() => toggleNode(node, tree, setTree)}
          className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded transition-colors hover:bg-white/5 text-xs"
          style={{
            paddingLeft: `${8 + depth * 14}px`,
            color: selectedDir === node.path ? 'white' : 'rgba(255,255,255,0.55)',
            backgroundColor: selectedDir === node.path ? `${accentColor}22` : 'transparent',
          }}
        >
          {node.expanded
            ? <ChevronDown size={10} style={{ color: accentColor, flexShrink: 0 }} />
            : <ChevronRight size={10} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
          }
          {node.expanded
            ? <FolderOpen size={13} style={{ color: accentColor, flexShrink: 0 }} />
            : <Folder     size={13} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
          }
          <span className="truncate">{node.name}</span>
        </button>
        {node.expanded && node.children.length > 0 && renderTree(node.children, depth + 1)}
      </div>
    ))
  }

  if (!isOpen) return null

  return (
    <>
      {/* ── Backdrop ────────────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0"
        style={{ zIndex: Z.FILE_EXPLORER - 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
      />

      {/* ── Window ──────────────────────────────────────────────────────────── */}
      <div
        className="fixed flex flex-col rounded-xl overflow-hidden"
        style={{
          left:              pos.x,
          top:               pos.y,
          width:             '820px',
          height:            '560px',
          zIndex:            Z.FILE_EXPLORER,
          backgroundColor:   'rgba(13,17,23,0.97)',
          backdropFilter:    'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border:            '1px solid rgba(255,255,255,0.08)',
          boxShadow:         '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Title Bar ─────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0 cursor-grab active:cursor-grabbing"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          onMouseDown={onMouseDown}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              disabled={history.length < 2}
              className="p-1 rounded transition-colors"
              style={{ color: history.length < 2 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)' }}
            >
              <ArrowLeft size={14} />
            </button>
            <button
              onClick={() => homedir && navigateTo(homedir)}
              className="p-1 rounded transition-colors hover:bg-white/5"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <Home size={14} />
            </button>
            <span
              className="text-xs truncate max-w-100"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Mono, monospace' }}
            >
              {selectedDir}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left Pane — Folder Tree ───────────────────────────────────── */}
          <div
            className="flex flex-col overflow-y-auto shrink-0"
            style={{ width: `${leftW}px`, padding: '8px 4px' }}
          >
            {/* Home shortcut */}
            <button
              onClick={() => homedir && navigateTo(homedir)}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-xs w-full text-left transition-colors hover:bg-white/5 mb-1"
              style={{ color: selectedDir === homedir ? 'white' : 'rgba(255,255,255,0.5)', backgroundColor: selectedDir === homedir ? `${accentColor}22` : 'transparent' }}
            >
              <Home size={13} style={{ color: accentColor, flexShrink: 0 }} />
              <span>Home</span>
            </button>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', margin: '4px 0 8px' }} />
            {renderTree(tree)}
          </div>

          {/* ── Left divider ────────────────────────────────────────────────── */}
          <div
            onMouseDown={e => { e.preventDefault(); setResizingLeft(true); resizeLeftStartX.current = e.clientX; resizeLeftStartW.current = leftW }}
            style={{
              width:           '12px',
              flexShrink:      0,
              cursor:          'col-resize',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              backgroundColor: resizingLeft ? `${accentColor}12` : 'transparent',
              borderLeft:      `1px solid ${resizingLeft ? accentColor + '40' : 'rgba(255,255,255,0.06)'}`,
              borderRight:     `1px solid ${resizingLeft ? accentColor + '40' : 'rgba(255,255,255,0.06)'}`,
              transition:      'background-color 0.15s, border-color 0.15s',
              userSelect:      'none',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.backgroundColor = `${accentColor}12`; el.style.borderLeftColor = `${accentColor}50`; el.style.borderRightColor = `${accentColor}50` }}
            onMouseLeave={e => { if (resizingLeft) return; const el = e.currentTarget as HTMLDivElement; el.style.backgroundColor = 'transparent'; el.style.borderLeftColor = 'rgba(255,255,255,0.06)'; el.style.borderRightColor = 'rgba(255,255,255,0.06)' }}
          >
            <span style={{ fontSize: 9, color: resizingLeft ? accentColor : 'rgba(255,255,255,0.18)', letterSpacing: '-1px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>&#x2194;</span>
          </div>

          {/* ── Centre Pane — Preview Placeholder ────────────────────────── */}
          <div className="flex flex-col flex-1 overflow-hidden items-center justify-center">
            {selectedFile ? (
              <div className="flex flex-col items-center gap-4 px-8 text-center">
                {getFileIcon(selectedFile.name, 40)}
                <div>
                  <div className="text-sm text-white/80 font-medium mb-1">{selectedFile.name}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Mono, monospace' }}>
                    {formatSize(selectedFile.size)} · {formatDate(selectedFile.modified)}
                  </div>
                </div>
                <button
                  onClick={() => window.electron?.openFile(selectedFile.path)}
                  className="px-4 py-2 rounded-lg text-xs font-medium transition-colors mt-2"
                  style={{ backgroundColor: accentColor, color: 'white' }}
                >
                  Open File
                </button>
                <div
                  className="text-xs mt-4 px-4 py-3 rounded-lg w-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  File preview coming in a future release
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center px-8">
                <Folder size={40} style={{ color: 'rgba(255,255,255,0.08)' }} />
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
                  Select a file to open it here
                </span>
              </div>
            )}
          </div>

          {/* ── Right divider ───────────────────────────────────────────────── */}
          <div
            onMouseDown={e => { e.preventDefault(); setResizingRight(true); resizeRightStartX.current = e.clientX; resizeRightStartW.current = rightW }}
            style={{
              width:           '12px',
              flexShrink:      0,
              cursor:          'col-resize',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              backgroundColor: resizingRight ? `${accentColor}12` : 'transparent',
              borderLeft:      `1px solid ${resizingRight ? accentColor + '40' : 'rgba(255,255,255,0.06)'}`,
              borderRight:     `1px solid ${resizingRight ? accentColor + '40' : 'rgba(255,255,255,0.06)'}`,
              transition:      'background-color 0.15s, border-color 0.15s',
              userSelect:      'none',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.backgroundColor = `${accentColor}12`; el.style.borderLeftColor = `${accentColor}50`; el.style.borderRightColor = `${accentColor}50` }}
            onMouseLeave={e => { if (resizingRight) return; const el = e.currentTarget as HTMLDivElement; el.style.backgroundColor = 'transparent'; el.style.borderLeftColor = 'rgba(255,255,255,0.06)'; el.style.borderRightColor = 'rgba(255,255,255,0.06)' }}
          >
            <span style={{ fontSize: 9, color: resizingRight ? accentColor : 'rgba(255,255,255,0.18)', letterSpacing: '-1px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>&#x2194;</span>
          </div>

          {/* ── Right Pane — File List ────────────────────────────────────── */}
          <div className="flex flex-col shrink-0 overflow-hidden" style={{ width: `${rightW}px` }}>
            <div className="flex-1 overflow-y-auto">
              {dirContents.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>Empty folder</span>
                </div>
              ) : (
                dirContents.map((entry, i) => (
                  <button
                    key={i}
                    className="flex items-center gap-2.5 w-full text-left px-4 py-2 transition-colors hover:bg-white/5 text-xs"
                    style={{
                      color: selectedFile?.path === entry.path ? 'white' : 'rgba(255,255,255,0.65)',
                      backgroundColor: selectedFile?.path === entry.path ? `${accentColor}22` : 'transparent',
                    }}
                    onClick={() => {
                      if (entry.isDir) {
                        navigateTo(entry.path)
                      } else {
                        setSelectedFile(entry)
                      }
                    }}
                    onDoubleClick={() => {
                      if (!entry.isDir) window.electron?.openFile(entry.path)
                    }}
                  >
                    {entry.isDir
                      ? <Folder size={14} style={{ color: accentColor, flexShrink: 0 }} />
                      : getFileIcon(entry.name, 14)
                    }
                    <span className="truncate flex-1">{entry.name}</span>
                    {!entry.isDir && (
                      <span style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{formatSize(entry.size)}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
