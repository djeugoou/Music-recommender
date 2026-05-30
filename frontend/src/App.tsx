import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PlaylistSection } from "@/components/PlaylistSection";
import { useFavorites } from "@/hooks/useFavorites";
import type { Song } from "@/types/song";

function App() {
  const [mood, setMood] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { favoriteCount, isFavorite, toggleFavorite } = useFavorites(mood);

  const getRecommendations = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/recommend",
        {
          client_mood: mood,
        }
      );

      const playlist = Array.isArray(response.data?.Playlist)
        ? response.data.Playlist
        : [];

      // Backend currently sends preview_url; we also preserve preview if present.
      const normalizedSongs: Song[] = playlist.map((song: Song) => ({
        ...song,
        preview: song.preview ?? song.preview_url ?? null,
      }));

      setSongs(normalizedSongs);
    
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

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const isGenerateDisabled = useMemo(
    () => mood.trim().length === 0 || isLoading,
    [mood, isLoading]
  );

  return (
    <div className="min-h-dvh bg-gradient-to-b from-black via-neutral-950 to-black text-white">
      <Header />
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
          onToggleFavorite={toggleFavorite}
        />
      </main>
    </div>
  );
}

export default App;
