// ═══════════════════════════════════════════════════════════════════════════════
// AIDA-2 — vite.config.ts
//
// All entry points defined here — one per window.
// Adding a new window: add its index.html to the input map below.
// No other changes needed.
// ═══════════════════════════════════════════════════════════════════════════════

import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'
import tailwindcss      from '@tailwindcss/vite'
import { resolve }      from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],


  build: {
    rollupOptions: {
      input: {
        // ── Menubar ──────────────────────────────────────────────────────
        menubar: resolve(__dirname, 'src/components/menubar/menubar.html'),
        handle:  resolve(__dirname, 'src/components/menubar/handle.html'),

        // ── Apps ─────────────────────────────────────────────────────────
        'file-decks': resolve(__dirname, 'src/components/apps/file-decks/index.html'),
        'tasks':      resolve(__dirname, 'src/components/apps/tasks/index.html'),
      'aida-chat':  resolve(__dirname, 'src/components/apps/aida-chat/index.html'),
      'provider':   resolve(__dirname, 'src/components/apps/provider/index.html'),

        // ── Panels ───────────────────────────────────────────────────────
        settings:              resolve(__dirname, 'src/components/panels/global-settings/index.html'),
      'clock-weather-settings': resolve(__dirname, 'src/components/panels/clock-weather-settings/index.html'),
        'today-settings':          resolve(__dirname, 'src/components/panels/today-settings/index.html'),

        // ── Widgets ──────────────────────────────────────────────────────
        'clock-weather': resolve(__dirname, 'src/components/widgets/clock-weather/index.html'),
      },
    },
  },

  server: {
    warmup: {
      clientFiles: [
        './src/components/menubar/handle.entry.tsx',
        './src/components/menubar/menubar.entry.tsx',
      ],
    },
    port: 5390,
  },
})
