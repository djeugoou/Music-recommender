# Audits Register

> Status: `living` · Last updated: 2026-06-27
>
> Every audit performed on WDD, **classified**. An audit *assesses*; it does not change code.
> Findings become tasks (see [`../registers/task-register.md`](../registers/task-register.md)).

## Classifications
| Class | Looks at |
| :--- | :--- |
| `architecture` | structure, coupling, scalability, correctness of design |
| `security` | auth, secrets, input handling, RLS, exposure |
| `performance` | latency, throughput, regressions vs. [baselines](../performance/baselines.md) |
| `dependency` | package health, unused/duplicated/outdated/vulnerable deps |

## Register
| Date | Audit | Class | Status | Key findings | Spawned tasks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-06-26 | [architecture-baseline](2026-06-26-architecture-baseline.md) | architecture | `point-in-time` | 6 findings (1 high, 3 med, 2 low) | 2026-06-26-02 … 07 (to file) |
| 2026-06-27 | [constitution-conformance](2026-06-27-constitution-conformance.md) | architecture* | `point-in-time` | 8 doc findings + 9 code findings (1 high, 5 med, rest low/info) | 2026-06-27-01 (migration) + 02 … 06 (to file) |

> \* Cross-cutting (documentation/governance + security + code-quality + testing). The class set above lacks `documentation`/`code-quality` — finding DOC-8 proposes adding them; see task `2026-06-27-01`.

## How to add an audit
1. Copy [`../templates/audit.md`](../templates/audit.md) to `docs/audits/<YYYY-MM-DD-class-slug>.md`.
2. Fill it in; keep it point-in-time (don't edit after sign-off — supersede instead).
3. Add a row above.
4. File the recommended tasks in the task register and link them back.
