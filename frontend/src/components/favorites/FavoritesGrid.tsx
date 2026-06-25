import { TrackList } from "@/components/TrackList";
import { favoriteRowToSong } from "@/lib/favorite-mappers";
import type { FavoriteRow } from "@/types/favorite";
import type { Song } from "@/types/song";

type FavoritesGridProps = {
  rows: FavoriteRow[];
  isSavingSong: (song: Song) => boolean;
  onToggleFavorite: (song: Song) => void;
  onSelectSong: (song: Song) => void;
};

export function FavoritesGrid({
  rows,
  isSavingSong,
  onToggleFavorite,
  onSelectSong,
}: FavoritesGridProps) {
  const songs = rows.map((row) => favoriteRowToSong(row));

  return (
    <div className="border border-white/5 bg-white/[0.02] rounded-2xl p-2 sm:p-4 backdrop-blur-md">
      <TrackList
        songs={songs}
        isFavorite={() => true} // Since these are already in favorites
        isSavingSong={isSavingSong}
        onToggleFavorite={onToggleFavorite}
        onSelectSong={onSelectSong}
      />
    </div>
  );
}
