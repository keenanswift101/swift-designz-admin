export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-48 bg-border rounded" />
        <div className="h-4 w-64 bg-border/60 rounded mt-2" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5 space-y-3">
            <div className="h-3 w-20 bg-border rounded" />
            <div className="h-6 w-28 bg-border rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card p-6 space-y-3">
            <div className="h-7 w-7 bg-border rounded" />
            <div className="h-5 w-32 bg-border rounded" />
            <div className="h-4 w-48 bg-border/60 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
