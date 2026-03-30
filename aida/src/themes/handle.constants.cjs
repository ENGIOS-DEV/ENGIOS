// ─── Handle Dimensions — Single Source of Truth ───────────────────────────────
// AIDA-2 — src/themes/handle.constants.cjs
//
// Reads from handle.dimensions.json — the ONE place dimensions are defined.
// Read by electron/main.cjs at window creation time.
// src/themes/handle.ts imports handle.dimensions.json directly via Vite.
//
// ONE change to handle.dimensions.json updates everything.
// ─────────────────────────────────────────────────────────────────────────────

const dims = require('./handle.dimensions.json')

module.exports = {
  HANDLE_W: dims.width,
  HANDLE_H: dims.height,
}
