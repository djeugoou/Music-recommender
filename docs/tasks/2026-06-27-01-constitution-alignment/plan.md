# Plan — 2026-06-27-01 · Engineering-Constitution alignment (hybrid/additive docs migration)

| Field | Value |
| :--- | :--- |
| Task ID | `2026-06-27-01-constitution-alignment` |
| Status | `planned` |
| Opened | `2026-06-27T00:00+02:00` |
| Author | Claude (Opus 4.8) |
| Requested by | djeugoou |

---

## Goal
Align the repository with the **Engineering Constitution** using a **hybrid/additive** strategy: preserve the existing WDD traceability system intact, **add** the Constitution's missing concern areas (`api/`, `security/`, `database/`, `testing/`, `onboarding/`, `changelog/`, and per-file `decisions/`), and make [`docs/README.md`](../../README.md) a **crosswalk** so the Constitution's vocabulary resolves to real files. Outcome: every Constitution-named area has a first-class, navigable home and **no existing artifact is deleted or invalidated**.

## Non-goals
- **No application code changes.** Findings CODE-1…CODE-9 from the [conformance audit](../../audits/2026-06-27-constitution-conformance.md) are *filed as tasks*, not implemented here. No refactors, no Redis, no logging rewrite, no endpoint hardening in this task.
- **No feature work** of any kind.
- **No deletion or rewrite of existing docs.** `reference/`, `registers/`, `templates/`, `workflow.md`, `performance/`, and the superseded `code-architecture.md` all stay. We add and cross-link; we do not move or destroy. (Splitting the decision log copies entries into per-ADR files and leaves a pointer behind — no history lost.)
- **No live performance measurement** (docs-only change; baseline capture remains baseline task `2026-06-26-06`).

## Context
- **Trigger:** the Engineering Constitution (supplied 2026-06-27) prescribes a docs taxonomy and engineering standards. The [conformance audit](../../audits/2026-06-27-constitution-conformance.md) found the repo already meets most *process* intent; gaps are additive (DOC-1…DOC-8) plus code-standard divergences (CODE-1…CODE-9).
- **Decisions taken (by the requester, 2026-06-27):** reconciliation = **hybrid/additive**; scope = **docs alignment + a code-conformance audit** (the audit is done; its code findings become backlog tasks). Recorded as [ADR-0003](../../registers/decision-log.md).
- **Constraint — Constitution says "structure *similar to*":** the taxonomy is a guideline, not a literal mandate. The existing WDD spine is judged superior for *process* and is kept; the Constitution's areas are layered on top.
- Reference inputs: [architecture](../../reference/architecture.md), [dependencies](../../reference/dependencies.md), [infrastructure](../../reference/infrastructure.md); root `README.md`, `CONTRIBUTING.md`.
- Affected paths (docs only): `docs/**`, and link-only edits to root `README.md` + `CONTRIBUTING.md` (DOC-7).

## Plan (checklist)

### 1 — Crosswalk + index (do first; everything links back here)
- [ ] Rewrite [`docs/README.md`](../../README.md) navigation to a **Constitution crosswalk** table: each Constitution area → actual file/folder, marked `native` (new folder) or `→ alias` (points at existing `reference/`/`registers/`). Keep the existing "how to navigate" + status legend.
- [ ] Add a short "Relationship to the Engineering Constitution" section stating the hybrid/additive decision and linking [ADR-0003](../../registers/decision-log.md).

### 2 — Add the missing concern areas (additive; stubs link to source-of-truth, no duplication)
- [ ] `docs/architecture/README.md` — index that surfaces [`reference/architecture.md`](../../reference/architecture.md) (source of truth) + the data-flow diagram; no content copy.
- [ ] `docs/api/README.md` — **new content** (DOC-1): endpoint catalog for `/health`, `POST /recommend` (unauth, body `user_id`, cursor `session:index`, `limit`), `GET /recommendations/for-you` (Bearer). Document the capital-`Playlist` response key, `next_cursor` semantics, and `preview`/`preview_url` mapping. Link to FastAPI `/docs` OpenAPI.
- [ ] `docs/deployment/README.md` — index/alias to [`reference/infrastructure.md`](../../reference/infrastructure.md) (Docker/Render/env/ports, source of truth).
- [ ] `docs/database/README.md` — **new content** (DOC-3): tables (`favorites`, `recommendation_history`), the `unique (user_id, artist, title)` constraint + `23505` behavior, RLS summary, and links to `supabase/*.sql`. Note the schema-as-migration gap (baseline F6) without fixing code.
- [ ] `docs/security/README.md` — **new content** (DOC-2): the two auth paths, RLS model, secret inventory/handling, and the **known issues** CODE-1 (unauth `/recommend` trusts `user_id`) + CODE-2, linked to their tasks.
- [ ] `docs/testing/README.md` — **new content** (DOC-4): testing strategy (route/unit/component scope, edge cases, coverage intent), pointing at [`registers/test-log.md`](../../registers/test-log.md) for the run log and baseline task `2026-06-26-06` for the harness.
- [ ] `docs/onboarding/README.md` — **new content** (DOC-6): cold-start path (clone → env → run backend+frontend → Supabase setup) that *links to* root `README.md`/`CONTRIBUTING.md` and routes newcomers into [`workflow.md`](../../workflow.md). No duplication.
- [ ] `docs/changelog/README.md` — **new content** (DOC-6): seed a Keep-a-Changelog file; backfill an `Unreleased` section referencing the docs-traceability stand-up and this alignment.

### 3 — Decisions as per-ADR files (DOC-5)
- [ ] Create `docs/decisions/` and split existing ADRs into `ADR-0001-*.md`, `ADR-0002-*.md`, `ADR-0003-*.md`, one per file, in the **Constitution ADR format** (Context / Problem / Alternatives considered / Decision / Consequences / Status).
- [ ] Leave [`registers/decision-log.md`](../../registers/decision-log.md) in place as a **rolling index** that points to the per-ADR files (no history lost); update its template to the expanded format.

### 4 — Fix stale links + taxonomy (DOC-7, DOC-8)
- [ ] Repoint `README.md:109` and `CONTRIBUTING.md:146` from `docs/code-architecture.md` → [`docs/reference/architecture.md`](../../reference/architecture.md) (keep the superseded file with its banner).
- [ ] Extend the audit classification set in [`audits/README.md`](../../audits/README.md) to add `documentation` and `code-quality`; re-tag this conformance audit accordingly.

### 5 — File the code-conformance findings as tasks (no implementation)
- [ ] Add backlog rows for `2026-06-27-02-secure-recommend-endpoint` (CODE-1/2), `…-03-structured-logging` (CODE-3/4), `…-04-config-module` (CODE-5), `…-05-prompt-and-config-cleanup` (CODE-6/7), `…-06-style-and-typing` (CODE-8/9) in [`task-register.md`](../../registers/task-register.md), each linking the audit finding. Note the CODE-9 ↔ `2026-06-26-07` overlap.

### 6 — Register + report
- [ ] Update [`audits/README.md`](../../audits/README.md) register row (done at audit time; confirm).
- [ ] Move this task `planned → in-progress → done` and write `report.md` from the [template](../../templates/report.md): ticked checklist, files created, deviations, a "no code changed / no regression possible" performance note, and SHA-256 of the new index/crosswalk.

## Risks & rollback
| Risk | Likelihood | Mitigation / how to roll back |
| :--- | :--- | :--- |
| New folders duplicate `reference/`/`registers/` content and drift. | medium | Stubs **link** to the single source of truth; only `api/`, `security/`, `database/`, `testing/`, `onboarding/`, `changelog/` hold net-new prose. Crosswalk in README makes aliases explicit. |
| Splitting the decision log loses the combined view. | low | Keep `decision-log.md` as an index; per-ADR files are additive. All Markdown is version-controlled → `git revert`. |
| Crosswalk diverges from Constitution wording, confusing future agents. | low | README table uses the Constitution's exact area names in the left column. |
| Scope creep into code fixes. | low | Non-goals forbid it; code findings are filed as separate tasks only. |

## Test & performance intent
- **Verification:** static only — this task changes documentation + two doc links; no runnable code. Confirm (a) every Constitution area resolves from the README crosswalk to an existing file, (b) no internal links break, (c) `code-architecture.md` is no longer referenced as canonical. Record in [`test-log.md`](../../registers/test-log.md).
- **Metrics:** none captured; docs-only change cannot regress [baselines](../../performance/baselines.md). Baseline capture remains task `2026-06-26-06`.
