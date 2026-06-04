import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/10 ${className ?? ""}`}
    />
  );
}

export function HistorySkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden border-white/10 bg-white/[0.04] ring-white/10"
        >
          <CardHeader className="space-y-2">
            <SkeletonBlock className="h-5 w-2/3" />
            <SkeletonBlock className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <SkeletonBlock className="h-8 w-20" />
            <SkeletonBlock className="h-8 w-20" />
            <SkeletonBlock className="h-8 w-20" />
            <div className="flex-1" />
            <SkeletonBlock className="h-9 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
