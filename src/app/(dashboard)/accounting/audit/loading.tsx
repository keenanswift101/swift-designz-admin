export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-52 bg-border rounded" />
        <div className="h-4 w-80 bg-border/60 rounded mt-2" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5 text-center space-y-2">
            <div className="h-3 w-24 bg-border rounded mx-auto" />
            <div className="h-6 w-20 bg-border rounded mx-auto" />
          </div>
        ))}
      </div>
      <div className="glass-card p-4 mb-4">
        <div className="h-9 w-full bg-border/40 rounded-lg" />
      </div>
      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-4">
              <div className="h-4 w-24 bg-border/60 rounded" />
              <div className="h-4 flex-1 bg-border/40 rounded" />
              <div className="h-4 w-20 bg-border/40 rounded" />
              <div className="h-6 w-16 bg-border/30 rounded-full ml-auto" />
              <div className="h-4 w-20 bg-border/30 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
