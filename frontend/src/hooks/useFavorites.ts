import { useCallback, useState } from "react";
import { getSongKey, loadFavorites, saveFavorites } from "@/lib/favorites";
import type { FavoriteRecord } from "@/types/favorite";
import type { Song } from "@/types/song";

export function useFavorites(currentMood: string) {
  const [favorites, setFavorites] = useState<FavoriteRecord[]>(() =>
    loadFavorites()
  );

  const isFavorite = useCallback(
    (song: Song) => favorites.some((f) => f.id === getSongKey(song)),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (song: Song) => {
      const id = getSongKey(song);
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === id);
        const next = exists
          ? prev.filter((f) => f.id !== id)
          : [
              ...prev,
              {
                id,
                song,
                favoritedAt: new Date().toISOString(),
                mood: currentMood.trim() || undefined,
              },
            ];
        saveFavorites(next);
        return next;
      });
    },
    [currentMood]
  );

  return {
    favorites,
    favoriteCount: favorites.length,
    isFavorite,
    toggleFavorite,
  };
}
