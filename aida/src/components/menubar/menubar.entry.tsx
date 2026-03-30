// ─── Entry: Menubar ───────────────────────────────────────────────────────────
// AIDA-2 — src/components/menubar/entry.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { createRoot } from 'react-dom/client'
import '../../index.css'
import MenuBar from './MenuBar'

createRoot(document.getElementById('root')!).render(
  <MenuBar />
)
