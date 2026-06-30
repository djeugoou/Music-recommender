<!--
TEMPLATE — copy to docs/audits/<YYYY-MM-DD-classification-slug>.md and fill in. Delete these comments.
Classification MUST be one of: architecture | security | performance | dependency
An audit ASSESSES; it does not change code. It usually spawns tasks that do.
-->

# Audit — <classification> · <short title>

| Field | Value |
| :--- | :--- |
| Audit ID | `YYYY-MM-DD-<classification>-slug` |
| Classification | `architecture` / `security` / `performance` / `dependency` |
| Status | `point-in-time` |
| Date | `YYYY-MM-DDTHH:mm+ZZ:ZZ` |
| Auditor | <agent/human> |
| Scope | <what was and was not examined> |

---

## Summary
<2–4 sentences: overall health and the headline findings.>

## Method
<How the assessment was done: files read, commands run, tools used. Make it reproducible.>

## Findings
<Each finding: severity, evidence (with `file:line`), and impact. Severity = critical | high | medium | low | info.>

| # | Severity | Finding | Evidence | Impact |
| :--- | :--- | :--- | :--- | :--- |
| F1 | … | … | `path:line` | … |

## Recommendations → tasks
<Each recommendation becomes (or maps to) a task. Link the task ID once filed.>

| Finding | Recommended action | Proposed task |
| :--- | :--- | :--- |
| F1 | … | `YYYY-MM-DD-NN-slug` (to file) |

## What is healthy
<Explicitly record what is already good, so future agents don't "fix" non-problems.>
- …
