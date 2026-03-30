// ─── Entry: Clock & Weather Widget ────────────────────────────────────────────
// AIDA-2 — src/components/widgets/clock-weather/entry.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { createRoot } from 'react-dom/client'
import '../../../index.css'
import Window from './Window'

createRoot(document.getElementById('root')!).render(
  <Window />
)
