# Decision Log (ADRs)

> Status: `living` · Last updated: 2026-06-27
>
> Lightweight record of **structural decisions** and their rationale, so future agents don't
> reverse a deliberate choice by accident. One entry per decision; newest at top.

---

## ADR-0003 — Align with the Engineering Constitution via a hybrid/additive docs migration
- **Date:** 2026-06-27
- **Status:** accepted
- **Context:** A new "Engineering Constitution" prescribes a docs taxonomy (`architecture/ api/ deployment/ database/ security/ performance/ testing/ decisions/ tasks/ audits/ onboarding/ changelog/`) and engineering standards. The repo already has the mature WDD traceability system, which meets most of the Constitution's *process* intent. The Constitution says structure "*similar to*" — a guideline, not a literal mandate.
- **Alternatives considered:** (a) **Literal taxonomy** — reorganize `docs/` to match the list exactly, dissolving `reference/`/`registers/`; highest churn, risks breaking the superior process spine. (b) **Minimal gap-fill** — add only net-new docs, ignore the taxonomy; lowest compliance. (c) **Hybrid/additive** — keep the WDD spine, add the missing concern areas, crosswalk in the README.
- **Decision:** Adopt **(c) hybrid/additive**. Preserve `workflow.md`/`templates/`/`reference/`/`registers/`/`performance/`; add `api/ security/ database/ testing/ onboarding/ changelog/` and per-file `decisions/`; make `docs/README.md` a Constitution crosswalk. Audit scope = docs alignment **plus** a code-conformance assessment whose code findings become separate backlog tasks (no implementation in the migration).
- **Consequences:** Full Constitution coverage with zero deletion of existing work; some additive folders are thin index/alias stubs (drift risk mitigated by linking to a single source of truth). ADRs split into per-file form; `decision-log.md` becomes a rolling index.
- **Task:** `2026-06-27-01-constitution-alignment` · **Audit:** [`2026-06-27-constitution-conformance`](../audits/2026-06-27-constitution-conformance.md)

## ADR-0001 — Adopt a plan→report task lifecycle with a `docs/` traceability system
- **Date:** 2026-06-26
- **Status:** accepted
- **Context:** Work needs to be traceable, auditable, and regression-aware. Multiple agents/sessions operate on the repo and must inherit full context cheaply.
- **Decision:** Every task is preceded by a `plan.md` and followed by a `report.md` under `docs/tasks/<task-id>/`; audits, references, performance, and registers are version-controlled Markdown. `CLAUDE.md` makes this binding. See [`../workflow.md`](../workflow.md).
- **Consequences:** Slight up-front overhead per task; large gain in traceability and onboarding. Point-in-time docs are immutable (superseded, not edited).
- **Task:** `2026-06-26-01-docs-traceability-framework`

## ADR-0002 — `reference/architecture.md` supersedes `docs/code-architecture.md`
- **Date:** 2026-06-26
- **Status:** accepted
- **Context:** `code-architecture.md` predates the current code (described single-call, sequential, no-pagination design).
- **Decision:** Keep the old file for history but mark it `superseded`; treat `reference/architecture.md` + `CLAUDE.md` as truth.
- **Consequences:** No history lost; one clear current source.
- **Task:** `2026-06-26-01-docs-traceability-framework`

---

## Template
```
## ADR-NNNN — <title>
- Date: YYYY-MM-DD
- Status: proposed | accepted | superseded by ADR-MMMM
- Context: <forces at play>
- Decision: <what we chose>
- Consequences: <trade-offs, what becomes easier/harder>
- Task: <task-id>
```
