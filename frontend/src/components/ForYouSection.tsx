import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SongCard } from "@/components/SongCard";
import type { Song } from "@/types/song";

type ForYouSectionProps = {
  songs: Song[];
  isLoading: boolean;
  errorMessage: string | null;
  isAuthenticated: boolean;
  isFavorite: (song: Song) => boolean;
  isSavingSong: (song: Song) => boolean;
  onToggleFavorite: (song: Song) => void;
  onSelectSong: (song: Song) => void;
};

export function ForYouSection({
  songs,
  isLoading,
  errorMessage,
  isAuthenticated,
  isFavorite,
  isSavingSong,
  onToggleFavorite,
  onSelectSong,
}: ForYouSectionProps) {
  const hasSongs = songs.length > 0;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-10 pt-10">
      <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5 shadow-[0_18px_60px_rgba(16,185,129,0.08)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-emerald-300" />
              <h2 className="text-xl font-semibold tracking-tight text-white">
                ✨ For You
              </h2>
            </div>
            <p className="mt-1 text-sm text-white/65">
              Personalized recommendations based on your listening preferences.
            </p>
          </div>

          {hasSongs ? (
            <div className="text-sm text-emerald-100/75">
              {songs.length} personalized pick{songs.length === 1 ? "" : "s"}
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <Card className="mt-5 border-white/10 bg-black/20 ring-white/10">
            <CardContent className="flex items-center gap-3 py-6 text-sm text-white/75">
              <span className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-emerald-300" />
              <span>Building your personalized playlist...</span>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && errorMessage ? (
          <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            <p className="font-medium">Could not load For You</p>
            <p className="mt-1 text-rose-100/90">{errorMessage}</p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && !hasSongs ? (
          <Card className="mt-5 border-white/10 bg-black/20 ring-white/10">
            <CardContent className="py-6 text-sm text-white/65">
              {isAuthenticated
                ? "Save favorites or generate a mood playlist to help personalize this space."
                : "Log in to see personalized recommendations here."}
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && hasSongs ? (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {songs.map((song, index) => (
              <SongCard
                key={`${song.artist}-${song.title}-${index}`}
                song={song}
                variant="compact"
                isFavorite={isFavorite(song)}
                isFavoriteLoading={isSavingSong(song)}
                onToggleFavorite={() => onToggleFavorite(song)}
                onClick={() => onSelectSong(song)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
