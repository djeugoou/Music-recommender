import sys
import os
from unittest.mock import patch

# Ensure the backend directory is in the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.supabase_service import load_supabase_config
from services.context_service import get_user_context, build_personalized_prompt
from ai_service import get_music_recommendations

# Sample data for mocking
MOCK_FAVORITES = [
    {"artist": "Coldplay", "genre": "Alternative Rock", "title": "Yellow"},
    {"artist": "Adele", "genre": "Pop", "title": "Someone Like You"},
    {"artist": "Coldplay", "genre": "Pop", "title": "Fix You"},  # Duplicate artist & genre
    {"artist": " Radiohead ", "genre": "Alternative Rock ", "title": "Creep"}  # Whitespace trimming
]

MOCK_HISTORY = [
    {"prompt": "nostalgic", "playlist": []},
    {"prompt": "relaxing", "playlist": []},
    {"prompt": "nostalgic", "playlist": []},  # Duplicate prompt
    {"prompt": "happy", "playlist": []}
]

def test_aggregation_and_prompt_building():
    print("=== Testing Context Service Aggregation and Prompt Builder ===")
    
    # Mocking get_user_favorites and get_user_history in supabase_service
    with patch("services.context_service.get_user_favorites", return_value=MOCK_FAVORITES), \
         patch("services.context_service.get_user_history", return_value=MOCK_HISTORY):
         
        # Run aggregation
        user_id = "test-user-123"
        context = get_user_context(user_id)
        
        print("Aggregated User Context:")
        print(f"favorite_artists: {context['favorite_artists']}")
        print(f"favorite_genres: {context['favorite_genres']}")
        print(f"recent_moods: {context['recent_moods']}")
        print(f"favorite_songs (first 2): {context['favorite_songs'][:2]}")
        print()
        
        # Verify correctness
        assert context["favorite_artists"] == ["Coldplay", "Adele", "Radiohead"], "Artists aggregation failed"
        assert context["favorite_genres"] == ["Alternative Rock", "Pop"], "Genres aggregation failed"
        assert context["recent_moods"] == ["nostalgic", "relaxing", "happy"], "Moods aggregation failed"
        assert len(context["favorite_songs"]) == 4, "Songs collection failed"
        
        print("[OK] Aggregation results match expectations.")
        
        # Test Prompt Builder
        mood = "sad"
        prompt = build_personalized_prompt(mood, context)
        print("Generated Personalized Prompt:")
        print("-" * 40)
        print(prompt)
        print("-" * 40)
        
        # Assertions on prompt structure
        assert "Current mood: sad" in prompt
        assert "Coldplay" in prompt
        assert "Radiohead" in prompt
        assert "Alternative Rock" in prompt
        assert "Pop" in prompt
        assert "nostalgic" in prompt
        assert "relaxing" in prompt
        assert "Avoid recommending the following songs already present in the user's favorites:" in prompt
        assert "* Yellow by Coldplay" in prompt
        assert "Recommend 10 songs matching the current mood." in prompt
        
        print("[OK] Generated prompt matches formatting expectations.")
        print()

def test_supabase_config_loading():
    print("=== Testing Supabase Config Loading ===")
    url, key = load_supabase_config()
    print(f"Loaded Supabase URL: {url}")
    print(f"Loaded Supabase Key: {'*' * len(key) if key else 'None'}")
    print()

def test_end_to_end_recommendation_fallback():
    print("=== Testing Recommendation Pipeline Fallback (No user_id) ===")
    try:
        # This will run a standard recommendation query. Since user_id is None, it uses the fallback.
        # We mock OpenAI client to avoid actually calling the external API or use real one if configured.
        # Let's mock OpenAI's chat completions to verify integration without using tokens.
        with patch("ai_service.client.chat.completions.create") as mock_openai, \
             patch("ai_service.search_track", return_value={"preview_url": "http://prev", "album_cover": "http://cover", "deezer_url": "http://deezer"}):
            
            # Setup mock response
            class MockMessage:
                content = '{"Playlist": [{"artist": "The Beatles", "title": "Let It Be", "genre": "Rock", "reason": "Classic comfort song."}]}'
                
            class MockChoice:
                message = MockMessage()
                
            class MockResponse:
                choices = [MockChoice()]
                
            mock_openai.return_value = MockResponse()
            
            print("Running get_music_recommendations with user_id=None...")
            res = get_music_recommendations("calm", user_id=None)
            print("Response:", res)
            
            # Verify mock was called with fallback prompt
            call_args = mock_openai.call_args[1]
            messages = call_args["messages"]
            user_msg = next(msg for msg in messages if msg["role"] == "user")
            assert "Suggest 10 songs for someone feeling calm." in user_msg["content"]
            print("[OK] Fallback prompt sent correctly.")
            
            # Test personalized prompt path
            print("Running get_music_recommendations with user_id='test-user'...")
            with patch("services.context_service.get_user_favorites", return_value=MOCK_FAVORITES), \
                 patch("services.context_service.get_user_history", return_value=MOCK_HISTORY):
                 
                res_personalized = get_music_recommendations("calm", user_id="test-user")
                
                call_args_personalized = mock_openai.call_args[1]
                messages_personalized = call_args_personalized["messages"]
                user_msg_personalized = next(msg for msg in messages_personalized if msg["role"] == "user")
                
                # Verify personalized context is in prompt
                assert "Favorite artists:" in user_msg_personalized["content"]
                assert "Coldplay" in user_msg_personalized["content"]
                assert "Yellow by Coldplay" in user_msg_personalized["content"]
                print("[OK] Personalized prompt sent correctly.")
                print()
                
    except Exception as e:
        print("Failed mock test:", e)
        sys.exit(1)

if __name__ == "__main__":
    test_supabase_config_loading()
    test_aggregation_and_prompt_building()
    test_end_to_end_recommendation_fallback()
    print("All tests completed successfully!")
