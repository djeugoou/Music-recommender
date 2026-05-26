import requests

def search_track(title: str, artist: str):

    query = f"{title} {artist}"

    url = "https://api.deezer.com/search"

    response = requests.get(
        url,
        params={
            "q": query
        }
    )

    data = response.json()

    tracks = data.get("data")

    if not tracks:
        return None

    track = tracks[0]

    return {
        "preview_url": track["preview"],
        "album_cover": track["album"]["cover_big"],
        "deezer_url": track["link"]
    }

