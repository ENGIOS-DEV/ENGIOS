import { useState, useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit                   from '@tiptap/starter-kit'
import Underline                    from '@tiptap/extension-underline'
import TextAlign                    from '@tiptap/extension-text-align'
import TextStyle                    from '@tiptap/extension-text-style'
import { Color }                    from '@tiptap/extension-color'
import FontFamily                   from '@tiptap/extension-font-family'
import TaskList                     from '@tiptap/extension-task-list'
import TaskItem                     from '@tiptap/extension-task-item'
import { Extension }                from '@tiptap/core'
import { Pin, Trash2, ChevronDown, CheckSquare } from 'lucide-react'
import type { GlobalSettings }  from '../../../types/settings'
import { defaultSettings }      from '../../../types/settings'
import { loadGlobalSettings }   from '../../../services/settingsDb'
import { useGlobal }            from '../../../global/useGlobal'
import AppTitleBar              from '../../shared/AppTitleBar'
import FloatyMenu               from '../../shared/FloatyMenu'
import { getAppWindowStyle }    from '../../../themes/app'
import {
  getNotesBodyStyle,
  getNotesSidebarStyle,
  getNotesSidebarHeaderStyle,
  getNotesSidebarTitleStyle,
  getNotesNewButtonStyle,
  getNotesSidebarListStyle,
  getNotesSidebarItemStyle,
  getNotesSidebarItemTitleStyle,
  getNotesSidebarItemMetaStyle,
  getNotesEmptySidebarStyle,
  getNotesMainStyle,
  getNotesEditorHeaderStyle,
  getNotesTitleInputStyle,
  getNotesMetaRowStyle,
  getNotesMetaLabelStyle,
  getNotesToolbarStyle,
  getNotesToolbarSeparatorStyle,
  getNotesToolbarButtonStyle,
  getNotesToolbarDropdownButtonStyle,
  getNotesFloatyItemStyle,
  getNotesEditorBodyStyle,
  getNotesEmptyStateStyle,
  getNotesEmptyStateLabelStyle,
  getNotesPinButtonStyle,
  getNotesDeleteButtonStyle,
  getNotesDeleteButtonHoverStyle,
  getNotesColourSwatchStyle,
} from '../../../themes/app'

// ─── FontSize extension ───────────────────────────────────────────────────────

const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el: HTMLElement) => el.style.fontSize || null,
          renderHTML: (attrs: any) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: any) =>
        chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }: any) =>
        chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    } as any
  },
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface Note {
  id:         number
  title:      string
  content:    string
  pinned:     number
  updated_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Editor CSS ───────────────────────────────────────────────────────────────

const EDITOR_CSS = `
  .tiptap-editor {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px;
    line-height: 1.6;
    color: var(--color-text-primary);
    font-family: var(--font-family-main);
    font-size: var(--font-size-base);
    outline: none;
    cursor: text;
  }
  .tiptap-editor p { margin: 0 0 0.25em; }
  .tiptap-editor p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color: var(--color-text-tertiary);
    pointer-events: none;
    float: left;
    height: 0;
  }
  .tiptap-editor a { color: var(--color-accent); }
  .tiptap-editor strong { font-weight: 700; }
  .tiptap-editor em { font-style: italic; }
  .tiptap-editor u { text-decoration: underline; }
  .tiptap-editor s { text-decoration: line-through; }

  /* ── Standard lists ────────────────────────────────────────────────── */
  .tiptap-editor ul:not([data-type="taskList"]),
  .tiptap-editor ol {
    list-style: none;
    padding-left: 0;
    margin: 0 0 0.25em;
    counter-reset: li-counter;
  }
  .tiptap-editor ul:not([data-type="taskList"]) > li,
  .tiptap-editor ol > li {
    display: flex;
    align-items: baseline;
    gap: 0.4em;
    margin: 0.1em 0;
    counter-increment: li-counter;
  }
  .tiptap-editor ul:not([data-type="taskList"]) > li::before {
    content: '•';
    font-size: var(--li-fs, inherit);
    flex-shrink: 0;
    min-width: 1em;
    text-align: center;
  }
  .tiptap-editor ol > li::before {
    content: counter(li-counter) '.';
    font-size: var(--li-fs, inherit);
    flex-shrink: 0;
    min-width: 1.5em;
  }

  /* ── Task list ─────────────────────────────────────────────────────── */
  .tiptap-editor ul[data-type="taskList"] {
    list-style: none;
    padding-left: 0;
    margin: 0 0 0.25em;
  }
  .tiptap-editor ul[data-type="taskList"] > li {
    display: flex;
    align-items: center;
    gap: 0.5em;
    margin: 0.15em 0;
  }
  /* label contains the checkbox — sits beside the div that holds text */
  .tiptap-editor ul[data-type="taskList"] > li > label {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    cursor: pointer;
    margin: 0;
  }
  /* Hide the empty <span> TipTap puts inside label */
  .tiptap-editor ul[data-type="taskList"] > li > label > span { display: none; }
  /* Custom checkbox */
  .tiptap-editor ul[data-type="taskList"] > li > label > input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    width: 1em;
    height: 1em;
    margin: 0;
    cursor: pointer;
    border: 1.5px solid var(--color-border-subtle);
    border-radius: 3px;
    background: transparent;
    position: relative;
    flex-shrink: 0;
    transition: border-color 0.15s, background 0.15s;
  }
  .tiptap-editor ul[data-type="taskList"] > li > label > input[type="checkbox"]:checked {
    background: var(--color-accent);
    border-color: var(--color-accent);
  }
  .tiptap-editor ul[data-type="taskList"] > li > label > input[type="checkbox"]:checked::after {
    content: '';
    position: absolute;
    left: 0.18em;
    top: 0.02em;
    width: 0.35em;
    height: 0.6em;
    border: 2px solid #fff;
    border-top: none;
    border-left: none;
    transform: rotate(45deg);
  }
  /* div holds the paragraph text */
  .tiptap-editor ul[data-type="taskList"] > li > div { flex: 1; }
  .tiptap-editor ul[data-type="taskList"] > li[data-checked="true"] > div {
    text-decoration: line-through;
    text-decoration-thickness: 0.1em;
    opacity: 0.5;
  }
`

if (!document.getElementById('tiptap-styles-v4')) {
  document.getElementById('tiptap-styles')?.remove()
  document.getElementById('tiptap-styles-v2')?.remove()
  document.getElementById('tiptap-styles-v3')?.remove()
  const style       = document.createElement('style')
  style.id          = 'tiptap-styles-v4'
  style.textContent = EDITOR_CSS
  document.head.appendChild(style)
}

// ─── Toolbar options ──────────────────────────────────────────────────────────

const FONT_FAMILIES = [
  { label: 'Inter (Default)', value: ''        },
  { label: 'Nunito',          value: 'Nunito'  },
  { label: 'DM Mono',         value: 'DM Mono' },
  { label: 'Georgia',         value: 'Georgia' },
  { label: 'Arial',           value: 'Arial'   },
]

const FONT_SIZES = [
  { label: 'Small',  value: '11px' },
  { label: 'Normal', value: ''     },
  { label: 'Large',  value: '18px' },
  { label: 'Huge',   value: '24px' },
]

const FONT_COLOURS = [
  '#E6E6E6', '#29ABE2', '#f472b6', '#4ade80',
  '#60a5fa', '#facc15', '#fb923c', '#f87171',
  '#a78bfa', '#34d399', '#ffffff', '#94a3b8',
]

// ─── ToolbarDropdown ──────────────────────────────────────────────────────────

interface ToolbarDropdownProps {
  label:    React.ReactNode
  settings: GlobalSettings
  active?:  boolean
  children: (close: () => void) => React.ReactNode
}

function ToolbarDropdown({ label, settings, active = false, children }: ToolbarDropdownProps) {
  const [open, setOpen] = useState(false)
  const btnRef          = useRef<HTMLButtonElement>(null)
  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(p => !p)}
        style={getNotesToolbarDropdownButtonStyle(settings, open || active)}
      >
        {label}
        <ChevronDown size={10} style={{ opacity: 0.6, flexShrink: 0 }} />
      </button>
      <FloatyMenu triggerRef={btnRef} open={open} onClose={() => setOpen(false)}>
        {children(() => setOpen(false))}
      </FloatyMenu>
    </>
  )
}

// ─── RichEditor ───────────────────────────────────────────────────────────────

interface RichEditorProps {
  content:  string
  onChange: (html: string) => void
  settings: GlobalSettings
}

function RichEditor({ content, onChange, settings }: RichEditorProps) {
  const syncListMarkers = (editorEl: HTMLElement) => {
    // TipTap structure: li > div > p > span[style*="font-size"]  (task list)
    //                   li > p > span[style*="font-size"]         (bullet/ordered)
    editorEl.querySelectorAll('li').forEach((li: HTMLElement) => {
      const span = li.querySelector('span[style*="font-size"]') as HTMLElement | null
      if (span) {
        li.style.setProperty('--li-fs', span.style.fontSize)
        // Also set on the label so the checkbox scales
        const label = li.querySelector('label') as HTMLElement | null
        if (label) label.style.fontSize = span.style.fontSize
      } else {
        li.style.removeProperty('--li-fs')
        const label = li.querySelector('label') as HTMLElement | null
        if (label) label.style.fontSize = ''
      }
    })
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TaskList,
      TaskItem.configure({ nested: false }),
    ],
    content,
    editorProps: {
      attributes: {
        class:              'tiptap-editor',
        'data-placeholder': 'Start writing…',
        spellcheck:         'true',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
      requestAnimationFrame(() => syncListMarkers(editor.view.dom as HTMLElement))
    },
  })

  useEffect(() => {
    if (!editor || editor.getHTML() === content) return
    editor.commands.setContent(content || '', false)
    requestAnimationFrame(() => syncListMarkers(editor.view.dom as HTMLElement))
  }, [content]) // eslint-disable-line

  useEffect(() => {
    if (!editor) return
    requestAnimationFrame(() => syncListMarkers(editor.view.dom as HTMLElement))
  }, [editor])

  if (!editor) return null

  const isBold      = editor.isActive('bold')
  const isItalic    = editor.isActive('italic')
  const isUnderline = editor.isActive('underline')
  const isStrike    = editor.isActive('strike')
  const isBullet    = editor.isActive('bulletList')
  const isOrdered   = editor.isActive('orderedList')
  const isTask      = editor.isActive('taskList')
  const isCenter    = editor.isActive({ textAlign: 'center' })
  const isRight     = editor.isActive({ textAlign: 'right' })
  const isLeft      = !isCenter && !isRight
  const activeColor = editor.getAttributes('textStyle').color        ?? ''
  const activeFont  = editor.getAttributes('textStyle').fontFamily   ?? ''
  const activeSize  = editor.getAttributes('textStyle').fontSize     ?? ''

  const currentFontLabel = FONT_FAMILIES.find(f => f.value === activeFont)?.label.split(' ')[0] ?? 'Font'
  const currentSizeLabel = FONT_SIZES.find(s => s.value === activeSize)?.label                  ?? 'Size'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div style={getNotesToolbarStyle(settings)}>

        <ToolbarDropdown label={currentFontLabel} settings={settings} active={!!activeFont}>
          {close => (
            <div style={{ minWidth: '160px' }}>
              {FONT_FAMILIES.map(f => (
                <button
                  key={f.value}
                  onClick={() => {
                    f.value ? editor.chain().focus().setFontFamily(f.value).run()
                            : editor.chain().focus().unsetFontFamily().run()
                    close()
                  }}
                  style={{ ...getNotesFloatyItemStyle(settings, activeFont === f.value), fontFamily: f.value || 'inherit' }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </ToolbarDropdown>

        <ToolbarDropdown label={currentSizeLabel} settings={settings} active={!!activeSize}>
          {close => (
            <div style={{ minWidth: '100px' }}>
              {FONT_SIZES.map(s => (
                <button
                  key={s.label}
                  onClick={() => {
                    s.value ? (editor.chain().focus() as any).setFontSize(s.value).run()
                            : (editor.chain().focus() as any).unsetFontSize().run()
                    close()
                  }}
                  style={getNotesFloatyItemStyle(settings, activeSize === s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </ToolbarDropdown>

        <ToolbarDropdown
          label={<span style={{ fontSize: '13px', fontWeight: 700, color: activeColor || 'inherit', textDecoration: 'underline', textDecorationColor: activeColor || 'currentColor' }}>A</span>}
          settings={settings}
          active={!!activeColor}
        >
          {close => (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', padding: '4px', width: '148px' }}>
              {FONT_COLOURS.map(c => (
                <button key={c} onClick={() => { editor.chain().focus().setColor(c).run(); close() }} style={getNotesColourSwatchStyle(c, activeColor === c)} title={c} />
              ))}
              <button
                onClick={() => { editor.chain().focus().unsetColor().run(); close() }}
                style={{ ...getNotesColourSwatchStyle('transparent', !activeColor), border: '1px solid var(--color-border-subtle)', fontSize: '9px', color: 'var(--color-text-tertiary)' }}
                title="Default"
              >✕</button>
            </div>
          )}
        </ToolbarDropdown>

        <div style={getNotesToolbarSeparatorStyle(settings)} />

        <button onClick={() => editor.chain().focus().toggleBold().run()}      style={getNotesToolbarButtonStyle(settings, isBold)}      title="Bold"><strong>B</strong></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}    style={getNotesToolbarButtonStyle(settings, isItalic)}    title="Italic"><em>I</em></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} style={getNotesToolbarButtonStyle(settings, isUnderline)} title="Underline"><u>U</u></button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()}    style={getNotesToolbarButtonStyle(settings, isStrike)}    title="Strikethrough"><s>S</s></button>

        <div style={getNotesToolbarSeparatorStyle(settings)} />

        <button onClick={() => editor.chain().focus().toggleBulletList().run()}  style={getNotesToolbarButtonStyle(settings, isBullet)}  title="Bullet list">•</button>
        <button onClick={() => editor.chain().focus().toggleTaskList().run()}    style={getNotesToolbarButtonStyle(settings, isTask)}    title="Checklist"><CheckSquare size={13} /></button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} style={getNotesToolbarButtonStyle(settings, isOrdered)} title="Numbered list">1.</button>

        <div style={getNotesToolbarSeparatorStyle(settings)} />

        <button onClick={() => editor.chain().focus().setTextAlign('left').run()}   style={getNotesToolbarButtonStyle(settings, isLeft)}   title="Align left">L</button>
        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} style={getNotesToolbarButtonStyle(settings, isCenter)} title="Align center">C</button>
        <button onClick={() => editor.chain().focus().setTextAlign('right').run()}  style={getNotesToolbarButtonStyle(settings, isRight)}  title="Align right">R</button>

      </div>

      {/* ── Editor surface ───────────────────────────────────────────── */}
      <div style={getNotesEditorBodyStyle()} onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} />
      </div>

    </div>
  )
}

// ─── Window ───────────────────────────────────────────────────────────────────

export default function Window() {
  const [settings,    setSettings]    = useState<GlobalSettings>(defaultSettings)
  const [notes,       setNotes]       = useState<Note[]>([])
  const [activeId,    setActiveId]    = useState<number | null>(null)
  const [title,       setTitle]       = useState('')
  const [content,     setContent]     = useState('')
  const [pinned,      setPinned]      = useState(false)
  const [deleteHover, setDeleteHover] = useState(false)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleRef  = useRef<HTMLInputElement>(null)

  useGlobal(settings)

  useEffect(() => { loadGlobalSettings().then(setSettings) }, [])
  useEffect(() => {
    const off = window.electron?.on('settings:updated',
      (_: unknown, updated: GlobalSettings) => setSettings(prev => ({ ...prev, ...updated })))
    return () => off?.()
  }, [])

  const loadNotes = useCallback(async () => {
    const raw = (await window.electron?.db.notes.get() ?? []) as Note[]
    setNotes(raw)
  }, [])

  useEffect(() => { loadNotes() }, [loadNotes])

  const selectNote = useCallback((note: Note) => {
    setActiveId(note.id)
    setTitle(note.title)
    setContent(note.content)
    setPinned(!!note.pinned)
  }, [])

  const scheduleSave = useCallback((id: number, changes: Record<string, unknown>) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await window.electron?.db.notes.update(id, changes)
      loadNotes()
    }, 600)
  }, [loadNotes])

  const handleTitleChange   = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    if (activeId) scheduleSave(activeId, { title: e.target.value })
  }

  const handleContentChange = (html: string) => {
    if (activeId) scheduleSave(activeId, { content: html })
  }

  const createNote = useCallback(async () => {
    const note = await window.electron?.db.notes.create({
      title: '', content: '', pinned: 0,
    }) as Note | undefined
    if (!note) return
    await loadNotes()
    selectNote(note)
    setTimeout(() => titleRef.current?.focus(), 50)
  }, [loadNotes, selectNote])

  const togglePin = useCallback(async () => {
    if (!activeId) return
    const next = pinned ? 0 : 1
    setPinned(!pinned)
    await window.electron?.db.notes.update(activeId, { pinned: next })
    loadNotes()
  }, [activeId, pinned, loadNotes])

  const deleteNote = useCallback(async () => {
    if (!activeId) return
    await window.electron?.db.notes.delete(activeId)
    setActiveId(null); setTitle(''); setContent('')
    loadNotes()
  }, [activeId, loadNotes])

  const activeNote = notes.find(n => n.id === activeId)

  return (
    <div style={{ ...getAppWindowStyle(settings), display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppTitleBar title="Notes" settings={settings} onClose={() => window.electron?.send('window:hide', 'notes')} />

      <div style={getNotesBodyStyle()}>

        <div style={getNotesSidebarStyle(settings)}>
          <div style={getNotesSidebarHeaderStyle()}>
            <span style={getNotesSidebarTitleStyle()}>Notes</span>
            <button onClick={createNote} style={getNotesNewButtonStyle(settings)} title="New note">+</button>
          </div>
          <div style={getNotesSidebarListStyle()}>
            {notes.length === 0 && <span style={getNotesEmptySidebarStyle()}>No notes yet</span>}
            {notes.map(note => (
              <button
                key={note.id}
                onClick={() => selectNote(note)}
                style={getNotesSidebarItemStyle(settings, note.id === activeId, !!note.pinned)}
              >
                <span style={getNotesSidebarItemTitleStyle(note.id === activeId)}>
                  {note.title || 'Untitled'}
                </span>
                <span style={getNotesSidebarItemMetaStyle()}>
                  {formatDate(note.updated_at)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={getNotesMainStyle()}>
          {!activeId ? (
            <div style={getNotesEmptyStateStyle()}>
              <span style={getNotesEmptyStateLabelStyle()}>Select a note or create a new one.</span>
            </div>
          ) : (
            <>
              <div style={getNotesEditorHeaderStyle(settings)}>
                <input
                  ref={titleRef}
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Untitled"
                  style={getNotesTitleInputStyle()}
                />
                <div style={getNotesMetaRowStyle()}>
                  {activeNote && <span style={getNotesMetaLabelStyle()}>{formatDate(activeNote.updated_at)}</span>}
                  <button onClick={togglePin} style={getNotesPinButtonStyle(settings, pinned)} title={pinned ? 'Unpin' : 'Pin'}>
                    <Pin size={14} />
                  </button>
                  <button
                    onClick={deleteNote}
                    onMouseEnter={() => setDeleteHover(true)}
                    onMouseLeave={() => setDeleteHover(false)}
                    style={{ ...getNotesDeleteButtonStyle(), ...(deleteHover ? getNotesDeleteButtonHoverStyle() : {}) }}
                    title="Delete note"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <RichEditor
                key={activeId}
                content={content}
                onChange={handleContentChange}
                settings={settings}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
