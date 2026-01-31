'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, PenSquare, ChevronLeft, ChevronRight, Pin, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header, BottomNav } from '@/components/layout';
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
      <Header title="공지사항" showBack />

      <main className="max-w-2xl mx-auto px-4 py-4">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="공지사항 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-10 bg-white border-0 shadow-sm"
            />
          </div>
        </form>

        {keyword && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">"{keyword}" 검색 결과</p>
            <Button variant="ghost" size="sm" onClick={handleClearSearch} className="text-blue-700">
              검색 초기화
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
          </div>
        ) : notices.length === 0 ? (
          <Card className="shadow-sm border-0">
            <CardContent className="py-12 text-center text-slate-500">
              {keyword ? '검색 결과가 없습니다.' : '아직 공지사항이 없습니다.'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <Link key={notice.id} href={`/notices/${notice.id}`}>
                <Card className={`shadow-sm border-0 hover:shadow-md transition-shadow ${notice.isPinned ? 'border-l-4 border-l-red-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {notice.isPinned && (
                        <div className="flex-shrink-0 mt-1">
                          <Pin className="w-4 h-4 text-red-500 fill-current" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {notice.isPinned && (
                            <Badge variant="destructive" className="text-xs">공지</Badge>
                          )}
                        </div>
                        <h3 className={`font-medium text-slate-900 line-clamp-2 ${notice.isPinned ? 'text-red-700' : ''}`}>
                          {notice.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <span>{notice.author.nickname}</span>
                            <GradeBadge grade={notice.author.grade} showName={false} size="sm" />
                          </div>
                          <span>{formatDate(notice.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {notice.viewCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-4 py-2 text-sm text-slate-600">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>

      {showAuthUI && (
        <Link
          href="/notices/write"
          className="fixed bottom-20 right-4 w-14 h-14 bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-800 transition-colors z-40"
        >
          <PenSquare className="w-6 h-6" />
        </Link>
      )}

      <BottomNav />
    </div>
  );
}
