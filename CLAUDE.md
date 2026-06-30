# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and any other agent when working with code in this repository.

## What this is

WDD (a.k.a. "AI-Music") turns a free-text mood prompt into a curated playlist. A FastAPI backend asks OpenAI for songs, enriches each with album art / 30s previews / links from Deezer, and returns them. A React + Vite frontend renders the playlist; Supabase provides auth, favorites, and recommendation history.

---

## ⚠️ Working Agreement — Task Lifecycle (READ FIRST, BINDING)

**Every unit of work on this repo follows a plan → execute → report lifecycle, recorded as version-controlled Markdown under [`docs/`](docs/). This is mandatory, not optional.** Full spec: [`docs/workflow.md`](docs/workflow.md).

For **every task** you are given:

1. **Plan first.** Assign a Task ID `YYYY-MM-DD-NN-slug`, create `docs/tasks/<task-id>/`, and write `plan.md` from [`docs/templates/plan.md`](docs/templates/plan.md) **before changing anything**. It must state: **Goal**, **Non-goals**, **Context**, and the **Plan as a checklist**.
2. **Execute.** Do the work. Deviations from the plan are allowed but **must be recorded** (never silent).
3. **Report after.** Write `report.md` from [`docs/templates/report.md`](docs/templates/report.md): the **same checklist now ticked**, what was done (with `file:line` refs), **deviations** (with reasons), **tests/verification run**, and **performance vs. [baselines](docs/performance/baselines.md)** (state explicitly whether anything regressed).
4. **Register.** Add/update the task in [`docs/registers/task-register.md`](docs/registers/task-register.md).

Conventions: timestamps are ISO-8601 with offset (e.g. `2026-06-26T17:39+02:00`); status vocabulary is `planned → in-progress → done/partial/blocked → superseded`; point-in-time docs (reports, audits) are **never edited after sign-off — supersede them**. ("MD5" in the original request means Markdown `.md`; an optional `Artifact SHA` field exists in the report template for true file hashing.)

**When in doubt, read [`docs/README.md`](docs/README.md) — it is the index to everything.** Always record tests in [`docs/registers/test-log.md`](docs/registers/test-log.md) and structural decisions in [`docs/registers/decision-log.md`](docs/registers/decision-log.md).

---

## Commands

### Backend (run from `backend/`)
```bash
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
fastapi dev main.py                                # dev server → http://127.0.0.1:8000
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}   # what start.sh / Docker runs
```
- Docker: `docker build -t ai-music-backend .` then `docker run --env-file .env -p 8000:8000 ai-music-backend`. (Note: the `Dockerfile` `EXPOSE`s 8001 and the README mixes 8000/8001, but the actual listen port is `$PORT`, defaulting to 8000 — that is the source of truth. See [`docs/reference/infrastructure.md`](docs/reference/infrastructure.md).)
- No test framework is configured (`requirements.txt` has no pytest). `backend/scratch/test_personalization.py` is a standalone script with mocked Supabase, run manually: `python scratch/test_personalization.py`.

### Frontend (run from `frontend/`)
```bash
bun install            # bun.lock is committed; npm install also works
bun run dev            # → http://localhost:5173
bun run build          # tsc -b && vite build
bun run lint           # eslint
```
No frontend test runner is configured.

## Environment setup (read this before running)

- **`frontend/.env` needs `VITE_API_URL`** (e.g. `VITE_API_URL=http://127.0.0.1:8000`) — `lib/recommendations-service.ts` reads it, but it is **missing from `frontend/.env.example`**. Without it, API calls go to `undefined/recommend`.
- Frontend also needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or `VITE_SUPABASE_PUBLISHABLE_KEY`).
- Backend needs `OPENAI_API_KEY`, `SUPABASE_URL`, and a key (`SUPABASE_SERVICE_ROLE_KEY` preferred, else `SUPABASE_ANON_KEY`). If those are absent, `services/supabase_service.py` falls back to parsing `frontend/.env` directly.
- Supabase tables (`favorites`, `recommendation_history`) and their RLS policies must be created by hand from `supabase/*.sql` before login/favorites/history work. The `favorites` table schema is in the README (not in a migration file).

> Full, authoritative env/deploy/port reference: [`docs/reference/infrastructure.md`](docs/reference/infrastructure.md).

## Architecture

> The detailed, current architecture also lives in [`docs/reference/architecture.md`](docs/reference/architecture.md) (kept in sync). The summary below is the quick reference.

### The recommendation pipeline (the core flow)
Spread across `main.py` → `ai_service.py` → `cache_service.py` + `deezer_service.py`:

1. `POST /recommend` (unauthenticated) takes `{ client_mood, user_id?, cursor?, limit }`.
2. **First page (`cursor` is null):** `_generate_raw_recommendations()` calls OpenAI (`gpt-4o-2024-08-06`, hardcoded) with a strict JSON-schema `response_format` to get **50** raw songs (artist/title/genre/reason only). The full 50 are stored in an **in-memory** `RecommendationCache` under a new `session_id` UUID; only the first `limit` are enriched via Deezer and returned with `next_cursor = "{session_id}:{end_index}"`.
3. **Subsequent pages:** the cursor `"session_id:index"` slices the cached list and enriches that page. When the slice reaches the end, `next_cursor` is `null`.
4. Deezer enrichment runs in parallel via `ThreadPoolExecutor` (`enrich_songs_parallel`); a miss yields `null` media fields, never an error.

**Implication:** pagination state lives in process memory (30-min TTL, refreshed on access). It does **not** survive a restart and **breaks under multiple workers/instances** — a "load more" cursor created on one worker won't be found on another. `redis` is in `requirements.txt` but is **not** wired up.

### Personalization
When `user_id` is present, `services/context_service.py` builds an enriched prompt from the user's Supabase favorites + recent history (`build_personalized_prompt`). `GET /recommendations/for-you` uses `build_for_you_prompt` to generate 5 discovery picks with no mood. Both prompt builders instruct the model to avoid repeating favorited/recently-recommended songs; the actual aggregation/dedup happens in `get_user_context`.

### Two different auth paths (important)
- **Frontend ↔ Supabase directly:** auth, favorites (`lib/favorites-service.ts`), and history (`lib/history-service.ts`) all use the Supabase JS client from the browser, protected by **RLS**. The backend is not involved in these.
- **Frontend ↔ backend:** `/recommend` is **unauthenticated** and trusts the `user_id` in the request body (used only to personalize, reading Supabase via REST with the service/anon key). `/recommendations/for-you` **is** authenticated — it requires a Bearer token, validated by `get_current_user_id` → `get_user_from_token` against Supabase `auth/v1/user`.

### Frontend structure
- No router library. "Pages" are switched by `page` state in `App.tsx` (`home`/`favorites`/`history`/`song-detail`). State is **prop-drilled** from `App.tsx` (e.g. the entire `useFavorites` hook result is passed down).
- `context/AuthContext.tsx` is the one global provider (wraps `App` in `main.tsx`); everything else is local state + hooks (`useFavorites`, `useHistory`).
- Supabase client lives in `lib/superbase.ts` — **note the misspelled filename**; import from `@/lib/superbase`. It is lazily created and returns `null` when env vars are absent, so the app degrades gracefully instead of crashing.
- `@/` is aliased to `frontend/src` (`vite.config.ts` + `tsconfig`).
- UI is shadcn/ui + Tailwind v4; dark mode is forced (`App.tsx` adds the `dark` class on mount).

## Conventions & gotchas

- **API response key is capital `Playlist`** (`{ "Playlist": [...], "next_cursor": ... }`). The frontend `normalizePlaylist` maps it and derives `song.preview` from `preview ?? preview_url`; `SongCard` plays from that. Keep both `preview` and `preview_url` in mind when touching the `Song` type.
- Songs are identified app-wide by a case-insensitive `"{artist}::{title}"` key (frontend `getSongKey`, backend `_song_identity`) for favorite lookups and dedup. The `favorites` table enforces this with a `unique (user_id, artist, title)` constraint (Postgres error `23505` → "already in favorites").
- `ai_service.py` has a module-level `if __name__ == "__main__": print(get_music_recommendations("happy"))` — running the file directly **spends an OpenAI call**.
- Backend error handling favors logging + returning empty/`null` over raising, so a failed Deezer/OpenAI/Supabase call degrades silently — check terminal `print` output when results look empty.
- **Installed but unwired:** `redis`, `sentry-sdk`, `SQLAlchemy`, `psycopg2-binary` are in `requirements.txt` but never imported. Don't assume those capabilities exist. See [`docs/reference/dependencies.md`](docs/reference/dependencies.md).

## Docs

The project's documentation and traceability system lives in [`docs/`](docs/) — start at [`docs/README.md`](docs/README.md):
- **Process:** [`docs/workflow.md`](docs/workflow.md) (the binding task lifecycle) + [`docs/templates/`](docs/templates/).
- **Reference:** [`architecture`](docs/reference/architecture.md), [`dependencies`](docs/reference/dependencies.md), [`infrastructure`](docs/reference/infrastructure.md).
- **Audits:** [`docs/audits/`](docs/audits/) (start with the [architecture baseline](docs/audits/2026-06-26-architecture-baseline.md)).
- **Performance:** [`docs/performance/`](docs/performance/) (measurement rules + baselines + regression thresholds).
- **Registers:** [task-register](docs/registers/task-register.md), [decision-log](docs/registers/decision-log.md), [test-log](docs/registers/test-log.md).

> Legacy: `docs/code-architecture.md` is **superseded** — it predates the current code (single OpenAI-call, sequential-Deezer, no-pagination, hardcoded-URL design). Trust this file and `docs/reference/architecture.md`.
