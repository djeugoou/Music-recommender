import { useState } from "react";
import { CircleUser, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { LogoutConfirmDialog } from "@/components/auth/LogoutConfirmDialog";
import { useAuth, getUserDisplayName } from "@/context/AuthContext";

export function Header() {
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
  };

  return (
    <>
      <header className="mx-auto w-full max-w-5xl px-4 pt-10 sm:pt-14">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5">
              <span className="text-lg font-semibold tracking-tight">AI</span>
            </div>
            <div>
              <div className="text-sm text-white/70">Mood Music</div>
              <div className="text-base font-semibold">
                Welcome Dear Dreamers
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Badge
              variant="outline"
              className="hidden border-white/10 bg-white/5 text-white/60 sm:inline-flex"
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
