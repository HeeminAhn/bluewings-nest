'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Header } from '@/components/layout';
import ImageUpload from '@/components/ImageUpload';
import { Toast } from '@/components/common';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { UploadImageResponse, Category } from '@/lib/types';

export default function PostWritePage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<UploadImageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  const fetchCategories = async () => {
    const response = await api.getCategories();
    if (response.success && response.data) {
      setCategories(response.data);
    }
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

    const response = await api.createPost({ title, content, categoryId: parseInt(categoryId), images: imageRequests });

    if (response.success && response.data) {
      setToast({ message: '게시글이 작성되었습니다.', type: 'success' });
      setTimeout(() => router.push(`/posts/${response.data!.id}`), 1000);
    } else {
      setToast({ message: response.error?.message || '저장에 실패했습니다.', type: 'error' });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header title="글쓰기" />

      <main className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="shadow-sm border-0">
            <CardContent className="p-4 space-y-4">
              {categories.length > 0 && (
                <div className="space-y-2">
                  <Label>카테고리</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="w-full bg-white h-10">
                      <SelectValue placeholder="카테고리를 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>제목</Label>
                <Input
                  type="text"
                  placeholder="제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  className="bg-white"
                />
                <p className="text-right text-xs text-slate-400">{title.length}/200</p>
              </div>

              <div className="space-y-2">
                <Label>내용</Label>
                <Textarea
                  placeholder="내용을 입력하세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="bg-white resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardContent className="p-4">
              <Label className="mb-3 block">이미지 첨부</Label>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={5}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800"
            disabled={isLoading || !title.trim() || !content.trim() || !categoryId}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                작성 중...
              </>
            ) : (
              '작성하기'
            )}
          </Button>
        </form>
      </main>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
