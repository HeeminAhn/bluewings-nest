import { Metadata } from 'next';
import { Suspense } from 'react';
import { getStandings } from '@/lib/server-api';
import MatchesClient from './MatchesClient';

// 빌드 시점이 아닌 요청 시점에 데이터를 가져오도록 동적 렌더링 강제
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '경기 정보 - 블루윙즈 둥지',
  description: '수원 삼성 블루윙즈의 경기 일정, 결과, K리그 순위표를 확인하세요.',
  openGraph: {
    title: '경기 정보 - 블루윙즈 둥지',
    description: '수원 삼성 블루윙즈의 경기 일정, 결과, K리그 순위표를 확인하세요.',
    type: 'website',
  },
};

function MatchesSkeleton() {
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

async function MatchesContent() {
  const currentYear = new Date().getFullYear();
  const standingsData = await getStandings(currentYear.toString());

  return (
    <MatchesClient
      initialStandings={standingsData?.standings || []}
      initialYear={currentYear}
    />
  );
}

export default async function MatchesPage() {
  return (
    <Suspense fallback={<MatchesSkeleton />}>
      <MatchesContent />
    </Suspense>
  );
}
