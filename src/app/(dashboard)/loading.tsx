export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-border rounded-lg" />
        <div className="h-4 w-72 bg-border/60 rounded-lg" />
      </div>

      {/* Cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5 space-y-3">
            <div className="h-3 w-20 bg-border rounded" />
            <div className="h-6 w-28 bg-border rounded" />
          </div>
        ))}
      </div>

      {/* Main content area */}
      <div className="glass-card p-6 space-y-4">
        <div className="h-4 w-32 bg-border rounded" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-3 w-24 bg-border rounded" />
              <div className="h-3 flex-1 bg-border/60 rounded" />
              <div className="h-3 w-16 bg-border rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
