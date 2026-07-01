# Test Log

> Status: `living` · Last updated: 2026-07-02
>
> One row per test/verification run, ever. Lets a debugging agent see what was checked, when,
> with what result, and any performance number — without re-running everything. Referenced from
> task reports. See [`../performance/README.md`](../performance/README.md) for measurement rules.

## Runs
| Date | Task | What | Command | Result | Perf metric (if any) | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-06-26T17:39+02:00 | 2026-06-26-01 | Verify backend imports (which deps are actually used) | `grep import in backend/**/*.py` | pass | — | Confirmed only fastapi/pydantic/openai/requests/dotenv imported; redis/sentry/sqlalchemy/psycopg2 not. |
| 2026-06-26T17:39+02:00 | 2026-06-26-01 | Verify port truth | read `Dockerfile`, `start.sh`, `README` | pass | — | Listen port = `$PORT` (8000); EXPOSE 8001 is wrong. |
| 2026-06-26T17:39+02:00 | 2026-06-26-01 | Verify env requirements | read both `.env.example` | pass | — | `VITE_API_URL` missing from `frontend/.env.example`. |
| 2026-07-01T00:00+02:00 | 2026-07-01-01 | Static: env-var block present and syntactically correct | read `backend/main.py` | pass | — | `os.environ.get("ALLOWED_ORIGINS")` block added after `origins` list, splits on comma, strips, deduplicates. |
| 2026-07-01T00:00+02:00 | 2026-07-01-01 | Static: trailing-slash origin entry removed | grep `"https://music-recommender-lime.vercel.app/"` in `backend/main.py` | pass (not found) | — | Browser never sends Origin with trailing slash; entry was unreachable. |
| 2026-07-02T01:24+02:00 | 2026-07-02-01 | Type-check + production build | `bun run build` (frontend/) | pass | M6 = 2.44s (no baseline to compare) | Only pre-existing >500kB chunk-size advisory, unrelated. |
| 2026-07-02T01:24+02:00 | 2026-07-02-01 | Lint parity before/after change | `bun run lint` via `git stash`/`git stash pop` | pass (identical) | — | 17 problems (14 errors, 3 warnings) both before and after; all pre-existing in `FavoritesPage.tsx`/`HomePage.tsx`, none in `App.tsx`. |
| 2026-07-02T01:24+02:00 | 2026-07-02-01 | Dev server boot | `bun run dev` | pass | — | Vite ready on `http://localhost:5173/`, no startup errors. |
| 2026-07-02T01:24+02:00 | 2026-07-02-01 | Static trace: reopen-different-history-entry restores correctly under persistent mount | read `HomePage.tsx:55-65` + `HistoryPage` remount/refetch behavior | pass (reasoned) | — | `initialMood`/`initialSongs` effects react to prop-reference change independent of mount. |
| 2026-07-02T01:24+02:00 | 2026-07-02-01 | Live click-through of navigation scenarios | — | **not executed by agent** | — | No browser-automation tool available in this session; handed to user. |
| 2026-07-02T01:35+02:00 | 2026-07-02-01 | Live click-through: generate playlist → navigate away → back to Discovery | manual, by user, at `http://localhost:5173` | pass | — | User confirmed "done and it worked." Not itemized per-scenario (reopen-different-entry, audio-pause not separately confirmed). |

## Note on automated tests
No automated test framework is wired yet (backend: no pytest; frontend: no runner). Verification to date is **manual/static** (reading source, grepping imports). Wiring real tests is task `2026-06-26-06-test-harness`; its run results land here.

## How to add a row
After any verification (automated *or* manual), append a row: date (ISO-8601), task ID, what you checked, exact command, result, any perf metric ID + value, and notes. Manual checks count — record them honestly.
