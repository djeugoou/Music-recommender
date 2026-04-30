from fastapi import FastAPI
from pydantic import BaseModel
from app import get_music_recommendations

app = FastAPI()

class User_mood(BaseModel): #Then you declare your data model as a class that inherits from BaseModel.
    client_mood: str


#post eNDPOINT
@app.post("/recommend/")
async def recommended_music(request:User_mood):
    # mood=request.mood
    response=get_music_recommendations(request)
    return response