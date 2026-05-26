import { Card, CardContent } from "@/components/ui/card";
import { SongCard } from "@/components/SongCard";
import type { Song } from "@/types/song";

type PlaylistSectionProps = {
  songs: Song[];
  isLoading: boolean;
};

export function PlaylistSection({ songs, isLoading }: PlaylistSectionProps) {
  const hasSongs = songs.length > 0;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Your playlist
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Generated results will appear here.
          </p>
        </div>
        {hasSongs ? (
          <div className="text-xs text-white/50">
            {songs.length} result{songs.length === 1 ? "" : "s"}
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <Card className="mt-6 border-white/10 bg-white/[0.03] ring-white/10">
          <CardContent className="flex items-center gap-3 py-6 text-sm text-white/75">
            <span className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400" />
            <span>Generating your playlist...</span>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {songs.map((song, index) => (
            <SongCard key={index} song={song} />
          ))}
        </div>
      )}

      {!hasSongs && !isLoading ? (
        <Card className="mt-6 border-white/10 bg-white/[0.03] ring-white/10">
          <CardContent className="text-sm text-white/65">
            Tip: try moods like{" "}
            <span className="font-medium text-white/85">focused</span>,{" "}
            <span className="font-medium text-white/85">gym</span>,{" "}
            <span className="font-medium text-white/85">chill</span>,{" "}
            <span className="font-medium text-white/85">sad</span>.
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
