import { getSupabase, isSupabaseConfigured } from "@/lib/superbase";
import type { FavoriteActionResult, FavoriteInsert, FavoriteRow } from "@/types/favorite";
import type { Song } from "@/types/song";

const FAVORITES_TABLE = "favorites";

/** Stable client-side key for comparing songs (title + artist). */
export function getSongKey(song: Pick<Song, "title" | "artist">): string {
  return `${song.artist}::${song.title}`.toLowerCase();
}

/** Map a recommended song + authenticated user id → Supabase insert row. */
export function songToFavoriteInsert(
  song: Song,
  userId: string
): FavoriteInsert {
  return {
    user_id: userId,
    title: song.title,
    artist: song.artist,
    genre: song.genre,
    album_cover: song.album_cover ?? null,
    preview_url: song.preview ?? song.preview_url ?? null,
    deezer_url: song.deezer_url ?? null,
  };
}

function mapSupabaseError(error: { message: string; code?: string }): string {
  if (error.code === "23505") {
    return "This song is already in your favorites.";
  }
  if (error.message.toLowerCase().includes("row-level security")) {
    return "Favorites are blocked by database permissions. Run supabase/favorites-rls.sql in your Supabase SQL Editor.";
  }
  return error.message;
}

/**
 * Returns the currently signed-in user's id from the active Supabase session.
 * Used by all favorites operations so rows are scoped to the right user.
 */
export async function getAuthenticatedUserId(): Promise<
  { userId: string } | { error: string }
> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase is not configured." };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Could not connect to Supabase." };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) return { error: error.message };
  if (!user) return { error: "You must be logged in to manage favorites." };

  return { userId: user.id };
}

/**
 * Loads all favorites for the signed-in user.
 * Reuse this on app load / after login to sync heart icons.
 */
export async function fetchUserFavorites(): Promise<{
  data: FavoriteRow[];
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
    .from(FAVORITES_TABLE)
    .select("*")
    .eq("user_id", auth.userId)
    .order("title", { ascending: true });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: (data ?? []) as FavoriteRow[], error: null };
}

/**
 * Checks whether a song already exists in favorites for the current user.
 * Reuse before insert to avoid duplicates, or to drive the heart UI state.
 */
export async function isSongFavoritedInDatabase(
  song: Song
): Promise<{ favorited: boolean; row?: FavoriteRow; error: string | null }> {
  const auth = await getAuthenticatedUserId();
  if ("error" in auth) {
    return { favorited: false, error: auth.error };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { favorited: false, error: "Could not connect to Supabase." };
  }

  const { data, error } = await supabase
    .from(FAVORITES_TABLE)
    .select("*")
    .eq("user_id", auth.userId)
    .eq("title", song.title)
    .eq("artist", song.artist)
    .maybeSingle();

  if (error) {
    return { favorited: false, error: mapSupabaseError(error) };
  }

  return {
    favorited: Boolean(data),
    row: data as FavoriteRow | undefined,
    error: null,
  };
}

/**
 * Saves a recommended song to the `favorites` table for the authenticated user.
 * This is the main entry point called from the UI when the heart is clicked.
 */
export async function saveFavoriteToSupabase(
  song: Song
): Promise<FavoriteActionResult> {
  const auth = await getAuthenticatedUserId();
  if ("error" in auth) {
    return { success: false, error: auth.error };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: "Could not connect to Supabase." };
  }

  const insertRow = songToFavoriteInsert(song, auth.userId);

  const { data, error } = await supabase
    .from(FAVORITES_TABLE)
    .insert(insertRow)
    .select()
    .single();

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  return { success: true, row: data as FavoriteRow };
}

/**
 * Removes a favorite row matching title + artist for the current user.
 * Wire this to the heart toggle when unfavoriting (future / current toggle).
 */
export async function removeFavoriteFromSupabase(
  song: Song
): Promise<FavoriteActionResult> {
  const auth = await getAuthenticatedUserId();
  if ("error" in auth) {
    return { success: false, error: auth.error };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: "Could not connect to Supabase." };
  }

  const { error } = await supabase
    .from(FAVORITES_TABLE)
    .delete()
    .eq("user_id", auth.userId)
    .eq("title", song.title)
    .eq("artist", song.artist);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  return { success: true };
}
