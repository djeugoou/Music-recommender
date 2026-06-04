import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { FavoritesSortOption } from "@/hooks/useFavoritesFilter";

type FavoritesToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  genre: string;
  onGenreChange: (value: string) => void;
  sort: FavoritesSortOption;
  onSortChange: (value: FavoritesSortOption) => void;
  genres: string[];
};

export function FavoritesToolbar({
  search,
  onSearchChange,
  genre,
  onGenreChange,
  sort,
  onSortChange,
  genres,
}: FavoritesToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 sm:max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
        <Input
          type="search"
          placeholder="Search by title, artist, or genre..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 border-white/10 bg-black/30 pl-10 text-white placeholder:text-white/40"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium tracking-wide text-white/50 uppercase">
            Genre
          </span>
          <select
            value={genre}
            onChange={(e) => onGenreChange(e.target.value)}
            className="h-10 min-w-[120px] rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
          >
            {genres.map((g) => (
              <option key={g} value={g} className="bg-neutral-900">
                {g === "all" ? "All genres" : g}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium tracking-wide text-white/50 uppercase">
            Sort by
          </span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as FavoritesSortOption)}
            className="h-10 min-w-[150px] rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
          >
            <option value="recent" className="bg-neutral-900">
              Recently Added
            </option>
            <option value="artist" className="bg-neutral-900">
              Artist Name
            </option>
            <option value="title" className="bg-neutral-900">
              Song Title
            </option>
          </select>
        </label>
      </div>
    </div>
  );
}
