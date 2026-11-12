# ENGIOS / AIDA — Platform Working Copies
*Working-copy ownership and delivery rules.*
*Established: 12 November 2026*

---

## Windows Desktop

- Source: `C:\Users\Admin\Documents\GitHub\ENGIOS`
- Branch: `windows-desktop`
- Launch: `Start-AIDA.cmd` / `Start-AIDA.ps1`
- Role: the Windows-compatible desktop application and its development baseline.

The baseline preserves the owner's uncommitted work, including Notes and the
existing Windows launcher. AIDA's runtime files were restored from the source
archive retained before Linux integration began on 12 November. Linux-specific
session launchers, built-file launch changes, startup diagnostics, and desktop
input-policy changes do not belong in this working copy.

Restoration and build checks do not constitute a new Windows GUI verification.
Local models, databases, logs, and dependencies remain in this copy's ignored
directories and are not part of the source baseline.

## Integrated Linux Desktop

- Source: `C:\Users\Admin\Documents\GitHub\ENGIOS-Linux`
- Branch: `linux-integrated`
- Test deployment: `/home/jacklewan/ENGIOS` on the Dell Latitude 3520.
- Launch: `Start-AIDA-Linux.sh`, through the installed local login hook.
- Role: Debian integration, labwc/Xwayland sessions, built-file startup, Linux
  input handling, and subsequent OS capability work.

The Dell is a deployed test copy, not the authoritative development source.
Export Linux updates only from the Linux worktree. Each working copy requires
its own platform-appropriate dependencies; do not copy Windows native modules
to the Dell or share writable runtime databases between platforms.

## Integrated Desktop Composition

The standalone Linux session uses one desktop window containing wallpaper
behind a permanently visible, full-screen main panel. It does not create a pull handle or standalone clock
window. Clock & Weather occupies the former Volume column and uses the existing
clock settings record and broadcast. The integrated display is not draggable.
Apps and settings remain separate windows above the desktop.

Do not restore overlay hiding, toggle or pointer-passthrough behavior in this
session. Desktop appearance stays in the existing themes and settings system.
This composition was requested and visually verified by the owner on
12 November 2026. The embedded clock uses its own background transparency;
the main panel paints its background independently.

The panel background is continuous beneath all embedded widgets. Each widget
paints its own background above it: 100% widget transparency reveals the panel,
not a hole through to wallpaper. Widget alpha is not multiplied by panel alpha.
Borders and text retain their own controls. The earlier cutout implementation
was rejected by the owner and removed. No extra widget window is required.
The continuous-panel transparency behavior was verified by the owner on the
Dell. The single-window desktop is the current tested milestone; a subsequent
idle measurement is recorded in CHANGELOG.md.
Wallpaper uses the same settings record and theme function inside the panel
renderer; there is no separate wallpaper renderer, window or settings listener.

## Working Method

Before edits, check the current directory and `git branch --show-current`.
Keep platform work on its owning branch. Shared improvements may be transferred
deliberately after reviewing their platform impact; do not automatically merge
the Linux branch into the Windows baseline.

Both working copies share Git history through a local worktree relationship,
but have separate source files and indexes. They are not independent backups of
the Git repository itself. Retained source archives provide an additional
recovery point. Commits remain local unless the owner requests a push.

The historical `Documents\Codex\2026-11-06\i-x20` source is reference only.
