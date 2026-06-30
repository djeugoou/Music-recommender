# WDD Documentation & Traceability System

> Single source of truth for **what was done, why, and whether it regressed**.
> Every change to this project flows through the lifecycle defined in [`workflow.md`](workflow.md).

This folder is designed so that **any agent or engineer can be dropped in cold** and reconstruct the full history and current state of the project without re-reading the entire codebase.

---

## How to navigate

| If you want to… | Go to |
| :--- | :--- |
| Understand the rules for doing work here | [`workflow.md`](workflow.md) |
| Start a new task | Copy [`templates/plan.md`](templates/plan.md) into a new `tasks/<task-id>/` folder |
| See everything that has ever been done | [`registers/task-register.md`](registers/task-register.md) |
| Understand the current architecture | [`reference/architecture.md`](reference/architecture.md) |
| Know what a package is for / why it's installed | [`reference/dependencies.md`](reference/dependencies.md) |
| Deploy / configure env / Docker / Supabase | [`reference/infrastructure.md`](reference/infrastructure.md) |
| Read audits (architecture/security/perf/deps) | [`audits/README.md`](audits/README.md) |
| Check performance baselines & regressions | [`performance/README.md`](performance/README.md) |
| See why a structural decision was made | [`registers/decision-log.md`](registers/decision-log.md) |
| Find a recorded test run + its result | [`registers/test-log.md`](registers/test-log.md) |

---

## Folder map

```
docs/
├── README.md            ← you are here: index + how to navigate
├── workflow.md          ← the binding task lifecycle (plan → execute → report)
├── templates/           ← copy these to start a plan / report / audit
├── tasks/               ← one folder per task: <task-id>/plan.md + report.md
├── audits/              ← classified audits (architecture | security | performance | dependency)
├── reference/           ← living, accurate reference docs (architecture, deps, infra)
├── performance/         ← perf measurement rules + baseline tables + regression log
└── registers/           ← living indexes: task-register, decision-log, test-log
```

---

## The one rule

**No work without a plan; no plan closed without a report.**

1. Before touching anything, write `tasks/<task-id>/plan.md` (goal, non-goals, plan-as-checklist).
2. Do the work.
3. Write `tasks/<task-id>/report.md` (tick the checklist, record deviations, record tests + performance).
4. Update [`registers/task-register.md`](registers/task-register.md).

Full details and the rationale are in [`workflow.md`](workflow.md).

---

## Document status legend

Used in the header of every doc in this system:

| Status | Meaning |
| :--- | :--- |
| `living` | Kept current; update it when reality changes. |
| `point-in-time` | A snapshot (e.g. an audit/report); never edited after sign-off, only superseded. |
| `superseded` | Replaced by a newer doc; kept for history. Header links to the replacement. |

_Maintained by the WDD engineering process. Created 2026-06-26._
