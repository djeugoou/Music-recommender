# Workflow — The Task Lifecycle

> Status: `living` · Owner: engineering process · Last updated: 2026-06-26
>
> This is the **binding process** for all work on WDD. `CLAUDE.md` references this file and
> requires every agent to follow it. If you are an AI agent: read this before doing anything.

---

## Why this exists

The project must be **traceable** and **regression-aware**:

- Every change is preceded by a written **plan** (so intent is explicit and reviewable).
- Every change is followed by a written **report** (so outcomes, deviations, tests, and
  performance impact are recorded).
- All of it is version-controlled Markdown, so the next agent inherits full context and can
  detect a performance regression by comparing against recorded baselines.

> **"Markdown" note:** earlier guidance referred to this as "MD5." Throughout this system that
> means **Markdown (`.md`) documents**. A separate, optional `Artifact SHA` field exists in the
> report template for genuine file-integrity hashing — see [`templates/report.md`](templates/report.md).

---

## The lifecycle

```
  ┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌───────────────────┐
  │  REQUEST │ ──▶ │  PLAN (write)│ ──▶ │  EXECUTE     │ ──▶ │  REPORT (write)   │
  │ (a task) │     │  plan.md     │     │  do the work │     │  report.md        │
  └──────────┘     └──────────────┘     └──────────────┘     └───────────────────┘
                          │                                            │
                          └──────────── register in ───────────────────┘
                                    registers/task-register.md
```

### 1. Identify the task
Assign a **Task ID**: `YYYY-MM-DD-NN-slug`
- `YYYY-MM-DD` — date the task was opened.
- `NN` — two-digit sequence within that day (`01`, `02`, …).
- `slug` — short kebab-case description.

Example: `2026-06-26-01-docs-traceability-framework`.

Create the folder `docs/tasks/<task-id>/`.

### 2. Write the plan — **before any work**
Copy [`templates/plan.md`](templates/plan.md) to `docs/tasks/<task-id>/plan.md` and fill in:

- **Header** — Task ID, status `planned`, **opened timestamp** (ISO-8601, e.g. `2026-06-26T17:39+02:00`).
- **Goal** — what success looks like, in one or two sentences.
- **Non-goals** — what this task explicitly will *not* do (prevents scope creep; tells the next agent where the boundary was drawn).
- **Context** — links to relevant reference docs, prior tasks, code paths, constraints, assumptions.
- **Plan** — the steps **as a checklist** (`- [ ]`). This is the contract that the report will tick off.
- **Risks / rollback** — what could go wrong and how to undo it.

Set the task status to `in-progress` when execution starts.

### 3. Execute
Do the work. If you must deviate from the plan, that is allowed — but it **must be recorded** in the report's Deviations section with a reason. Do not silently change scope.

### 4. Write the report — **after the work**
Copy [`templates/report.md`](templates/report.md) to `docs/tasks/<task-id>/report.md` and fill in:

- **Header** — Task ID, status `done` (or `partial`/`blocked`), **completed timestamp**.
- **Checklist results** — the *same* checklist from the plan, now ticked `- [x]` (or marked not-done with a reason).
- **What was done** — narrative summary, with file paths and `file:line` references.
- **Deviations** — anything that differs from the plan, each with a reason. "None" is a valid, expected answer.
- **Tests** — every test/verification run: the exact command, the result, and a link to the [`test-log.md`](registers/test-log.md) entry.
- **Performance** — measurements taken, compared against [`performance/baselines.md`](performance/baselines.md). State explicitly whether a regression occurred.
- **Follow-ups** — new tasks this work revealed (file them in the register).
- **(Optional) Artifact SHA** — SHA-256 of key produced/changed files for integrity.

### 5. Register it
Add/append the task to [`registers/task-register.md`](registers/task-register.md) with its status and links. This is the index every future agent reads first.

---

## Rules

1. **No work without a plan.** If a request is small, the plan is small — but it exists.
2. **No plan closed without a report.** A task without a report is "in-progress" forever.
3. **Plans are checklists; reports tick them.** One-to-one. The reader must be able to confirm completion at a glance.
4. **Deviations are recorded, not hidden.** Changing course is fine; not documenting it is not.
5. **Point-in-time docs are immutable.** Reports and audits are never edited after sign-off — only superseded by a new dated doc that links back.
6. **Living docs are kept current.** `reference/*`, registers, and `performance/baselines.md` are updated whenever reality changes, ideally within the task that changed reality.
7. **Tests and performance are always recorded** when a task touches runnable code — even "no tests exist yet, ran the app manually, here's what I saw."
8. **Timestamps everywhere.** ISO-8601 with offset. They make regressions and history reconstructable.

---

## Status vocabulary

| Status | Used on | Meaning |
| :--- | :--- | :--- |
| `planned` | plan.md | written, work not started |
| `in-progress` | plan.md | work underway |
| `done` | report.md | completed, checklist fully ticked |
| `partial` | report.md | some checklist items intentionally deferred (listed) |
| `blocked` | report.md | stopped on an external dependency (named) |
| `superseded` | any | replaced by a newer doc (linked) |

---

## Audits vs. tasks

- A **task** is a unit of *change*.
- An **audit** is a unit of *assessment* (no change required). Audits live in [`audits/`](audits/), are **classified** (`architecture` | `security` | `performance` | `dependency`), and are registered in [`audits/README.md`](audits/README.md). An audit usually *spawns* tasks (which then follow the lifecycle above).
