import json
import uuid
from typing import Any, Dict, List, Optional
from concurrent.futures import ThreadPoolExecutor
from openai import OpenAI
from dotenv import load_dotenv
from deezer_service import search_track
from services.context_service import get_user_context, build_personalized_prompt, build_for_you_prompt
from services.cache_service import recommendation_cache

load_dotenv()
client = OpenAI()

PlaylistResponse = Dict[str, Any]


def _generate_raw_recommendations(user_prompt: str) -> List[Dict[str, Any]]:
    """
    Calls OpenAI to get raw playlist recommendations (artist, title, genre, reason) matching the prompt.
    Does NOT query Deezer or enrich metadata.
    """
    response_schema = {
        "type": "json_schema",
        "json_schema": {
            "name": "MusicRecommendations",
            "schema": {
                "type": "object",
                "properties": {
                    "Playlist": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "artist": {"type": "string"},
                                "title": {"type": "string"},
                                "genre": {"type": "string"},
                                "reason": {"type": "string"},
                            },
                            "required": ["artist", "title", "genre", "reason"],
                            "additionalProperties": False,
                        },
                    }
                },
                "required": ["Playlist"],
                "additionalProperties": False,
            },
        },
    }

    response = client.chat.completions.create(
        model="gpt-4o-2024-08-06",
        response_format=response_schema,
        messages=[
            {
                "role": "system",
                "content": "You are a thoughtful music curator who believes music reflects human emotions deeply. Return only valid JSON that matches the requested schema.",
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
    )
    content = response.choices[0].message.content
    try:
        data = json.loads(content or "{}")
        playlist = data.get("Playlist")
        if isinstance(playlist, list):
            return playlist
        return []
    except Exception as e:
        print("ERROR parsing OpenAI response:", e)
        return []


def enrich_songs_parallel(songs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Enriches a batch of songs with Deezer metadata in parallel.
    Uses ThreadPoolExecutor to run requests simultaneously for speed.
    """
    def enrich_single_song(song: Dict[str, Any]) -> Dict[str, Any]:
        song_copy = dict(song)
        try:
            deezer_data = search_track(song_copy["title"], song_copy["artist"])
            if deezer_data:
                song_copy["preview_url"] = deezer_data["preview_url"]
                song_copy["album_cover"] = deezer_data["album_cover"]
                song_copy["deezer_url"] = deezer_data["deezer_url"]
            else:
                song_copy["preview_url"] = None
                song_copy["album_cover"] = None
                song_copy["deezer_url"] = None
        except Exception as e:
            print(f"ERROR: Failed to enrich track '{song_copy.get('title')}' by {song_copy.get('artist')}: {e}")
            song_copy["preview_url"] = None
            song_copy["album_cover"] = None
            song_copy["deezer_url"] = None
        return song_copy

    with ThreadPoolExecutor(max_workers=10) as executor:
        enriched_songs = list(executor.map(enrich_single_song, songs))
    return enriched_songs


def get_music_recommendations(
    mood: str,
    user_id: Optional[str] = None,
    cursor: Optional[str] = None,
    limit: int = 10
) -> PlaylistResponse:
    """
    Generates or paginates music recommendations.
    If cursor is provided:
        Loads cached playlist recommendations and returns the requested page slice, enriched in parallel.
    If cursor is None:
        Generates 50 raw recommendations, caches them under a new session UUID, and returns the first page.
    """
    # Case 1: Fetch next page from cache
    if cursor:
        try:
            session_id, index_str = cursor.split(":")
            start_index = int(index_str)
        except ValueError:
            print("ERROR: Invalid cursor format:", cursor)
            return {"Playlist": [], "next_cursor": None}

        raw_songs = recommendation_cache.get(session_id)
        if not raw_songs:
            # Cache expired or session not found
            print(f"WARNING: Cache expired or not found for session {session_id}")
            return {"Playlist": [], "next_cursor": None}

        end_index = min(start_index + limit, len(raw_songs))
        batch = raw_songs[start_index:end_index]
        enriched_batch = enrich_songs_parallel(batch)

        next_cursor = f"{session_id}:{end_index}" if end_index < len(raw_songs) else None
        return {
            "Playlist": enriched_batch,
            "next_cursor": next_cursor
        }

    # Case 2: Initial generation
    if user_id:
        context = get_user_context(user_id)
        user_prompt = build_personalized_prompt(mood, context)
    else:
        user_prompt = f"Suggest 50 songs for someone feeling {mood}."

    raw_songs = _generate_raw_recommendations(user_prompt)
    if not raw_songs:
        return {"Playlist": [], "next_cursor": None}

    session_id = str(uuid.uuid4())
    recommendation_cache.set(session_id, raw_songs)

    # Return first batch
    end_index = min(limit, len(raw_songs))
    first_batch = raw_songs[0:end_index]
    enriched_batch = enrich_songs_parallel(first_batch)

    next_cursor = f"{session_id}:{end_index}" if end_index < len(raw_songs) else None
    return {
        "Playlist": enriched_batch,
        "next_cursor": next_cursor
    }


def get_for_you_recommendations(user_id: str) -> PlaylistResponse:
    """
    Retrieves small personalized pick list (no pagination required, enriched in parallel).
    """
    context = get_user_context(user_id)
    user_prompt = build_for_you_prompt(context)
    raw_songs = _generate_raw_recommendations(user_prompt)
    enriched_songs = enrich_songs_parallel(raw_songs)
    return {"Playlist": enriched_songs, "next_cursor": None}


if __name__ == "__main__":
    print(get_music_recommendations("happy"))
