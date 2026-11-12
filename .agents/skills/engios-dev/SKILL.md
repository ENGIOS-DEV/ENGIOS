---
name: engios-dev
description: Develop, review, or debug ENGIOS/AIDA using its established architecture, presentation conventions, and stepwise teaching workflow. Apply to code and project documentation changes in the ENGIOS repository.
---

# ENGIOS / AIDA Development

## Read the project contract

Locate the ENGIOS repository root (the directory containing ENGIOS_PROJECT.md).
Read its AGENTS.md first: it is the single maintained source for mandatory
consistency, presentation, architecture, and implementation rules. Do not copy
those rules into a competing checklist or substitute generic formatter defaults.
If the contract is unavailable, retrieve it before editing project code.

Read ENGIOS_PROJECT.md for context. For layer and architecture work, read the
actual aida/BLUEPRINT v1.4.docx rather than assuming BLUEPRINT.md exists.
Inspect the target file and a comparable file in the same layer before editing.
Distinguish implemented behaviour from proposals and dated documentation.

## Collaborate and teach

The owner is learning React/TypeScript while building the project and makes
product and architectural decisions. Keep explanations short and direct:
explain what changes, why, and unfamiliar syntax on its first relevant use.
When the owner says "etc", make the intended scope concrete rather than treating
it as unlimited authorization.

Build one coherent piece at a time and verify it before moving on. Identify the
owning layer and flag architectural conflicts before implementation. Present a
plan before touching more than three files, following the authorization rules
in AGENTS.md. Do not add a repeated approval step for already authorized work.

The owner uses Windows and a Norwegian keyboard. Prefer named menu actions or
confirmed keyboard bindings; do not assume Ctrl+backtick. The owner-provided
VS Code terminal shortcut is Ctrl+Shift+Ø; verify if the installed setup differs.
Verify tool versions when needed rather than treating old version notes as
current machine inventory.

## Deliver consistently

For workspace work, edit the real active files directly, preserve unrelated
changes, and report the affected files, reason, verification, and limitations.
For manual copy-and-paste delivery, provide complete files rather than isolated
replacement fragments, with the full destination path immediately before each
file and a brief explanation of its layer and purpose.

Before finishing, review presentation against the repository contract as well
as behaviour. Use checks appropriate to the change; do not claim an unrun build
or an unobserved GUI launch passed. Documentation-only changes need document
and reference verification, not an application rebuild.

Preserve a single implementation method unless the owner agrees to change it.
When a method changes, update the authoritative instructions with that change
so the following session uses the same method.

## Debug and preserve milestones

Locate the failure's owning layer, reproduce the issue, and prefer removing the
cause over adding overrides. Historical blur explanations are hypotheses until
reproduced: do not assume Electron cannot blur the desktop, transforms always
break backdrop-filter, or CSS variables cannot repaint it. Use a minimal test
when investigating blur and add complexity only as evidence warrants.

Git commits and retained archives preserve past states; a newly created archive
captures the current working tree, including uncommitted changes. Never claim
an old state is recoverable unless it was actually retained. Offer a source-only
milestone archive at meaningful working milestones, excluding dependencies,
local runtimes, models, private databases, credentials, and generated output.
Use the established desktop-assistant-YYYY-MM-DD-HH-MM-description.zip naming
unless the owner agrees to change it. Do not create archives after every edit.

## Brand context

Owner-provided brand reference: logo #E6E6E6, accent #29ABE2, background #0D1117;
Archivo Black and DM Mono. Taglines: "Because machines deserve to live longer
too." and "Sovereignty. Restored." Verify against current theme definitions
before changing visuals. Values belong in their owning theme/token files,
never copied into components.
