import { useState, useEffect } from "react";
import {
  Compass,
  Heart,
  History,
  ListMusic,
  LogOut,
  CircleUser,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X
} from "lucide-react";
import type { AppPage } from "@/types/app";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { LogoutConfirmDialog } from "@/components/auth/LogoutConfirmDialog";
import { useAuth, getUserDisplayName } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type SidebarProps = {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
};

export function Sidebar({
  currentPage,
  onNavigate,
  isOpenMobile,
  setIsOpenMobile,
}: SidebarProps) {
  const { user, loading, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const displayName = user ? getUserDisplayName(user) : "";

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
    setIsOpenMobile(false);
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
    setIsOpenMobile(false);
  };

  const navItems = [
    { id: "home" as AppPage, label: "Discover", icon: Compass },
    { id: "favorites" as AppPage, label: "Favorites", icon: Heart },
    { id: "history" as AppPage, label: "History", icon: History },
  ];

  const handleNavClick = (page: AppPage, isPlaylist = false) => {
    onNavigate(page);
    setIsOpenMobile(false);
    if (isPlaylist) {
      setTimeout(() => {
        const el = document.getElementById("playlist-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      {/* Top Section / Branding & Navigation */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className={cn("flex items-center gap-3 px-2 py-1", isCollapsed ? "justify-center" : "justify-between")}>
          <button
            type="button"
            onClick={() => handleNavClick("home")}
            className="flex items-center gap-3 text-left group"
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-300">
              <Sparkles className="size-5 text-emerald-300 group-hover:scale-110 transition-transform duration-300" />
            </div>
            {!isCollapsed && (
              <div>
                <div className="text-xs text-white/50 leading-none">Mood Music</div>
                <div className="text-sm font-semibold leading-tight text-white group-hover:text-emerald-300 transition-colors">AI Playlist</div>
              </div>
            )}
          </button>
          
          {/* Collapse toggle (desktop only) */}
          {!isOpenMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:grid size-8 place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent",
                  isCollapsed ? "justify-center" : ""
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn("size-5 shrink-0", isActive ? "text-emerald-300" : "text-white/60")} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}

          {/* Playlist nav link (scrolls to playlist generator) */}
          <button
            type="button"
            onClick={() => handleNavClick("home", true)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white border border-transparent transition duration-200",
              isCollapsed ? "justify-center" : ""
            )}
            title={isCollapsed ? "Playlist Maker" : undefined}
          >
            <ListMusic className="size-5 shrink-0" />
            {!isCollapsed && <span>Playlist Maker</span>}
          </button>
        </nav>
      </div>

      {/* Bottom Section / User Profile & Auth Actions */}
      <div className="space-y-4 border-t border-white/10 pt-4">
        {loading ? (
          <div className="flex justify-center py-2">
            <span className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-emerald-300" />
          </div>
        ) : user ? (
          <div className="space-y-2">
            {/* User display details */}
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-2",
                isCollapsed ? "justify-center" : ""
              )}
              title={displayName}
            >
              <CircleUser className="size-6 shrink-0 text-emerald-300" />
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-white/90">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-white/40 leading-none">Active User</div>
                </div>
              )}
            </div>

            {/* Logout button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLogoutOpen(true)}
              className={cn(
                "w-full border-white/10 bg-white/5 hover:bg-white/10 text-white/80",
                isCollapsed ? "px-0" : "px-3"
              )}
            >
              <LogOut className="size-4 shrink-0" />
              {!isCollapsed && <span className="ml-2">Log out</span>}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => openAuth("login")}
              className="w-full text-white/80 hover:bg-white/10 hover:text-white"
            >
              {!isCollapsed ? "Log in" : <CircleUser className="size-5" />}
            </Button>
            {!isCollapsed && (
              <Button
                type="button"
                size="sm"
                onClick={() => openAuth("signup")}
                className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-medium"
              >
                Sign up
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Auth Dialogs */}
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
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-white/10 bg-black/65 backdrop-blur-xl h-screen sticky top-0 transition-all duration-300 z-30 shrink-0",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Mobile Sidebar (Drawer) */}
      <aside
        className={cn(
          "md:hidden fixed top-0 bottom-0 left-0 bg-black border-r border-white/10 w-64 z-50 transition-transform duration-300 ease-in-out flex flex-col",
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header with close button */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-emerald-300" />
            <span className="font-semibold text-white">AI Playlist</span>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="size-8 grid place-items-center rounded-lg hover:bg-white/10 text-white/70"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Force collapsed to false for mobile menu since it's full width */}
          <MobileContentWrapper onNavigate={onNavigate} setIsOpenMobile={setIsOpenMobile} currentPage={currentPage} handleLogoutConfirm={handleLogoutConfirm} openAuth={openAuth} logoutOpen={logoutOpen} setLogoutOpen={setLogoutOpen} isLoggingOut={isLoggingOut} authOpen={authOpen} setAuthOpen={setAuthOpen} authMode={authMode} displayName={displayName} loading={loading} user={user} />
        </div>
      </aside>
    </>
  );
}

// A simple inner component to avoid duplicating auth logic and force collapsed to false in mobile drawer
function MobileContentWrapper({
  currentPage,
  onNavigate,
  setIsOpenMobile,
  handleLogoutConfirm,
  openAuth,
  logoutOpen,
  setLogoutOpen,
  isLoggingOut,
  authOpen,
  setAuthOpen,
  authMode,
  displayName,
  loading,
  user,
}: any) {
  const navItems = [
    { id: "home" as AppPage, label: "Discover", icon: Compass },
    { id: "favorites" as AppPage, label: "Favorites", icon: Heart },
    { id: "history" as AppPage, label: "History", icon: History },
  ];

  const handleNavClick = (page: AppPage, isPlaylist = false) => {
    onNavigate(page);
    setIsOpenMobile(false);
    if (isPlaylist) {
      setTimeout(() => {
        const el = document.getElementById("playlist-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  };

  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
                )}
              >
                <Icon className={cn("size-5 shrink-0", isActive ? "text-emerald-300" : "text-white/60")} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => handleNavClick("home", true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white border border-transparent transition duration-200"
          >
            <ListMusic className="size-5 shrink-0" />
            <span>Playlist Maker</span>
          </button>
        </nav>
      </div>

      <div className="space-y-4 border-t border-white/10 pt-4 mt-8">
        {loading ? (
          <div className="flex justify-center py-2">
            <span className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-emerald-300" />
          </div>
        ) : user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-2">
              <CircleUser className="size-6 shrink-0 text-emerald-300" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-white/90">
                  {displayName}
                </div>
                <div className="text-[10px] text-white/40 leading-none">Active User</div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLogoutOpen(true)}
              className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
            >
              <LogOut className="size-4 shrink-0" />
              <span className="ml-2">Log out</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => openAuth("login")}
              className="w-full text-white/80 hover:bg-white/10 hover:text-white"
            >
              Log in
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => openAuth("signup")}
              className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-medium"
            >
              Sign up
            </Button>
          </div>
        )}
      </div>

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
    </div>
  );
}
