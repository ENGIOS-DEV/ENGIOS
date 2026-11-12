#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════════
# ENGIOS — Local Login Integration
# ENGIOS / AIDA — Enable-AIDA-Login.sh
#
# Responsibility:
#   Back up the current user's Bash profile and add the AIDA session launcher.
#   Only tty1 starts AIDA; SSH and other consoles remain ordinary terminals.
#   Requires Start-AIDA-Linux.sh beside this script and an existing .profile.
#   Run once as the normal user. Password login remains enabled.
# ═══════════════════════════════════════════════════════════════════════════════

set -eu

# ─── Preconditions ────────────────────────────────────────────────────────────

if [ "$(uname -s)" != 'Linux' ] || [ "$(id -u)" -eq 0 ]; then
  printf '%s\n' 'Run on Linux as your normal user, without sudo.' >&2
  exit 1
fi

project_root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
profile_path="$HOME/.profile"

if [ ! -f "$profile_path" ] || [ -L "$profile_path" ] ||
   [ -e "$HOME/.bash_profile" ] || [ -e "$HOME/.bash_login" ]; then
  printf '%s\n' 'Login profile differs from the verified setup; leaving it unchanged.' >&2
  exit 1
fi

if [ "$project_root" != "$HOME/ENGIOS" ] ||
   [ ! -f "$project_root/Start-AIDA-Linux.sh" ]; then
  printf '%s\n' 'Keep both launch scripts in your home ENGIOS directory.' >&2
  exit 1
fi

if grep -q '^# BEGIN ENGIOS AIDA LOGIN$' "$profile_path"; then
  printf '%s\n' 'AIDA login integration is already present; no changes made.'
  exit 0
fi

# ─── Preserve profile and prepare addition ─────────────────────────────────────

backup_path=$(mktemp "$HOME/.profile.before-aida.XXXXXX")
cp -p "$profile_path" "$backup_path"
pending_path=$(mktemp "$HOME/.profile.aida.XXXXXX")
trap 'rm -f "$pending_path"' EXIT
cp -p "$profile_path" "$pending_path"

cat >> "$pending_path" <<'AIDA_LOGIN'

# BEGIN ENGIOS AIDA LOGIN
# Start only after local tty1 login. Create the bypass file from SSH to recover.
if [ -z "${SSH_CONNECTION-}" ] && [ -z "${SSH_TTY-}" ] &&
   [ -z "${DISPLAY-}" ] && [ -z "${WAYLAND_DISPLAY-}" ] &&
   [ "$(tty 2>/dev/null)" = '/dev/tty1' ] &&
   [ ! -e "$HOME/.config/engios/skip-aida-autostart" ] &&
   [ -f "$HOME/ENGIOS/Start-AIDA-Linux.sh" ]; then
  if mkdir -p "$HOME/.local/state/engios"; then
    sh "$HOME/ENGIOS/Start-AIDA-Linux.sh" > "$HOME/.local/state/engios/aida-session.log" 2>&1
    printf '%s\n' 'AIDA session ended. You are at the local console.'
  fi
fi
# END ENGIOS AIDA LOGIN
AIDA_LOGIN

# ─── Verify and install ───────────────────────────────────────────────────────

bash -n "$pending_path"
mv "$pending_path" "$profile_path"
printf 'AIDA will start on the next local tty1 login. Profile backup: %s\n' "$backup_path"
