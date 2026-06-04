import type { FavoriteRow } from "@/types/favorite";
import type { Song } from "@/types/song";

/** Convert a Supabase favorites row into the shared Song shape for SongCard. */
export function favoriteRowToSong(row: FavoriteRow): Song {
  return {
    title: row.title,
    artist: row.artist,
    genre: row.genre,
    reason: "",
    album_cover: row.album_cover,
    preview_url: row.preview_url,
    preview: row.preview_url,
    deezer_url: row.deezer_url,
  };
}
