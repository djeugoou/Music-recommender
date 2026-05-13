from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app import get_music_recommendations
from typing import List

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User_mood(BaseModel): #Then you declare your data model as a class that inherits from BaseModel.
    client_mood: str

class  SongSchema(BaseModel):
    title: str
    artist: str
    genre: str
    reason: str

class  ResponseSchema(BaseModel):
    Playlist:List[SongSchema]




#post eNDPOINT
@app.post("/recommend",response_model=ResponseSchema)
async def recommended_music(request:User_mood):
    # mood=request.mood
    
        response = get_music_recommendations(request.client_mood)
        print(f"DEBUG: Response value is {response}") # Check your terminal!
        return response
   