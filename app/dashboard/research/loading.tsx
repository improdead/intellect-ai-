import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 bg-muted animate-pulse rounded mb-6"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={`skeleton-${index}`}
            className="border-primary/10 bg-card/50 backdrop-blur-sm"
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                  <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-full bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
