import type { FavoriteRecord } from "@/types/favorite";
import type { Song } from "@/types/song";

const STORAGE_KEY = "ai-music-favorites";

export function getSongKey(song: Song): string {
  return `${song.artist}::${song.title}`.toLowerCase();
}

export function loadFavorites(): FavoriteRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FavoriteRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: FavoriteRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}
