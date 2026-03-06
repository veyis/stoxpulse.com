export default function StockLoading() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        {/* Breadcrumb skeleton */}
        <div className="mb-8 flex items-center gap-2">
          <div className="h-4 w-10 animate-pulse rounded bg-surface-2" />
          <div className="h-4 w-3 animate-pulse rounded bg-surface-2" />
          <div className="h-4 w-12 animate-pulse rounded bg-surface-2" />
          <div className="h-4 w-3 animate-pulse rounded bg-surface-2" />
          <div className="h-4 w-14 animate-pulse rounded bg-surface-2" />
        </div>

        {/* Badge skeleton */}
        <div className="mb-3 flex items-center gap-3">
          <div className="h-6 w-20 animate-pulse rounded-full bg-surface-2" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-surface-2" />
        </div>

        {/* Title skeleton */}
        <div className="mb-10">
          <div className="h-10 w-3/4 animate-pulse rounded-lg bg-surface-2" />
        </div>

        {/* Overview card skeleton */}
        <div className="mb-10 rounded-2xl border border-border bg-surface-1 p-6">
          <div className="mb-3 h-6 w-40 animate-pulse rounded bg-surface-2" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-surface-2" />
          </div>
        </div>

        {/* Stats table skeleton */}
        <div className="mb-10">
          <div className="mb-4 h-6 w-36 animate-pulse rounded bg-surface-2" />
          <div className="rounded-2xl border border-border bg-surface-1 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-6 py-3 ${i % 2 === 0 ? "bg-surface-1" : "bg-surface-2/50"}`}
              >
                <div className="h-4 w-24 animate-pulse rounded bg-surface-2" />
                <div className="h-4 w-40 animate-pulse rounded bg-surface-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Sections skeleton */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="size-9 animate-pulse rounded-lg bg-surface-2" />
              <div className="h-6 w-48 animate-pulse rounded bg-surface-2" />
            </div>
            <div className="rounded-2xl border border-border bg-surface-1 p-6">
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
