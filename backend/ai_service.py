from openai import OpenAI
from dotenv import load_dotenv
from deezer_service import search_track
import json
from typing import Any, Dict
from services.context_service import get_user_context, build_personalized_prompt, build_for_you_prompt
load_dotenv()
client = OpenAI()

PlaylistResponse = Dict[str, list[Dict[str, Any]]]


def _generate_and_enrich_recommendations(user_prompt: str) -> PlaylistResponse:
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

    response=client.chat.completions.create(
        model="gpt-4o-2024-08-06",
        response_format=response_schema,
        messages=[
            {
                "role":"system",
                "content":"You are a thoughtful music curator who believes music reflects human emotions deeply. Return only valid JSON that matches the requested schema."
            },
            {
                "role":"user",
                "content": user_prompt
            },
        ],
    )
    content=response.choices[0].message.content
    try:
        data = json.loads(content or "{}")
        playlist = data.get("Playlist")
        if not isinstance(playlist, list):
            return {"Playlist": []}

        for song in playlist:
            deezer_data = search_track(
                song["title"],
                song["artist"]
            )

            if deezer_data:
                song["preview_url"] = deezer_data["preview_url"]
                song["album_cover"] = deezer_data["album_cover"]
                song["deezer_url"] = deezer_data["deezer_url"]
            else:
                song["preview_url"] = None
                song["album_cover"] = None
                song["deezer_url"] = None

        return {"Playlist": playlist}

    except Exception as e:
        print("ERROR:", e)
        return {
            "Playlist": []
        }

def get_music_recommendations(mood: str, user_id: str | None = None) -> PlaylistResponse:
    if user_id:
        context = get_user_context(user_id)
        user_prompt = build_personalized_prompt(mood, context)
    else:
        user_prompt = f"Suggest 50 songs for someone feeling {mood}."
    return _generate_and_enrich_recommendations(user_prompt)

def get_for_you_recommendations(user_id: str) -> PlaylistResponse:
    context = get_user_context(user_id)
    user_prompt = build_for_you_prompt(context)
    return _generate_and_enrich_recommendations(user_prompt)

if __name__ == "__main__":
    print(get_music_recommendations("happy"))
