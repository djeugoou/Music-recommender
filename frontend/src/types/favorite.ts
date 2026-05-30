import type { Song } from "@/types/song";

/** Shape ready to POST to a favorites API / database later. */
export type FavoriteRecord = {
  id: string;
  song: Song;
  favoritedAt: string;
  mood?: string;
};
