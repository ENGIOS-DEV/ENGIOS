# AIDA-2 — Definition of Done

## Every file before it is considered complete:

### Layer 1 — Electron module
- [ ] Single responsibility — does exactly one job
- [ ] No UI logic
- [ ] No hardcoded paths — uses config/registry
- [ ] Exports a clean, named API

### Layer 2 — Bridge
- [ ] Every exposed method is documented
- [ ] No logic — pass-through only
- [ ] Matches exactly what IPC handlers expect

### Layer 3 — Global
- [ ] All values derive from GlobalSettings
- [ ] CSS variables written for every token
- [ ] No window-type-specific values

### Layer 4 — Convention file
- [ ] All style functions take `settings: GlobalSettings`
- [ ] No hardcoded colours
- [ ] No hardcoded font sizes — uses tokens from Layer 3
- [ ] No hardcoded spacing
- [ ] Exported as named functions — no default exports

### Layer 5 — Component
- [ ] No hardcoded colours
- [ ] No hardcoded font sizes
- [ ] No getPalette() calls — uses typed style functions
- [ ] No localStorage
- [ ] No direct window.electron calls — uses services
- [ ] Import depth correct for component location
- [ ] Renders correctly at all three font sizes
- [ ] Renders correctly in dark and light theme

### Layer 6 — Data
- [ ] All reads/writes go through settingsDb.ts or db.ts
- [ ] No component touches the DB directly
- [ ] Schema documented in database/schema.cjs
