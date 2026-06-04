import { useMemo, useState } from "react";
import type { FavoriteRow } from "@/types/favorite";

export type FavoritesSortOption = "recent" | "artist" | "title";

export function useFavoritesFilter(rows: FavoriteRow[]) {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<string>("all");
  const [sort, setSort] = useState<FavoritesSortOption>("recent");

  const genres = useMemo(() => {
    const unique = new Set(rows.map((row) => row.genre).filter(Boolean));
    return ["all", ...Array.from(unique).sort()];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = rows.filter((row) => {
      const matchesSearch =
        !query ||
        row.title.toLowerCase().includes(query) ||
        row.artist.toLowerCase().includes(query) ||
        row.genre.toLowerCase().includes(query);

      const matchesGenre = genre === "all" || row.genre === genre;

      return matchesSearch && matchesGenre;
    });

    result = [...result].sort((a, b) => {
      if (sort === "artist") {
        return a.artist.localeCompare(b.artist);
      }
      if (sort === "title") {
        return a.title.localeCompare(b.title);
      }
      // "recent" — preserve fetch order reversed (newest last in array ≈ last saved)
      return 0;
    });

    if (sort === "recent") {
      result = [...result].reverse();
    }

    return result;
  }, [rows, search, genre, sort]);

  return {
    search,
    setSearch,
    genre,
    setGenre,
    sort,
    setSort,
    genres,
    filteredRows,
  };
}
