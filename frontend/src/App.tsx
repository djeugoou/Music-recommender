import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { HomePage } from "@/pages/HomePage";
import { HistoryPage } from "@/pages/HistoryPage";
import { SongDetailPage } from "@/pages/SongDetailPage";
import { useFavorites } from "@/hooks/useFavorites";
import { Sparkles, Menu } from "lucide-react";

import type { AppPage } from "@/types/app";
import type { Song } from "@/types/song";

function App() {
  const [page, setPage] = useState<AppPage>("home");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [historyMood, setHistoryMood] = useState<string | undefined>(undefined);
  const [historySongs, setHistorySongs] = useState<Song[] | undefined>(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const favorites = useFavorites();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleNavigate = (newPage: AppPage) => {
    setPage(newPage);
    if (newPage !== "song-detail") {
      setSelectedSong(null);
    }
  };

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setPage("song-detail");
  };

  const handleReopenHistory = (prompt: string, songs: Song[]) => {
    setHistoryMood(prompt);
    setHistorySongs(songs);
    setPage("home");
  };

  const handleClearInitialHistory = () => {
    setHistoryMood(undefined);
    setHistorySongs(undefined);
  };

  useEffect(() => {
    if (page !== "home") {
      document.querySelectorAll("audio").forEach((audio) => audio.pause());
    }
  }, [page]);

  return (
    <div className="flex min-h-dvh bg-gradient-to-b from-black via-neutral-950 to-black text-white">
      {/* Collapsible Sidebar Navigation */}
      <Sidebar
        currentPage={page}
        onNavigate={handleNavigate}
        isOpenMobile={isMobileMenuOpen}
        setIsOpenMobile={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top header bar */}
        <header className="md:hidden flex items-center justify-between border-b border-white/10 bg-black/65 backdrop-blur-md px-4 py-3 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/5">
              <Sparkles className="size-4 text-emerald-300" />
            </div>
            <div>
              <span className="font-semibold text-sm text-white">AI Playlist</span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="size-9 grid place-items-center rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-white transition"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </button>
        </header>

        {/* Page Routing */}
        <div className="flex-1">
          {/* Discovery stays mounted (hidden via CSS, not unmounted) so its
              generated playlist survives navigating to other pages. */}
          <div className={page === "home" ? undefined : "hidden"}>
            <HomePage
              onSelectSong={handleSelectSong}
              initialMood={historyMood}
              initialSongs={historySongs}
              onClearInitialHistory={handleClearInitialHistory}
              favoriteCount={favorites.favoriteCount}
              isFavorite={favorites.isFavorite}
              isSavingSong={favorites.isSavingSong}
              toggleFavorite={favorites.toggleFavorite}
              favoriteActionError={favorites.favoriteActionError}
              favoriteActionSuccess={favorites.favoriteActionSuccess}
              clearFavoriteMessages={favorites.clearFavoriteMessages}
            />
          </div>

          {page === "favorites" && (
            <FavoritesPage
              onDiscover={() => handleNavigate("home")}
              favoriteRows={favorites.favoriteRows}
              favoriteCount={favorites.favoriteCount}
              isLoadingFavorites={favorites.isLoadingFavorites}
              isSavingSong={favorites.isSavingSong}
              toggleFavorite={favorites.toggleFavorite}
              favoriteActionError={favorites.favoriteActionError}
              clearFavoriteMessages={favorites.clearFavoriteMessages}
              onSelectSong={handleSelectSong}
            />
          )}

          {page === "history" && (
            <HistoryPage
              onDiscover={() => handleNavigate("home")}
              onReopen={handleReopenHistory}
            />
          )}

          {page === "song-detail" && selectedSong && (
            <SongDetailPage
              song={selectedSong}
              onBack={() => handleNavigate("home")}
              isFavorite={favorites.isFavorite(selectedSong)}
              isFavoriteLoading={favorites.isSavingSong(selectedSong)}
              onToggleFavorite={() => favorites.toggleFavorite(selectedSong)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
