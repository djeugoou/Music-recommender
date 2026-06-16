import { useRef, useState } from "react";
import { ExternalLink, Heart, Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Song } from "@/types/song";

type SongCardProps = {
  song: Song;
  isFavorite: boolean;
  isFavoriteLoading?: boolean;
  onToggleFavorite: () => void;
  variant?: "recommendation" | "favorites" | "compact";
  onClick?: () => void;
};

export function SongCard({
  song,
  isFavorite,
  isFavoriteLoading = false,
  onToggleFavorite,
  variant = "recommendation",
  onClick,
}: SongCardProps) {
  const previewUrl = song.preview ?? song.preview_url ?? null;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePreview = () => {
    if (!audioRef.current || !previewUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    void audioRef.current.play();
    setIsPlaying(true);
  };

  const isFavoritesVariant = variant === "favorites";

  if (variant === "compact") {
    return (
      <Card
        onClick={onClick}
        className="group relative overflow-hidden border-white/10 bg-white/[0.03] ring-white/10 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_12px_40px_rgba(16,185,129,0.05)] cursor-pointer"
      >
        <div className="relative">
          {song.album_cover ? (
            <img
              src={song.album_cover}
              alt={`${song.title} album cover`}
              className="w-full h-36 object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-36 bg-gradient-to-br from-neutral-800 to-neutral-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            disabled={isFavoriteLoading}
            aria-pressed={isFavorite}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            className="absolute top-2 right-2 border border-white/10 bg-black/40 text-white backdrop-blur hover:bg-black/60 disabled:opacity-50 z-10 size-8"
          >
            {isFavoriteLoading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-rose-400" />
            ) : (
              <Heart
                className={cn(
                  "size-4 transition",
                  isFavorite && "fill-rose-400 text-rose-400"
                )}
              />
            )}
          </Button>
        </div>

        <div className="p-3">
          <div className="truncate text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
            {song.title}
          </div>
          <div className="truncate text-xs text-white/60 mt-0.5">
            {song.artist}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group overflow-hidden border-white/10 ring-white/10 backdrop-blur-xl transition-all duration-300",
        isFavoritesVariant
          ? "bg-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.35)] hover:border-white/20 hover:bg-white/[0.08] hover:shadow-[0_16px_48px_rgba(16,185,129,0.08)]"
          : "bg-white/[0.03]"
      )}
    >
      <div className="relative">
        {song.album_cover ? (
          <img
            src={song.album_cover}
            alt={`${song.title} album cover`}
            className={cn(
              "w-full object-cover transition duration-500 group-hover:scale-105",
              isFavoritesVariant ? "h-52" : "h-48"
            )}
          />
        ) : (
          <div
            className={cn(
              "w-full bg-gradient-to-br from-neutral-800 to-neutral-900",
              isFavoritesVariant ? "h-52" : "h-48"
            )}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleFavorite}
          disabled={isFavoriteLoading}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
          className="absolute top-3 right-3 border border-white/10 bg-black/40 text-white backdrop-blur hover:bg-black/60 disabled:opacity-50"
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

        {previewUrl && isFavoritesVariant ? (
          <Button
            type="button"
            onClick={togglePreview}
            className="absolute bottom-4 left-4 size-11 rounded-full border border-white/20 bg-emerald-500 text-black shadow-lg hover:bg-emerald-400"
            aria-label={isPlaying ? "Pause preview" : "Play preview"}
          >
            {isPlaying ? (
              <Pause className="size-5" />
            ) : (
              <Play className="size-5 fill-current" />
            )}
          </Button>
        ) : null}
      </div>

      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-white">{song.title}</CardTitle>
            <CardDescription className="truncate text-white/70">
              {song.artist}
            </CardDescription>
          </div>
          <Badge className="shrink-0 border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
            {song.genre}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {!isFavoritesVariant && song.reason ? (
          <p className="text-sm leading-relaxed text-white/75">
            <span className="font-medium text-white/90">Why this fits:</span>{" "}
            {song.reason}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {song.deezer_url ? (
            <a
              href={song.deezer_url}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                isFavoritesVariant
                  ? "border-white/15 bg-white/5 text-white/90 hover:bg-white/10"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
              )}
            >
              {isFavoritesVariant ? (
                <>
                  <ExternalLink className="size-3.5" />
                  Listen on Deezer
                </>
              ) : (
                "Open on Deezer"
              )}
            </a>
          ) : null}
        </div>

        {previewUrl && !isFavoritesVariant ? (
          <audio
            ref={audioRef}
            controls
            src={previewUrl}
            className="w-full"
            preload="none"
            onEnded={() => setIsPlaying(false)}
          >
            Your browser does not support the audio element.
          </audio>
        ) : null}

        {previewUrl && isFavoritesVariant ? (
          <audio
            ref={audioRef}
            src={previewUrl}
            preload="none"
            className="sr-only"
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
