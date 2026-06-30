# Performance — Baselines

> Status: `living` · Last updated: 2026-06-26
>
> Current reference numbers. A regression is judged against the **active** row for each metric
> using the thresholds in [`README.md`](README.md). Update only with a note + the task ID that
> changed it. Metric IDs are defined in [`README.md`](README.md).

## Active baselines
| Metric | Value | Captured | Env | Notes |
| :--- | :--- | :--- | :--- | :--- |
| M1 — `/recommend` first-page (cold) | _not yet measured_ | — | — | Capture in task `2026-06-26-06-test-harness`. Dominated by M3 (OpenAI). |
| M2 — `/recommend` next-page (cached) | _not yet measured_ | — | — | Should be ≈ M4 only (no OpenAI call). |
| M3 — OpenAI generation | _not yet measured_ | — | — | 50-song JSON-schema completion. |
| M4 — Deezer enrichment / page | _not yet measured_ | — | — | Parallel via ThreadPoolExecutor. |
| M5 — `/recommendations/for-you` | _not yet measured_ | — | — | Authenticated, 5 picks. |
| M6 — frontend build | _not yet measured_ | — | — | `bun run build`. |
| M7 — frontend bundle (gzip JS) | _not yet measured_ | — | — | From `dist/`. |

> **Status:** baseline table seeded but **empty** — no measurements exist yet because no test
> harness is wired (see audit finding F5). The first numbers should be captured by task
> `2026-06-26-06-test-harness` and recorded here.

## History
<Append a row whenever a baseline changes. Never delete history.>

| Date | Metric | Old → New | Task | Reason |
| :--- | :--- | :--- | :--- | :--- |
| 2026-06-26 | — | (seeded) | 2026-06-26-01 | Table created; no measurements yet. |
