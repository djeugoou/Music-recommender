import { useState } from "react";
import { CircleUser, Heart, LogOut, Sparkles, Clock } from "lucide-react";
import type { AppPage } from "@/types/app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { LogoutConfirmDialog } from "@/components/auth/LogoutConfirmDialog";
import { useAuth, getUserDisplayName } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type HeaderProps = {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
};

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const { user, loading, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const displayName = user ? getUserDisplayName(user) : "";

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    const error = await signOut();
    setIsLoggingOut(false);
    if (error) {
      console.error("Logout failed:", error);
      return;
    }
    setLogoutOpen(false);
    onNavigate("home");
  };

  const navLinkClass = (page: AppPage) =>
    cn(
      "rounded-lg px-3 py-1.5 text-sm font-medium transition",
      currentPage === page
        ? "bg-white/10 text-white"
        : "text-white/60 hover:bg-white/5 hover:text-white"
    );

  return (
    <>
      <header className="mx-auto w-full max-w-6xl px-4 pt-6 sm:pt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("home")}
              className="flex items-center gap-3 text-left"
            >
              <div className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                <Sparkles className="size-5 text-emerald-300" />
              </div>
              <div>
                <div className="text-sm text-white/70">Mood Music</div>
                <div className="text-base font-semibold">AI Playlist</div>
              </div>
            </button>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={navLinkClass("home")}
              onClick={() => onNavigate("home")}
            >
              Discover
            </button>
            <button
              type="button"
              className={cn(navLinkClass("favorites"), "inline-flex items-center gap-1.5")}
              onClick={() => onNavigate("favorites")}
            >
              <Heart className="size-3.5" />
              Favorites
            </button>
            <button
              type="button"
              className={cn(navLinkClass("history"), "inline-flex items-center gap-1.5")}
              onClick={() => onNavigate("history")}
            >
              <Clock className="size-3.5" />
              History
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Badge
              variant="outline"
              className="hidden border-white/10 bg-white/5 text-white/60 lg:inline-flex"
            >
              Generate Your Playlist
            </Badge>

            {loading ? (
              <span className="text-xs text-white/50">...</span>
            ) : user ? (
              <>
                <div className="flex max-w-[200px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1.5">
                  <CircleUser className="size-5 shrink-0 text-emerald-300" />
                  <span
                    className="truncate text-sm font-medium text-white/90"
                    title={displayName}
                  >
                    {displayName}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLogoutOpen(true)}
                  className="border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                >
                  <LogOut className="size-3.5" />
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => openAuth("login")}
                  className="text-white/80 hover:bg-white/10 hover:text-white"
                >
                  Log in
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => openAuth("signup")}
                  className="bg-emerald-500 text-black hover:bg-emerald-400"
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />

      <LogoutConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
}
