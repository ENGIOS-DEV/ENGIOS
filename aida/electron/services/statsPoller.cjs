// ─── LAYER 1: Service — Stats Poller ─────────────────────────────────────────
// AIDA-2 — electron/services/statsPoller.cjs
//
// Responsibility: System monitor stats polling.
// Collects CPU, RAM, GPU, Disk, Network, Temperature data
// and pushes to the system monitor widget via IPC.
//
// Isolated here so it can be started/stopped cleanly
// without touching any other part of the main process.
// ─────────────────────────────────────────────────────────────────────────────
