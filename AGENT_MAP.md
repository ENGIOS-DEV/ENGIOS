# ENGIOS / AIDA — Agent Map
*Living document. Updated as agent candidates emerge naturally from AIDA development.*
*Do not design agents speculatively — document them when real usage demands them.*
*Last updated: April 2026*

---

## Architecture Philosophy

ENGIOS will use a **rule-based multi-agent architecture**. Not AI-driven orchestration.

Every agent has a narrow, defined scope. The orchestrator is a rule-based intent parser — not a model. When the system cannot handle a situation, it is because we have not yet written that rule. That is a feature, not a limitation. We stay sovereign. We stay in control.

> *"The AI serves within boundaries we set. Not boundaries it sets for itself."*
> — ENGIOS Design Law №15

---

## Orchestration Layer (Planned)

A lightweight rule-based **intent parser** sits in front of all agents.

- Tags incoming requests with one or more intents
- Routes to the correct agent based on explicit rules
- Handles compound requests by invoking multiple agents in sequence
- Falls back to the Chat Agent for anything unclassified
- Never uses AI to make routing decisions

**Status:** Concept only. Design begins when AIDA reaches sufficient maturity.

---

## Agent Candidates

### 1. Hardware & System Health Agent
**Trigger keywords:** cpu, ram, memory, gpu, temperature, disk, storage, battery, performance, specs, processes, running, uptime, load

**Scope:**
- Live hardware stats (CPU, RAM, GPU, disk, temperature)
- Running process monitoring
- System health alerts
- Hardware anomaly detection
- Performance recommendations

**Current state:** Partially implemented. `electron/ipc/system.cjs` handles on-demand system queries via `systeminformation`. Currently triggered by keyword detection in `buildSystemContext()` in `Window.tsx`.

**Notes:** This is the most developed agent candidate. The IPC layer is already built. The agent boundary is clear and non-overlapping with others.

---

### 2. Task & Scheduling Agent
**Trigger keywords:** task, remind, reminder, schedule, due, deadline, calendar, appointment, event, recurring

**Scope:**
- Task creation, editing, completion
- Reminder scheduling and firing
- Overdue detection and notification
- Recurring task management
- Calendar integration (future)

**Current state:** Task management is fully built in the Tasks app. Reminder and nudge systems are in `electron/main.cjs`. Not yet abstracted as a discrete agent.

**Notes:** The logic already exists — it just needs to be encapsulated into an agent interface when the orchestrator is built.

---

### 3. File & Storage Agent
**Trigger keywords:** file, folder, find, search, open, move, copy, delete, organise, clean, storage, space, disk

**Scope:**
- File search across the system
- File organisation suggestions
- GiG (Get it Gone) — identifying and cleaning unused files
- Storage usage reporting
- File type analysis

**Current state:** File search is implemented in `electron/ipc/filesystem.cjs` and `src/services/fileSearchService.ts`. GiG is not yet built.

**Notes:** GiG is the most interesting capability here — a principled, user-controlled cleanup agent. Fits perfectly with Design Law №10.

---

### 4. Chat / General Intelligence Agent
**Trigger:** Everything not claimed by a specialist agent

**Scope:**
- General conversation
- Questions that cross agent boundaries
- Context and continuity across sessions
- Anything the rule-based router cannot classify

**Current state:** Fully implemented. AIDA Chat with phi3mini:latest via Ollama. Full conversation persistence, projects, search.

**Model candidates (future):**
- phi3mini:latest — current
- Bonsai 8B (1.15GB) — when Ollama support arrives
- Fine-tuned ENGIOS-specific model — long-term goal

---

## Specialist Model Candidates

These are potential future models — purpose-built or fine-tuned for specific ENGIOS agent roles.

| Agent | Model approach | Size target | Timeline |
|-------|---------------|-------------|----------|
| Hardware & System | Fine-tune Bonsai 1.7B | ~0.24GB | 1 year+ |
| Task & Scheduling | Rule-based + classifier | Minimal | 6 months+ |
| File & Storage | Rule-based + classifier | Minimal | 6 months+ |
| Chat / General | Bonsai 8B or fine-tuned | ~1.15GB | When Ollama supports Bonsai |

---

## How to Use This Document

**When to add an agent candidate:**
- When a feature in AIDA feels like it belongs to a clearly separate domain
- When a user request crosses multiple capabilities and the routing feels obvious
- When the Chat Agent is doing something that would be better served by a specialist

**When NOT to add an agent candidate:**
- Speculatively — only document what real usage demands
- When the boundary with another agent is unclear
- When a rule could handle it without a model at all

**Format for new candidates:**
```
### N. Agent Name
**Trigger keywords:** ...
**Scope:** bullet list of responsibilities
**Current state:** what exists today
**Notes:** anything relevant
```

---

*Every agent we build should be the right tool for a specific job.*
*No agent should be a Swiss Army knife.*
*And no agent should ever decide its own scope.*
