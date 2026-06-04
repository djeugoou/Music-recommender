import { SongCard } from "@/components/SongCard";
import { favoriteRowToSong } from "@/lib/favorite-mappers";
import type { FavoriteRow } from "@/types/favorite";
import type { Song } from "@/types/song";

type FavoritesGridProps = {
  rows: FavoriteRow[];
  isSavingSong: (song: Song) => boolean;
  onToggleFavorite: (song: Song) => void;
};

export function FavoritesGrid({
  rows,
  isSavingSong,
  onToggleFavorite,
}: FavoritesGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => {
        const song = favoriteRowToSong(row);
        return (
          <div
            key={row.id}
            className="transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01]"
          >
            <SongCard
              variant="favorites"
              song={song}
              isFavorite
              isFavoriteLoading={isSavingSong(song)}
              onToggleFavorite={() => onToggleFavorite(song)}
            />
          </div>
        );
      })}
    </div>
  );
}
