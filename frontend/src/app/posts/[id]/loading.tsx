export default function PostDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white sticky top-0 z-40 border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        <article className="bg-white p-4">
          <div className="h-6 w-16 bg-gray-200 rounded-full mb-3 animate-pulse" />
          <div className="h-8 w-3/4 bg-gray-200 rounded mb-4 animate-pulse" />

          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <div className="h-10 w-20 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-10 w-20 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </article>

        <section className="bg-white mt-2 p-4">
          <div className="h-6 w-24 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
