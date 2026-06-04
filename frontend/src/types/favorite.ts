import type { Song } from "@/types/song";

/**
 * Row shape returned from the Supabase `favorites` table.
 * Extend this type if you add columns (e.g. `reason`, `created_at`).
 */
export type FavoriteRow = {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  genre: string;
  album_cover: string | null;
  preview_url: string | null;
  deezer_url: string | null;
};

/** Payload used when inserting a new favorite (no `id` yet). */
export type FavoriteInsert = Omit<FavoriteRow, "id">;

/** Standard result for save / remove / fetch actions. */
export type FavoriteActionResult =
  | { success: true; row?: FavoriteRow }
  | { success: false; error: string };

/** @deprecated Local-only record — kept for migration reference. */
export type FavoriteRecord = {
  id: string;
  song: Song;
  favoritedAt: string;
  mood?: string;
};
