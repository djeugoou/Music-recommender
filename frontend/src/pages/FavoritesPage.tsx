import { FavoritesEmptyState } from "@/components/favorites/FavoritesEmptyState";
import { FavoritesGrid } from "@/components/favorites/FavoritesGrid";
import { FavoritesHeader } from "@/components/favorites/FavoritesHeader";
import { FavoritesSkeleton } from "@/components/favorites/FavoritesSkeleton";
import { FavoritesToolbar } from "@/components/favorites/FavoritesToolbar";
import { useAuth } from "@/context/AuthContext";
import { useFavoritesFilter } from "@/hooks/useFavoritesFilter";

type FavoritesPageProps = {
  onDiscover: () => void;
  favoriteRows: any[];
  favoriteCount: number;
  isLoadingFavorites: boolean;
  isSavingSong: (song: Song) => boolean;
  toggleFavorite: (song: Song) => void;
  favoriteActionError: string | null;
  clearFavoriteMessages: () => void;
  onSelectSong: (song: Song) => void;
};

import type { Song } from "@/types/song";

export function FavoritesPage({
  onDiscover,
  favoriteRows,
  favoriteCount,
  isLoadingFavorites,
  isSavingSong,
  toggleFavorite,
  favoriteActionError,
  clearFavoriteMessages,
  onSelectSong,
}: FavoritesPageProps) {
  const { user } = useAuth();

  const {
    search,
    setSearch,
    genre,
    setGenre,
    sort,
    setSort,
    genres,
    filteredRows,
  } = useFavoritesFilter(favoriteRows);

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pb-20">
        <FavoritesHeader totalCount={0} />
        <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 text-center text-sm text-amber-100">
          <p className="font-medium">Sign in to view your favorites</p>
          <p className="mt-2 text-amber-100/80">
            Log in from the header to access your saved collection.
          </p>
          <button
            type="button"
            onClick={onDiscover}
            className="mt-6 text-sm font-medium text-emerald-300 underline-offset-4 hover:underline"
          >
            Discover Music
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20">
      <FavoritesHeader totalCount={favoriteCount} />

      {favoriteCount > 0 ? (
        <div className="mt-8">
          <FavoritesToolbar
            search={search}
            onSearchChange={setSearch}
            genre={genre}
            onGenreChange={setGenre}
            sort={sort}
            onSortChange={setSort}
            genres={genres}
          />
        </div>
      ) : null}

      {favoriteActionError ? (
        <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          <p className="font-medium">Favorites</p>
          <p className="mt-1">{favoriteActionError}</p>
          <button
            type="button"
            onClick={clearFavoriteMessages}
            className="mt-2 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="mt-8">
        {isLoadingFavorites ? (
          <FavoritesSkeleton />
        ) : favoriteCount === 0 ? (
          <FavoritesEmptyState onDiscover={onDiscover} />
        ) : filteredRows.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] py-12 text-center text-sm text-white/60">
            No songs match your search or filters.
          </div>
        ) : (
          <FavoritesGrid
            rows={filteredRows}
            isSavingSong={isSavingSong}
            onToggleFavorite={toggleFavorite}
            onSelectSong={onSelectSong}
          />
        )}
      </div>
    </div>
  );
}
