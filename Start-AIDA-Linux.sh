#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════════
# ENGIOS — Linux Test Session Launcher
# ENGIOS / AIDA — Start-AIDA-Linux.sh
#
# Responsibility:
#   Start labwc with AIDA as its session client, loading the existing build.
#   Requires installed labwc, Xwayland, D-Bus and Linux Electron dependencies.
#   Run as the logged-in user from a local text console, after npm run build.
#   This source-tree launcher does not install packages or configure auto-login.
# ═══════════════════════════════════════════════════════════════════════════════

set -eu

printf '[startup] %s launcher %s\n' "$(date -Iseconds)" "${1-session}"

# ─── Project location and prerequisites ────────────────────────────────────────

AIDA_PROJECT_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
export AIDA_PROJECT_ROOT

if [ "$(uname -s)" != 'Linux' ] || [ "$(id -u)" -eq 0 ]; then
  printf '%s\n' 'Run this launcher on Linux as your normal user, without sudo.' >&2
  exit 1
fi

cd "$AIDA_PROJECT_ROOT/aida"

if [ ! -x node_modules/electron/dist/electron ] ||
   [ ! -f dist/src/components/menubar/handle.html ]; then
  printf '%s\n' 'Install AIDA dependencies and run npm run build before starting the session.' >&2
  exit 1
fi

# ─── AIDA session client ──────────────────────────────────────────────────────
# labwc supplies DISPLAY for Xwayland before starting this client.

if [ "${1-}" = '--client' ]; then
  : "${DISPLAY:?Start this client through the labwc session launcher.}"
  export NODE_ENV=production
  export AIDA_DESKTOP_SESSION=1
  printf '[startup] %s starting Electron\n' "$(date -Iseconds)"
  exec ./node_modules/electron/dist/electron . --ozone-platform=x11
fi

# ─── Local compositor session ─────────────────────────────────────────────────
# labwc's session option ends the compositor when AIDA exits.

if [ -n "${DISPLAY-}" ] || [ -n "${WAYLAND_DISPLAY-}" ]; then
  printf '%s\n' 'Exit the current graphical session and run this from the local text console.' >&2
  exit 1
fi

for session_command in dbus-run-session labwc Xwayland; do
  if ! command -v "$session_command" >/dev/null 2>&1; then
    printf 'Missing session requirement: %s\n' "$session_command" >&2
    exit 1
  fi
done

export XDG_SESSION_TYPE=wayland
export XDG_CURRENT_DESKTOP=AIDA:labwc
exec dbus-run-session -- labwc -S "sh \"$AIDA_PROJECT_ROOT/Start-AIDA-Linux.sh\" --client"
