# Audit — architecture · Engineering-Constitution conformance

| Field | Value |
| :--- | :--- |
| Audit ID | `2026-06-27-constitution-conformance` |
| Classification | `architecture` *(cross-cutting — spans documentation/governance, security, code-quality, testing; see DOC-7 on taxonomy)* |
| Status | `point-in-time` |
| Date | `2026-06-27T00:00+02:00` |
| Auditor | Claude (Opus 4.8), Lead-Architect review |
| Scope | The repository assessed against the **Engineering Constitution** supplied 2026-06-27. Covers (A) documentation-structure conformance and (B) code & engineering-standards conformance. **Excluded:** runtime profiling, CVE scanning, and any code/structure *changes* (this audit only assesses; the [migration plan](../tasks/2026-06-27-01-constitution-alignment/plan.md) and spawned tasks do the work). |

---

## Summary

The repository is in **good health** and already satisfies a large share of the Constitution's *process* intent: the existing WDD traceability system ([`../workflow.md`](../workflow.md)) gives it a binding plan→execute→report lifecycle, immutable point-in-time docs, living reference docs, registers, and a seeded performance regime — much of which the Constitution also demands. The gaps are therefore **mostly additive**, not corrective:

- **Documentation:** 6 of the Constitution's 12 prescribed concern-areas have no first-class home (`api/`, `security/`, `database/`, `testing/`, `onboarding/`, `changelog/`), and architectural decisions live in one combined log rather than per-ADR files. Two top-level docs still link to a **superseded** file.
- **Code & engineering standards:** the codebase is small and readable, but diverges from the Constitution on **structured logging vs. `print`**, **silent failure handling**, **input validation / authorization on `/recommend`**, **centralized configuration vs. magic values**, and **DRY** in the prompt builders. None are critical; all are improvable through tracked tasks.

This audit confirms the repo is **ready to adopt the Constitution via an additive migration** that preserves every existing artifact. No finding requires deleting existing work.

## Method

- Read the entire `docs/` tree (README, workflow, templates, reference/{architecture,dependencies,infrastructure}, audits, performance, registers) and the existing [architecture-baseline audit](2026-06-26-architecture-baseline.md).
- Read backend source for evidence: `backend/main.py`, `ai_service.py`, `deezer_service.py`, `services/{supabase_service,context_service,cache_service}.py`.
- Read root governance/onboarding docs: `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` (presence), `docs/code-architecture.md` (superseded).
- Mapped each Constitution requirement to its current home (or absence) and recorded `file:line` evidence.
- **Did not** modify any file, run the app, or profile. Cross-references the prior baseline audit's findings F1–F6 instead of re-deriving them.

---

## Part A — Documentation-structure conformance

Crosswalk of the Constitution's prescribed taxonomy against the current `docs/`. Verdict legend: ✅ present · ◑ partial (exists but not as a first-class area / incomplete) · ❌ absent.

| Constitution area | Current home | Verdict | Evidence / gap |
| :--- | :--- | :--- | :--- |
| `architecture/` | `docs/reference/architecture.md` | ◑ | Strong content, single file not a folder. Keep file; surface under `architecture/` via crosswalk. |
| `api/` | — (README prose only) | ❌ | No endpoint/contract reference. Endpoints, request/response schemas, the capital-`Playlist` key, cursor format, auth-per-route all live in code + scattered prose. README roadmap even wants OpenAPI→TS types (`README.md:270`). |
| `deployment/` | `docs/reference/infrastructure.md` | ◑ | Covers Docker/Render/env/ports well. Map under `deployment/` via crosswalk. |
| `database/` | `supabase/*.sql` + `README.md:204-218` prose + infra doc | ❌ | No schema/ERD/migration reference. `favorites` schema is README prose only (baseline F6). |
| `security/` | — (notes in `CLAUDE.md` + architecture doc) | ❌ | No security doc despite two distinct auth paths and an unauthenticated `/recommend` that trusts a body `user_id`. See CODE-1. |
| `performance/` | `docs/performance/` | ✅ | Rules + seeded baselines present. Compliant. |
| `testing/` | `docs/registers/test-log.md` (rows only) | ❌ | A run-log exists; no testing *strategy* doc (what/how/coverage targets/edge cases). Harness itself is baseline F5. |
| `decisions/` | `docs/registers/decision-log.md` (ADR-0001/0002) | ◑ | ADRs exist but as one combined log. Constitution wants per-ADR files with **Context / Problem / Alternatives considered / Decision / Consequences / Status** — current format omits explicit *Problem* and *Alternatives*. |
| `tasks/` | `docs/tasks/` | ✅ | Per-task plan+report folders. Compliant. |
| `audits/` | `docs/audits/` | ✅ | Classified register + audits. Compliant. |
| `onboarding/` | `README.md` + `CONTRIBUTING.md` | ◑ | Good root docs, but no `docs/onboarding` entry and no "cold-start in N minutes" path that points at the docs system. |
| `changelog/` | — (git history only) | ❌ | No human-curated changelog. |

### Documentation findings

| # | Severity | Finding | Evidence | Impact |
| :--- | :--- | :--- | :--- | :--- |
| DOC-1 | medium | No API reference (`api/`). | `README.md` prose; no contract doc; `frontend/src/lib/recommendations-service.ts` is the de-facto spec | Contributors reverse-engineer endpoints/cursor/`Playlist` key from code; drift risk. |
| DOC-2 | medium | No security doc (`security/`). | two auth paths in `reference/architecture.md`; CODE-1/CODE-2 below | Security posture is tribal knowledge; no threat/authorization record. |
| DOC-3 | medium | No database reference (`database/`); schema in prose. | `supabase/*.sql`; `README.md:204-218` | Schema not reproducible/onboardable as a first-class doc (overlaps baseline F6). |
| DOC-4 | low | No testing strategy doc (`testing/`). | `registers/test-log.md` only | Run history exists; the *approach* (unit/route/component, edge cases, targets) is unrecorded. |
| DOC-5 | low | Decisions are one combined log, not per-ADR files; format lacks *Problem* + *Alternatives*. | `registers/decision-log.md:10-24,29-37` | Diverges from Constitution ADR format; harder to link/evolve a single decision. |
| DOC-6 | low | No curated changelog (`changelog/`); onboarding has no `docs/` entry. | repo root; `CONTRIBUTING.md` | Release/notable-change history only in git; new contributors not routed into the docs system. |
| DOC-7 | low | Two top-level docs link to the **superseded** `docs/code-architecture.md` as the canonical deep-dive. | `README.md:109`, `CONTRIBUTING.md:146` | Cold readers are sent to stale architecture (ADR-0002 marked it superseded). |
| DOC-8 | info | Audit classification taxonomy lacks `documentation`/`code-quality` classes. | `audits/README.md:9-14` | This very audit doesn't fit cleanly; future doc/code-quality audits have no class. |

---

## Part B — Code & engineering-standards conformance

Assessed against the Constitution's pillars (SOLID, DRY, KISS, separation of concerns, type safety, structured logging, no silent failures, no magic values, security/OWASP, no dead code). Severity = critical | high | medium | low | info.

| # | Severity | Finding | Evidence | Constitution pillar |
| :--- | :--- | :--- | :--- | :--- |
| CODE-1 | **high** | `/recommend` is unauthenticated and trusts the body `user_id`, which drives Supabase reads via a service-role key (RLS-bypassing). Any caller can supply any `user_id`. | `main.py:61-70` (no auth dep) → `ai_service.get_music_recommendations(..., request.user_id)` → `context_service.get_user_context` → `supabase_service.get_headers` uses `SUPABASE_SERVICE_ROLE_KEY` (`supabase_service.py:19,47-58`) | Security / OWASP A01 (broken object-level authorization). |
| CODE-2 | medium | No input validation/bounds on request fields. `limit` accepts negative/huge ints; `client_mood` is unbounded free text sent straight into the OpenAI prompt. | `main.py:29-33` (`limit: int = 10`, no `Field` constraints); `ai_service.py:148` interpolates mood; `context_service.build_personalized_prompt` | Input validation / OWASP / cost-control. |
| CODE-3 | medium | Unstructured logging via `print` throughout; no logging config/levels; a debug `print` dumps full responses per request. | `main.py:69`; `ai_service.py:72,94,124,130`; `supabase_service.py:71,86,101,118,126,139` | Structured logging. |
| CODE-4 | medium | Silent failures: broad `except Exception` returns empty/`None` everywhere, so OpenAI/Deezer/Supabase errors vanish from the response path. | `ai_service.py:71-73,93-98`; `supabase_service.py:85-87,117-119,138-140`; `deezer_service.py` has *no* error handling/`raise_for_status` (`deezer_service.py:9-16`) | "Avoid silent failures"; actionable errors. |
| CODE-5 | medium | Magic values scattered, no config module: model id, worker count, cache TTL, page/limit defaults, history/slice sizes are hardcoded. | model `"gpt-4o-2024-08-06"` `ai_service.py:51`; `max_workers=10` `ai_service.py:100`; `expiration_seconds=1800` `cache_service.py:11`; `limit` defaults; `[:5]/[:25]` `context_service.py:112-114`; CORS origins hardcoded `main.py:12-19` | No magic values / explicit configuration. |
| CODE-6 | low | DRY: `build_personalized_prompt` and `build_for_you_prompt` duplicate the favorite-artists/genres/recent-moods/avoidance section builders. | `context_service.py:138-172` vs `199-235` | DRY. |
| CODE-7 | low | Separation of concerns: backend reaches into `frontend/.env` and parses it by hand as a config fallback. | `supabase_service.py:22-41` | Separation of concerns / explicit dependencies. |
| CODE-8 | low | Type-safety/style gaps: API contract typed as `Dict[str, Any]`; `deezer_service.search_track` has no return type and unguarded dict access; PEP8 deviations despite CONTRIBUTING claiming PEP8 (`class User_mood`, double-spaced class defs, `Playlist:List[...]`). | `ai_service.py:14`; `deezer_service.py:3,25-29`; `main.py:29,35,43,44,60` | Type safety / readability. |
| CODE-9 | low | Dead-code/footgun: module-level `__main__` spends a real OpenAI call if the file is run directly. | `ai_service.py:180-181` | Dead code / no foot-guns (overlaps baseline F6). |

> **Cross-reference:** the prior [architecture-baseline audit](2026-06-26-architecture-baseline.md) already tracks in-memory cache/Redis (F1), unused deps (F2), Docker port (F3), missing `VITE_API_URL` (F4), no test harness (F5), schema-as-prose + `__main__` (F6). Those are **not** re-filed here; CODE-9 notes the `__main__` overlap.

---

## Recommendations → tasks

Documentation findings are addressed by the **migration task** itself; code findings become new backlog tasks. Proposed IDs are **reserved, not executed.**

| Finding(s) | Recommended action | Proposed task |
| :--- | :--- | :--- |
| DOC-1…DOC-8 | Hybrid/additive docs migration: add the missing concern areas, crosswalk existing docs, split ADRs, fix superseded links, expand classifications. | `2026-06-27-01-constitution-alignment` (this audit's [plan](../tasks/2026-06-27-01-constitution-alignment/plan.md)) |
| CODE-1, CODE-2 | Authorize/validate `/recommend`: derive `user_id` from a token (or scope service-role use), add `Field` bounds on `limit`/`client_mood`, drive CORS from env. | `2026-06-27-02-secure-recommend-endpoint` (to file) |
| CODE-3, CODE-4 | Introduce `logging` with structure/levels; remove debug `print`; stop swallowing errors silently (log + surface). | `2026-06-27-03-structured-logging` (to file) |
| CODE-5 | Add a `settings`/config module (pydantic-settings) for model, workers, TTL, limits, CORS. | `2026-06-27-04-config-module` (to file) |
| CODE-6, CODE-7 | DRY the prompt-section builders; remove the `frontend/.env` parsing fallback (document required backend env instead). | `2026-06-27-05-prompt-and-config-cleanup` (to file) |
| CODE-8, CODE-9 | PEP8 naming + return types + guard `__main__` (coordinate with baseline F6 task `2026-06-26-07`). | `2026-06-27-06-style-and-typing` (to file) |

> CODE-9 and baseline `2026-06-26-07-schema-and-guards` both touch the `__main__` guard — execute together to avoid conflict.

## What is healthy (do not "fix")

- **The existing WDD traceability system already meets most of the Constitution's process intent** — lifecycle, immutability, registers, templates, performance regime. The migration *extends* it; it must not replace it.
- **Backend pipeline separation** (routing → AI → cache → enrichment) is clean and already documented; keep the shape.
- **Parallel Deezer enrichment**, **strict JSON-schema `response_format`**, and **graceful media degradation** are deliberate, modern choices (per baseline audit) — not defects.
- **Root `README.md` / `CONTRIBUTING.md` / `CODE_OF_CONDUCT.md`** are thorough; onboarding work should *link to* and lightly augment them, not duplicate them.
