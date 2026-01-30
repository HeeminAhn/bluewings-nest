import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPost } from '@/lib/server-api';
import PostDetailClient from './PostDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 동적 메타데이터 생성 (SEO)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(parseInt(id));

  if (!post) {
    return {
      title: '게시글을 찾을 수 없습니다 - 블루윙즈 둥지',
    };
  }

  const description = post.content.slice(0, 150) + (post.content.length > 150 ? '...' : '');

  return {
    title: `${post.title} - 블루윙즈 둥지`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.createdAt,
      authors: [post.author.nickname],
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description,
    },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const postId = parseInt(id);

  const post = await getPost(postId);

  if (!post) {
    notFound();
  }

  return <PostDetailClient initialPost={post} postId={postId} />;
}
