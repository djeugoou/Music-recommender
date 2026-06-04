import { useMemo, useState } from "react";
import axios from "axios";
import { Hero } from "@/components/Hero";
import { PlaylistSection } from "@/components/PlaylistSection";
import { useFavorites } from "@/hooks/useFavorites";
import type { Song } from "@/types/song";
import { saveHistoryToSupabase } from "@/lib/history-service";

type HomePageProps = {
  mood: string;
  setMood: (mood: string) => void;
  songs: Song[];
  setSongs: (songs: Song[]) => void;
};

export function HomePage({ mood, setMood, songs, setSongs }: HomePageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    favoriteCount,
    isFavorite,
    isSavingSong,
    toggleFavorite,
    favoriteActionError,
    favoriteActionSuccess,
    clearFavoriteMessages,
  } = useFavorites();

  const getRecommendations = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.post("http://127.0.0.1:8000/recommend", {
        client_mood: mood,
      });

      const playlist = Array.isArray(response.data?.Playlist)
        ? response.data.Playlist
        : [];

      const normalizedSongs: Song[] = playlist.map((song: Song) => ({
        ...song,
        preview: song.preview ?? song.preview_url ?? null,
      }));

      setSongs(normalizedSongs);
      if (normalizedSongs.length > 0) {
        saveHistoryToSupabase(mood, normalizedSongs).then((res) => {
          if (!res.success) {
            console.warn("Failed to save recommendation history:", res.error);
          } else {
            console.log("Successfully saved recommendation history:", res.row);
          }
        });
      }
    } catch (error: unknown) {
      console.error("Error fetching recommendations:", error);
      const fallbackMessage =
        "We could not generate your playlist right now. Please try again in a moment.";

      if (axios.isAxiosError(error)) {
        if (error.code === "ERR_NETWORK") {
          setErrorMessage(
            "Cannot reach the server. Make sure your backend is running, then try again."
          );
        } else if (error.response?.status && error.response.status >= 500) {
          setErrorMessage(
            "The server had an issue while generating your playlist. Please retry."
          );
        } else {
          setErrorMessage(fallbackMessage);
        }
      } else {
        setErrorMessage(fallbackMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isGenerateDisabled = useMemo(
    () => mood.trim().length === 0 || isLoading,
    [mood, isLoading]
  );

  return (
    <main className="flex flex-col items-stretch">
      <Hero
        mood={mood}
        setMood={setMood}
        onGenerate={getRecommendations}
        isGenerateDisabled={isGenerateDisabled}
        isLoading={isLoading}
      />
      <PlaylistSection
        songs={songs}
        isLoading={isLoading}
        errorMessage={errorMessage}
        favoriteCount={favoriteCount}
        isFavorite={isFavorite}
        isSavingSong={isSavingSong}
        onToggleFavorite={toggleFavorite}
        favoriteActionError={favoriteActionError}
        favoriteActionSuccess={favoriteActionSuccess}
        onDismissFavoriteMessage={clearFavoriteMessages}
      />
    </main>
  );
}
