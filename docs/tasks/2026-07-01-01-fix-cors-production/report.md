# Report — 2026-07-01-01-fix-cors-production · Fix production CORS 400 on OPTIONS preflight

| Field | Value |
| :--- | :--- |
| Task ID | `2026-07-01-01-fix-cors-production` |
| Status | `done` |
| Plan | [`plan.md`](plan.md) |
| Started | `2026-07-01T00:00+02:00` |
| Completed | `2026-07-01T00:00+02:00` |
| Author | Claude Code |

---

## Checklist results

- [x] Add `import os` to `backend/main.py`.
- [x] After the hardcoded `origins` list, read `ALLOWED_ORIGINS` env var (comma-separated), strip whitespace, skip empty tokens, skip duplicates, and extend `origins`.
- [x] Remove the trailing-slash duplicate `"https://music-recommender-lime.vercel.app/"`.
- [x] Write `report.md`.
- [x] Update `docs/registers/task-register.md`.
- [x] Update `docs/registers/test-log.md`.

## What was done

- `backend/main.py:1` — added `import os`.
- `backend/main.py:20-26` (after the `origins` list) — added 5-line block that reads `ALLOWED_ORIGINS` from the environment, splits on commas, strips whitespace, and appends each unique non-empty token to `origins`. The block runs at module load time, before `add_middleware`.
- `backend/main.py` — removed `"https://music-recommender-lime.vercel.app/"` (trailing-slash variant). This entry was unreachable: browsers never send `Origin` with a trailing slash per RFC 6454.

## Deviations from plan

None.

## Tests & verification

| What | Command | Result | Test-log |
| :--- | :--- | :--- | :--- |
| Static: confirm env-var block present and correct | read `backend/main.py` | pass | [row](../../registers/test-log.md) |
| Static: confirm trailing-slash entry removed | grep `"https://music-recommender-lime.vercel.app/"` in main.py | pass (not found) | [row](../../registers/test-log.md) |
| Live: OPTIONS preflight unblocked | requires deploy to Render with `ALLOWED_ORIGINS` set to the actual Vercel URL | pending — see follow-ups | — |

No automated test framework exists (see task `2026-06-26-06-test-harness`). Live verification requires the operator to set `ALLOWED_ORIGINS` in Render's environment dashboard (see follow-ups).

## Performance

Not applicable — the change adds O(n) list extension at module startup (n = number of extra origins, typically 1). No measurable runtime cost. No baselines affected.

## Follow-ups

1. **Operator action required (unblocks production):** In Render → service environment variables, add `ALLOWED_ORIGINS=<exact-vercel-url>`. The exact URL must be read from:
   - Vercel dashboard → project → Deployments → the production deployment's URL, **or**
   - Browser DevTools → Network → failed OPTIONS request → Request Headers → `Origin` field (not the request URL column).
   - Example: `ALLOWED_ORIGINS=https://music-recommender-lime.vercel.app`
2. **Confirm `frontend/.env` is committed with correct `VITE_API_URL`** — currently `https://music-recommender-astx.onrender.com`, which Vercel bakes into the build. If this URL ever changes, `.env` (or Vercel's dashboard env config) must be updated.
3. **Backlog `2026-06-27-02`** (`secure-recommend-endpoint`) includes env-driven CORS as one of its items; this fix partially satisfies that. When that task is picked up, the operator-managed env var approach here should be preserved (or expanded) rather than reverted.

## Artifact SHA

| File | SHA-256 |
| :--- | :--- |
| `backend/main.py` | `319d04626a283169709786144d22be0069ace4136a7c2cfd96588755b76ca4a3` |
