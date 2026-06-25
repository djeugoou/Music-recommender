from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from typing import List
from ai_service import get_for_you_recommendations, get_music_recommendations
from services.supabase_service import get_user_from_token

app = FastAPI()
security = HTTPBearer()

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:8000",
    "http://localhost:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User_mood(BaseModel):
    client_mood: str
    user_id: str | None = None
    cursor: str | None = None
    limit: int = 10

class  SongSchema(BaseModel):
    title: str
    artist: str
    genre: str
    reason: str
    preview_url: str  | None = None
    album_cover: str  | None = None
    deezer_url: str  | None = None
class  ResponseSchema(BaseModel):
    Playlist:List[SongSchema]
    next_cursor: str | None = None

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    token = credentials.credentials
    user = get_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token")
    return user["id"]

@app.get("/health")
def health():
    return {"status": "healthy"}

#post eNDPOINT
@app.post("/recommend", response_model=ResponseSchema)
async def recommended_music(request: User_mood):
    response = get_music_recommendations(
        request.client_mood, 
        request.user_id, 
        request.cursor, 
        request.limit
    )
    print(f"DEBUG: Response value is {response}")  # Check your terminal!
    return response

@app.get("/recommendations/for-you", response_model=ResponseSchema)
async def recommended_for_you(user_id: str = Depends(get_current_user_id)):
    response = get_for_you_recommendations(user_id)
    return response

   
