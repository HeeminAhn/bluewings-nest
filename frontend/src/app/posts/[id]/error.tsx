'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PostDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('PostDetailError:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h2 className="text-xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
      <p className="text-gray-500 mb-6">게시글을 불러오는 중 문제가 발생했습니다.</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-bluewings text-white rounded-xl font-medium hover:bg-bluewings-dark transition-colors"
        >
          다시 시도
        </button>
        <Link
          href="/posts"
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
        >
          목록으로
        </Link>
      </div>
    </div>
  );
}
