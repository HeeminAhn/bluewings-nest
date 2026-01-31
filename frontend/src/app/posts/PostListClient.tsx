'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, PenSquare, ChevronLeft, ChevronRight, Eye, MessageCircle, Loader2, Heart, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header } from '@/components/layout';
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

  const isFirstRender = useRef(true);
  const prevParams = useRef({ page: 0, keyword: '', categoryId: undefined as number | undefined });

  const page = parseInt(searchParams.get('page') || '0');
  const keyword = searchParams.get('keyword') || '';
  const categoryId = searchParams.get('categoryId')
    ? parseInt(searchParams.get('categoryId')!)
    : undefined;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevParams.current = { page, keyword, categoryId };
      return;
    }

    if (
      prevParams.current.page === page &&
      prevParams.current.keyword === keyword &&
      prevParams.current.categoryId === categoryId
    ) {
      return;
    }

    prevParams.current = { page, keyword, categoryId };

    const fetchPosts = async () => {
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
    };

    fetchPosts();
  }, [page, keyword, categoryId]);

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const showAuthUI = _hasHydrated && isAuthenticated;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24 md:pb-8">
      <Header title="커뮤니티" />

      <main className="max-w-5xl mx-auto px-4 py-4">
        {/* PC: 검색과 카테고리를 한 줄에 배치 */}
        <div className="hidden md:flex items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!categoryId ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(undefined)}
              className={!categoryId ? 'bg-blue-700 hover:bg-blue-800' : 'bg-white'}
            >
              전체
            </Button>
            {initialCategories.map((category) => (
              <Button
                key={category.id}
                variant={categoryId === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
                className={categoryId === category.id ? 'bg-blue-700 hover:bg-blue-800' : 'bg-white'}
              >
                {category.name}
              </Button>
            ))}
          </div>
          <form onSubmit={handleSearch} className="w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="게시글 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10 bg-white border-0 shadow-sm"
              />
            </div>
          </form>
        </div>

        {/* 모바일: 기존 레이아웃 */}
        <div className="md:hidden">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="게시글 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10 bg-white border-0 shadow-sm"
              />
            </div>
          </form>

          {initialCategories.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={!categoryId ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(undefined)}
                className={!categoryId ? 'bg-blue-700 hover:bg-blue-800' : 'bg-white'}
              >
                전체
              </Button>
              {initialCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={categoryId === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange(category.id)}
                  className={categoryId === category.id ? 'bg-blue-700 hover:bg-blue-800' : 'bg-white'}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
        </div>

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
        ) : posts.length === 0 ? (
          <Card className="shadow-sm border-0 max-w-md">
            <CardContent className="py-12 text-center text-slate-500">
              {keyword ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 모바일: 카드 뷰 */}
            <div className="flex flex-col gap-3 md:hidden">
              {posts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`}>
                  <Card className="shadow-sm border-0 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {post.category && (
                        <Badge
                          variant="secondary"
                          className="mb-2 text-xs"
                          style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
                        >
                          {post.category.name}
                        </Badge>
                      )}
                      <h3 className="font-medium text-slate-900 mb-2 line-clamp-2">{post.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            {post.author.profileImageUrl ? (
                              <AvatarImage src={api.getImageUrl(post.author.profileImageUrl)} />
                            ) : null}
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                              {post.author.nickname.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-slate-500">{post.author.nickname}</span>
                          <span className="text-xs text-slate-400">{formatDate(post.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {post.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {post.commentCount}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* PC: Reddit 스타일 리스트 */}
            <div className="hidden md:flex flex-col gap-2">
              {posts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`}>
                  <Card className="shadow-sm border-0 hover:shadow-md transition-all">
                    <div className="flex items-stretch">
                      {/* 좋아요 카운트 */}
                      <div className="w-16 flex-shrink-0 flex flex-col items-center justify-center py-4 bg-slate-50 rounded-l-xl">
                        <ChevronUp className="w-5 h-5 text-slate-300" />
                        <span className="text-sm font-bold text-slate-700">{post.likeCount}</span>
                      </div>

                      {/* 메인 콘텐츠 */}
                      <div className="flex-1 py-4 px-4 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {post.category && (
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
                            >
                              {post.category.name}
                            </Badge>
                          )}
                          <span className="text-xs text-slate-400">
                            {post.author.nickname} · {formatDate(post.createdAt)}
                          </span>
                        </div>
                        <h3 className="font-medium text-slate-900 hover:text-blue-700 transition-colors line-clamp-1">
                          {post.title}
                        </h3>
                      </div>

                      {/* 통계 */}
                      <div className="flex items-center gap-6 px-6 text-sm text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.commentCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4" />
                          <span>{post.viewCount}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
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
          href="/posts/write"
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-800 hover:scale-110 transition-all z-40"
        >
          <PenSquare className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
}
