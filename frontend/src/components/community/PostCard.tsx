import Link from 'next/link';
import { Eye, Heart, MessageCircle } from 'lucide-react';
import type { PostListItem } from '@/lib/types';
import { GradeBadge } from '../member/GradeBadge';

// 색상 코드별 Tailwind 클래스 매핑
const COLOR_CLASSES: Record<string, string> = {
  gray: 'text-gray-700 bg-gray-100',
  blue: 'text-blue-700 bg-blue-100',
  green: 'text-green-700 bg-green-100',
  purple: 'text-purple-700 bg-purple-100',
  orange: 'text-orange-700 bg-orange-100',
  yellow: 'text-yellow-700 bg-yellow-100',
  pink: 'text-pink-700 bg-pink-100',
  red: 'text-red-700 bg-red-100',
  indigo: 'text-indigo-700 bg-indigo-100',
  teal: 'text-teal-700 bg-teal-100',
  cyan: 'text-cyan-700 bg-cyan-100',
};

const getCategoryColorClass = (color: string): string => {
  return COLOR_CLASSES[color] || COLOR_CLASSES['gray'];
};

interface PostCardProps {
  post: PostListItem;
}

export function PostCard({ post }: PostCardProps) {
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
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <Link href={`/posts/${post.id}`} className="block">
      <div className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow">
        {post.category && (
          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2 ${getCategoryColorClass(post.category.color)}`}>
            {post.category.name}
          </span>
        )}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {post.title}
        </h3>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">{post.author.nickname}</span>
            <GradeBadge grade={post.author.grade} showName={false} size="sm" />
          </div>
          <span className="text-gray-400">{formatDate(post.createdAt)}</span>
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {post.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {post.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {post.commentCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
