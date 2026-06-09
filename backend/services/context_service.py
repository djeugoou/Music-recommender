from typing import List, Dict, Any
from services.supabase_service import get_user_favorites, get_user_history

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
    """
    # 1. Fetch raw data from Supabase Service
    raw_favorites = get_user_favorites(user_id)
    raw_history = get_user_history(user_id, limit=10) # Fetch up to latest 10 recommendations to aggregate
    
    # 2. Extract and deduplicate artists and genres from favorites
    artists_seen = set()
    genres_seen = set()
    favorite_artists: List[str] = []
    favorite_genres: List[str] = []
    favorite_songs: List[Dict[str, str]] = []
    
    for fav in raw_favorites:
        artist = fav.get("artist")
        genre = fav.get("genre")
        title = fav.get("title")
        
        if artist:
            # Clean and check uniqueness case-insensitively
            artist_clean = artist.strip()
            artist_lower = artist_clean.lower()
            if artist_lower not in artists_seen:
                artists_seen.add(artist_lower)
                favorite_artists.append(artist_clean)
                
        if genre:
            genre_clean = genre.strip()
            genre_lower = genre_clean.lower()
            if genre_lower not in genres_seen:
                genres_seen.add(genre_lower)
                favorite_genres.append(genre_clean)
                
        if title and artist:
            favorite_songs.append({
                "title": title.strip(),
                "artist": artist.strip()
            })
            
    # 3. Extract and deduplicate recent moods/prompts from history
    moods_seen = set()
    recent_moods: List[str] = []
    
    for hist in raw_history:
        prompt = hist.get("prompt")
        if prompt:
            prompt_clean = prompt.strip()
            prompt_lower = prompt_clean.lower()
            if prompt_lower not in moods_seen:
                moods_seen.add(prompt_lower)
                recent_moods.append(prompt_clean)
                
    # Limit recent moods to the latest 5 to keep context focused
    recent_moods = recent_moods[:5]
    
    return {
        "favorite_artists": favorite_artists,
        "favorite_genres": favorite_genres,
        "recent_moods": recent_moods,
        "favorite_songs": favorite_songs
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
    prompt_lines.append(f"Recommend 10 songs matching the current mood.")
    prompt_lines.append("Return valid JSON.")
    
    return "\n".join(prompt_lines)
