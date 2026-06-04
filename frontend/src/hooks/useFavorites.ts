import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchUserFavorites,
  getSongKey,
  removeFavoriteFromSupabase,
  saveFavoriteToSupabase,
} from "@/lib/favorites-service";
import type { FavoriteRow } from "@/types/favorite";
import type { Song } from "@/types/song";

/**
 * UI hook: loads favorites from Supabase when the user is logged in,
 * and exposes toggle + loading / error state for song cards.
 */
export function useFavorites() {
  const { user } = useAuth();

  const [favoriteRows, setFavoriteRows] = useState<FavoriteRow[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [savingSongKey, setSavingSongKey] = useState<string | null>(null);
  const [favoriteActionError, setFavoriteActionError] = useState<string | null>(
    null
  );
  const [favoriteActionSuccess, setFavoriteActionSuccess] = useState<
    string | null
  >(null);

  // Build a fast lookup set from DB rows for `isFavorite(song)`.
  const favoriteKeys = new Set(
    favoriteRows.map((row) => getSongKey(row))
  );

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteRows([]);
      return;
    }

    setIsLoadingFavorites(true);
    setFavoriteActionError(null);

    const { data, error } = await fetchUserFavorites();

    setIsLoadingFavorites(false);

    if (error) {
      setFavoriteActionError(error);
      return;
    }

    setFavoriteRows(data);
  }, [user]);

  // Reload favorites whenever the authenticated user changes (login / logout).
  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  const isFavorite = useCallback(
    (song: Song) => favoriteKeys.has(getSongKey(song)),
    [favoriteRows]
  );

  const isSavingSong = useCallback(
    (song: Song) => savingSongKey === getSongKey(song),
    [savingSongKey]
  );

  const toggleFavorite = useCallback(
    async (song: Song) => {
      if (!user) {
        setFavoriteActionError("Log in to save songs to your favorites.");
        setFavoriteActionSuccess(null);
        return;
      }

      const key = getSongKey(song);
      setSavingSongKey(key);
      setFavoriteActionError(null);
      setFavoriteActionSuccess(null);

      const alreadyFavorited = favoriteKeys.has(key);

      const result = alreadyFavorited
        ? await removeFavoriteFromSupabase(song)
        : await saveFavoriteToSupabase(song);

      setSavingSongKey(null);

      if (result.success === false) {
        setFavoriteActionError(result.error);
        return;
      }

      if (alreadyFavorited) {
        setFavoriteRows((prev) => prev.filter((row) => getSongKey(row) !== key));
        setFavoriteActionSuccess("Removed from favorites.");
      } else if (result.row) {
        setFavoriteRows((prev) => [...prev, result.row!]);
        setFavoriteActionSuccess("Saved to favorites.");
      } else {
        await loadFavorites();
        setFavoriteActionSuccess("Saved to favorites.");
      }
    },
    [user, favoriteRows, loadFavorites]
  );

  const clearFavoriteMessages = useCallback(() => {
    setFavoriteActionError(null);
    setFavoriteActionSuccess(null);
  }, []);

  return {
    favoriteRows,
    favoriteCount: favoriteRows.length,
    isFavorite,
    isSavingSong,
    isLoadingFavorites,
    toggleFavorite,
    favoriteActionError,
    favoriteActionSuccess,
    clearFavoriteMessages,
  };
}
