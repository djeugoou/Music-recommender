import os
from typing import List, Dict, Any, Optional
import requests
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

def load_supabase_config() -> tuple[Optional[str], Optional[str]]:
    """
    Loads Supabase configuration from environment variables.
    Falls back to frontend/.env if variables are not set in the backend env.
    
    Returns:
        tuple[Optional[str], Optional[str]]: (supabase_url, supabase_key)
    """
    # 1. Check backend env first (prefer service role key if available)
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    
    # 2. Fall back to frontend/.env configuration if missing
    if not url or not key:
        # Determine path to frontend/.env (backend/services/supabase_service.py -> ../../frontend/.env)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        frontend_env = os.path.abspath(os.path.join(current_dir, "..", "..", "frontend", ".env"))
        
        if os.path.exists(frontend_env):
            with open(frontend_env, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip('"').strip("'")
                        if k == "VITE_SUPABASE_URL" and not url:
                            url = v
                        elif k in ("VITE_SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_ANON_KEY") and not key:
                            key = v
                            
    return url, key

# Load configuration globally for the module
SUPABASE_URL, SUPABASE_KEY = load_supabase_config()

def get_headers() -> Dict[str, str]:
    """
    Returns the headers required for authenticating with the Supabase REST API.
    """
    if not SUPABASE_KEY:
        return {}
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def get_user_favorites(user_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves the favorites list for a given user from Supabase.
    
    Args:
        user_id (str): The unique identifier of the user.
        
    Returns:
        List[Dict[str, Any]]: A list of favorite song records.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("WARNING: Supabase is not configured. Returning empty favorites.")
        return []
        
    url = f"{SUPABASE_URL}/rest/v1/favorites"
    params = {
        "user_id": f"eq.{user_id}",
        "select": "*"
    }
    
    try:
        response = requests.get(url, headers=get_headers(), params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"ERROR: Failed to fetch favorites for user {user_id}: {e}")
        return []

def get_user_history(user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Retrieves the recommendation history for a given user from Supabase.
    
    Args:
        user_id (str): The unique identifier of the user.
        limit (int): The maximum number of recent recommendations to retrieve.
        
    Returns:
        List[Dict[str, Any]]: A list of recommendation history records, sorted by created_at descending.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("WARNING: Supabase is not configured. Returning empty history.")
        return []
        
    url = f"{SUPABASE_URL}/rest/v1/recommendation_history"
    params = {
        "user_id": f"eq.{user_id}",
        "select": "*",
        "order": "created_at.desc",
        "limit": str(limit)
    }
    
    try:
        response = requests.get(url, headers=get_headers(), params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"ERROR: Failed to fetch history for user {user_id}: {e}")
        return []

def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Validates the user token with Supabase Auth and returns the user object if valid.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("WARNING: Supabase is not configured.")
        return None
        
    url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/user"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {token}"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"ERROR: Failed to validate token with Supabase: {e}")
        return None

