'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Button, Toast } from '@/components/common';
import ImageUpload from '@/components/ImageUpload';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { UploadImageResponse, Category } from '@/lib/types';

export default function PostEditPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<UploadImageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const postId = parseInt(params.id as string || '0');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (postId) {
      fetchPost();
    }
  }, [_hasHydrated, isAuthenticated, postId, router]);

  const fetchCategories = async () => {
    const response = await api.getCategories();
    if (response.success && response.data) {
      setCategories(response.data);
    }
  };

  const fetchPost = async () => {
    setIsFetching(true);
    const response = await api.getPost(postId);
    if (response.success && response.data) {
      setTitle(response.data.title);
      setContent(response.data.content);
      setCategoryId(response.data.category?.id);
      if (response.data.images) {
        setImages(response.data.images.map(img => ({
          fileName: img.fileName,
          originalName: img.originalName,
          filePath: img.filePath,
          fileSize: img.fileSize,
          contentType: img.contentType,
        })));
      }
    } else {
      setToast({ message: '게시글을 불러올 수 없습니다.', type: 'error' });
      setTimeout(() => router.push('/posts'), 1500);
    }
    setIsFetching(false);
  };

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

    if (!categoryId) {
      setToast({ message: '카테고리를 선택해주세요.', type: 'error' });
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

    const response = await api.updatePost(postId, { title, content, categoryId, images: imageRequests });

    if (response.success && response.data) {
      setToast({ message: '게시글이 수정되었습니다.', type: 'success' });
      setTimeout(() => router.push(`/posts/${response.data!.id}`), 1000);
    } else {
      setToast({ message: response.error?.message || '저장에 실패했습니다.', type: 'error' });
    }

    setIsLoading(false);
  };

  if (isFetching) {
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
            <h1 className="text-lg font-semibold">게시글 수정</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {categories.length > 0 && (
            <div className="relative">
              <select
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-3 bg-white rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-bluewings/30"
              >
                <option value="">카테고리를 선택해주세요</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          )}

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
            <h3 className="text-sm font-medium text-gray-700 mb-3">이미지 첨부</h3>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={5}
            />
          </div>

          <Button type="submit" isLoading={isLoading} disabled={!title.trim() || !content.trim() || !categoryId}>
            수정하기
          </Button>
        </form>
      </main>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
