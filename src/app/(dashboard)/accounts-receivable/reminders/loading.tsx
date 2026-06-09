export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-7 w-48 bg-border rounded" />
          <div className="h-4 w-56 bg-border/60 rounded mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5 space-y-3">
            <div className="h-3 w-20 bg-border rounded" />
            <div className="h-6 w-16 bg-border rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5 space-y-3">
            <div className="h-4 w-40 bg-border rounded" />
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="py-3 flex items-center gap-4">
                  <div className="h-4 w-32 bg-border/60 rounded" />
                  <div className="h-4 flex-1 bg-border/40 rounded" />
                  <div className="h-8 w-20 bg-border/30 rounded-lg ml-auto" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
