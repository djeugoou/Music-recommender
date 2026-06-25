import axios from "axios";
import type { Song } from "@/types/song";

const API_BASE_URL = "http://localhost:8001";

type PlaylistPayload = {
  Playlist?: Song[];
  next_cursor?: string | null;
};

function normalizePlaylist(payload: PlaylistPayload): Song[] {
  const playlist = Array.isArray(payload?.Playlist) ? payload.Playlist : [];

  return playlist.map((song) => ({
    ...song,
    preview: song.preview ?? song.preview_url ?? null,
  }));
}

export function getRecommendationErrorMessage(error: unknown): string {
  const fallbackMessage =
    "We could not generate your playlist right now. Please try again in a moment.";

  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  if (error.code === "ERR_NETWORK") {
    return "Cannot reach the server. Make sure your backend is running, then try again.";
  }

  if (error.response?.status === 401) {
    return "Log in again to refresh your personalized recommendations.";
  }

  if (error.response?.status && error.response.status >= 500) {
    return "The server had an issue while generating your playlist. Please retry.";
  }

  return fallbackMessage;
}

export async function fetchMoodRecommendations(
  mood: string,
  userId?: string,
  cursor?: string | null
): Promise<{ songs: Song[]; nextCursor: string | null }> {
  const response = await axios.post<PlaylistPayload>(`${API_BASE_URL}/recommend`, {
    client_mood: mood,
    user_id: userId ?? null,
    cursor: cursor ?? null,
    limit: 10,
  });

  return {
    songs: normalizePlaylist(response.data),
    nextCursor: response.data.next_cursor ?? null,
  };
}

export async function fetchForYouRecommendations(
  accessToken: string
): Promise<Song[]> {
  const response = await axios.get<PlaylistPayload>(
    `${API_BASE_URL}/recommendations/for-you`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return normalizePlaylist(response.data);
}
