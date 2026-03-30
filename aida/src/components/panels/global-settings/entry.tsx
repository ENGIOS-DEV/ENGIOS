// ─── Entry: Global Settings Panel ─────────────────────────────────────────────
// AIDA-2 — src/components/panels/global-settings/entry.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { createRoot } from 'react-dom/client'
import '../../../index.css'
import Window from './Window'

createRoot(document.getElementById('root')!).render(
  <Window />
)
