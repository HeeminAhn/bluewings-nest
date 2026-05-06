import { Metadata } from 'next';
import { Suspense } from 'react';
import { getPosts, searchPosts, getCategories, getPostsByMember } from '@/lib/server-api';
import PostListClient from './PostListClient';

export const metadata: Metadata = {
  title: '커뮤니티 - 블루윙즈 둥지',
  description: '수원 삼성 블루윙즈 팬들의 커뮤니티 게시판입니다. 경기 이야기, 선수 응원, 팬 모임 등 다양한 이야기를 나눠보세요.',
  openGraph: {
    title: '커뮤니티 - 블루윙즈 둥지',
    description: '수원 삼성 블루윙즈 팬들의 커뮤니티 게시판입니다.',
    type: 'website',
  },
};

interface PageProps {
  searchParams: Promise<{ page?: string; keyword?: string; categoryId?: string; authorId?: string }>;
}

function PostListSkeleton() {
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

async function PostListContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '0');
  const keyword = params.keyword || '';
  const categoryId = params.categoryId ? parseInt(params.categoryId) : undefined;
  const authorId = params.authorId ? parseInt(params.authorId) : undefined;

  // 서버에서 초기 데이터 fetch (병렬 처리)
  const [postsData, categories] = await Promise.all([
    authorId
      ? getPostsByMember(authorId, page, 20)
      : keyword
        ? searchPosts(keyword, page, 20, categoryId)
        : getPosts(page, 20, categoryId),
    getCategories(),
  ]);

  return (
    <PostListClient
      initialPosts={postsData?.posts || []}
      initialTotalPages={postsData?.totalPages || 0}
      initialCurrentPage={postsData?.currentPage || 0}
      initialCategories={categories || []}
      initialKeyword={keyword}
      initialCategoryId={categoryId}
      initialAuthorId={authorId}
    />
  );
}

export default async function PostListPage(props: PageProps) {
  return (
    <Suspense fallback={<PostListSkeleton />}>
      <PostListContent {...props} />
    </Suspense>
  );
}
