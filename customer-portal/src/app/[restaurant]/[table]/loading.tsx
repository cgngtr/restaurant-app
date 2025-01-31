export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-6">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Menu section skeleton */}
      <div className="grid gap-6">
        <section>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-lg shadow-sm animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="h-16 w-16 bg-gray-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded" />
                    <div className="h-4 w-1/4 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
} 