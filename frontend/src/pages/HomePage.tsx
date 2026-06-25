import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ForYouSection } from "@/components/ForYouSection";
import { Hero } from "@/components/Hero";
import { PlaylistSection } from "@/components/PlaylistSection";
import { saveHistoryToSupabase } from "@/lib/history-service";
import {
  fetchForYouRecommendations,
  fetchMoodRecommendations,
  getRecommendationErrorMessage,
} from "@/lib/recommendations-service";
import type { Song } from "@/types/song";

type HomePageProps = {
  onSelectSong: (song: Song) => void;
  initialMood?: string;
  initialSongs?: Song[];
  onClearInitialHistory?: () => void;
  favoriteCount: number;
  isFavorite: (song: Song) => boolean;
  isSavingSong: (song: Song) => boolean;
  toggleFavorite: (song: Song) => void;
  favoriteActionError: string | null;
  favoriteActionSuccess: string | null;
  clearFavoriteMessages: () => void;
};

export function HomePage({
  onSelectSong,
  initialMood,
  initialSongs,
  onClearInitialHistory,
  favoriteCount,
  isFavorite,
  isSavingSong,
  toggleFavorite,
  favoriteActionError,
  favoriteActionSuccess,
  clearFavoriteMessages,
}: HomePageProps) {
  const { user, session } = useAuth();
  const [mood, setMood] = useState(initialMood || "");
  const [songs, setSongs] = useState<Song[]>(initialSongs || []);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forYouSongs, setForYouSongs] = useState<Song[]>([]);
  const [isForYouLoading, setIsForYouLoading] = useState(false);
  const [forYouErrorMessage, setForYouErrorMessage] = useState<string | null>(
    null
  );
  const lastForYouTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (initialMood !== undefined) {
      setMood(initialMood);
    }
  }, [initialMood]);

  useEffect(() => {
    if (initialSongs !== undefined) {
      setSongs(initialSongs);
    }
  }, [initialSongs]);

  useEffect(() => {
    const accessToken = session?.access_token;

    if (!user || !accessToken) {
      lastForYouTokenRef.current = null;
      setForYouSongs([]);
      setForYouErrorMessage(null);
      setIsForYouLoading(false);
      return;
    }

    if (lastForYouTokenRef.current === accessToken) {
      return;
    }

    lastForYouTokenRef.current = accessToken;
    setIsForYouLoading(true);
    setForYouErrorMessage(null);

    fetchForYouRecommendations(accessToken)
      .then((playlist) => {
        setForYouSongs(playlist);
      })
      .catch((error: unknown) => {
        console.error("Error fetching For You recommendations:", error);
        setForYouErrorMessage(getRecommendationErrorMessage(error));
        setForYouSongs([]);
      })
      .finally(() => {
        setIsForYouLoading(false);
      });
  }, [session?.access_token, user]);

  const getRecommendations = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setNextCursor(null);
    if (onClearInitialHistory) {
      onClearInitialHistory();
    }
    try {
      const result = await fetchMoodRecommendations(mood, user?.id, null);
      setSongs(result.songs);
      setNextCursor(result.nextCursor);

      if (user && result.songs.length > 0) {
        void saveHistoryToSupabase(mood.trim(), result.songs);
      }
    } catch (error: unknown) {
      console.error("Error fetching recommendations:", error);
      setErrorMessage(getRecommendationErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreSongs = async () => {
    if (isLoadingMore || !nextCursor || isLoading) return;

    setIsLoadingMore(true);
    try {
      const result = await fetchMoodRecommendations(mood, user?.id, nextCursor);
      setSongs((prev) => [...prev, ...result.songs]);
      setNextCursor(result.nextCursor);
    } catch (error: unknown) {
      console.error("Error loading more recommendations:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const isGenerateDisabled = useMemo(
    () => mood.trim().length === 0 || isLoading,
    [mood, isLoading]
  );

  return (
    <main className="flex flex-col items-stretch">
      <ForYouSection
        songs={forYouSongs}
        isLoading={isForYouLoading}
        errorMessage={forYouErrorMessage}
        isAuthenticated={Boolean(user)}
        isFavorite={isFavorite}
        isSavingSong={isSavingSong}
        onToggleFavorite={toggleFavorite}
        onSelectSong={onSelectSong}
      />
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
        nextCursor={nextCursor}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMoreSongs}
        onSelectSong={onSelectSong}
      />
    </main>
  );
}
