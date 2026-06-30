# Task Register

> Status: `living` · Last updated: 2026-06-27
>
> The index of **every task**, ever. First thing a new agent should read. Each task links to its
> `plan.md` and `report.md`. Status vocabulary is defined in [`../workflow.md`](../workflow.md).

## Active & completed
| Task ID | Title | Status | Plan | Report | Opened | Closed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `2026-06-26-01-docs-traceability-framework` | Stand up docs & traceability system | `done` | [plan](../tasks/2026-06-26-01-docs-traceability-framework/plan.md) | [report](../tasks/2026-06-26-01-docs-traceability-framework/report.md) | 2026-06-26 | 2026-06-26 |
| `2026-06-27-01-constitution-alignment` | Hybrid/additive docs migration to align with the Engineering Constitution | `planned` | [plan](../tasks/2026-06-27-01-constitution-alignment/plan.md) | — | 2026-06-27 | — |
| `2026-07-01-01-fix-cors-production` | Fix production CORS 400 on OPTIONS preflight | `done` | [plan](../tasks/2026-07-01-01-fix-cors-production/plan.md) | [report](../tasks/2026-07-01-01-fix-cors-production/report.md) | 2026-07-01 | 2026-07-01 |

## Backlog (reserved IDs from the architecture baseline audit)
> Filed by [audit 2026-06-26-architecture-baseline](../audits/2026-06-26-architecture-baseline.md). Not started — each needs its own `plan.md` when picked up.

| Task ID | Title | Source finding | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
| `2026-06-26-02-wire-redis-cache` | Back `cache_service` with Redis (in-memory fallback) | F1 (high) | high | `backlog` |
| `2026-06-26-03-dependency-cleanup` | Wire-or-remove unused deps; dedupe psycopg2 | F2 | medium | `backlog` |
| `2026-06-26-04-fix-docker-port` | Fix `EXPOSE`/README port mismatch | F3 | medium | `backlog` |
| `2026-06-26-05-env-example-api-url` | Add `VITE_API_URL` to `frontend/.env.example` | F4 | medium | `backlog` |
| `2026-06-26-06-test-harness` | Add pytest + Vitest; capture perf baselines | F5 | medium | `backlog` |
| `2026-06-26-07-schema-and-guards` | `favorites` migration SQL; guard `ai_service __main__` | F6 | low | `backlog` |

## Backlog (reserved IDs from the constitution-conformance audit)
> Filed by [audit 2026-06-27-constitution-conformance](../audits/2026-06-27-constitution-conformance.md). Code findings only — the documentation findings are handled by `2026-06-27-01` above. Not started; each needs its own `plan.md`.

| Task ID | Title | Source finding | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
| `2026-06-27-02-secure-recommend-endpoint` | Authorize/validate `/recommend`; bound `limit`/`client_mood`; env-driven CORS | CODE-1 (high), CODE-2 | high | `backlog` |
| `2026-06-27-03-structured-logging` | Replace `print` with structured `logging`; stop silent failures | CODE-3, CODE-4 | medium | `backlog` |
| `2026-06-27-04-config-module` | Centralize magic values (model/workers/TTL/limits/CORS) in a settings module | CODE-5 | medium | `backlog` |
| `2026-06-27-05-prompt-and-config-cleanup` | DRY the prompt builders; drop `frontend/.env` parsing fallback | CODE-6, CODE-7 | low | `backlog` |
| `2026-06-27-06-style-and-typing` | PEP8 naming + return types; guard `__main__` (with `2026-06-26-07`) | CODE-8, CODE-9 | low | `backlog` |

## How to add a task
1. Pick the next `YYYY-MM-DD-NN-slug`. Create `docs/tasks/<task-id>/`.
2. Write `plan.md` (from [template](../templates/plan.md)) **before** working.
3. Do the work; write `report.md` (from [template](../templates/report.md)) after.
4. Add/update the row here. Move backlog → active when started.
