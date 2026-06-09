export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-7 w-40 bg-border rounded" />
          <div className="h-4 w-56 bg-border/60 rounded mt-2" />
        </div>
        <div className="h-9 w-24 bg-border rounded-lg" />
      </div>
      <div className="glass-card p-6 mb-6 space-y-4">
        <div className="h-4 w-32 bg-border rounded" />
        <div className="h-10 w-48 bg-border rounded" />
        <div className="h-2 w-full bg-border/40 rounded-full" />
      </div>
      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-4">
              <div className="h-4 w-28 bg-border/60 rounded" />
              <div className="h-4 flex-1 bg-border/40 rounded" />
              <div className="h-4 w-24 bg-border/30 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
