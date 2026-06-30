# Reference — Infrastructure

> Status: `living` · Last updated: 2026-06-26
>
> Deployment, configuration, ports, and environment. Where the README and Dockerfile disagree,
> **this file states the source of truth** and flags the discrepancy as a follow-up task.

---

## Runtime topology
```
[ Browser ] ──HTTPS──▶ [ Frontend static site (Vite build) ]
     │                          │
     │                          ├─ Supabase JS (auth/favorites/history, RLS)  ──▶ [ Supabase ]
     │                          └─ axios  ──▶ VITE_API_URL  ──▶ [ Backend (FastAPI/Uvicorn) ]
     │                                                                 ├─▶ OpenAI
     │                                                                 ├─▶ Deezer
     │                                                                 └─▶ Supabase REST
```

## Backend container

`backend/Dockerfile`:
- Base `python:3.12-slim`. *(Note: local dev `__pycache__` shows Python 3.13; the image pins 3.12 — keep in mind for version-specific behavior.)*
- Installs `requirements.txt`, copies source, `chmod +x start.sh`, runs `CMD ["./start.sh"]`.
- `start.sh`: `uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}`.

### ⚠️ Port — source of truth
| Place | Port | Correct? |
| :--- | :--- | :--- |
| `start.sh` (actual listen) | `${PORT:-8000}` → **8000** by default | ✅ **this is the truth** |
| `Dockerfile` `EXPOSE 8001` | 8001 | ❌ misleading — does not match listen port |
| `README.md` `docker run -p 8001:8001` | 8001 | ❌ won't reach the app (app listens on 8000 unless `PORT=8001` is set) |
| `README.md` health check `curl …:8000/health` | 8000 | ✅ matches truth |

**The app listens on `$PORT`, defaulting to 8000.** Filed as a follow-up task to fix `EXPOSE` + README. On Render/managed hosts, `$PORT` is injected — `start.sh` already honours it.

### Build & run (corrected)
```bash
cd backend
docker build -t ai-music-backend .
docker run --env-file .env -p 8000:8000 ai-music-backend   # maps to default $PORT=8000
curl http://localhost:8000/health
```

## Backend environment (`backend/.env`)
| Variable | Required | Purpose |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` | yes | GPT-4o calls |
| `SUPABASE_URL` | yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | preferred | Admin REST access (bypasses RLS) |
| `SUPABASE_ANON_KEY` | fallback | Used if service-role key absent |
| `PORT` | no | Listen port; defaults to 8000 |

> Fallback behavior: if Supabase vars are absent in the backend env, `services/supabase_service.py` parses `frontend/.env` directly. Template: `backend/.env.example`.

## Frontend environment (`frontend/.env`)
| Variable | Required | Purpose |
| :--- | :--- | :--- |
| `VITE_API_URL` | **yes** | Backend base URL (e.g. `http://127.0.0.1:8000`). Read by `lib/recommendations-service.ts`. |
| `VITE_SUPABASE_URL` | yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` *or* `VITE_SUPABASE_PUBLISHABLE_KEY` | yes | Public client key |

### ⚠️ `VITE_API_URL` is missing from `frontend/.env.example`
Without it, frontend API calls go to `undefined/recommend`. The example file only lists the Supabase vars. **Filed as a follow-up task** to add `VITE_API_URL` to `frontend/.env.example`.

## Supabase setup
- Tables `favorites` and `recommendation_history` + RLS policies must be created **by hand** before login/favorites/history work.
- SQL lives in `supabase/favorites-rls.sql` and `supabase/recommendation-history-rls.sql`.
- The `favorites` **table schema** itself is only in the README (not in a migration file) — it enforces `unique (user_id, artist, title)`. **Follow-up:** capture the schema as a real migration under `supabase/`.

## Known deployment notes
- **Single-instance assumption:** pagination cache is in-process (see [architecture.md](architecture.md)). Scaling beyond one worker/instance breaks "load more" cursors until Redis is wired up.
- CORS is enabled in `main.py` (recent commits: "Frontend CORS enabled", "CORS issue").
- Current branch context: `feature/docker-deployment`; recent work targeted Render deployment.

## Discrepancy summary (→ follow-up tasks)
| # | Discrepancy | Truth | Action |
| :--- | :--- | :--- | :--- |
| 1 | `EXPOSE 8001` / README `-p 8001:8001` | listens on `$PORT` (8000) | fix Dockerfile + README |
| 2 | `VITE_API_URL` missing from `frontend/.env.example` | it is required | add it |
| 3 | `favorites` schema only in README prose | should be reproducible | add migration SQL |
| 4 | `psycopg2-binary` duplicated in `requirements.txt` | one entry needed | dedupe |

These are tracked in [`../registers/task-register.md`](../registers/task-register.md).
