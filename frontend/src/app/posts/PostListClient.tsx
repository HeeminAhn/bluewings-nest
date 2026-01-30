'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, PenSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { PostCard } from '@/components/community';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { PostListItem, Category } from '@/lib/types';

interface PostListClientProps {
  initialPosts: PostListItem[];
  initialTotalPages: number;
  initialCurrentPage: number;
  initialCategories: Category[];
  initialKeyword: string;
  initialCategoryId?: number;
}

export default function PostListClient({
  initialPosts,
  initialTotalPages,
  initialCurrentPage,
  initialCategories,
  initialKeyword,
  initialCategoryId,
}: PostListClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  const [posts, setPosts] = useState<PostListItem[]>(initialPosts);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);

  // URL에서 현재 파라미터 읽기
  const page = parseInt(searchParams.get('page') || '0');
  const keyword = searchParams.get('keyword') || '';
  const categoryId = searchParams.get('categoryId')
    ? parseInt(searchParams.get('categoryId')!)
    : undefined;

  // URL 파라미터가 변경되면 데이터 refetch
  const fetchPosts = useCallback(async () => {
    // 초기 렌더링 시 서버 데이터와 동일하면 fetch 하지 않음
    if (
      page === initialCurrentPage &&
      keyword === initialKeyword &&
      categoryId === initialCategoryId
    ) {
      return;
    }

    setIsLoading(true);
    const response = keyword
      ? await api.searchPosts(keyword, page, 20, categoryId)
      : await api.getPosts(page, 20, categoryId);

    if (response.success && response.data) {
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    }
    setIsLoading(false);
  }, [page, keyword, categoryId, initialCurrentPage, initialKeyword, initialCategoryId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword.trim()) {
      params.set('keyword', searchKeyword);
    }
    if (categoryId) params.set('categoryId', categoryId.toString());
    params.set('page', '0');
    router.push(`/posts?${params.toString()}`);
  };

  const handleCategoryChange = (newCategoryId: number | undefined) => {
    const params = new URLSearchParams();
    if (newCategoryId) params.set('categoryId', newCategoryId.toString());
    if (keyword) params.set('keyword', keyword);
    params.set('page', '0');
    router.push(`/posts?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    if (keyword) params.set('keyword', keyword);
    if (categoryId) params.set('categoryId', categoryId.toString());
    router.push(`/posts?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    router.push('/posts');
  };

  // 인증 상태는 hydration 후에만 표시
  const showAuthUI = _hasHydrated && isAuthenticated;

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
              <h1 className="text-lg font-bold text-bluewings">커뮤니티</h1>
            </Link>
            {showAuthUI && (
              <Link
                href="/posts/write"
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
              placeholder="게시글 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-bluewings/30"
            />
          </div>
        </form>

        {initialCategories.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => handleCategoryChange(undefined)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !categoryId
                  ? 'bg-bluewings text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              전체
            </button>
            {initialCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  categoryId === category.id
                    ? 'bg-bluewings text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

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
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {keyword ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
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
          href="/posts/write"
          className="fixed bottom-6 right-6 w-14 h-14 bg-bluewings text-white rounded-full shadow-lg flex items-center justify-center hover:bg-bluewings-dark transition-colors"
        >
          <PenSquare className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
}
