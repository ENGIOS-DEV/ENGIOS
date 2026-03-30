// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4 — THEME: App Theme Index
// AIDA-2 — src/themes/app/index.ts
//
// Single entry point for all app styles.
// Components import from '@themes/app' — resolved via Vite alias to this index.
// Add new app theme files here as new apps are built.
//
// Structure:
//   shared.ts      — window chrome, title bar, content layout (ALL apps)
//   file-decks.ts  — File Decks app
//   tasks.ts       — Tasks app
//   pickers.ts     — DatePicker, TimePicker, FloatyMenu, RepeatPicker (shared)
// ═══════════════════════════════════════════════════════════════════════════════

export * from './shared'
export * from './file-decks'
export * from './tasks'
export * from './pickers'
export * from './aida-chat'
