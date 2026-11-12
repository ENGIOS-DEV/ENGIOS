# ENGIOS / AIDA — Working Instructions

## Consistency is mandatory

Consistency in everything we do is ABSOLUTE KEY. Apply the same established
method across sessions, code, architecture, documentation, naming, file delivery,
and verification. Do not silently substitute a different approach tomorrow.
Changes to an established convention require the owner's agreement and an
update to the authoritative instructions in the same change.

This file owns mandatory development rules. The project skill at
.agents/skills/engios-dev/SKILL.md owns the development and teaching workflow;
read it for ENGIOS/AIDA development. Do not maintain competing copies of rules.
Read ENGIOS_PROJECT.md for project context and aida/BLUEPRINT v1.4.docx for the
existing architectural blueprint before architectural changes. There is no
verified root BLUEPRINT.md. If documentation conflicts with the owner's current
instructions, follow those instructions and surface the discrepancy; do not
silently invent a resolution or rewrite unrelated historical documents.

## Architecture and implementation rules

- ENGIOS is the planned Debian-based OS with substantial customisation.
  AIDA provides the consistent user-facing experience; AI supplies system-aware
  reasoning and directs interactions using verified host capabilities. This is
  the owner's clarified direction, not a claim that it is fully implemented.
- Identify the layer and respect its responsibilities before editing. Fix the
  cause in its owning layer; do not hide it with overrides in another layer.
- Before a change affecting more than three files, present a concrete plan.
  Follow existing authorization; ask only when a new decision or expanded scope
  actually requires it. No bulk rewrites without explicit agreement.
- No hardcoded colours, font sizes, or spacing in components; define values in
  the owning token/theme/convention layer. No component-local style definitions
  or getPalette() calls; use the existing typed theme functions.
- No localStorage. Use the established persistence and settings mechanisms.
- Use strict TypeScript without any. Keep components focused; aim below 200
  lines and split by responsibility rather than arbitrary line count.
- Keep one styling system and one source of truth for settings. Do not introduce
  competing ways to solve the same problem.
- Avoid z-index unless the intended layering requires it; preserve existing
  working layering. Guard slider values against NaN before updating state.
- Select explicit dependency versions; never install latest blindly. Do not
  rewrite existing dependency ranges as an unrelated cleanup.
- Preserve the owner's password-field convention, autoComplete="off", but do
  not claim it reliably suppresses every password manager's UI.
- Preserve working code and existing uncommitted changes outside the task.
  Do not treat this as a ban on changing a working caller when a coherent fix
  requires it; explain such changes in the plan.

## Mandatory presentation and code consistency

The owner requires strict consistency in code structure, formatting, and
documentation. This is an acceptance requirement for every change, not an
optional preference. Correct functionality alone is insufficient.

Before editing, read ENGIOS_PROJECT.md and the relevant source files. Inspect
the complete file being changed and a representative neighbouring file in the
same layer. Follow their established presentation rather than personal style
or generic formatter defaults.

- Preserve the established file banner: double-line Unicode separators, layer
  and responsibility title, project identifier and accurate source path.
- Explain responsibilities, constraints, and relevant dependencies in the
  existing header format. Include provenance when code is actually adapted;
  never invent origins, layer numbers, or historical claims.
- Use the established single-line Unicode section dividers and descriptive
  section names. Keep related imports, types, helpers, and implementation in
  the order established by comparable files.
- Match indentation, quotes, semicolon usage, blank lines, wrapping, trailing
  commas, and deliberate column alignment in the relevant language and file.
  The inspected TypeScript/TSX and CommonJS examples use two-space indentation,
  single quotes, omitted statement semicolons, and aligned related declarations.
  Do not apply these mechanically to other formats or languages.
- Use clear, consistent names and comments that explain purpose, constraints,
  or non-obvious behaviour. Keep headers and comments accurate after changes.
- Respect layer boundaries and documented ownership. For example, components
  that delegate styling to theme modules must continue doing so.
- New files must follow a comparable existing file in their layer. If no
  precedent establishes a significant convention, resolve it with the owner
  before introducing a competing style.
- Do not run a formatter that destroys intentional alignment or rewrites
  unrelated code. Do not perform broad cosmetic cleanups during functional work.
- Before finishing, inspect the diff for presentation as well as correctness:
  banners, source paths, section order, alignment, naming, and comments must
  remain consistent. Run checks appropriate to any functional change.

These instructions apply to code produced using skills and other tools as well
as direct edits. A skill's generic style must not override the owner's explicit
project conventions. Do not claim the entire repository has been audited when
only representative files have been inspected.

## Working copy

The Windows source is C:\Users\Admin\Documents\GitHub\ENGIOS on branch
windows-desktop. The integrated Linux source is the separate Git worktree
C:\Users\Admin\Documents\GitHub\ENGIOS-Linux on branch linux-integrated.
Read PLATFORMS.md before editing or exporting either platform. Confirm the
working directory and branch; do not develop Linux integration in the Windows
copy or silently copy platform changes between them.
The attached C:\Users\Admin\Documents\Codex\2026-11-06\i-x20 folder is
historical reference and exports; do not edit its older source copy unless the
owner explicitly requests work there. Preserve existing uncommitted work.
