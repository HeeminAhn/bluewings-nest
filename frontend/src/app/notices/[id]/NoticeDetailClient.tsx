'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Edit2, Trash2, MoreVertical, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GradeBadge } from '@/components/member/GradeBadge';
import { Toast } from '@/components/common';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Notice } from '@/lib/types';

interface NoticeDetailClientProps {
  initialNotice: Notice;
}

export default function NoticeDetailClient({ initialNotice }: NoticeDetailClientProps) {
  const router = useRouter();
  const { isAuthenticated, member, _hasHydrated } = useAuthStore();

  const [notice] = useState<Notice>(initialNotice);
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const isAdmin = _hasHydrated && member?.role === 'ADMIN';
  const showAdminUI = _hasHydrated && isAuthenticated && isAdmin;

  const handleDelete = async () => {
    if (!confirm('공지사항을 삭제하시겠습니까?')) return;

    const response = await api.deleteNotice(notice.id);
    if (response.success) {
      setToast({ message: '공지사항이 삭제되었습니다.', type: 'success' });
      setTimeout(() => router.push('/notices'), 1000);
    } else {
      setToast({ message: response.error?.message || '삭제에 실패했습니다.', type: 'error' });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white sticky top-0 z-40 border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.push('/notices')} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          {showAdminUI && (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-6 h-6" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[100px]">
                  <Link
                    href={`/notices/${notice.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                  >
                    <Edit2 className="w-4 h-4" />
                    수정
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-50 w-full whitespace-nowrap"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        <article className="bg-white p-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">{notice.title}</h1>

          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <div className="flex items-center gap-2">
              {notice.author.profileImageUrl ? (
                <img
                  src={api.getImageUrl(notice.author.profileImageUrl)}
                  alt={notice.author.nickname}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                  {notice.author.nickname.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{notice.author.nickname}</span>
                  <GradeBadge grade={notice.author.grade} showName={false} size="sm" />
                </div>
                <span className="text-sm text-gray-400">{formatDate(notice.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {notice.viewCount}
              </span>
            </div>
          </div>

          <div className="prose max-w-none whitespace-pre-wrap">{notice.content}</div>

          {notice.images && notice.images.length > 0 && (
            <div
              className={`mt-4 grid gap-2 ${
                notice.images.length === 1
                  ? 'grid-cols-1'
                  : notice.images.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-2 md:grid-cols-3'
              }`}
            >
              {notice.images.map((image, index) => (
                <div
                  key={image.id}
                  className={`relative cursor-pointer overflow-hidden rounded-lg bg-gray-100 ${
                    notice.images.length === 1 ? 'aspect-video' : 'aspect-square'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={api.getImageUrl(image.filePath)}
                    alt={image.originalName}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          )}
        </article>
      </main>

      {selectedImageIndex !== null && notice.images && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={() => setSelectedImageIndex(null)}
          >
            <X className="w-8 h-8" />
          </button>

          {notice.images.length > 1 && selectedImageIndex > 0 && (
            <button
              className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(selectedImageIndex - 1);
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          <img
            src={api.getImageUrl(notice.images[selectedImageIndex].filePath)}
            alt={notice.images[selectedImageIndex].originalName}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {notice.images.length > 1 && selectedImageIndex < notice.images.length - 1 && (
            <button
              className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(selectedImageIndex + 1);
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
