import { getSupabase, isSupabaseConfigured } from "@/lib/superbase";
import { getAuthenticatedUserId } from "@/lib/favorites-service";
import type { HistoryActionResult, HistoryInsert, HistoryRow } from "@/types/history";
import type { Song } from "@/types/song";

const HISTORY_TABLE = "recommendation_history";

/**
 * Saves a generated playlist to the recommendation history.
 * Called in the background after a successful recommendation.
 */
export async function saveHistoryToSupabase(
  prompt: string,
  songs: Song[]
): Promise<HistoryActionResult> {
  const auth = await getAuthenticatedUserId();
  if ("error" in auth) {
    return { success: false, error: auth.error };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: "Could not connect to Supabase." };
  }

  const insertRow: HistoryInsert = {
    user_id: auth.userId,
    prompt,
    playlist: songs,
  };

  const { data, error } = await supabase
    .from(HISTORY_TABLE)
    .insert(insertRow)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, row: data as HistoryRow };
}

/**
 * Loads all recommendation history for the signed-in user, newest first.
 */
export async function fetchUserHistory(): Promise<{
  data: HistoryRow[];
  error: string | null;
}> {
  const auth = await getAuthenticatedUserId();
  if ("error" in auth) {
    return { data: [], error: auth.error };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { data: [], error: "Could not connect to Supabase." };
  }

  const { data, error } = await supabase
    .from(HISTORY_TABLE)
    .select("*")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data ?? []) as HistoryRow[], error: null };
}

/**
 * Deletes a single history session by its row id.
 */
export async function deleteHistoryFromSupabase(
  id: string
): Promise<HistoryActionResult> {
  const auth = await getAuthenticatedUserId();
  if ("error" in auth) {
    return { success: false, error: auth.error };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: "Could not connect to Supabase." };
  }

  const { error } = await supabase
    .from(HISTORY_TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", auth.userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
