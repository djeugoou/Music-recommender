# Plan — 2026-07-01-01-fix-cors-production · Fix production CORS 400 on OPTIONS preflight

| Field | Value |
| :--- | :--- |
| Task ID | `2026-07-01-01-fix-cors-production` |
| Status | `in-progress` |
| Opened | `2026-07-01T00:00+02:00` |
| Author | Claude Code |
| Requested by | User (production debugging) |

---

## Goal

The Render backend returns `400 "Disallowed CORS origin"` on every OPTIONS preflight from the Vercel frontend. After the fix, the backend should respond `200` to valid preflights and CORS headers should be present on `/recommend` responses.

## Non-goals

- Redesigning the application or CORS architecture.
- Rewriting the frontend or backend.
- Adding authentication to `/recommend`.
- Introducing new frameworks or libraries.
- Fixing backlog item `2026-06-27-02` (full secure-endpoint work) — this fix is narrowly scoped to unblock production.

## Context

- **Mechanism confirmed:** Starlette's `CORSMiddleware` returns exactly `HTTP 400` with body `"Disallowed CORS origin"` when the preflight's `Origin` header does not exactly match any entry in `allow_origins`. With `allow_methods=["*"]` and `allow_headers=["*"]`, an origin mismatch is the only thing that can produce this `400`.
- **Hardcoded origins** in `backend/main.py:12-19` include `https://music-recommender-lime.vercel.app`, but the actual production Vercel URL is not confirmed (user provided the backend request URL from DevTools rather than the `Origin` header value — the real URL could differ, e.g. a different Vercel project slug or a branch preview URL).
- **Why env-driven:** hardcoding the URL requires a code deploy every time the Vercel URL changes (e.g. project rename, new preview). Reading from `ALLOWED_ORIGINS` env var lets the operator correct the URL via Render's dashboard with zero code change. This also partially closes the concern in backlog task `2026-06-27-02-secure-recommend-endpoint` ("env-driven CORS").
- Affected file: `backend/main.py:12-27`.
- Related: [infrastructure.md](../../reference/infrastructure.md), backlog task `2026-06-27-02`.

## Plan (checklist)

- [ ] Add `import os` to `backend/main.py`.
- [ ] After the hardcoded `origins` list, read `ALLOWED_ORIGINS` env var (comma-separated), strip whitespace, skip empty tokens, skip duplicates, and extend `origins`.
- [ ] Remove the trailing-slash duplicate `"https://music-recommender-lime.vercel.app/"` (it is unreachable — browsers never send `Origin` with a trailing slash — and its presence could mislead operators reading the list).
- [ ] Write `report.md`.
- [ ] Update `docs/registers/task-register.md`.
- [ ] Update `docs/registers/test-log.md`.

## Risks & rollback

| Risk | Likelihood | Mitigation / how to roll back |
| :--- | :--- | :--- |
| `ALLOWED_ORIGINS` not set in Render → same 400 | high (intentional: user must set it) | User adds `ALLOWED_ORIGINS=<vercel-url>` in Render dashboard; no code change needed |
| Wrong value set → continues to 400 | low | Operator can read `Origin` from DevTools correctly; update env var |
| Removing trailing-slash entry causes regression | very low | It never matched anything (browsers send no trailing slash); removing it changes nothing functional |

## Test & performance intent

- Verification: manually test `OPTIONS /recommend` from browser after deploying with correct `ALLOWED_ORIGINS` value.
- No performance metrics are relevant (CORS middleware is pre-route, negligible cost).
- No test framework configured; manual check + Render logs are the verification path.
