# Audit — architecture · Baseline structural assessment

| Field | Value |
| :--- | :--- |
| Audit ID | `2026-06-26-architecture-baseline` |
| Classification | `architecture` |
| Status | `point-in-time` |
| Date | `2026-06-26T17:39+02:00` |
| Auditor | Claude (Opus 4.8), senior-engineer review |
| Scope | Repo structure, backend pipeline, frontend structure, deployment, dependencies. **Excluded:** runtime profiling, security pen-test, dependency CVE scan (each its own future audit). |

---

## Summary
WDD is a **clean, comprehensible two-tier app** (FastAPI backend + React/Vite frontend + Supabase) with a well-factored backend pipeline (clear separation: routing → AI → cache → enrichment). It is **functional and readable**. The main structural risks are **state that lives in process memory** (pagination cache) and a set of **installed-but-unwired dependencies** that imply capabilities the system doesn't actually have. None are critical; all are improvable through tracked tasks. The codebase is in good shape to adopt the new traceability process.

## Method
- Enumerated the source tree excluding `venv`/`node_modules`/`.git` (PowerShell).
- Read `backend/requirements.txt`, `frontend/package.json`, `Dockerfile`, `start.sh`, `.env.example` (both), `README.md`, and the existing `CLAUDE.md`.
- Grepped `backend/**/*.py` for actual imports to separate *used* from *merely installed* packages.
- Cross-checked README/Dockerfile claims against `start.sh` for ground truth.

## Findings
| # | Severity | Finding | Evidence | Impact |
| :--- | :--- | :--- | :--- | :--- |
| F1 | **high** | Pagination/session state is in-memory only; `redis` installed but unwired. | `backend/services/cache_service.py`; `redis==7.4.0` present, no `import redis` | "Load more" breaks across restarts and multiple workers/instances. Blocks horizontal scaling. |
| F2 | medium | Four packages installed but never imported (`redis`, `sentry-sdk`, `SQLAlchemy`, `psycopg2-binary`); `psycopg2-binary` also duplicated. | grep of `backend/**/*.py`; `requirements.txt:27-28` | Implies non-existent capabilities (observability, ORM, caching); bloats image; confuses readers. |
| F3 | medium | Deploy config disagrees with reality: `EXPOSE 8001` + README `-p 8001:8001`, but app listens on `$PORT` (default 8000). | `Dockerfile:19`, `README.md` Docker section vs `start.sh:3` | Following the README yields an unreachable container. |
| F4 | medium | `VITE_API_URL` is required but missing from `frontend/.env.example`. | `frontend/.env.example` (only Supabase vars); `lib/recommendations-service.ts` reads it | New setups silently call `undefined/recommend`. |
| F5 | low | No automated tests; no test framework wired (`requirements.txt` has no pytest; frontend has no runner). | `requirements.txt`; `package.json` scripts | No regression safety net; changes verified manually. |
| F6 | low | `favorites` table schema lives only in README prose, not a migration; `ai_service.py` has a `__main__` block that spends a real OpenAI call if run directly. | `README.md` schema; `ai_service.py` `__main__` | Schema not reproducible; foot-gun for anyone running the file. |

## Recommendations → tasks
| Finding | Recommended action | Proposed task |
| :--- | :--- | :--- |
| F1 | Wire `cache_service` to Redis behind an interface (in-memory fallback for single-instance dev). | `2026-06-26-02-wire-redis-cache` |
| F2 | Decide per package: wire up `sentry-sdk` (observability) or remove the four unused deps; dedupe `psycopg2`. | `2026-06-26-03-dependency-cleanup` |
| F3 | Fix `EXPOSE`→`8000` (or templated) and correct README Docker commands. | `2026-06-26-04-fix-docker-port` |
| F4 | Add `VITE_API_URL` to `frontend/.env.example` with a sensible default + comment. | `2026-06-26-05-env-example-api-url` |
| F5 | Introduce pytest (backend route tests) + Vitest (frontend) and a baseline test run; record in [test-log](../registers/test-log.md). | `2026-06-26-06-test-harness` |
| F6 | Add `favorites` migration SQL under `supabase/`; guard `ai_service.py __main__`. | `2026-06-26-07-schema-and-guards` |

> Proposed task IDs are **reserved, not yet executed.** Each must get its own `plan.md`/`report.md` when picked up.

## What is healthy (do not "fix")
- **Backend pipeline separation** is clean: `main.py` (routing/auth) → `ai_service.py` (LLM) → `cache_service.py` (paging) → `deezer_service.py` (enrichment). Keep this shape.
- **Parallel Deezer enrichment** via `ThreadPoolExecutor` already addresses the old README's "make it async" suggestion.
- **Graceful degradation** is consistent and deliberate (null media, `null` Supabase client, silent-but-logged failures). Intentional, not a bug.
- **Strict JSON-schema `response_format`** for OpenAI is a solid, modern choice for structured output.
- **Frontend** is small and legible; prop-drilling is a known trade-off (documented in README roadmap → Zustand), acceptable at current size.
