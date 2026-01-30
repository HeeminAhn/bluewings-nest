import { Metadata } from 'next';
import { Suspense } from 'react';
import { getNotices, searchNotices } from '@/lib/server-api';
import NoticesClient from './NoticesClient';

export const metadata: Metadata = {
  title: '공지사항 - 블루윙즈 둥지',
  description: '블루윙즈 둥지의 공지사항입니다. 중요한 소식과 업데이트를 확인하세요.',
  openGraph: {
    title: '공지사항 - 블루윙즈 둥지',
    description: '블루윙즈 둥지의 공지사항입니다.',
    type: 'website',
  },
};

interface PageProps {
  searchParams: Promise<{ page?: string; keyword?: string }>;
}

function NoticesSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4">
            <div className="h-5 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </main>
    </div>
  );
}

async function NoticesContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '0');
  const keyword = params.keyword || '';

  const noticesData = keyword
    ? await searchNotices(keyword, page)
    : await getNotices(page);

  return (
    <NoticesClient
      initialNotices={noticesData?.notices || []}
      initialTotalPages={noticesData?.totalPages || 0}
      initialCurrentPage={noticesData?.currentPage || 0}
      initialKeyword={keyword}
    />
  );
}

export default async function NoticesPage(props: PageProps) {
  return (
    <Suspense fallback={<NoticesSkeleton />}>
      <NoticesContent {...props} />
    </Suspense>
  );
}
