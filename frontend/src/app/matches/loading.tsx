export default function MatchesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </header>
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-4 py-3">
            <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <main className="max-w-2xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="h-12 bg-gray-200 animate-pulse" />
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 border-t border-gray-100 bg-gray-50 animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}
