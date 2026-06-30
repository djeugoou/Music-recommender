# Plan — 2026-06-26-01 · Documentation & Traceability Framework

| Field | Value |
| :--- | :--- |
| Task ID | `2026-06-26-01-docs-traceability-framework` |
| Status | `done` *(see [report](report.md))* |
| Opened | `2026-06-26T17:39+02:00` |
| Author | Claude (Opus 4.8) |
| Requested by | djeugoou |

---

## Goal
Stand up a version-controlled `docs/` system where **every task is planned before work and reported after**, and where audits, dependencies, architecture, infrastructure, tests, and performance baselines are all traceable — so any future agent or engineer can reconstruct *what was done, why, and whether it regressed performance* without re-reading the whole codebase. Make the process **binding** via `CLAUDE.md`.

## Non-goals
- **No code changes / refactors / file moves.** Backend/frontend restructuring, wiring Redis, fixing the port mismatch, etc. become their own tracked tasks under the new system.
- Not deleting the stale `docs/code-architecture.md` — mark it superseded, preserve history.
- Not wiring a test framework (none exists) — *spec* how tests get recorded; wiring is task `2026-06-26-06`.
- Not measuring live performance — seed the baseline table; first measurements come with the test harness task.

## Context
- Interpretation of the request: "MD5" → Markdown `.md`; "doc/dog folder" → `docs/`; "tax" → task; "cloud.mg" → `CLAUDE.md`. An optional `Artifact SHA` field was added to the report template to also satisfy a literal file-integrity reading.
- Existing state: `docs/` had only one stale file (`code-architecture.md`). `CLAUDE.md` (untracked) already holds accurate architecture notes — preserved, not discarded.
- Reference inputs read: `backend/requirements.txt`, `frontend/package.json`, `Dockerfile`, `start.sh`, both `.env.example`, `README.md`, `CLAUDE.md`; `backend/**/*.py` import grep.

## Plan (checklist)
- [ ] Create `docs/` skeleton (templates, tasks, audits, reference, performance, registers)
- [ ] Write `workflow.md` (the binding lifecycle) + 3 templates (plan/report/audit)
- [ ] Write `README.md` master index
- [ ] Write `reference/architecture.md` (accurate; supersedes code-architecture.md)
- [ ] Write `reference/dependencies.md` (package register; verify used-vs-installed by grep)
- [ ] Write `reference/infrastructure.md` (Docker/Render/Supabase/env/ports; flag discrepancies)
- [ ] Write `audits/README.md` register + `2026-06-26-architecture-baseline.md` seed audit
- [ ] Write `performance/README.md` (rules) + `baselines.md` (seeded)
- [ ] Write `registers/` (task-register, decision-log, test-log)
- [ ] Author this task's `plan.md` + `report.md` (dogfood)
- [ ] Restructure `CLAUDE.md` with a binding Task Lifecycle section pointing to docs
- [ ] Mark `docs/code-architecture.md` as superseded

## Risks & rollback
| Risk | Likelihood | Mitigation / rollback |
| :--- | :--- | :--- |
| Docs taxonomy doesn't fit user's mental model | medium | Presented full structure for approval before building; docs are cheap to reorganize. |
| Rewriting `CLAUDE.md` loses accurate notes | low | Preserve all existing content; reorganize, don't delete. `CLAUDE.md` is untracked → easily reverted. |
| Dependency/port claims inaccurate | low | Verified by reading actual files + import grep, not assumptions. |

## Test & performance intent
- Verification: static — confirm import facts, port truth, env requirements by reading source (no runtime change to test).
- Metric(s): none captured this task; performance baseline table seeded empty for future tasks.
