// File Search Service
// Searches files and folders across user directories via Electron

export interface SearchResult {
  name: string
  path: string
  type: 'file' | 'folder'
}

export class FileSearchService {

  // Search files and folders via Electron IPC
  static async search(query: string, maxResults = 10): Promise<SearchResult[]> {
    if (!window.electron) {
      console.warn('File search requires Electron')
      return []
    }

    const searchTerm = query.trim()
    if (!searchTerm) return []

    console.log('File search:', searchTerm)

    try {
      return await window.electron.searchFiles(searchTerm, maxResults)
    } catch (error) {
      console.error('File search error:', error)
      return []
    }
  }

  // Open file or folder with default OS application
  static async openFile(filePath: string): Promise<void> {
    if (!window.electron) return
    try {
      await window.electron.openFile(filePath)
    } catch (error) {
      console.error('Failed to open file:', error)
    }
  }
}
