# Roadmap — WDD (AI-Music)

> Status: `living` · Last updated: 2026-06-27 · Owner: engineering
>
> **This is not a specification.** It is a living document describing direction, not a contract.
> Items move between sections, get reprioritized, or are dropped as the system and its constraints
> change. Only the **Current State** section describes what actually exists today; everything below
> it is intent of decreasing certainty.

---

## How to read this document

| Confidence level | Section | Meaning |
| :--- | :--- | :--- |
| **Done** | Current State | Implemented and in production. |
| **Committed** | Near-Term | Decided; tracked as tasks in [`registers/task-register.md`](registers/task-register.md). |
| **Flexible** | Medium-Term | Likely, but scope/timing unconfirmed. May change. |
| **Exploration** | Ideas | Concepts only. No commitment that these ship. |
| **Engineering** | Technical Evolution | Cross-cutting platform work that enables the above. |
| **Out of scope** | Non-Goals | Deliberately not pursued right now. |

Where a roadmap item maps to a concrete task, the **Task ID** is cited. New work should still follow
the [task lifecycle](workflow.md) (plan → execute → report); this roadmap is the *why/when*, the task
register is the *what/status*.

---

## 1. Vision

WDD turns a free-text description of how someone feels into a curated, playable playlist, and learns
from each user's favorites and history to make better suggestions over time. The long-term aim is a
dependable personalization layer over existing music catalogs — strong at *discovery from intent*
rather than catalog ownership or playback. Growth is measured by recommendation relevance and system
reliability, not feature count.

---

## 2. Current State (Completed)

Implemented and deployed today.

**Core recommendation pipeline**
- `POST /recommend` (unauthenticated): mood prompt → 50 raw songs via OpenAI `gpt-4o-2024-08-06` with a strict JSON-schema response.
- In-memory pagination cache: full 50 cached under a session UUID; `next_cursor = "session:index"` pages through them (30-min TTL).
- Deezer enrichment in parallel (`ThreadPoolExecutor`): album art, 30s preview, track link; misses degrade to `null` media, never errors.
- `GET /recommendations/for-you` (authenticated): 5 discovery picks from the user profile, no mood needed.

**Personalization**
- Prompt enrichment from Supabase favorites + recent history, with de-duplication and avoid-repeat instructions.

**Auth, favorites, history**
- Supabase Auth (email/password) via the browser client.
- Favorites with a `unique (user_id, artist, title)` constraint; recommendation history persisted.
- Row Level Security on user tables; frontend ↔ Supabase is direct, backend is not in that path.

**Frontend**
- React 19 + Vite + TypeScript + Tailwind v4 + shadcn/ui; pages: home / favorites / history / song-detail; in-card 30s audio playback.

**Platform & process**
- Backend on Render, frontend on Vercel; CORS configured for the deployed origin.
- Documentation & traceability system under [`docs/`](README.md) (plan→report lifecycle, registers, audits, performance baselines).

---

## 3. Near-Term (Committed Improvements)

Decided work that directly hardens or extends what already exists. Each is tracked in the
[task register](registers/task-register.md).

**Security & correctness**
- Authorize and validate `/recommend`: stop trusting a client-supplied `user_id`, bound `limit` and `client_mood`, move CORS origins to configuration. — `2026-06-27-02`
- Make the database schema reproducible (migration for `favorites`) and guard the `ai_service` `__main__` foot-gun. — `2026-06-26-07`

**Stability & operability**
- Replace `print` debugging with structured logging; stop silent failure swallowing so errors are observable and actionable. — `2026-06-27-03`
- Centralize configuration (model id, worker count, cache TTL, page limits, CORS) in a settings module instead of scattered literals. — `2026-06-27-04`
- Dependency hygiene: wire-or-remove installed-but-unused packages; deduplicate. — `2026-06-26-03`
- Fix deployment discrepancies: Docker `EXPOSE`/port, and add `VITE_API_URL` to `frontend/.env.example`. — `2026-06-26-04`, `2026-06-26-05`

**Quality & UX**
- First automated tests: backend route tests (pytest) + frontend component tests (Vitest); capture initial performance baselines. — `2026-06-26-06`
- Code cleanup: DRY the prompt builders, drop the `frontend/.env` parsing fallback, PEP8/typing fixes. — `2026-06-27-05`, `2026-06-27-06`
- Surface backend failures in the UI (clear empty/error states) instead of silent empty playlists.

---

## 4. Medium-Term (Planned but Flexible)

Likely directions; scope and order are not fixed.

- **Pagination durability:** back the session cache with Redis so "load more" survives restarts and works across multiple workers/instances (`redis` is already a dependency, currently unwired). High-value once the backend scales past one instance. — relates to `2026-06-26-02`
- **External-call resilience:** timeouts, retries with backoff, and basic circuit-breaking around OpenAI and Deezer; per-user rate limiting on `/recommend` to control cost and abuse.
- **Recommendation quality:** prompt/context-engineering iteration, lightweight evaluation of relevance, and tunable diversity vs. familiarity.
- **User preference modeling:** richer signals (explicit likes/dislikes, skip behavior) feeding the personalization context beyond favorites + history.
- **Frontend evolution:** introduce a lightweight state manager (e.g. Zustand) to reduce prop-drilling; generate TypeScript types from the FastAPI OpenAPI schema to keep the contract in sync.
- **Reliability/observability groundwork:** see [Technical Evolution](#6-technical-evolution).

---

## 5. Exploration / Ideas (Not committed)

Concepts under consideration only. **None of these are planned or guaranteed.** They are recorded so
the idea space is visible, not to imply delivery.

### Music recognition (Shazam-like)
- **Concept:** identify a playing track from a short audio sample and offer to add it / seed recommendations.
- **Possible approaches:** client-side fingerprinting, or a third-party recognition API; privacy and licensing must be assessed first.
- **Current status:** exploration.

### Artist news & events aggregation
- **Concept:** surface releases, tours, and events for artists a user favorites.
- **Possible approaches:** integrate a music-metadata/events provider; cache and schedule refreshes as background jobs.
- **Current status:** exploration.

### Social / sharing features
- **Concept:** share a generated playlist or follow other users' discoveries.
- **Possible approaches:** shareable read-only playlist links first; social graph only if there is real demand.
- **Current status:** exploration.

### Advanced AI personalization
- **Concept:** an embedding-based taste model (vector profile of a user) to drive recommendations beyond prompt context.
- **Possible approaches:** pgvector on Supabase, periodic profile recomputation, hybrid retrieval + LLM re-ranking.
- **Current status:** exploration.

### Playlist export to streaming services
- **Concept:** export a generated playlist to Spotify / Apple Music.
- **Possible approaches:** OAuth per provider, mapping Deezer/AI results to provider catalog IDs.
- **Current status:** exploration.

### Multi-model / multi-provider AI routing
- **Concept:** route generation across models/providers for cost, quality, or availability.
- **Possible approaches:** a provider abstraction with fallbacks and per-request model selection.
- **Current status:** exploration.

---

## 6. Technical Evolution

Cross-cutting engineering work that enables the roadmap. Pursued as the system grows; not all of it is
needed at current scale.

- **Stateless, horizontally scalable backend:** externalize the pagination/session state (Redis) so the API can run multiple workers/instances behind a load balancer.
- **Observability:** structured logs, then error/performance monitoring (`sentry-sdk` is installed but uninitialized — a natural first step), plus request tracing and basic metrics.
- **Caching strategy:** Redis-backed session cache first; later, cache Deezer lookups and consider short-TTL caching of common mood results to cut latency and external calls.
- **Background jobs:** offload non-request work (e.g. precomputing "for-you", refreshing artist/event data, profile recomputation) to a scheduler/worker.
- **AI pipeline improvements:** a model/provider abstraction, response caching, optional streaming, and an evaluation harness to measure recommendation quality across prompt/model changes.
- **Database optimization:** real migrations as the source of truth, appropriate indexes on `favorites`/`recommendation_history`, and query review as data grows; consider pgvector if embedding personalization is pursued.
- **Test & performance maturity:** grow from initial route/component tests toward meaningful coverage and recorded [performance baselines](performance/baselines.md), wired into the workflow.

---

## 7. Explicit Non-Goals

What WDD is deliberately **not** doing right now, to prevent scope creep:

- **Not building its own auth or identity system** — Supabase Auth is the system of record.
- **Not hosting or streaming full-length audio** — playback is limited to Deezer's 30s previews (licensing/cost).
- **Not a native mobile app** — responsive web only for now.
- **Not real-time/collaborative features** (live shared sessions, presence, chat).
- **Not training or fine-tuning custom ML models** — the product uses hosted models via API.
- **Not multi-tenant / enterprise / team workspaces.**
- **Not an offline-first or fully self-hostable distribution** — it targets the current managed stack (Render + Vercel + Supabase + OpenAI + Deezer).

---

_Revisit this roadmap whenever priorities shift. Move items between sections rather than rewriting
history; record any structural product decision as an ADR in [`registers/decision-log.md`](registers/decision-log.md)._
