// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5 — COMPONENT: File Decks
// AIDA-2 — src/components/apps/file-decks/FileDecks.tsx
//
// Responsibility:
//   File manager and simple editor UI.
//   Three-pane layout: folder tree | preview | file list
//   Collapsible sub-bar: Path (with copy) | Search
//
// Rules:
//   - Zero style definitions — all from src/themes/app.ts
//   - No hardcoded colours, sizes, or spacing
//   - No getPalette() calls — typed style functions only
//   - No localStorage — all persistence through DB
//   - No direct window.electron calls beyond IPC send/fs
//
// Import depth: apps/file-decks/ → depth 3 → ../../../
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Folder, FolderOpen, FileText, ChevronRight, ChevronDown,
  Home, ArrowLeft, Image, Film, Music, Code, Archive,
  FileSpreadsheet, Copy, Check, Search, X, CornerDownLeft,
} from 'lucide-react'
import AppTitleBar from '../../shared/AppTitleBar'
import type { GlobalSettings } from '../../../types/settings'
import {
  APP_TITLE_BAR,
  getAppWindowElevatedStyle,
  getFileDeckBackButtonStyle,
  getFileDeckSubBarMenuButtonStyle,
  getFileDeckSubBarStyle,
  getFileDeckPathTextStyle,
  getFileDeckCopyButtonStyle,
  getFileDeckSearchInputStyle,
  getFileDeckSearchClearStyle,
  getFileDeckTreeNodeStyle,
  getFileDeckHomeButtonStyle,
  getFileDeckFileRowStyle,
  getFileDeckToolbarGroupStyle,
  getFileDeckSidebarStyle,
  getFileDeckSeparatorStyle,
  getFileDeckResizeHandleStyle,
  getFileDeckResizeHandleIconStyle,
  getFileDeckDetailPrimaryStyle,
  getFileDeckDetailSecondaryStyle,
  getFileDeckDetailMonoStyle,
  getFileDeckPreviewImageStyle,
  getFileDeckIconStyle,
  getFileDeckEmptyStyle,
  getFileDeckBreadcrumbIconStyle,
  FILE_ICON_COLOURS,
  Z,
} from '../../../themes/app'

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

interface FileDecksProps {
  isOpen:      boolean
  onClose:     () => void
  accentColor: string
  settings:    GlobalSettings
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AUDIO_EXTS = ['mp3','wav','flac','ogg','m4a','aac','wma','opus','aiff']
const VIDEO_EXTS = ['mp4','mkv','webm','mov','avi','wmv','m4v','ogv']
const IMAGE_EXTS = ['jpg','jpeg','png','gif','webp','svg','bmp','ico']

function getMediaType(name: string): 'audio' | 'video' | 'image' | null {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (AUDIO_EXTS.includes(ext)) return 'audio'
  if (VIDEO_EXTS.includes(ext)) return 'video'
  if (IMAGE_EXTS.includes(ext)) return 'image'
  return null
}

function formatSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function getFileIcon(name: string, size = 14) {
  const ext   = name.split('.').pop()?.toLowerCase()
  const style = { flexShrink: 0 as const }
  switch (ext) {
    case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp': case 'svg':
      return <Image size={size} style={{ ...style, color: FILE_ICON_COLOURS.image }} />
    case 'mp4': case 'mkv': case 'avi': case 'mov': case 'webm':
      return <Film size={size} style={{ ...style, color: FILE_ICON_COLOURS.video }} />
    case 'mp3': case 'flac': case 'wav': case 'ogg': case 'aac':
      return <Music size={size} style={{ ...style, color: FILE_ICON_COLOURS.audio }} />
    case 'js': case 'ts': case 'tsx': case 'jsx': case 'py':
    case 'sh': case 'css': case 'html': case 'json':
      return <Code size={size} style={{ ...style, color: FILE_ICON_COLOURS.code }} />
    case 'zip': case 'tar': case 'gz': case 'rar': case '7z':
      return <Archive size={size} style={{ ...style, color: FILE_ICON_COLOURS.archive }} />
    case 'xlsx': case 'csv': case 'ods':
      return <FileSpreadsheet size={size} style={{ ...style, color: FILE_ICON_COLOURS.spreadsheet }} />
    default:
      return <FileText size={size} style={{ ...style, ...getFileDeckIconStyle() }} />
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FileDecks({
  isOpen,
  onClose,
  accentColor,
  settings,
}: FileDecksProps) {

  // ── State ──────────────────────────────────────────────────────────────────
  const [tree,         setTree]         = useState<TreeNode[]>([])
  const [selectedDir,  setSelectedDir]  = useState<string>('')
  const [dirContents,  setDirContents]  = useState<FsEntry[]>([])
  const [selectedFile, setSelectedFile] = useState<FsEntry | null>(null)
  const [homedir,      setHomedir]      = useState<string>('')
  const [history,      setHistory]      = useState<string[]>([])

  // ── Sub-bar ────────────────────────────────────────────────────────────────
  type SubBar = 'path' | 'search' | null
  const [subBar,      setSubBar]      = useState<SubBar>(null)
  const [copied,      setCopied]      = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // ── Sidebar resize ─────────────────────────────────────────────────────────
  const LEFT_MIN  = 140
  const LEFT_MAX  = 360
  const RIGHT_MIN = 180
  const RIGHT_MAX = 420

  const [leftW,         setLeftW]         = useState(200)
  const [rightW,        setRightW]        = useState(280)
  const [resizingLeft,  setResizingLeft]  = useState(false)
  const [resizingRight, setResizingRight] = useState(false)
  const resizeLeftStartX  = useRef(0)
  const resizeLeftStartW  = useRef(200)
  const resizeRightStartX = useRef(0)
  const resizeRightStartW = useRef(280)

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !window.electron) return
    window.electron.fs.homedir().then(async home => {
      setHomedir(home)
      const entries = await window.electron!.fs.readdir(home)
      const dirs    = entries.filter(e => e.isDir)
      const nodes: TreeNode[] = dirs.map(d => ({
        name: d.name, path: d.path, children: [], expanded: false, loaded: false,
      }))
      setTree(nodes)
      await navigateTo(home)
    })
  }, [isOpen])

  // ── Navigation ─────────────────────────────────────────────────────────────
  const navigateTo = useCallback(async (dirPath: string) => {
    if (!window.electron) return
    const entries = await window.electron.fs.readdir(dirPath)
    setSelectedDir(dirPath)
    setDirContents(entries)
    setSelectedFile(null)
    setHistory(prev => [...prev, dirPath])
  }, [])

  // ── Listen for navigate + select IPC directly ───────────────────────────
  useEffect(() => {
    const offNav = window.electron?.on('explorer:navigate', (_: unknown, path: string) => {
      navigateTo(path)
    })
    const offSel = window.electron?.on('explorer:select', (_: unknown, fileName: string) => {
      setDirContents(prev => {
        const file = prev.find(e => e.name === fileName)
        if (file) {
          setSelectedFile(file)
          // Scroll into view after React re-renders
          setTimeout(() => {
            const el = document.querySelector(`[data-filename="${fileName}"]`) as HTMLElement
            el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
          }, 50)
        }
        return prev
      })
    })
    return () => { offNav?.(); offSel?.() }
  }, [navigateTo])

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

  // ── Tree expansion ─────────────────────────────────────────────────────────
  const toggleNode = useCallback(async (
    node:     TreeNode,
    nodes:    TreeNode[],
    setNodes: (n: TreeNode[]) => void,
  ) => {
    if (!window.electron) return
    if (!node.loaded && !node.expanded) {
      const entries     = await window.electron.fs.readdir(node.path)
      node.children     = entries
        .filter(e => e.isDir)
        .map(d => ({ name: d.name, path: d.path, children: [], expanded: false, loaded: false }))
      node.loaded       = true
    }
    node.expanded = !node.expanded
    setNodes([...nodes])
    if (node.expanded) navigateTo(node.path)
  }, [navigateTo])

  // ── Sidebar resize handlers ────────────────────────────────────────────────
  useEffect(() => {
    if (!resizingLeft) return
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeLeftStartX.current
      setLeftW(Math.max(LEFT_MIN, Math.min(LEFT_MAX, resizeLeftStartW.current + delta)))
    }
    const onUp = () => setResizingLeft(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [resizingLeft])

  useEffect(() => {
    if (!resizingRight) return
    const onMove = (e: MouseEvent) => {
      const delta = resizeRightStartX.current - e.clientX
      setRightW(Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, resizeRightStartW.current + delta)))
    }
    const onUp = () => setResizingRight(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [resizingRight])

  // ── Copy path ──────────────────────────────────────────────────────────────
  function handleCopyPath() {
    const target = selectedFile ? selectedFile.path : selectedDir
    navigator.clipboard.writeText(target).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  // ── Tree renderer ──────────────────────────────────────────────────────────
  function renderTree(nodes: TreeNode[], depth = 0): React.ReactNode {
    return nodes.map(node => (
      <div key={node.path}>
        <button
          onClick={() => toggleNode(node, tree, setTree)}
          className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded transition-colors hover:bg-[var(--color-bg-subtle)]"
          style={getFileDeckTreeNodeStyle(settings, selectedDir === node.path, accentColor, depth)}
        >
          {node.expanded
            ? <ChevronDown  size={10} style={{ color: accentColor, flexShrink: 0 }} />
            : <ChevronRight size={10} style={getFileDeckIconStyle()} />
          }
          {node.expanded
            ? <FolderOpen size={13} style={{ color: accentColor, flexShrink: 0 }} />
            : <Folder     size={13} style={getFileDeckIconStyle()} />
          }
          <span className="truncate">{node.name}</span>
        </button>
        {node.expanded && node.children.length > 0 && renderTree(node.children, depth + 1)}
      </div>
    ))
  }

  if (!isOpen) return null

  return (
    <div style={{ ...getAppWindowElevatedStyle(settings), display: 'flex', flexDirection: 'column' }}>

      {/* ── Title Bar ───────────────────────────────────────────────────────── */}
      <AppTitleBar title="File Decks" settings={settings} onClose={onClose}>

        {/* Back */}
        <button
          onClick={goBack}
          disabled={history.length < 2}
          style={getFileDeckBackButtonStyle(settings, history.length < 2)}
          title="Back"
        >
          <ArrowLeft size={APP_TITLE_BAR.chevronSize} />
        </button>

        {/* Path | Search menu */}
        <div style={getFileDeckToolbarGroupStyle()}>
          {(['path', 'search'] as const).map(item => (
            <button
              key={item}
              onClick={() => setSubBar(prev => prev === item ? null : item)}
              style={getFileDeckSubBarMenuButtonStyle(settings, subBar === item, accentColor)}
            >
              {item === 'path' ? 'Path' : 'Search'}
            </button>
          ))}
        </div>

      </AppTitleBar>

      {/* ── Sub-bar ─────────────────────────────────────────────────────────── */}
      {subBar !== null && (
        <div style={getFileDeckSubBarStyle(settings, accentColor)}>

          {subBar === 'path' && (
            <>
              <span style={getFileDeckPathTextStyle(settings)}>
                {selectedFile ? selectedFile.path : selectedDir || '—'}
              </span>
              <button
                onClick={handleCopyPath}
                title={copied ? 'Copied!' : 'Copy path'}
                style={getFileDeckCopyButtonStyle(settings, copied, accentColor)}
              >
                {copied
                  ? <><Check size={12} /> Copied</>
                  : <><Copy  size={12} /> Copy</>
                }
              </button>
            </>
          )}

          {subBar === 'search' && (
            <>
              <Search size={13} style={getFileDeckIconStyle(true)} />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search files and folders…"
                style={getFileDeckSearchInputStyle(settings)}
              />
              {searchQuery
                ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={getFileDeckSearchClearStyle(settings)}
                  >
                    <X size={12} />
                  </button>
                ) : (
                  <CornerDownLeft
                    size={12}
                    style={getFileDeckBreadcrumbIconStyle(true)}
                  />
                )
              }
            </>
          )}

        </div>
      )}

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left pane — folder tree ─────────────────────────────────────── */}
        <div
          className="flex flex-col overflow-y-auto shrink-0"
          style={getFileDeckSidebarStyle(leftW)}
        >
          <button
            onClick={() => homedir && navigateTo(homedir)}
            className="flex items-center gap-2 px-2 py-1.5 rounded w-full text-left transition-colors hover:bg-[var(--color-bg-subtle)] mb-1"
            style={getFileDeckHomeButtonStyle(settings, selectedDir === homedir, accentColor)}
          >
            <Home size={13} style={{ color: accentColor, flexShrink: 0 }} />
            <span>Home</span>
          </button>
          <div style={getFileDeckSeparatorStyle()} />
          {renderTree(tree)}
        </div>

        {/* ── Left divider ────────────────────────────────────────────────── */}
        <div
          onMouseDown={e => {
            e.preventDefault()
            setResizingLeft(true)
            resizeLeftStartX.current = e.clientX
            resizeLeftStartW.current = leftW
          }}
          style={getFileDeckResizeHandleStyle(resizingLeft, accentColor, 'left')}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.backgroundColor  = `${accentColor}12`
            el.style.borderLeftColor  = `${accentColor}50`
            el.style.borderRightColor = `${accentColor}50`
          }}
          onMouseLeave={e => {
            if (resizingLeft) return
            const el = e.currentTarget as HTMLDivElement
            el.style.backgroundColor  = 'transparent'
            el.style.borderLeftColor  = 'var(--color-border-subtle)'
            el.style.borderRightColor = 'var(--color-border-subtle)'
          }}
        >
          <span style={getFileDeckResizeHandleIconStyle(resizingLeft, accentColor)}>
            &#x2194;
          </span>
        </div>

        {/* ── Centre pane — preview ───────────────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden items-center justify-center">
          {selectedFile ? (
            <div className="flex flex-col items-center gap-4 px-8 w-full text-center">
              {(() => {
                const mediaType = getMediaType(selectedFile.name)
                const src       = `file://${selectedFile.path.replace(/\\/g, '/')}`

                if (mediaType === 'audio') return (
                  <div className="flex flex-col items-center gap-3 w-full">
                    {getFileIcon(selectedFile.name, 36)}
                    <div style={getFileDeckDetailPrimaryStyle()}>
                      {selectedFile.name}
                    </div>
                    <div style={getFileDeckDetailSecondaryStyle()}>
                      {formatSize(selectedFile.size)} · {formatDate(selectedFile.modified)}
                    </div>
                    <audio
                      controls
                      autoPlay
                      src={src}
                      style={{ width: '100%', marginTop: '8px', accentColor }}
                    />
                  </div>
                )

                if (mediaType === 'video') return (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <video
                      controls
                      autoPlay
                      src={src}
                      style={{ width: '100%', maxHeight: '240px', borderRadius: '8px', background: FILE_ICON_COLOURS.mediaBg }}
                    />
                    <div style={getFileDeckDetailSecondaryStyle()}>
                      {selectedFile.name} · {formatSize(selectedFile.size)}
                    </div>
                  </div>
                )

                if (mediaType === 'image') return (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <img
                      src={src}
                      alt={selectedFile.name}
                      style={getFileDeckPreviewImageStyle()}
                    />
                    <div style={getFileDeckDetailSecondaryStyle()}>
                      {selectedFile.name} · {formatSize(selectedFile.size)}
                    </div>
                  </div>
                )

                // Default — non-media file
                return (
                  <>
                    {getFileIcon(selectedFile.name, 40)}
                    <div>
                      <div style={getFileDeckDetailPrimaryStyle()}>
                        {selectedFile.name}
                      </div>
                      <div style={getFileDeckDetailMonoStyle()}>
                        {formatSize(selectedFile.size)} · {formatDate(selectedFile.modified)}
                      </div>
                    </div>
                    <button
                      onClick={() => window.electron?.openFile(selectedFile.path)}
                      className="px-4 py-2 rounded-lg font-medium transition-colors mt-2"
                      style={{ backgroundColor: accentColor, color: 'var(--color-text-primary)', fontSize: 'var(--font-size-base)' }}
                    >
                      Open File
                    </button>
                  </>
                )
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center px-8">
              <Folder size={40} style={getFileDeckEmptyStyle()} />
              <span style={getFileDeckDetailSecondaryStyle()}>
                Select a file to open it here
              </span>
            </div>
          )}
        </div>

        {/* ── Right divider ───────────────────────────────────────────────── */}
        <div
          onMouseDown={e => {
            e.preventDefault()
            setResizingRight(true)
            resizeRightStartX.current = e.clientX
            resizeRightStartW.current = rightW
          }}
          style={getFileDeckResizeHandleStyle(resizingRight, accentColor, 'right')}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.backgroundColor  = `${accentColor}12`
            el.style.borderLeftColor  = `${accentColor}50`
            el.style.borderRightColor = `${accentColor}50`
          }}
          onMouseLeave={e => {
            if (resizingRight) return
            const el = e.currentTarget as HTMLDivElement
            el.style.backgroundColor  = 'transparent'
            el.style.borderLeftColor  = 'var(--color-border-subtle)'
            el.style.borderRightColor = 'var(--color-border-subtle)'
          }}
        >
          <span style={getFileDeckResizeHandleIconStyle(resizingRight, accentColor)}>
            &#x2194;
          </span>
        </div>

        {/* ── Right pane — file list ──────────────────────────────────────── */}
        <div className="flex flex-col shrink-0 overflow-hidden" style={{ width: `${rightW}px` }}>
          <div className="flex-1 overflow-y-auto">
            {dirContents.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span style={getFileDeckDetailSecondaryStyle()}>
                  Empty folder
                </span>
              </div>
            ) : (
              dirContents.map((entry, i) => (
                <button
                  key={i}
                  data-filename={entry.name}
                  className="flex items-center gap-2.5 w-full text-left px-4 py-2 transition-colors hover:bg-[var(--color-bg-subtle)]"
                  style={getFileDeckFileRowStyle(settings, selectedFile?.path === entry.path, accentColor)}
                  onClick={() => entry.isDir ? navigateTo(entry.path) : setSelectedFile(entry)}
                  onDoubleClick={() => !entry.isDir && window.electron?.openFile(entry.path)}
                >
                  {entry.isDir
                    ? <Folder size={14} style={{ color: accentColor, flexShrink: 0 }} />
                    : getFileIcon(entry.name, 14)
                  }
                  <span className="truncate flex-1">{entry.name}</span>

                </button>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
