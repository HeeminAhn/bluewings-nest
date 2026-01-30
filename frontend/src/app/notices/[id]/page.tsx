import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNotice } from '@/lib/server-api';
import NoticeDetailClient from './NoticeDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const notice = await getNotice(parseInt(id));

  if (!notice) {
    return {
      title: '공지사항을 찾을 수 없습니다 - 블루윙즈 둥지',
    };
  }

  const description = notice.content.slice(0, 150) + (notice.content.length > 150 ? '...' : '');

  return {
    title: `${notice.title} - 블루윙즈 둥지 공지사항`,
    description,
    openGraph: {
      title: notice.title,
      description,
      type: 'article',
      publishedTime: notice.createdAt,
    },
  };
}

export default async function NoticeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const notice = await getNotice(parseInt(id));

  if (!notice) {
    notFound();
  }

  return <NoticeDetailClient initialNotice={notice} />;
}
