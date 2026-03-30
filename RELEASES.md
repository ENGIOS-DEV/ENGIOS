# ENGIOS Release Process

*How monthly releases are packaged, versioned, and published.*

---

## Philosophy

ENGIOS releases are honest snapshots of a project in progress. Every release documents what works, what is partial, and what is planned. There are no smoke-and-mirrors releases here.

A release that says "this feature is 70% done" is more valuable to the community than one that pretends it is finished.

---

## Release Schedule

Releases are published at the end of each calendar month.

| Release | Contents |
|---------|----------|
| AIDA | Production build of the Electron app — whatever state it is in |
| OS Setup | Debian 13 + Ollama + Phi-3 Mini setup script |
| Setup Guide | Step-by-step `SETUP.md` for new users |
| Release Notes | What changed, what works, what is in progress |

---

## Versioning

ENGIOS uses a simple versioning scheme:

```
v0.MONTH.0  — monthly development release
v1.0.0      — first stable Personal edition release (future)
```

Examples:
- `v0.1.0` — April 2026 (first release)
- `v0.2.0` — May 2026
- `v0.3.0` — June 2026

Pre-release suffix for significant mid-month fixes: `v0.1.1`, `v0.1.2` etc.

---

## What Each Release Contains

```
engios-v0.X.0/
├── aida/                   ← Built AIDA Electron app
│   └── dist/               ← Production bundle
├── os/
│   └── setup.sh            ← Debian + Ollama + Phi-3 setup script
├── SETUP.md                ← Installation guide
├── CHANGELOG.md            ← What changed this month
└── README.md               ← Quick start
```

---

## Release Checklist

Run through this at the end of each month.

### 1. Build AIDA

```bash
cd aida/
npm run build
```

Verify the build completes without errors.

### 2. Test the build

- Launch the production build
- Open AIDA Chat — send a test message, confirm Ollama responds
- Open File Decks — navigate a directory
- Open Tasks — create and complete a task
- Check the menu bar — confirm it opens and hides

### 3. Update CHANGELOG.md

Document what changed this month:
- New features added
- Bugs fixed
- Known issues remaining
- What is in progress

Be honest. If something is broken, say so.

### 4. Tag and push

```bash
git add .
git commit -m "release: v0.X.0 — [Month] [Year]"
git tag v0.X.0
git push origin main --tags
```

### 5. Create GitHub Release

1. Go to [github.com/ENGIOS-DEV/ENGIOS/releases](https://github.com/ENGIOS-DEV/ENGIOS/releases)
2. Click **Draft a new release**
3. Select the tag you just pushed (`v0.X.0`)
4. Title: `ENGIOS v0.X.0 — [Month Year]`
5. Paste the CHANGELOG entry for this version into the release notes
6. Attach the built files
7. Check **"This is a pre-release"** — until v1.0.0, all releases are pre-releases
8. Publish

---

## Release Notes Template

Use this structure for every release:

```markdown
## ENGIOS v0.X.0 — [Month Year]

Monthly development snapshot. ENGIOS is a work in progress.
This release reflects the current state of active development.

### What's New
- Feature or fix description

### What Works
- ✓ AIDA Chat — streaming conversation, persistence, projects
- ✓ [other working features]

### Known Issues
- → [honest description of what is incomplete or broken]

### In Progress
- → [what is actively being worked on]

### Setup
See [SETUP.md](SETUP.md) for installation instructions.
```

---

## Notes

- Never publish a release without testing the production build first
- Never hide known issues — document them clearly
- The community respects honesty far more than polish
- If a month is light on changes, still publish — consistency builds trust

---

*ENGIOS — Engineered Intelligent OS · [engios.dev](https://engios.dev)*
