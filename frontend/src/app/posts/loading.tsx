export default function PostListLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-16 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4">
            <div className="h-4 w-16 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-5 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </main>
    </div>
  );
}
