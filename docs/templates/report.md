<!--
TEMPLATE — copy to docs/tasks/<task-id>/report.md and fill in. Delete these comments.
A report is POINT-IN-TIME: once signed off, do not edit it — supersede it with a new dated doc.
-->

# Report — <Task ID> · <short title>

| Field | Value |
| :--- | :--- |
| Task ID | `YYYY-MM-DD-NN-slug` |
| Status | `done` / `partial` / `blocked` |
| Plan | [`plan.md`](plan.md) |
| Started | `YYYY-MM-DDTHH:mm+ZZ:ZZ` |
| Completed | `YYYY-MM-DDTHH:mm+ZZ:ZZ` |
| Author | <agent/human> |

---

## Checklist results
<The SAME checklist from the plan. Tick what was done; for anything not done, say why.>
- [x] Step 1
- [x] Step 2
- [ ] Step 3 — *not done: <reason>*

## What was done
<Narrative. Reference concrete paths and `file:line` so a reader can verify.>
- …

## Deviations from plan
<Each item: what changed vs. the plan, and why. "None." is a valid and expected answer.>
- None.

## Tests & verification
<Every check run. Exact command, result, and a link to the registers/test-log.md row. If no test framework exists, record manual verification honestly.>

| What | Command | Result | Test-log |
| :--- | :--- | :--- | :--- |
| … | `…` | pass/fail | [row](../../registers/test-log.md) |

## Performance
<Measurements vs. [baselines](../../performance/baselines.md). State explicitly: regression / no change / improvement. If not applicable, say why.>

| Metric | Baseline | This run | Δ | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| … | … | … | … | no regression / REGRESSION / improved |

Baseline updated? <yes/no — if yes, link the baselines.md change>

## Follow-ups
<New tasks/issues this work revealed. File each in the task register.>
- …

## Artifact SHA (optional)
<SHA-256 of key files produced/changed, for integrity. Generate with:
  PowerShell:  Get-FileHash -Algorithm SHA256 <path>
  bash:        sha256sum <path>  >
| File | SHA-256 |
| :--- | :--- |
| … | … |
