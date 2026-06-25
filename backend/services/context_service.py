from typing import List, Dict, Any
from services.supabase_service import get_user_favorites, get_user_history


def _append_unique(values: List[str], seen: set[str], value: Any) -> None:
    """Append a cleaned string once, comparing case-insensitively."""
    if not isinstance(value, str):
        return

    cleaned = value.strip()
    if not cleaned:
        return

    key = cleaned.lower()
    if key in seen:
        return

    seen.add(key)
    values.append(cleaned)


def _song_identity(song: Dict[str, Any]) -> str:
    return f"{song.get('artist', '')}::{song.get('title', '')}".strip().lower()


def _extract_song(song: Any) -> Dict[str, str] | None:
    if not isinstance(song, dict):
        return None

    title = song.get("title")
    artist = song.get("artist")
    if not isinstance(title, str) or not isinstance(artist, str):
        return None

    title_clean = title.strip()
    artist_clean = artist.strip()
    if not title_clean or not artist_clean:
        return None

    extracted = {
        "title": title_clean,
        "artist": artist_clean,
    }

    genre = song.get("genre")
    if isinstance(genre, str) and genre.strip():
        extracted["genre"] = genre.strip()

    return extracted

def get_user_context(user_id: str) -> Dict[str, Any]:
    """
    Retrieves and aggregates user preferences and history from Supabase.
    
    Args:
        user_id (str): The unique identifier of the user.
        
    Returns:
        Dict[str, Any]: A dictionary containing:
            - favorite_artists: List of unique artist names
            - favorite_genres: List of unique genre names
            - recent_moods: List of unique recent prompts, ordered newest first
            - favorite_songs: List of dicts with title and artist for prompt avoidance
            - previous_recommendations: List of recently recommended songs from history
    """
    # 1. Fetch raw data from Supabase Service
    raw_favorites = get_user_favorites(user_id)
    raw_history = get_user_history(user_id, limit=10) # Fetch up to latest 10 recommendations to aggregate
    
    artists_seen = set()
    genres_seen = set()
    moods_seen = set()
    favorite_song_keys = set()
    previous_song_keys = set()
    favorite_artists: List[str] = []
    favorite_genres: List[str] = []
    favorite_songs: List[Dict[str, str]] = []
    recent_moods: List[str] = []
    previous_recommendations: List[Dict[str, str]] = []
    
    for fav in raw_favorites:
        _append_unique(favorite_artists, artists_seen, fav.get("artist"))
        _append_unique(favorite_genres, genres_seen, fav.get("genre"))

        song = _extract_song(fav)
        if song:
            key = _song_identity(song)
            if key not in favorite_song_keys:
                favorite_song_keys.add(key)
                favorite_songs.append(song)
    
    for hist in raw_history:
        _append_unique(recent_moods, moods_seen, hist.get("prompt"))

        playlist = hist.get("playlist")
        if isinstance(playlist, list):
            for item in playlist:
                song = _extract_song(item)
                if not song:
                    continue

                key = _song_identity(song)
                if key in favorite_song_keys or key in previous_song_keys:
                    continue

                previous_song_keys.add(key)
                previous_recommendations.append(song)
    
    return {
        "favorite_artists": favorite_artists,
        "favorite_genres": favorite_genres,
        "recent_moods": recent_moods[:5],
        "favorite_songs": favorite_songs[:25],
        "previous_recommendations": previous_recommendations[:25],
    }

def build_personalized_prompt(mood: str, context: Dict[str, Any]) -> str:
    """
    Constructs a personalized user prompt based on their mood and aggregated context.
    
    Args:
        mood (str): The user's current mood prompt.
        context (Dict[str, Any]): The aggregated user profile context.
        
    Returns:
        str: The fully formatted prompt.
    """
    favorite_artists = context.get("favorite_artists", [])
    favorite_genres = context.get("favorite_genres", [])
    recent_moods = context.get("recent_moods", [])
    favorite_songs = context.get("favorite_songs", [])
    previous_recommendations = context.get("previous_recommendations", [])
    
    # Start with current mood
    prompt_lines = [f"Current mood: {mood}", ""]
    
    # Append favorite artists
    if favorite_artists:
        prompt_lines.append("Favorite artists:")
        for artist in favorite_artists:
            prompt_lines.append(f"* {artist}")
        prompt_lines.append("")
        
    # Append favorite genres
    if favorite_genres:
        prompt_lines.append("Favorite genres:")
        for genre in favorite_genres:
            prompt_lines.append(f"* {genre}")
        prompt_lines.append("")
        
    # Append recent moods
    if recent_moods:
        prompt_lines.append("Recent moods:")
        for rm in recent_moods:
            prompt_lines.append(f"* {rm}")
        prompt_lines.append("")

    if previous_recommendations:
        prompt_lines.append("Recent recommendations to avoid repeating exactly:")
        for song in previous_recommendations:
            prompt_lines.append(f"* {song['title']} by {song['artist']}")
        prompt_lines.append("")
        
    # Append song avoidance list if any exist
    if favorite_songs:
        prompt_lines.append("Avoid recommending the following songs already present in the user's favorites:")
        for song in favorite_songs:
            prompt_lines.append(f"* {song['title']} by {song['artist']}")
        prompt_lines.append("")
    else:
        prompt_lines.append("Avoid recommending songs already present in the user's favorites.")
        prompt_lines.append("")
        
    # Recommendation instruction
    prompt_lines.append("Recommend 50 songs matching the current mood.")
    prompt_lines.append("Return valid JSON with a top-level Playlist array. Each item must include artist, title, genre, and reason.")
    
    return "\n".join(prompt_lines)

def build_for_you_prompt(context: Dict[str, Any]) -> str:
    """
    Constructs a personalized "For You" recommendation prompt based on user's profile,
    without requiring a mood prompt.
    """
    favorite_artists = context.get("favorite_artists", [])
    favorite_genres = context.get("favorite_genres", [])
    recent_moods = context.get("recent_moods", [])
    favorite_songs = context.get("favorite_songs", [])
    previous_recommendations = context.get("previous_recommendations", [])
    
    prompt_lines = [
        "Generate a personalized 'For You' music playlist from this structured user profile.",
        "Analyze the user's favorite artists, favorite genres, recent mood prompts, and prior recommendations.",
        "Recommend songs that match their taste while encouraging discovery of similar artists and tracks.",
        ""
    ]
    
    # Use favorite artists
    if favorite_artists:
        prompt_lines.append("Favorite artists (use as preference signals):")
        for artist in favorite_artists:
            prompt_lines.append(f"* {artist}")
        prompt_lines.append("")
        
    # Use favorite genres
    if favorite_genres:
        prompt_lines.append("Favorite genres (use as preference signals):")
        for genre in favorite_genres:
            prompt_lines.append(f"* {genre}")
        prompt_lines.append("")
        
    # Use recommendation history (recent moods/prompts)
    if recent_moods:
        prompt_lines.append("Recommendation history prompts (use to infer listening patterns):")
        for rm in recent_moods:
            prompt_lines.append(f"* {rm}")
        prompt_lines.append("")

    if previous_recommendations:
        prompt_lines.append("Previously recommended playlist tracks (avoid exact repeats, but learn from the pattern):")
        for song in previous_recommendations:
            genre = f" ({song['genre']})" if song.get("genre") else ""
            prompt_lines.append(f"* {song['title']} by {song['artist']}{genre}")
        prompt_lines.append("")
        
    # Avoid recommending songs already present in the user's favorites
    if favorite_songs:
        prompt_lines.append("Avoid recommending the following songs already present in the user's favorites:")
        for song in favorite_songs:
            prompt_lines.append(f"* {song['title']} by {song['artist']}")
        prompt_lines.append("")
    else:
        prompt_lines.append("Avoid recommending songs already present in the user's favorites.")
        prompt_lines.append("")
        
    prompt_lines.append("If the profile is sparse, infer broadly from any available signal and make accessible discovery picks.")
    prompt_lines.append("Prefer discovery of new songs that match the user's taste, rather than just repeating their favorites.")
    prompt_lines.append("Suggest 5 distinct songs.")
    prompt_lines.append("Return valid JSON with a top-level Playlist array. Each item must include artist, title, genre, and reason.")
    
    return "\n".join(prompt_lines)
