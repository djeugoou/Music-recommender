import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="mx-auto w-full max-w-5xl px-4 pt-10 sm:pt-14">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5">
            <span className="text-lg font-semibold tracking-tight">AI</span>
          </div>
          <div>
            <div className="text-sm text-white/70">Mood Music</div>
            <div className="text-base font-semibold">Welcome Dear Dreamers</div>
          </div>
        </div>
        <Badge
          variant="outline"
          className="hidden border-white/10 bg-white/5 text-white/60 sm:inline-flex"
        >
           Generate Your Playlist
        </Badge>
      </div>
    </header>
  );
}
