export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-7 w-40 bg-border rounded" />
      <div className="flex items-center justify-between">
        <div className="h-8 w-8 bg-border rounded-lg" />
        <div className="h-5 w-36 bg-border rounded" />
        <div className="h-8 w-8 bg-border rounded-lg" />
      </div>
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="px-2 py-2 h-8 bg-border/20" />
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="min-h-[90px] border-r border-b border-border p-1.5 space-y-1">
              <div className="h-4 w-4 bg-border/40 rounded-full" />
              {i % 4 === 0 && <div className="h-4 bg-border/30 rounded" />}
              {i % 7 === 0 && <div className="h-4 bg-border/20 rounded" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
