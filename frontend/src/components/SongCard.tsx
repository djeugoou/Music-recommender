import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Song } from "@/types/song";

type SongCardProps = {
  song: Song;
};

export function SongCard({ song }: SongCardProps) {
  const previewUrl = song.preview ?? song.preview_url ?? null;

  return (
    <Card className="border-white/10 bg-white/[0.03] ring-white/10 backdrop-blur">
      {song.album_cover ? (
        <img
          src={song.album_cover}
          alt={`${song.title} album cover`}
          className="h-48 w-full object-cover"
        />
      ) : null}

      <CardHeader className="grid-cols-[1fr_auto] gap-3">
        <div className="min-w-0">
          <CardTitle className="truncate text-white">{song.title}</CardTitle>
          <CardDescription className="truncate text-white/70">
            {song.artist}
          </CardDescription>
        </div>
        <Badge className="shrink-0 border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
          {song.genre}
        </Badge>
      </CardHeader>

      <CardContent>
        <p className="text-sm leading-relaxed text-white/75">
          <span className="font-medium text-white/90">Why this fits:</span>{" "}
          {song.reason}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {song.deezer_url ? (
            <a
              href={song.deezer_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
            >
              Open on Deezer
            </a>
          ) : null}
        </div>

        {previewUrl ? (
          <audio
            controls
            src={previewUrl}
            className="mt-3 w-full"
            preload="none"
          >
            Your browser does not support the audio element.
          </audio>
        ) : null}
      </CardContent>
    </Card>
  );
}
