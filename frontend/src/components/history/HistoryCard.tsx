import { useState } from "react";
import { Clock, Music2, Play, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { HistoryRow } from "@/types/history";

type HistoryCardProps = {
  row: HistoryRow;
  isDeleting: boolean;
  onReopen: () => void;
  onDelete: () => void;
};

/** Format a timestamp into a human-readable relative string. */
function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year:
      new Date(dateString).getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  });
}

export function HistoryCard({
  row,
  isDeleting,
  onReopen,
  onDelete,
}: HistoryCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const songCount = row.playlist.length;

  // Extract unique genres from the playlist
  const genres = Array.from(
    new Set(
      row.playlist
        .map((song) => song.genre)
        .filter(Boolean)
    )
  ).slice(0, 3);

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete();
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <Card className="group overflow-hidden border-white/10 bg-white/[0.04] ring-white/10 backdrop-blur-xl transition-all duration-300 hover:border-white/15 hover:bg-white/[0.06]">
      <CardHeader className="gap-1 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-white leading-snug">
              "{row.prompt}"
            </p>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-white/50">
              <Clock className="size-3.5" />
              <span>{formatRelativeTime(row.created_at)}</span>
              <span className="text-white/20">·</span>
              <Music2 className="size-3.5" />
              <span>
                {songCount} song{songCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-wrap items-center gap-2 pt-0">
        {genres.map((genre) => (
          <Badge
            key={genre}
            className="border-sky-500/20 bg-sky-500/10 text-sky-300"
          >
            {genre}
          </Badge>
        ))}

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <>
              <span className="text-xs text-rose-300/80">Delete?</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                className="h-8 px-2 text-xs text-white/60 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
            </>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className={
              confirmDelete
                ? "h-8 border border-rose-500/30 bg-rose-500/10 px-3 text-xs text-rose-300 hover:bg-rose-500/20 hover:text-rose-200"
                : "h-8 px-2 text-white/40 hover:bg-white/10 hover:text-rose-300"
            }
          >
            {isDeleting ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-rose-400" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            {confirmDelete ? "Confirm" : null}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onReopen}
            className="h-8 gap-1.5 rounded-lg bg-emerald-500 px-4 text-xs font-semibold text-black hover:bg-emerald-400"
          >
            <Play className="size-3.5 fill-current" />
            Reopen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
