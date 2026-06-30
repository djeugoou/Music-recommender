# Performance — Measurement & Regression Rules

> Status: `living` · Last updated: 2026-06-26
>
> How we measure WDD, what counts as a **regression**, and where results are recorded. Any task
> that touches runnable code must record performance per these rules in its report.

---

## Why
Traceability includes **performance over time**. A debugging agent must be able to open this folder
and answer: *"Is this slow now, or always? Did task X regress it?"* — without re-profiling from scratch.

## Metrics we track
| ID | Metric | How to measure | Unit |
| :--- | :--- | :--- | :--- |
| `M1` | `/recommend` first-page latency (cold) | wall-clock of `POST /recommend` with `cursor=null`, `limit=10` | ms |
| `M2` | `/recommend` next-page latency (cached) | wall-clock of `POST /recommend` with a valid cursor | ms |
| `M3` | OpenAI generation time | time around the OpenAI call in `ai_service._generate_raw_recommendations` | ms |
| `M4` | Deezer enrichment time (per page) | time around `enrich_songs_parallel` | ms |
| `M5` | `/recommendations/for-you` latency | wall-clock of the authenticated call | ms |
| `M6` | Frontend build time | `bun run build` total | s |
| `M7` | Frontend bundle size | `dist/` JS gzip size after build | KB |

> Add new metric IDs here as the system grows; never renumber existing ones (baselines reference them).

## How to measure (reproducible)
- **Backend latency:** use a fixed prompt (e.g. `"focused late-night coding"`) and `limit=10`. Run 3×, record median. Note whether OpenAI/Deezer were hit live (network variance — record it).
  ```bash
  # example, from a running backend
  curl -s -o /dev/null -w "%{time_total}\n" -X POST http://127.0.0.1:8000/recommend \
    -H "Content-Type: application/json" \
    -d '{"client_mood":"focused late-night coding","limit":10}'
  ```
- **Build/bundle:** `cd frontend && bun run build` (record total time and `dist` gzip size).
- Record **environment** with every measurement: machine, Python/Node version, live-vs-mocked external APIs.

## What counts as a regression
Compared to the current row in [`baselines.md`](baselines.md):
- **Latency (M1–M5):** > **20%** slower than baseline median **and** > 100 ms absolute → **REGRESSION**.
- **Build time (M6):** > **30%** slower → REGRESSION.
- **Bundle size (M7):** > **10%** larger → REGRESSION.
- Anything faster/smaller beyond these thresholds → **improvement**; update the baseline (with a note + the task ID that caused it).
- External-API variance (OpenAI/Deezer) must be called out — a "regression" caused purely by network is noted, not blamed on the change.

## Where results live
- Per-task numbers → that task's `report.md` "Performance" table.
- Rolling source of truth → [`baselines.md`](baselines.md).
- Every run is also logged in [`../registers/test-log.md`](../registers/test-log.md) (one row per run).

## Process
1. Before a perf-sensitive change: capture current numbers (or use the existing baseline).
2. After: re-measure, fill the report's Performance table, compute Δ, apply the thresholds above.
3. If improved/regressed intentionally, update `baselines.md` and note the task ID.
