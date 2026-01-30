'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, PenSquare, ChevronLeft, ChevronRight, Pin, Eye } from 'lucide-react';
import { GradeBadge } from '@/components/member/GradeBadge';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { NoticeListItem } from '@/lib/types';

interface NoticesClientProps {
  initialNotices: NoticeListItem[];
  initialTotalPages: number;
  initialCurrentPage: number;
  initialKeyword: string;
}

export default function NoticesClient({
  initialNotices,
  initialTotalPages,
  initialCurrentPage,
  initialKeyword,
}: NoticesClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, member, _hasHydrated } = useAuthStore();

  const [notices, setNotices] = useState<NoticeListItem[]>(initialNotices);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);

  const page = parseInt(searchParams.get('page') || '0');
  const keyword = searchParams.get('keyword') || '';
  const isAdmin = _hasHydrated && member?.role === 'ADMIN';
  const showAuthUI = _hasHydrated && isAuthenticated && isAdmin;

  const fetchNotices = useCallback(async () => {
    if (page === initialCurrentPage && keyword === initialKeyword) {
      return;
    }

    setIsLoading(true);
    const response = keyword
      ? await api.searchNotices(keyword, page)
      : await api.getNotices(page);

    if (response.success && response.data) {
      setNotices(response.data.notices);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    }
    setIsLoading(false);
  }, [page, keyword, initialCurrentPage, initialKeyword]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword.trim()) {
      params.set('keyword', searchKeyword);
    }
    params.set('page', '0');
    router.push(`/notices?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    if (keyword) params.set('keyword', keyword);
    router.push(`/notices?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    router.push('/notices');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/android-chrome-512x512.png"
                alt="블루윙즈 둥지"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <h1 className="text-lg font-bold text-bluewings">공지사항</h1>
            </Link>
            {showAuthUI && (
              <Link
                href="/notices/write"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-bluewings"
              >
                <PenSquare className="w-6 h-6" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="공지사항 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-bluewings/30"
            />
          </div>
        </form>

        {keyword && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">"{keyword}" 검색 결과</p>
            <button onClick={handleClearSearch} className="text-sm text-bluewings">
              검색 초기화
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-bluewings border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {keyword ? '검색 결과가 없습니다.' : '아직 공지사항이 없습니다.'}
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <Link
                key={notice.id}
                href={`/notices/${notice.id}`}
                className="block bg-white rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {notice.isPinned && (
                    <div className="flex-shrink-0 mt-1">
                      <Pin className="w-4 h-4 text-red-500 fill-current" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium text-gray-900 line-clamp-2 ${
                        notice.isPinned ? 'text-red-600' : ''
                      }`}
                    >
                      {notice.isPinned && <span className="text-red-500 mr-1">[공지]</span>}
                      {notice.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <span>{notice.author.nickname}</span>
                        <GradeBadge grade={notice.author.grade} showName={false} size="sm" />
                      </div>
                      <span>{formatDate(notice.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {notice.viewCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      {showAuthUI && (
        <Link
          href="/notices/write"
          className="fixed bottom-6 right-6 w-14 h-14 bg-bluewings text-white rounded-full shadow-lg flex items-center justify-center hover:bg-bluewings-dark transition-colors"
        >
          <PenSquare className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
}
