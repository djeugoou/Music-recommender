import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/10 ${className ?? ""}`}
    />
  );
}

export function FavoritesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden border-white/10 bg-white/[0.04] ring-white/10"
        >
          <SkeletonBlock className="h-44 w-full rounded-none" />
          <CardHeader className="space-y-2">
            <SkeletonBlock className="h-5 w-3/4" />
            <SkeletonBlock className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <SkeletonBlock className="h-6 w-20" />
            <SkeletonBlock className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
