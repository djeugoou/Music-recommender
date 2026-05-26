from openai import OpenAI
from dotenv import load_dotenv
from deezer_service import search_track
import json
load_dotenv()
client = OpenAI()

# mood=input("Enter your mood: ")
def get_music_recommendations(mood:str):
    response_schema={
        "type": "json_schema",
        "json_schema": {
        "name":"Music",  
        "schema":{
            "type":"object",
            "properties":{
                "Playlist":{
                    "type":"array",
                    "items":{
                        "type":"object",
                        "properties":{
                            "artist":{"type":"string"},
                            "title":{"type":"string"},
                            "genre":{"type":"string"},
                            "reason":{"type":"string"},
                        }
                    },
                    "required":["artist","title","genre","reason"],
                    "additionalProperties": False
                }
                },
        }
        },
    }



    response=client.chat.completions.create(
        model="gpt-4o-2024-08-06",
        response_format=response_schema,
        messages=[
            {
                "role":"system",
                "content":"ou are a thoughtful music curator who believes music reflects human emotions deeply "

            },
            {
                "role":"user",
                "content":f"Suggest 5 songs for someone feeling {mood}."

            },
        ],

    )
    content=response.choices[0].message.content
    try:

        data = json.loads(content)

        # LOOP THROUGH AI SONGS
        for song in data["Playlist"]:

            deezer_data = search_track(
                song["title"],
                song["artist"]
            )

            # MERGE DEEZER DATA
            if deezer_data:

                song["preview_url"] = deezer_data["preview_url"]

                song["album_cover"] = deezer_data["album_cover"]

                song["deezer_url"] = deezer_data["deezer_url"]

            else:

                song["preview_url"] = None

                song["album_cover"] = None

                song["deezer_url"] = None

        return data

    except Exception as e:

        print("ERROR:", e)

        return {
            "Playlist": []
        }



print(get_music_recommendations("happy"))