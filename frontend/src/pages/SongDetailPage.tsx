import { useRef, useState } from "react";
import { ArrowLeft, ExternalLink, Heart, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Song } from "@/types/song";

type SongDetailPageProps = {
  song: Song;
  onBack: () => void;
  isFavorite: boolean;
  isFavoriteLoading: boolean;
  onToggleFavorite: () => void;
};

export function SongDetailPage({
  song,
  onBack,
  isFavorite,
  isFavoriteLoading,
  onToggleFavorite,
}: SongDetailPageProps) {
  const previewUrl = song.preview ?? song.preview_url ?? null;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current || !previewUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      void audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
      >
        <ArrowLeft className="size-4" />
        Back to recommendations
      </button>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_32px_64px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center">
          {/* Album Cover / Artwork */}
          <div className="relative mx-auto size-64 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-2xl md:mx-0">
            {song.album_cover ? (
              <img
                src={song.album_cover}
                alt={`${song.title} album cover`}
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {previewUrl && (
              <Button
                type="button"
                onClick={togglePlay}
                className="absolute bottom-4 right-4 size-14 rounded-full border border-white/20 bg-emerald-500 text-black shadow-lg hover:scale-105 hover:bg-emerald-400 transition duration-300"
                aria-label={isPlaying ? "Pause preview" : "Play preview"}
              >
                {isPlaying ? (
                  <Pause className="size-6 fill-current" />
                ) : (
                  <Play className="size-6 fill-current ml-0.5" />
                )}
              </Button>
            )}
          </div>

          {/* Song Details */}
          <div className="flex flex-col justify-center flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  {song.title}
                </h1>
                <p className="mt-2 text-lg text-emerald-400 font-medium">
                  {song.artist}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onToggleFavorite}
                disabled={isFavoriteLoading}
                aria-pressed={isFavorite}
                className="border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 size-11 rounded-xl"
              >
                {isFavoriteLoading ? (
                  <span className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-rose-400" />
                ) : (
                  <Heart
                    className={cn(
                      "size-5 transition",
                      isFavorite && "fill-rose-400 text-rose-400"
                    )}
                  />
                )}
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300 px-3 py-1">
                {song.genre}
              </Badge>
            </div>

            {song.reason && (
              <div className="mt-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Why this fits
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  {song.reason}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              {song.deezer_url && (
                <a
                  href={song.deezer_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20 transition"
                >
                  <ExternalLink className="size-4" />
                  Listen on Deezer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {previewUrl && (
        <audio
          ref={audioRef}
          src={previewUrl}
          preload="none"
          className="sr-only"
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
}
