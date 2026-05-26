import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PlaylistSection } from "@/components/PlaylistSection";
import type { Song } from "@/types/song";

function App() {
  const [mood, setMood] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getRecommendations = async () => {
    setIsLoading(true);
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
    
    } catch (error) {
      console.error("Error fetching recommendations:", error);
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
        <PlaylistSection songs={songs} isLoading={isLoading} />
      </main>
    </div>
  );
}

export default App;
