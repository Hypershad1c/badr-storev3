import { DashboardStatSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-36 bg-muted rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-64 bg-muted/60 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <DashboardStatSkeleton key={i} />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6">
          <div className="h-5 w-40 bg-muted rounded animate-pulse mb-4" />
          <div className="h-60 bg-muted/30 rounded-xl animate-pulse" />
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="h-5 w-32 bg-muted rounded animate-pulse mb-4" />
          <div className="h-60 bg-muted/30 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
