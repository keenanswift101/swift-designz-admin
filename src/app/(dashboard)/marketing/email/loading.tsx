export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 w-40 bg-border rounded" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-5 space-y-3">
            <div className="h-3 w-16 bg-border rounded" />
            <div className="h-6 w-20 bg-border rounded" />
          </div>
        ))}
      </div>
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border h-12" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex gap-4 border-b border-border">
            <div className="h-4 w-48 bg-border/60 rounded" />
            <div className="h-4 flex-1 bg-border/40 rounded" />
            <div className="h-4 w-20 bg-border/30 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
