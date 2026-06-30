# Reference — Dependencies (Package Register)

> Status: `living` · Last updated: 2026-06-26
>
> Every package in the application's infrastructure: what it's for, and **whether it's actually
> used**. "Installed" ≠ "used" — this register makes the difference explicit so nobody assumes a
> capability exists (e.g. Redis caching) that isn't wired up.
>
> Sources of truth: `backend/requirements.txt` (UTF-16), `frontend/package.json`.
> Import facts verified by grepping `backend/**/*.py` on 2026-06-26.

---

## Backend — Python (`backend/requirements.txt`)

### Direct & used (imported in source)
| Package | Version | Role | Evidence |
| :--- | :--- | :--- | :--- |
| `fastapi` | 0.136.1 | Web framework / routing / CORS / auth deps | `main.py:1-3` |
| `pydantic` | 2.13.3 | Request/response models, JSON-schema for OpenAI | `main.py:4` |
| `openai` | 2.32.0 | GPT-4o client (`gpt-4o-2024-08-06`) | `ai_service.py:5` |
| `requests` | 2.34.2 | Deezer + Supabase REST calls | `deezer_service.py:1`, `services/supabase_service.py:3` |
| `python-dotenv` | 1.2.2 | Loads `.env` | `ai_service.py:6`, `supabase_service.py:4` |

### Runtime / server (used via CLI, not imported)
| Package | Version | Role |
| :--- | :--- | :--- |
| `uvicorn` | 0.46.0 | ASGI server (`uvicorn main:app …` in `start.sh`/Docker) |
| `fastapi-cli` | 0.0.24 | `fastapi dev main.py` dev server |

### ⚠️ Installed but NOT used (no import found — decide: wire up or remove)
| Package | Version | Intended role | Status |
| :--- | :--- | :--- | :--- |
| `redis` | 7.4.0 | Distributed pagination/session cache | **Unwired.** `cache_service.py` is in-memory only. This is the root cause of the multi-worker "load more" limitation. |
| `sentry-sdk` | 2.58.0 | Error/perf observability | **Not initialized.** No `sentry_sdk.init()` in source. |
| `SQLAlchemy` | 2.0.50 | ORM / direct Postgres | **Unused.** Data access goes through Supabase REST, not SQLAlchemy. |
| `psycopg2-binary` | 2.9.12 | Postgres driver | **Unused.** (Also **duplicated** in `requirements.txt`, lines 27–28.) |

> These four are tracked as follow-up tasks in [`../registers/task-register.md`](../registers/task-register.md): either wire them up intentionally or remove them to shrink the image and reduce confusion.

### Transitive / supporting (pulled in by the above; not directly imported)
`anyio`, `certifi`, `charset-normalizer`, `click`, `colorama`, `distro`, `dnspython`, `email-validator`, `greenlet`, `h11`, `httpcore`, **`httpx` 0.28.1** (HTTP core for `openai`), `httptools`, `idna`, `Jinja2`, `jiter`, `markdown-it-py`, `MarkupSafe`, `mdurl`, `pydantic-core`/`pydantic-extra-types`/`pydantic-settings`, `Pygments`, `python-multipart`, `PyYAML`, `rich`/`rich-toolkit`, `rignore`, `shellingham`, `sniffio`, `starlette` (FastAPI's ASGI toolkit), `tqdm`, `typer`, `typing-extensions`/`typing-inspection`, `urllib3`, `watchfiles`, `websockets`, `annotated-doc`/`annotated-types`, `fastapi-cloud-cli`, `fastar`.

> **Note:** `requirements.txt` is a flat `pip freeze`-style pin (no separation of direct vs transitive). A future task may split into `requirements.in` (direct) + compiled lockfile for clarity.

---

## Frontend — Node/Bun (`frontend/package.json`)

### Dependencies
| Package | Version | Role |
| :--- | :--- | :--- |
| `react` / `react-dom` | ^19.2.5 | UI library |
| `vite` (dev) | ^8.0.10 | Build/dev server |
| `typescript` (dev) | ~6.0.2 | Static typing |
| `@vitejs/plugin-react` (dev) | ^6.0.1 | React fast-refresh for Vite |
| `tailwindcss` + `@tailwindcss/vite` | ^4.3.0 | Utility-first CSS (v4) |
| `tw-animate-css` | ^1.4.0 | Tailwind animation utilities |
| `shadcn` | ^4.7.0 | UI component scaffolding (shadcn/ui) |
| `@base-ui/react` | ^1.4.1 | Headless UI primitives (shadcn base) |
| `class-variance-authority` | ^0.7.1 | Variant-based component styling |
| `clsx` | ^2.1.1 | Conditional className composition |
| `tailwind-merge` | ^3.6.0 | Dedup/merge Tailwind classes |
| `lucide-react` | ^1.14.0 | Icon set |
| `@fontsource-variable/geist` | ^5.2.8 | Geist variable font |
| `@supabase/supabase-js` | ^2.106.2 | Browser Supabase client (auth, favorites, history) |
| `axios` | ^1.16.0 | HTTP client → backend (`lib/recommendations-service.ts`) |

### Dev tooling
| Package | Version | Role |
| :--- | :--- | :--- |
| `eslint` + `@eslint/js` | ^10 | Linting (`bun run lint`) |
| `typescript-eslint` | ^8.58.2 | TS lint rules |
| `eslint-plugin-react-hooks` | ^7.1.1 | React hooks lint |
| `eslint-plugin-react-refresh` | ^0.5.2 | Fast-refresh lint |
| `globals` | ^17.5.0 | ESLint global definitions |
| `@types/node`, `@types/react`, `@types/react-dom` | — | Type definitions |

> Lockfile: `frontend/bun.lock` is committed (Bun is the primary package manager; `npm install` also works).

---

## External services (not packages, but part of the infrastructure)
| Service | Purpose | Auth | Notes |
| :--- | :--- | :--- | :--- |
| OpenAI | Playlist generation (GPT-4o) | `OPENAI_API_KEY` | Model hardcoded in `ai_service.py`. |
| Deezer | Album art / 30s preview / link | none (public REST) | Misses degrade to `null` media, never error. |
| Supabase | Auth + Postgres (favorites, history) + RLS | service-role/anon key (backend), anon key (frontend) | Tables created by hand from `supabase/*.sql`. |

See [infrastructure.md](infrastructure.md) for env vars and deployment.
