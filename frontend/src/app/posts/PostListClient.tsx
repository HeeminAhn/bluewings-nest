'use client';

import { useState, useEffect } from 'react';
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
  initialAuthorId?: number;
}

export default function PostListClient({
  initialPosts,
  initialTotalPages,
  initialCurrentPage,
  initialCategories,
  initialKeyword,
  initialCategoryId,
  initialAuthorId,
}: PostListClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  const [posts, setPosts] = useState<PostListItem[]>(initialPosts);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);

  const keyword = searchParams.get('keyword') || '';
  const categoryId = searchParams.get('categoryId')
    ? parseInt(searchParams.get('categoryId')!)
    : undefined;
  const authorId = searchParams.get('authorId')
    ? parseInt(searchParams.get('authorId')!)
    : undefined;

  useEffect(() => {
    setPosts(initialPosts);
    setTotalPages(initialTotalPages);
    setCurrentPage(initialCurrentPage);
  }, [initialPosts, initialTotalPages, initialCurrentPage]);

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
    router.replace(`/posts?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    if (authorId) params.set('authorId', authorId.toString());
    if (keyword) params.set('keyword', keyword);
    if (categoryId) params.set('categoryId', categoryId.toString());
    router.replace(`/posts?${params.toString()}`);
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
    <div className="min-h-screen bg-[#fcf9f8] pb-24 md:pb-8">
      <Header title={authorId ? "내가 쓴 글" : "Grandbleu Zone"} />

      <main className="max-w-[1280px] mx-auto px-6 py-5">
        {/* 페이지 소개 */}
        {!authorId && (
          <div className="mb-6">
            <p className="text-[#424751] text-sm">팬들과 전술을 논하고, MVP에 투표하고, 경기의 열정을 나누세요.</p>
          </div>
        )}

        {/* PC: 검색과 카테고리를 한 줄에 배치 */}
        {!authorId && (
          <div className="hidden md:flex items-center justify-between gap-4 mb-5">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => handleCategoryChange(undefined)}
                className={`uppercase tracking-wider text-xs font-semibold ${
                  !categoryId
                    ? 'bg-[#004C97] hover:bg-[#00366e] text-white'
                    : 'bg-white border border-[#c2c6d3] text-[#424751] hover:bg-[#f0eded]'
                }`}
              >
                전체
              </Button>
              {initialCategories.map((category) => (
                <Button
                  key={category.id}
                  size="sm"
                  onClick={() => handleCategoryChange(category.id)}
                  className={`text-xs font-semibold ${
                    categoryId === category.id
                      ? 'bg-[#004C97] hover:bg-[#00366e] text-white'
                      : 'bg-white border border-[#c2c6d3] text-[#424751] hover:bg-[#f0eded]'
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            <form onSubmit={handleSearch} className="w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737782]" />
                <Input
                  type="text"
                  placeholder="게시글 검색..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10 bg-white border border-[#c2c6d3] focus:border-[#004C97] focus:ring-[#004C97]"
                />
              </div>
            </form>
          </div>
        )}

        {/* 모바일 */}
        {!authorId && (
          <div className="md:hidden">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737782]" />
                <Input
                  type="text"
                  placeholder="게시글 검색..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10 bg-white border border-[#c2c6d3]"
                />
              </div>
            </form>

            {initialCategories.length > 0 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                  size="sm"
                  onClick={() => handleCategoryChange(undefined)}
                  className={`shrink-0 text-xs font-semibold ${
                    !categoryId
                      ? 'bg-[#004C97] hover:bg-[#00366e] text-white'
                      : 'bg-white border border-[#c2c6d3] text-[#424751] hover:bg-[#f0eded]'
                  }`}
                >
                  전체
                </Button>
                {initialCategories.map((category) => (
                  <Button
                    key={category.id}
                    size="sm"
                    onClick={() => handleCategoryChange(category.id)}
                    className={`shrink-0 text-xs font-semibold ${
                      categoryId === category.id
                        ? 'bg-[#004C97] hover:bg-[#00366e] text-white'
                        : 'bg-white border border-[#c2c6d3] text-[#424751] hover:bg-[#f0eded]'
                    }`}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {keyword && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[#424751]">"{keyword}" 검색 결과</p>
            <Button variant="ghost" size="sm" onClick={handleClearSearch} className="text-[#004C97] font-semibold">
              검색 초기화
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#004C97]" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="border border-[#c2c6d3] shadow-sm">
            <CardContent className="py-12 text-center text-[#737782]">
              {keyword ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 모바일: 카드 뷰 */}
            <div className="flex flex-col gap-3 md:hidden">
              {posts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`}>
                  <Card className="border border-[#c2c6d3] shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {post.category && (
                        <Badge
                          className="mb-2 text-xs border-0 font-semibold"
                          style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
                        >
                          {post.category.name}
                        </Badge>
                      )}
                      <h3 className="font-semibold text-[#1c1b1b] mb-2 line-clamp-2">{post.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            {post.author.profileImageUrl ? (
                              <AvatarImage src={api.getImageUrl(post.author.profileImageUrl)} />
                            ) : null}
                            <AvatarFallback className="text-xs bg-[#d6e3ff] text-[#004C97]">
                              {post.author.nickname.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-[#424751]">{post.author.nickname}</span>
                          <span className="text-xs text-[#737782]">{formatDate(post.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#737782]">
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

            {/* PC: 리스트 */}
            <div className="hidden md:flex flex-col gap-2">
              {posts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`}>
                  <Card className="border border-[#c2c6d3] shadow-sm hover:shadow-md hover:border-[#004C97]/30 transition-all">
                    <div className="flex items-stretch">
                      {/* 좋아요 카운트 */}
                      <div className="w-16 flex-shrink-0 flex flex-col items-center justify-center py-4 bg-[#f0eded] rounded-l-lg">
                        <ChevronUp className="w-5 h-5 text-[#c2c6d3]" />
                        <span className="text-sm font-bold text-[#1c1b1b]">{post.likeCount}</span>
                      </div>

                      {/* 메인 콘텐츠 */}
                      <div className="flex-1 py-4 px-4 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {post.category && (
                            <Badge
                              className="text-xs border-0 font-semibold"
                              style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
                            >
                              {post.category.name}
                            </Badge>
                          )}
                          <span className="text-xs text-[#737782]">
                            {post.author.nickname} · {formatDate(post.createdAt)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-[#1c1b1b] hover:text-[#004C97] transition-colors line-clamp-1">
                          {post.title}
                        </h3>
                      </div>

                      {/* 통계 */}
                      <div className="flex items-center gap-6 px-6 text-sm text-[#737782]">
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
              className="border-[#c2c6d3]"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-4 py-2 text-sm text-[#424751] font-semibold">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="border-[#c2c6d3]"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>

      {showAuthUI && (
        <Link
          href="/posts/write"
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-[#004C97] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#00366e] hover:scale-110 transition-all z-40"
        >
          <PenSquare className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
}
