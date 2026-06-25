import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrackList } from "@/components/TrackList";
import type { Song } from "@/types/song";

type PlaylistSectionProps = {
  songs: Song[];
  isLoading: boolean;
  errorMessage: string | null;
  favoriteCount: number;
  isFavorite: (song: Song) => boolean;
  isSavingSong: (song: Song) => boolean;
  onToggleFavorite: (song: Song) => void;
  favoriteActionError: string | null;
  favoriteActionSuccess: string | null;
  onDismissFavoriteMessage: () => void;
  nextCursor: string | null;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onSelectSong: (song: Song) => void;
};

export function PlaylistSection({
  songs,
  isLoading,
  errorMessage,
  favoriteCount,
  isFavorite,
  isSavingSong,
  onToggleFavorite,
  favoriteActionError,
  favoriteActionSuccess,
  onDismissFavoriteMessage,
  nextCursor,
  isLoadingMore,
  onLoadMore,
  onSelectSong,
}: PlaylistSectionProps) {
  const hasSongs = songs.length > 0;
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  // Setup infinite scroll observer
  useEffect(() => {
    if (!nextCursor || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTargetRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [nextCursor, isLoading, isLoadingMore, onLoadMore]);

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
          <div className="text-right text-xs text-white/50">
            <div>
              {songs.length} track{songs.length === 1 ? "" : "s"} loaded
            </div>
            {favoriteCount > 0 ? (
              <div className="mt-0.5 text-rose-300/80">
                {favoriteCount} favorite{favoriteCount === 1 ? "" : "s"} saved
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {favoriteActionError ? (
        <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          <p className="font-medium">Favorites</p>
          <p className="mt-1">{favoriteActionError}</p>
          <button
            type="button"
            onClick={onDismissFavoriteMessage}
            className="mt-2 text-xs text-rose-200/80 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {favoriteActionSuccess ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          <p>{favoriteActionSuccess}</p>
          <button
            type="button"
            onClick={onDismissFavoriteMessage}
            className="mt-2 text-xs text-emerald-200/80 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <Card className="mt-6 border-white/10 bg-white/[0.03] ring-white/10">
          <CardContent className="flex items-center gap-3 py-6 text-sm text-white/75">
            <span className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400" />
            <span>Generating your playlist...</span>
          </CardContent>
        </Card>
      ) : (
        hasSongs && (
          <div className="mt-6 border border-white/5 bg-white/[0.02] rounded-2xl p-2 sm:p-4 backdrop-blur-md">
            <TrackList
              songs={songs}
              isFavorite={isFavorite}
              isSavingSong={isSavingSong}
              onToggleFavorite={onToggleFavorite}
              onSelectSong={onSelectSong}
            />
          </div>
        )
      )}

      {/* Infinite Scroll trigger or Loading indicator */}
      {nextCursor && !isLoading && (
        <div
          ref={observerTargetRef}
          className="mt-8 flex justify-center items-center h-12 w-full"
        >
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <span className="size-4 animate-spin rounded-full border border-emerald-400/20 border-t-emerald-400" />
              <span>Loading more tracks...</span>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="px-5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-white/60 hover:text-white transition cursor-pointer"
            >
              Load More Songs
            </button>
          )}
        </div>
      )}

      {errorMessage ? (
        <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100 shadow-[0_0_0_1px_rgba(251,113,133,0.12)]">
          <p className="font-medium">Could not generate playlist</p>
          <p className="mt-1 text-rose-100/90">{errorMessage}</p>
        </div>
      ) : null}

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
