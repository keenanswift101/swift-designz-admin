export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-24 bg-border rounded" />
        <div className="h-4 w-48 bg-border/60 rounded mt-2" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-5 space-y-3">
            <div className="h-3 w-24 bg-border rounded" />
            <div className="h-6 w-32 bg-border rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-5 space-y-3">
            <div className="h-4 w-40 bg-border rounded" />
            <div className="h-4 w-full bg-border/40 rounded" />
            <div className="h-4 w-3/4 bg-border/30 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
