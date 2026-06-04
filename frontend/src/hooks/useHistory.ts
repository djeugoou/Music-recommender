import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchUserHistory,
  deleteHistoryFromSupabase,
} from "@/lib/history-service";
import type { HistoryRow } from "@/types/history";

/**
 * UI hook: loads recommendation history from Supabase when the user is
 * logged in, and exposes delete + loading / error state.
 */
export function useHistory() {
  const { user } = useAuth();

  const [historyRows, setHistoryRows] = useState<HistoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!user) {
      setHistoryRows([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await fetchUserHistory();

    setIsLoading(false);

    if (fetchError) {
      setError(fetchError);
      return;
    }

    setHistoryRows(data);
  }, [user]);

  // Reload history whenever the authenticated user changes (login / logout).
  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const deleteSession = useCallback(
    async (id: string) => {
      setDeletingId(id);
      setError(null);

      const result = await deleteHistoryFromSupabase(id);

      setDeletingId(null);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setHistoryRows((prev) => prev.filter((row) => row.id !== id));
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    historyRows,
    historyCount: historyRows.length,
    isLoading,
    error,
    deletingId,
    deleteSession,
    clearError,
    reload: loadHistory,
  };
}
