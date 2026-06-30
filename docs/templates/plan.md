<!--
TEMPLATE — copy to docs/tasks/<task-id>/plan.md and fill in. Delete these comments.
Task ID format: YYYY-MM-DD-NN-slug  (e.g. 2026-06-26-02-wire-redis-cache)
-->

# Plan — <Task ID> · <short title>

| Field | Value |
| :--- | :--- |
| Task ID | `YYYY-MM-DD-NN-slug` |
| Status | `planned` |
| Opened | `YYYY-MM-DDTHH:mm+ZZ:ZZ` |
| Author | <agent/human> |
| Requested by | <who asked> |

---

## Goal
<One or two sentences: what success looks like. Be concrete and verifiable.>

## Non-goals
<What this task explicitly will NOT do. Draw the scope boundary so the next agent knows where it stopped and why.>
- …

## Context
<Why now, what it touches, what's assumed. Link forward and back so this task is self-contained for a cold reader.>
- Relevant reference: [architecture](../../reference/architecture.md), [dependencies](../../reference/dependencies.md), [infrastructure](../../reference/infrastructure.md)
- Related tasks / audits: …
- Affected code paths: `backend/…`, `frontend/src/…`
- Constraints / assumptions: …

## Plan (checklist)
<The contract. The report will tick each of these. Keep them verifiable.>
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Risks & rollback
| Risk | Likelihood | Mitigation / how to roll back |
| :--- | :--- | :--- |
| … | low/med/high | … |

## Test & performance intent
<What will be verified, and what will be measured against [baselines](../../performance/baselines.md). If the change is runnable, name the command(s) and the metric(s).>
- Verification: …
- Metric(s) to capture: …
