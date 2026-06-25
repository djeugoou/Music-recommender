import { useRef, useState, useEffect } from "react";
import { ExternalLink, Heart, Pause, Play, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Song } from "@/types/song";

type TrackListProps = {
  songs: Song[];
  isFavorite: (song: Song) => boolean;
  isSavingSong: (song: Song) => boolean;
  onToggleFavorite: (song: Song) => void;
  onSelectSong: (song: Song) => void;
};

export function TrackList({
  songs,
  isFavorite,
  isSavingSong,
  onToggleFavorite,
  onSelectSong,
}: TrackListProps) {
  const [playingSong, setPlayingSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop playback if songs list changes (e.g. new generation search)
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setPlayingSong(null);
  }, [songs]);

  const togglePlay = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation(); // Prevent opening song-detail view
    const url = song.preview ?? song.preview_url;
    if (!url) return;

    const isSameSong =
      playingSong &&
      playingSong.title === song.title &&
      playingSong.artist === song.artist;

    if (isSameSong) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        void audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setPlayingSong(song);
      setIsPlaying(true);

      // We wait for the audio element to be in the DOM
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.load();
          void audioRef.current.play().catch((err) => {
            console.error("Audio playback error:", err);
            setIsPlaying(false);
          });
        }
      }, 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="w-full space-y-1">
      {/* Table Header for desktop */}
      <div className="hidden sm:grid grid-cols-[auto_1fr_180px_100px] gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/40 border-b border-white/5 select-none mb-2">
        <div className="w-12 text-center">#</div>
        <div>Title</div>
        <div>Genre</div>
        <div className="text-right pr-4">Actions</div>
      </div>

      {/* Track Rows */}
      {songs.map((song, index) => {
        const isCurrentSong =
          playingSong &&
          playingSong.title === song.title &&
          playingSong.artist === song.artist;
        const isCurrentPlaying = isCurrentSong && isPlaying;
        const previewUrl = song.preview ?? song.preview_url;

        return (
          <div
            key={`${song.artist}-${song.title}-${index}`}
            onClick={() => onSelectSong(song)}
            className={cn(
              "group grid grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_180px_100px] gap-4 items-center rounded-xl px-4 py-3 transition duration-200 cursor-pointer select-none",
              isCurrentSong
                ? "bg-emerald-400/[0.08] hover:bg-emerald-400/[0.12]"
                : "hover:bg-white/[0.05]"
            )}
          >
            {/* Number / Play Button */}
            <div className="hidden sm:flex items-center justify-center w-12 text-sm font-medium text-white/50 relative">
              <span className={cn("group-hover:opacity-0 transition-opacity", isCurrentSong && "text-emerald-400 font-semibold")}>
                {index + 1}
              </span>
              {previewUrl && (
                <button
                  type="button"
                  onClick={(e) => togglePlay(e, song)}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white hover:scale-110 transition focus:outline-none"
                  aria-label={isCurrentPlaying ? "Pause preview" : "Play preview"}
                >
                  {isCurrentPlaying ? (
                    <Pause className="size-4 fill-current text-emerald-400" />
                  ) : (
                    <Play className="size-4 fill-current text-white ml-0.5" />
                  )}
                </button>
              )}
            </div>

            {/* Album Cover & Track Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-white/5 bg-white/5 shadow-md flex items-center justify-center">
                {song.album_cover ? (
                  <img
                    src={song.album_cover}
                    alt={`${song.title} artwork`}
                    className="size-full object-cover"
                  />
                ) : (
                  <Music className="size-4 text-white/30" />
                )}
                {/* Mobile overlay play button */}
                {previewUrl && (
                  <button
                    type="button"
                    onClick={(e) => togglePlay(e, song)}
                    className={cn(
                      "absolute inset-0 bg-black/50 flex items-center justify-center sm:hidden transition focus:outline-none",
                      isCurrentPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {isCurrentPlaying ? (
                      <Pause className="size-4 text-emerald-400 fill-current" />
                    ) : (
                      <Play className="size-4 text-white fill-current ml-0.5" />
                    )}
                  </button>
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium truncate",
                    isCurrentSong ? "text-emerald-400" : "text-white"
                  )}
                >
                  {song.title}
                </p>
                <p className="text-xs text-white/50 truncate mt-0.5">
                  {song.artist}
                </p>
              </div>
            </div>

            {/* Genre Badge */}
            <div className="hidden sm:block truncate">
              <Badge
                variant="outline"
                className={cn(
                  "border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 text-xs text-emerald-300 font-normal",
                  isCurrentSong && "bg-emerald-400/10 text-emerald-200 border-emerald-400/30"
                )}
              >
                {song.genre}
              </Badge>
            </div>

            {/* Actions (Heart & Deezer Link) */}
            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isSavingSong(song)}
                onClick={() => onToggleFavorite(song)}
                className="size-8 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                aria-pressed={isFavorite(song)}
                aria-label={isFavorite(song) ? "Remove favorite" : "Add favorite"}
              >
                {isSavingSong(song) ? (
                  <span className="size-3.5 animate-spin rounded-full border border-white/20 border-t-rose-400" />
                ) : (
                  <Heart
                    className={cn(
                      "size-4 transition",
                      isFavorite(song) && "fill-rose-400 text-rose-400 text-rose-400"
                    )}
                  />
                )}
              </Button>

              {song.deezer_url && (
                <a
                  href={song.deezer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition"
                  title="Open on Deezer"
                >
                  <ExternalLink className="size-4" />
                </a>
              )}
            </div>
          </div>
        );
      })}

      {/* Single HTML Audio Player for inline play */}
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onPause={handleEnded}
        className="hidden"
      />
    </div>
  );
}
