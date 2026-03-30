// ─── Global Type Declarations ─────────────────────────────────────────────────
// AIDA-2 — src/types/declarations.d.ts
//
// Tells TypeScript about types it doesn't natively understand.
// ─────────────────────────────────────────────────────────────────────────────

// CSS files — imported for side effects (index.css in entry points)
declare module '*.css' {
  const content: Record<string, string>
  export default content
}

// Image assets
declare module '*.png'  { const src: string; export default src }
declare module '*.jpg'  { const src: string; export default src }
declare module '*.jpeg' { const src: string; export default src }
declare module '*.svg'  { const src: string; export default src }
declare module '*.webp' { const src: string; export default src }
declare module '*.ico'  { const src: string; export default src }

// ─── window.electron ─────────────────────────────────────────────────────────
// The API exposed by bridge/preload.cjs via contextBridge.
// Mirrors the structure of window.electron in bridge/preload.cjs exactly.

interface ElectronAPI {
  platform:   string
  isElectron: boolean

  openFile:     (filePath: string) => Promise<{ success?: boolean; error?: string }>
  openProvider:  (url: string, label: string, keepSession: boolean) => Promise<void>
  getOsUsername: () => Promise<string>
  setAutoStart: (enabled: boolean) => Promise<{ success: boolean }>
  searchFiles:  (query: string) => Promise<Array<{ name: string; path: string; isDir: boolean }>>

  db: {
    settings: {
      get:    (keys?: string[]) => Promise<Record<string, string>>
      set:    (key: string, value: string) => Promise<{ key: string; value: string }>
      setAll: (pairs: Array<{ key: string; value: string }>) => Promise<unknown>
      delete: (key: string) => Promise<{ success: boolean }>
    }
    spaces: {
      get:     () => Promise<unknown[]>
      create:  (data: unknown) => Promise<unknown>
      update:  (id: number, data: unknown) => Promise<unknown>
      archive: (id: number) => Promise<{ success: boolean }>
    }
    collections: {
      get:    (spaceId: number) => Promise<unknown[]>
      create: (data: unknown) => Promise<unknown>
      update: (id: number, changes: unknown) => Promise<unknown>
      delete: (id: number) => Promise<{ success: boolean }>
    }
    fields: {
      get:    (collectionId: number) => Promise<unknown[]>
      create: (data: unknown) => Promise<unknown>
      update: (id: number, changes: unknown) => Promise<unknown>
      delete: (id: number) => Promise<{ success: boolean }>
    }
    records: {
      get:     (collectionId: number, opts?: unknown) => Promise<unknown[]>
      create:  (data: unknown) => Promise<unknown>
      update:  (id: number, data: unknown) => Promise<unknown>
      archive: (id: number) => Promise<{ success: boolean }>
      delete:  (id: number) => Promise<{ success: boolean }>
    }
    tasks: {
      get:    () => Promise<unknown[]>
      create: (data: unknown) => Promise<unknown>
      update: (id: number, changes: unknown) => Promise<unknown>
      delete: (id: number) => Promise<{ success: boolean }>
    }
    notes: {
      get:    () => Promise<unknown[]>
      create: (data: unknown) => Promise<unknown>
      update: (id: number, changes: unknown) => Promise<unknown>
      delete: (id: number) => Promise<{ success: boolean }>
    }
    events: {
      get:    (range?: unknown) => Promise<unknown[]>
      create: (data: unknown) => Promise<unknown>
      update: (id: number, changes: unknown) => Promise<unknown>
      delete: (id: number) => Promise<{ success: boolean }>
    }
    chat: {
      folders: {
        get:    () => Promise<unknown[]>
        create: (data: unknown) => Promise<unknown>
        update: (id: number, changes: unknown) => Promise<unknown>
        delete: (id: number) => Promise<{ success: boolean }>
      }
      conversations: {
        get:    (opts?: unknown) => Promise<unknown[]>
        create: (data: unknown) => Promise<unknown>
        update: (id: number, changes: unknown) => Promise<unknown>
        delete: (id: number) => Promise<{ success: boolean }>
        search: (query: string) => Promise<unknown[]>
      }
      messages: {
        get:    (convId: number) => Promise<unknown[]>
        add:    (data: unknown) => Promise<unknown>
        delete: (id: number) => Promise<{ success: boolean }>
      }
    }
    licence: {
      get:          () => Promise<unknown>
      flags:        () => Promise<unknown[]>
      canUse:       (key: string) => Promise<boolean>
      catalogue:    () => Promise<unknown[]>
      entitlements: () => Promise<unknown[]>
    }
    memory: {
      get:    (opts?: unknown) => Promise<unknown[]>
      upsert: (data: unknown) => Promise<unknown>
      delete: (id: number) => Promise<{ success: boolean }>
      purge:  () => Promise<{ purged: number }>
    }
    suggestions: {
      get:     (opts?: unknown) => Promise<unknown[]>
      create:  (data: unknown) => Promise<unknown>
      dismiss: (id: number) => Promise<{ success: boolean }>
      act:     (id: number) => Promise<{ success: boolean }>
    }
  }

  aidaTools: {
    getSystemStats:      () => Promise<{
      cpu: { brand: string; cores: number; physicalCores: number; speed: string; loadPercent: number; tempCelsius: number | null }
      ram: { totalGB: number; usedGB: number; freeGB: number; usedPercent: number }
      gpu: { model: string; vram: string; utilizationGpu: number | null }[]
      error?: string
    }>
    getDiskInfo:         () => Promise<{
      drives: { mount: string; type: string; totalGB: number; usedGB: number; freeGB: number; usedPercent: number }[]
      error?: string
    }>
    getRunningProcesses: () => Promise<{
      total: number; running: number
      top: { name: string; pid: number; cpuPercent: number; memPercent: number; memMB: number }[]
      error?: string
    }>
    getOsInfo:           () => Promise<{
      platform: string; distro: string; release: string; kernel: string
      arch: string; hostname: string; uptimeHours: number
      error?: string
    }>
  }

  fs: {
    readdir: (dirPath: string) => Promise<Array<{
      name:     string
      path:     string
      isDir:    boolean
      size:     number
      modified: Date
    }>>
    homedir: () => Promise<string>
    project: {
      archive:        (folderId: number, folderName: string) => Promise<{ success?: boolean; path?: string; error?: string }>
      restore:        (archivePath: string)                   => Promise<{ success?: boolean; folderId?: number; error?: string }>
      openArchiveDir: ()                                      => Promise<{ success: boolean }>
    }
  }

  pty: {
    create:  (id: string) => Promise<{ success: boolean; error?: string }>
    write:   (id: string, data: string) => Promise<{ success: boolean }>
    resize:  (id: string, cols: number, rows: number) => Promise<{ success: boolean }>
    kill:    (id: string) => Promise<{ success: boolean }>
    onData:  (id: string, cb: (data: string) => void) => void
    onExit:  (id: string, cb: () => void) => void
    offData: (id: string) => void
  }

  send: (channel: string, ...args: unknown[]) => void
  on:   (channel: string, listener: (event: unknown, ...args: any[]) => void) => (() => void)
  off:  (channel: string, listener: (event: unknown, ...args: any[]) => void) => void
}

declare global {
  interface Window {
    electron?: ElectronAPI
  }
}

export {}
