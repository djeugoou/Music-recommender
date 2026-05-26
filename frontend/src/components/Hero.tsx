import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type HeroProps = {
  mood: string;
  setMood: (value: string) => void;
  onGenerate: () => void;
  isGenerateDisabled: boolean;
  isLoading: boolean;
};

export function Hero({
  mood,
  setMood,
  onGenerate,
  isGenerateDisabled,
  isLoading,
}: HeroProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-10 pt-10 sm:pb-14 sm:pt-14">
      <Card className="relative overflow-hidden rounded-3xl border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] py-0 ring-white/10">
        <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-lime-400/10 blur-3xl" />

        <CardContent className="relative px-6 py-8 sm:px-10 sm:py-10">
          <p className="text-xs font-semibold tracking-widest text-emerald-300/90">
            YOUR MOOD → A CURATED MINI PLAYLIST
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Describe how you feel, and I’ll generate a playlist that matches the
            vibe.
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-white/70 sm:text-base">
            Keep it simple (“chill”, “focused”, “heartbroken”) or be specific
            (“late-night drive in the rain”)
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="w-full sm:flex-1">
              <span className="sr-only">How are you feeling?</span>
              <Input
                type="text"
                placeholder="How are you feeling?"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="h-12 rounded-2xl border-white/10 bg-black/30 px-4 text-base text-white placeholder:text-white/40"
              />
            </label>

            <Button
              onClick={onGenerate}
              disabled={isGenerateDisabled}
              className="h-12 rounded-2xl bg-emerald-500 px-6 text-base font-semibold text-black hover:bg-emerald-400 active:bg-emerald-500 disabled:opacity-50"
            >
              {isLoading ? "Generating..." : "Generate Playlist"}
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-white/10 bg-white/5 text-white/55"
            >
              Fast
            </Badge>
            <Badge
              variant="outline"
              className="border-white/10 bg-white/5 text-white/55"
            >
              Beginner-friendly
            </Badge>
            <Badge
              variant="outline"
              className="border-white/10 bg-white/5 text-white/55"
            >
              Responsive
            </Badge>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
