'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button, Toast } from '@/components/common';
import ImageUpload from '@/components/ImageUpload';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { UploadImageResponse } from '@/lib/types';

export default function NoticeWritePage() {
  const router = useRouter();
  const { isAuthenticated, member, _hasHydrated } = useAuthStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [images, setImages] = useState<UploadImageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isAdmin = member?.role === 'ADMIN';

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      setToast({ message: '관리자만 공지사항을 작성할 수 있습니다.', type: 'error' });
      setTimeout(() => router.push('/notices'), 1500);
    }
  }, [_hasHydrated, isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setToast({ message: '제목을 입력해주세요.', type: 'error' });
      return;
    }

    if (!content.trim()) {
      setToast({ message: '내용을 입력해주세요.', type: 'error' });
      return;
    }

    setIsLoading(true);

    const imageRequests = images.map(img => ({
      fileName: img.fileName,
      originalName: img.originalName,
      filePath: img.filePath,
      fileSize: img.fileSize,
      contentType: img.contentType,
    }));

    const response = await api.createNotice({ title, content, isPinned, images: imageRequests });

    if (response.success && response.data) {
      setToast({ message: '공지사항이 작성되었습니다.', type: 'success' });
      setTimeout(() => router.push(`/notices/${response.data!.id}`), 1000);
    } else {
      setToast({ message: response.error?.message || '저장에 실패했습니다.', type: 'error' });
    }

    setIsLoading(false);
  };

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-bluewings border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-bluewings border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white sticky top-0 z-40 border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold">새 공지사항</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="w-full px-4 py-3 bg-white rounded-xl text-lg font-medium focus:outline-none focus:ring-2 focus:ring-bluewings/30"
            />
            <p className="text-right text-sm text-gray-400 mt-1">{title.length}/200</p>
          </div>

          <div>
            <textarea
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 bg-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-bluewings/30"
            />
          </div>

          <div className="bg-white rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-bluewings focus:ring-bluewings"
              />
              <span className="text-sm font-medium text-gray-700">상단 고정</span>
            </label>
          </div>

          <div className="bg-white rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">이미지 첨부</h3>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={5}
            />
          </div>

          <Button type="submit" isLoading={isLoading} disabled={!title.trim() || !content.trim()}>
            작성하기
          </Button>
        </form>
      </main>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
