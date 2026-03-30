// ─── Entry: File Decks ────────────────────────────────────────────────────────
// AIDA-2 — src/components/apps/file-decks/entry.tsx
//
// Standard entry point for all app windows.
// Renders Window.tsx into #root. Nothing else.
// ─────────────────────────────────────────────────────────────────────────────
import { createRoot } from 'react-dom/client'
import '../../../index.css'
import Window from './Window'

createRoot(document.getElementById('root')!).render(
  <Window />
)
