// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 6 — SERVICE: File Search
// AIDA-2 — src/services/fileSearchService.ts
//
// Adapted from AIDA-1. Searches files via Electron IPC.
// ═══════════════════════════════════════════════════════════════════════════════

export interface SearchResult {
  name:  string
  path:  string
  isDir: boolean
}

export class FileSearchService {
  static async search(query: string): Promise<SearchResult[]> {
    if (!window.electron) return []
    const term = query.trim()
    if (!term) return []
    try {
      const raw = await window.electron.searchFiles(term)
      return raw.map(r => ({ name: r.name, path: r.path, isDir: r.isDir }))
    } catch {
      return []
    }
  }

  static async openFile(filePath: string): Promise<void> {
    if (!window.electron) return
    try {
      await window.electron.openFile(filePath)
    } catch {}
  }
}
