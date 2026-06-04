import { CircleUser, Clock } from "lucide-react";
import { useAuth, getUserDisplayName } from "@/context/AuthContext";

type HistoryHeaderProps = {
  totalCount: number;
};

export function HistoryHeader({ totalCount }: HistoryHeaderProps) {
  const { user } = useAuth();
  const displayName = user ? getUserDisplayName(user) : "Guest";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-6 backdrop-blur-xl sm:p-10">
      <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-sky-300/90 uppercase">
            Recommendation history
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            My History
          </h1>
          <p className="mt-3 text-base text-white/65 sm:text-lg">
            Browse and reopen your past playlists.
          </p>
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:items-end">
          <div
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur"
            title={displayName}
          >
            <div className="grid size-11 place-items-center rounded-full border border-emerald-500/30 bg-gradient-to-br from-emerald-500/25 to-emerald-500/5">
              <CircleUser className="size-6 text-emerald-300" />
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-white/50">Signed in as</p>
              <p className="max-w-[140px] truncate text-sm font-medium text-white">
                {displayName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur">
            <div className="grid size-10 place-items-center rounded-xl bg-sky-500/15">
              <Clock className="size-5 text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums text-white">
                {totalCount}
              </p>
              <p className="text-xs text-white/55">Sessions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
