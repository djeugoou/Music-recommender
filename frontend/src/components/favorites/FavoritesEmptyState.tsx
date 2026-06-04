import { Music2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type FavoritesEmptyStateProps = {
  onDiscover: () => void;
};

export function FavoritesEmptyState({ onDiscover }: FavoritesEmptyStateProps) {
  return (
    <Card className="relative overflow-hidden border-white/10 bg-white/[0.04] py-16 ring-white/10 backdrop-blur-xl">
      <div className="pointer-events-none absolute -top-20 left-1/2 size-64 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
      <CardContent className="relative flex flex-col items-center px-6 text-center">
        <div className="relative mb-6">
          <div className="grid size-20 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-violet-500/10 backdrop-blur">
            <Music2 className="size-10 text-emerald-300" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 size-6 text-amber-300/90" />
        </div>
        <h3 className="text-xl font-semibold text-white">No favorite songs yet.</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">
          Start exploring recommendations and save tracks you love.
        </p>
        <Button
          type="button"
          onClick={onDiscover}
          className="mt-8 h-11 rounded-xl bg-emerald-500 px-8 font-semibold text-black hover:bg-emerald-400"
        >
          Discover Music
        </Button>
      </CardContent>
    </Card>
  );
}
