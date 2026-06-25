# Code Architecture — AI-Music

> **Last updated:** from repository source analysis  
> **MCP:** `user-mr-speech` (mr-speech) was unavailable in the authoring session — no live MCP tools were called.

---

## 1. Purpose

**AI-Music** turns a user’s **mood** into a **curated playlist** with album art, 30s previews, and Deezer links.

| Layer | Role |
|-------|------|
| Frontend | Collect mood, call API, show loading/errors/playlist |
| Backend | Orchestrate OpenAI + Deezer |
| OpenAI | Generate 10 songs (title, artist, genre, reason) as JSON |
| Deezer | Enrich each song with media metadata |

---

## 2. System diagram

```
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND  React + Vite  :5173                                │
│  Header → Hero (input) → PlaylistSection → SongCard[]        │
│  App.tsx: mood, songs, isLoading, errorMessage               │
└────────────────────────────┬─────────────────────────────────┘
                             │ POST /recommend
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ BACKEND  FastAPI  :8000                                      │
│  main.py → ai_service.py → deezer_service.py                 │
└──────────────┬─────────────────────────────┬───────────────┘
               ▼                             ▼
        ┌─────────────┐               ┌─────────────┐
        │   OpenAI    │               │   Deezer    │
        └─────────────┘               └─────────────┘
```

---

## 3. Repository structure

| Path | Responsibility |
|------|----------------|
| `backend/main.py` | FastAPI app, CORS, `/recommend`, Pydantic schemas |
| `backend/ai_service.py` | OpenAI call + JSON parse + Deezer loop |
| `backend/deezer_service.py` | `GET https://api.deezer.com/search` |
| `frontend/src/main.tsx` | React bootstrap, imports `App.css` |
| `frontend/src/App.tsx` | Root state + Axios + page layout |
| `frontend/src/types/song.ts` | `Song` TypeScript type |
| `frontend/src/components/Header.tsx` | Top branding |
| `frontend/src/components/Hero.tsx` | Mood input + Generate button |
| `frontend/src/components/PlaylistSection.tsx` | Results, spinner, errors |
| `frontend/src/components/SongCard.tsx` | Single song UI |
| `frontend/src/components/ui/*` | shadcn: Button, Card, Input, Badge |
| `frontend/src/lib/utils.ts` | `cn()` for Tailwind classes |

---

## 4. Backend

### 4.1 Layers

| Layer | File | Does |
|-------|------|------|
| API | `main.py` | HTTP, validation, CORS |
| Domain | `ai_service.py` | AI + enrichment orchestration |
| Integration | `deezer_service.py` | External music API |

### 4.2 Pydantic models (`main.py`)

| Model | Fields |
|-------|--------|
| `User_mood` | `client_mood: str` |
| `SongSchema` | `title`, `artist`, `genre`, `reason`, `preview_url?`, `album_cover?`, `deezer_url?` |
| `ResponseSchema` | `Playlist: List[SongSchema]` |

### 4.3 CORS

Allowed origins include `http://localhost:5173` so the Vite dev server can call `http://127.0.0.1:8000`.

### 4.4 AI pipeline (`ai_service.py`)

| Step | Detail |
|------|--------|
| 1 | `gpt-4o-2024-08-06` with `response_format` JSON schema |
| 2 | Schema forces `{ Playlist: [ { artist, title, genre, reason } ] }` |
| 3 | User prompt: *Suggest 10 songs for someone feeling {mood}* |
| 4 | For each song: `search_track(title, artist)` |
| 5 | Attach `preview_url`, `album_cover`, `deezer_url` or `null` |
| 6 | On failure: return `{ Playlist: [] }` |

### 4.5 Deezer (`deezer_service.py`)

| Input | Output |
|-------|--------|
| `title`, `artist` | First search hit |
| — | `preview_url`, `album_cover`, `deezer_url` |
| No hit | `None` → null fields on song |

---

## 5. API contract

### Request

```http
POST /recommend
Content-Type: application/json

{ "client_mood": "focused" }
```

### Response

```json
{
  "Playlist": [
    {
      "title": "...",
      "artist": "...",
      "genre": "...",
      "reason": "...",
      "preview_url": "https://...",
      "album_cover": "https://...",
      "deezer_url": "https://www.deezer.com/..."
    }
  ]
}
```

| Field | Source |
|-------|--------|
| `artist`, `title`, `genre`, `reason` | OpenAI |
| `preview_url` | Deezer |
| `album_cover` | Deezer |
| `deezer_url` | Deezer |

**Critical:** `Playlist` is an **array**. Frontend must use `setSongs(playlist)`, not `setSongs([playlist])`.

---

## 6. Frontend

### 6.1 Component tree

```
App
├── Header
├── Hero
└── PlaylistSection
    └── SongCard × N
```

### 6.2 State (`App.tsx`)

| State | Type | Purpose |
|-------|------|---------|
| `mood` | `string` | Controlled input |
| `songs` | `Song[]` | API results |
| `isLoading` | `boolean` | Spinner, disable button |
| `errorMessage` | `string \| null` | Error alert |

### 6.3 try / catch / finally

| Phase | State updates |
|-------|----------------|
| Start | `isLoading=true`, `errorMessage=null` |
| Success | `setSongs(normalized)` |
| catch | `setErrorMessage(...)` (Axios-aware) |
| finally | `isLoading=false` |

### 6.4 Normalization

```ts
preview: song.preview ?? song.preview_url ?? null
```

`SongCard` plays audio from `preview ?? preview_url`.

### 6.5 Error messages

| Condition | User message |
|-----------|----------------|
| `ERR_NETWORK` | Backend unreachable |
| HTTP ≥ 500 | Server error |
| Other | Generic fallback |

---

## 7. Run locally

| Service | Command | URL |
|---------|---------|-----|
| Backend | `cd backend` → `fastapi dev` | http://127.0.0.1:8000 |
| Frontend | `cd frontend` → `bun run dev` | http://localhost:5173 |

Backend needs `OPENAI_API_KEY` in `.env`.

---

## 8. Design trade-offs

| Choice | Benefit | Cost |
|--------|---------|------|
| State in `App.tsx` | Simple for beginners | Harder to scale |
| Sequential Deezer calls | Easy to read | Slower with 10 songs |
| Hardcoded API URL | Works locally | Needs env for deploy |
| shadcn/ui | Polished components | Extra setup |

---

## 9. Suggested improvements

1. `frontend/src/lib/api.ts` with `VITE_API_BASE_URL`
2. Implement `music_store.ts` (Context / Zustand)
3. Parallel Deezer requests in backend
4. Remove side-effect `print(get_music_recommendations("happy"))` at bottom of `ai_service.py`
5. OpenAPI → generated TS types for `Song`

---

## 10. Related artifacts

| File | Format |
|------|--------|
| `code-architecture.ipynb` | Jupyter notebook (tables + diagrams) |
| `canvases/ai-music-code-architecture.canvas.tsx` | Interactive Cursor canvas |
