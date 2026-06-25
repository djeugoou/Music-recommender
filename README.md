# WDD  🎵

WDD is an AI-powered music recommendation platform that transforms your mood prompts into curated playlists. Built with FastAPI, React, TypeScript, and Supabase, it leverages OpenAI to generate playlists tailored to your mood and historical listening preferences, and enriches each track with album artwork and 30-second audio previews from Deezer.

---

## Table of Contents
* [Overview](#overview)
* [Screenshots](#screenshots)
* [Key Features](#key-features)
* [Tech Stack](#tech-stack)
* [Architecture Overview](#architecture-overview)
* [Project Structure](#project-structure)
* [Local Installation](#local-installation)
  * [Prerequisites](#prerequisites)
  * [Backend Setup](#1-backend-setup)
  * [Frontend Setup](#2-frontend-setup)
  * [Supabase Database Setup](#3-supabase-database-setup)
* [Environment Variables](#environment-variables)
* [Docker Section](#docker-section)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)

---

## Overview

WDD is designed to provide a seamless discovery experience. Traditional music search requires you to search for specific genres, artists, or tracks. WDD allows you to input descriptions of how you are feeling (e.g., *"focused and coding late at night"*, *"energetic workout vibes"*, or *"melancholic rainy Sunday afternoon"*), and uses a language model to return a structured playlist. It also leverages your saved favorites and request history to avoid duplicates and tailor suggestions to your taste.

---

## Screenshots

> [!NOTE]
> *Screenshots showcasing the dashboard, mood inputs, playlist rendering, and audio players will be added here once the deployment is live.*
>
> | Home Page / Mood Input | Playlist Dashboard | Favorite Tracks |
> | :---: | :---: | :---: |
> | *[Placeholder: Mood input UI]* | *[Placeholder: Curated playlist output]* | *[Placeholder: Favorites page]* |

---

## Key Features

- **Mood-Based Playlist Generation**: Enter a prompt describing your mood, activities, or environment to get a curated list of songs.
- **Personalized Recommendations**: Logs in with Supabase Auth to analyze your favorite artists, favorite genres, and history of mood prompts to give you tailored recommendations (e.g. a "For You" feed).
- **Music Enrichment & Previews**: Integrates with Deezer's REST API to retrieve album covers, 30-second playable audio previews, and links to the full songs.
- **Favorites Library**: Save your favorite tracks directly to the Supabase database. The system automatically filters out favorited tracks to prevent them from being repeated in future playlists.
- **Recommendation History**: View your past playlist generation requests and re-open them at any time.

---

## Tech Stack

### Backend
- **FastAPI**: Modern, high-performance web framework for Python 3.10+.
- **OpenAI API**: Uses `gpt-4o-2024-08-06` with JSON schemas to generate structured playlist formats.
- **Pydantic**: Data validation and setting structures.
- **Uvicorn**: Lightweight ASGI server.

### Frontend
- **React (v19)**: Component-based UI library.
- **TypeScript**: Static typing for stable code execution.
- **Vite**: Rapid-build development server.
- **Tailwind CSS (v4)**: Modern, utility-first CSS styling.
- **shadcn/ui**: Accessible, clean pre-designed UI components.
- **Axios**: Promised-based HTTP requests to communicate with the backend.

### Database & Auth
- **Supabase**: Managed PostgreSQL database, authentication system, and client-side integrations with Row Level Security (RLS) policies.

---

## Architecture Overview

Here is a look at the data flow inside AI-Music:

```
                  ┌──────────────────────┐
                  │       Frontend       │
                  │   (React + Vite)     │
                  └──────────┬───────────┘
                             │
                  POST /recommend (Prompt + User ID)
                             │
                             ▼
                  ┌──────────────────────┐
                  │       Backend        │
                  │      (FastAPI)       │
                  └────┬────────────┬────┘
                       │            │
         Analyze History            Fetch Tracks
         & Query OpenAI             & Preview URLs
                       │            │
                       ▼            ▼
               ┌──────────┐      ┌──────────┐
               │  OpenAI  │      │  Deezer  │
               │ (GPT-4o) │      │  (API)   │
               └──────────┘      └──────────┘
```

1. **Client Prompt**: The user inputs a mood on the frontend.
2. **Context Aggregation**: If authenticated, the backend queries Supabase for the user's favorite artists, genres, and recent recommendations.
3. **Structured AI Suggestion**: The backend builds a prompt containing the user's mood and preferences, sends it to OpenAI's GPT-4o, and requests a JSON output matching a strict song schema.
4. **Metadata Enrichment**: The backend loops through the songs returned by OpenAI and fetches matching album covers, preview audio URLs, and Deezer page URLs from the Deezer API.
5. **UI Rendering**: The backend returns the playlist to the client, which dynamically renders the tracklist with functional music players.

For a deep dive into the code organization and design patterns, check out the [Code Architecture Document](docs/code-architecture.md).

---

## Project Structure

```
AI-Music/
├── backend/                  # FastAPI Application
│   ├── services/             # Database and context business logic
│   ├── ai_service.py         # OpenAI GPT connection and orchestration
│   ├── deezer_service.py     # Deezer API client queries
│   ├── main.py               # API routes, CORS settings, middleware
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Container definition
├── frontend/                 # Vite-React UI Application
│   ├── src/
│   │   ├── components/       # UI elements (Cards, Buttons, Header)
│   │   ├── hooks/            # useFavorites, useHistory state management
│   │   ├── lib/              # Supabase clients and api services
│   │   ├── pages/            # View managers (Home, Favorites, History)
│   │   └── App.tsx           # Page router and main container
│   └── package.json          # Node/Bun dependencies
└── supabase/                 # Supabase configuration & RLS policies
```

---

## Local Installation

### Prerequisites
* Python 3.10 or higher installed.
* Node.js (v18+) or Bun installed.
* A Supabase project account (for Auth and Database).
* An OpenAI API Key.

### 1. Backend Setup
1. Move to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template and fill in your keys:
   ```bash
   cp .env.example .env
   ```
   *(See [Environment Variables](#environment-variables) below for details)*
5. Run the FastAPI development server:
   ```bash
   fastapi dev main.py
   ```
   The backend should now be running at `http://127.0.0.1:8000`.

### 2. Frontend Setup
1. Move to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   # Or if using Bun:
   bun install
   ```
3. Copy the environment template and fill in your keys:
   ```bash
   cp .env.example .env
   ```
   *(See [Environment Variables](#environment-variables) below for details)*
4. Launch the frontend development server:
   ```bash
   npm run dev
   # Or if using Bun:
   bun run dev
   ```
   Open `http://localhost:5173` in your browser to view the application.

### 3. Supabase Database Setup
Before logging in or saving favorites, you must configure the database tables in your Supabase project.
1. Log into your [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor** in your project.
3. Open and run the code from [supabase/recommendation-history-rls.sql](supabase/recommendation-history-rls.sql). This will create the `recommendation_history` table and enable RLS policies.
4. Set up the `favorites` table by running a query to create the table structure, then run the RLS configuration from [supabase/favorites-rls.sql](supabase/favorites-rls.sql). 

#### Suggested SQL schema for `favorites`:
```sql
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  artist text not null,
  genre text,
  album_cover text,
  preview_url text,
  deezer_url text,
  created_at timestamptz default now() not null,
  constraint unique_user_song unique (user_id, artist, title)
);
```

---

## Environment Variables

The application requires configuration of both the backend and frontend `.env` files.

### Backend `.env` (`/backend/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` | Key for querying the GPT-4o model. | `sk-proj-...` |
| `SUPABASE_URL` | Your Supabase project URL endpoint. | `https://your-proj.supabase.co` |
| `SUPABASE_ANON_KEY` | The public anonymous key for authentication. | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Optional)* Backend admin role key. | `eyJhbGci...` |

### Frontend `.env` (`/frontend/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase project URL endpoint. | `https://your-proj.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | The public client key to interface with Auth. | `eyJhbGci...` |

---

## Docker Section

The backend directory contains a `Dockerfile` for easy deployment or local isolated testing.

### Running Backend with Docker
1. Build the backend image:
   ```bash
   cd backend
   docker build -t ai-music-backend .
   ```
2. Start the container, mounting the local `.env` and binding port 8001:
   ```bash
   docker run -d --name ai-music-api --env-file .env -p 8001:8001 ai-music-backend
   ```
3. Test that the API is running by checking the health endpoint:
   ```bash
   curl http://localhost:8000/health
   ```

---

## Roadmap

Future improvements planned for AI-Music:
* **Asynchronous Integration**: Run Deezer enrichment requests in parallel using `asyncio.gather` on the backend to reduce `/recommend` latency.
* **State Store Migration**: Move the React application state from root props drillings to a lightweight client-side state manager (e.g. Zustand) for better modularity.
* **Auto-generated Types**: Compile the FastAPI OpenAPI specification schema directly into frontend TypeScript interfaces.
* **Robust Testing**: Add pytest files for backend route verification and Vitest/Testing-Library coverage for React components.

---

## Contributing

We welcome community feedback, issue reports, and pull requests! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started on setting up your branch and commit guidelines.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). You are free to modify, distribute, and build upon this project for educational and personal use.
