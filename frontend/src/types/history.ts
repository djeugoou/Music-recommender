import type { Song } from "@/types/song";

/**
 * Row shape returned from the Supabase `recommendation_history` table.
 */
export type HistoryRow = {
  id: string;
  user_id: string;
  prompt: string;
  playlist: Song[];
  created_at: string;
};

/** Payload used when inserting a new history row (no `id` or `created_at`). */
export type HistoryInsert = Omit<HistoryRow, "id" | "created_at">;

/** Standard result for history save / delete actions. */
export type HistoryActionResult =
  | { success: true; row?: HistoryRow }
  | { success: false; error: string };
