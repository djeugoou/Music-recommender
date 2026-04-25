from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
client = OpenAI()

mood=input("Enter your mood: ")

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

print(response.choices[0].message.content)