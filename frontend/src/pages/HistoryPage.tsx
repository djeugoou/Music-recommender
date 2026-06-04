import { HistoryCard } from "@/components/history/HistoryCard";
import { HistoryEmptyState } from "@/components/history/HistoryEmptyState";
import { HistoryHeader } from "@/components/history/HistoryHeader";
import { HistorySkeleton } from "@/components/history/HistorySkeleton";
import { useAuth } from "@/context/AuthContext";
import { useHistory } from "@/hooks/useHistory";
import type { Song } from "@/types/song";

type HistoryPageProps = {
  onDiscover: () => void;
  onReopen: (prompt: string, songs: Song[]) => void;
};

export function HistoryPage({ onDiscover, onReopen }: HistoryPageProps) {
  const { user } = useAuth();
  const {
    historyRows,
    historyCount,
    isLoading,
    error,
    deletingId,
    deleteSession,
    clearError,
  } = useHistory();

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pb-20">
        <HistoryHeader totalCount={0} />
        <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 text-center text-sm text-amber-100">
          <p className="font-medium">Sign in to view your history</p>
          <p className="mt-2 text-amber-100/80">
            Log in from the header to access your recommendation history.
          </p>
          <button
            type="button"
            onClick={onDiscover}
            className="mt-6 text-sm font-medium text-emerald-300 underline-offset-4 hover:underline"
          >
            Discover Music
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20">
      <HistoryHeader totalCount={historyCount} />

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          <p className="font-medium">History</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={clearError}
            className="mt-2 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="mt-8">
        {isLoading ? (
          <HistorySkeleton />
        ) : historyCount === 0 ? (
          <HistoryEmptyState onDiscover={onDiscover} />
        ) : (
          <div className="space-y-4">
            {historyRows.map((row) => (
              <HistoryCard
                key={row.id}
                row={row}
                isDeleting={deletingId === row.id}
                onReopen={() => onReopen(row.prompt, row.playlist)}
                onDelete={() => deleteSession(row.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
