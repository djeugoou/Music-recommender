# Reference — Architecture

> Status: `living` · Last updated: 2026-06-26
>
> Accurate, current description of how WDD works. **Supersedes** the older
> [`../code-architecture.md`](../code-architecture.md), which predates the present code
> (it described a single-OpenAI-call, sequential-Deezer, no-pagination design). Trust this file.

---

## What WDD is
A free-text **mood prompt → curated playlist** app.
- **Backend** (FastAPI) asks OpenAI for songs, enriches each via Deezer (album art / 30s preview / link), returns them.
- **Frontend** (React + Vite) renders the playlist.
- **Supabase** provides auth, favorites, and recommendation history.

## Components

| Component | Stack | Entry point |
| :--- | :--- | :--- |
| Backend API | FastAPI + Uvicorn, Python 3.13 | `backend/main.py` |
| AI orchestration | OpenAI `gpt-4o-2024-08-06` (hardcoded) | `backend/ai_service.py` |
| Music enrichment | Deezer REST | `backend/deezer_service.py` |
| Pagination cache | in-memory, 30-min TTL | `backend/services/cache_service.py` |
| Personalization | Supabase favorites + history | `backend/services/context_service.py`, `backend/services/supabase_service.py` |
| Frontend | React 19 + Vite 8 + TS 6 + Tailwind 4 + shadcn/ui | `frontend/src/App.tsx` |
| Auth/DB | Supabase (Postgres + RLS) | `frontend/src/lib/superbase.ts` *(filename misspelled on purpose — import from `@/lib/superbase`)* |

## The recommendation pipeline (core flow)
`main.py` → `ai_service.py` → `cache_service.py` + `deezer_service.py`:

1. `POST /recommend` (**unauthenticated**) takes `{ client_mood, user_id?, cursor?, limit }`.
2. **First page** (`cursor` null): `_generate_raw_recommendations()` calls OpenAI with a strict JSON-schema `response_format` for **50** raw songs (artist/title/genre/reason). All 50 are stored in an **in-memory** `RecommendationCache` under a new `session_id` UUID; only the first `limit` are Deezer-enriched and returned with `next_cursor = "{session_id}:{end_index}"`.
3. **Subsequent pages**: cursor `"session_id:index"` slices the cached list and enriches that page. At the end, `next_cursor` is `null`.
4. Deezer enrichment runs in parallel via `ThreadPoolExecutor` (`enrich_songs_parallel`); a miss yields `null` media fields, never an error.

> **Key implication (known limitation):** pagination state lives in **process memory**. It does **not** survive a restart and **breaks under multiple workers/instances** — a "load more" cursor created on one worker won't be found on another. `redis` is installed but **not wired up**. See [dependencies](dependencies.md) and the architecture audit.

## Personalization
- `user_id` present → `context_service.build_personalized_prompt` enriches the prompt from Supabase favorites + recent history; aggregation/dedup in `get_user_context`.
- `GET /recommendations/for-you` (**authenticated**) → `build_for_you_prompt`, 5 discovery picks, no mood.
- Both prompt builders instruct the model to avoid repeating favorited/recently-recommended songs.

## Two auth paths (important)
- **Frontend ↔ Supabase directly:** auth, favorites (`lib/favorites-service.ts`), history (`lib/history-service.ts`) use the Supabase JS client in the browser, protected by **RLS**. Backend not involved.
- **Frontend ↔ backend:** `/recommend` is **unauthenticated** and trusts `user_id` in the body (used only to personalize, reading Supabase via REST). `/recommendations/for-you` **is** authenticated — Bearer token validated by `get_current_user_id` → `get_user_from_token` against Supabase `auth/v1/user`.

## Frontend structure
- **No router library.** "Pages" switch via `page` state in `App.tsx` (`home`/`favorites`/`history`/`song-detail`). State is **prop-drilled** from `App.tsx`.
- `context/AuthContext.tsx` is the single global provider (wraps `App` in `main.tsx`). Everything else is local state + hooks (`useFavorites`, `useHistory`).
- Supabase client in `lib/superbase.ts` (misspelled filename) — lazily created, returns `null` when env vars absent (graceful degradation).
- `@/` → `frontend/src` (`vite.config.ts` + tsconfig). Dark mode forced (`App.tsx` adds `dark` class on mount).

## Cross-cutting conventions
- **API response key is capital `Playlist`**: `{ "Playlist": [...], "next_cursor": ... }`. Frontend `normalizePlaylist` maps it; `song.preview` derived from `preview ?? preview_url`.
- **Song identity** is a case-insensitive `"{artist}::{title}"` key (frontend `getSongKey`, backend `_song_identity`). `favorites` enforces it via `unique (user_id, artist, title)` (Postgres `23505` → "already in favorites").
- **Error handling favors logging + returning empty/null over raising** — failed Deezer/OpenAI/Supabase calls degrade silently; check terminal output when results look empty.
- `ai_service.py` has a module-level `if __name__ == "__main__": print(get_music_recommendations("happy"))` — running it directly **spends an OpenAI call**.

## Data flow diagram
```
Frontend (React+Vite)
   │  POST /recommend {client_mood, user_id?, cursor?, limit}
   ▼
Backend (FastAPI, main.py)
   ├─ context_service ──▶ Supabase (favorites + history)   [if user_id]
   ├─ ai_service ───────▶ OpenAI GPT-4o (50 songs, JSON schema)
   │                       └─ cache_service (in-memory, session_id)
   └─ deezer_service ───▶ Deezer (parallel enrichment, art/preview/link)
   ▼
{ "Playlist": [...], "next_cursor": "session:index"|null }
```

## See also
- [dependencies.md](dependencies.md) — what each package does and its status.
- [infrastructure.md](infrastructure.md) — Docker, Render, env vars, ports.
- [../audits/2026-06-26-architecture-baseline.md](../audits/2026-06-26-architecture-baseline.md) — baseline architecture audit + findings.
