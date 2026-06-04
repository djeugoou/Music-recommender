import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { HomePage } from "@/pages/HomePage";
import { HistoryPage } from "@/pages/HistoryPage";

import type { AppPage } from "@/types/app";
import type { Song } from "@/types/song";

function App() {
  const [page, setPage] = useState<AppPage>("home");
  const [mood, setMood] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-black via-neutral-950 to-black text-white">
      <Header currentPage={page} onNavigate={setPage} />
      {page === "home" ? (
        <HomePage
          mood={mood}
          setMood={setMood}
          songs={songs}
          setSongs={setSongs}
        />
      ) : page === "favorites" ? (
        <FavoritesPage onDiscover={() => setPage("home")} />
      ) : (
        <HistoryPage
          onDiscover={() => setPage("home")}
          onReopen={(prompt, playlist) => {
            setMood(prompt);
            setSongs(playlist);
            setPage("home");
          }}
        />
      )}
    </div>
  );
}

export default App;
