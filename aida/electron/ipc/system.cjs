// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — ELECTRON IPC: System Tool Handlers
// AIDA-2 — electron/ipc/system.cjs
//
// Responsibility:
//   Executes AIDA tool calls that require live system data.
//   Called on-demand only — nothing runs in the background.
//   Data is fetched at the moment AIDA requests it via tool call.
//
// Tools exposed:
//   aida:tool:get_system_stats    — CPU, RAM, GPU load + temperatures
//   aida:tool:get_disk_info       — drives, total/used/free space
//   aida:tool:get_running_processes — top 10 processes by CPU usage
//   aida:tool:get_os_info         — OS, hostname, uptime, platform
//
// Rules:
//   - No polling, no background timers — strictly on-demand
//   - Each handler fetches only what it needs, returns immediately
//   - All data stays local — never sent anywhere except back to AIDA
// ═══════════════════════════════════════════════════════════════════════════════

'use strict'

const { ipcMain } = require('electron')
const si          = require('systeminformation')

// ── aida:tool:get_system_stats ────────────────────────────────────────────────
// Returns current CPU load, RAM usage, GPU load and temperatures.

ipcMain.handle('aida:tool:get_system_stats', async () => {
  try {
    const [cpu, mem, load, temp, graphics] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.currentLoad(),
      si.cpuTemperature(),
      si.graphics(),
    ])

    const gpus = (graphics.controllers ?? []).map(g => ({
      model:       g.model,
      vram:        g.vram ? `${g.vram}MB` : 'unknown',
      utilizationGpu: g.utilizationGpu ?? null,
    }))

    return {
      cpu: {
        brand:        `${cpu.manufacturer} ${cpu.brand}`.trim(),
        cores:        cpu.cores,
        physicalCores: cpu.physicalCores,
        speed:        cpu.speed ? `${cpu.speed}GHz` : 'unknown',
        loadPercent:  Math.round(load.currentLoad),
        tempCelsius:  temp.main ?? null,
      },
      ram: {
        totalGB:  +(mem.total  / 1024 ** 3).toFixed(1),
        usedGB:   +(mem.active / 1024 ** 3).toFixed(1),
        freeGB:   +((mem.total - mem.active) / 1024 ** 3).toFixed(1),
        usedPercent: Math.round((mem.active / mem.total) * 100),
      },
      gpu: gpus,
    }
  } catch (err) {
    console.error('[aida:tool:get_system_stats] error:', err.message)
    return { error: err.message }
  }
})

// ── aida:tool:get_disk_info ───────────────────────────────────────────────────
// Returns all mounted drives with usage breakdown.

ipcMain.handle('aida:tool:get_disk_info', async () => {
  try {
    const drives = await si.fsSize()
    return {
      drives: drives.map(d => ({
        mount:      d.mount,
        type:       d.type,
        totalGB:    +(d.size  / 1024 ** 3).toFixed(1),
        usedGB:     +(d.used  / 1024 ** 3).toFixed(1),
        freeGB:     +((d.size - d.used) / 1024 ** 3).toFixed(1),
        usedPercent: d.use ?? Math.round((d.used / d.size) * 100),
      }))
    }
  } catch (err) {
    console.error('[aida:tool:get_disk_info] error:', err.message)
    return { error: err.message }
  }
})

// ── aida:tool:get_running_processes ──────────────────────────────────────────
// Returns top 10 processes by CPU usage.

ipcMain.handle('aida:tool:get_running_processes', async () => {
  try {
    const data = await si.processes()
    const top  = (data.list ?? [])
      .sort((a, b) => (b.cpu ?? 0) - (a.cpu ?? 0))
      .slice(0, 10)
      .map(p => ({
        name:       p.name,
        pid:        p.pid,
        cpuPercent: +(p.cpu ?? 0).toFixed(1),
        memPercent: +(p.mem ?? 0).toFixed(1),
        memMB:      +(p.memRss / 1024).toFixed(1),
      }))
    return { total: data.all, running: data.running, top }
  } catch (err) {
    console.error('[aida:tool:get_running_processes] error:', err.message)
    return { error: err.message }
  }
})

// ── aida:tool:get_os_info ─────────────────────────────────────────────────────
// Returns OS name, version, hostname and uptime.

ipcMain.handle('aida:tool:get_os_info', async () => {
  try {
    const [os, time] = await Promise.all([
      si.osInfo(),
      si.time(),
    ])
    return {
      platform:    os.platform,
      distro:      os.distro,
      release:     os.release,
      kernel:      os.kernel,
      arch:        os.arch,
      hostname:    os.hostname,
      uptimeHours: +(time.uptime / 3600).toFixed(1),
    }
  } catch (err) {
    console.error('[aida:tool:get_os_info] error:', err.message)
    return { error: err.message }
  }
})
