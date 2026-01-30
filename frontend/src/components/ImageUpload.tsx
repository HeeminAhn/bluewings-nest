import { useState, useRef, useCallback } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import type { UploadImageResponse } from '../types';

interface ImageUploadProps {
  images: UploadImageResponse[];
  onImagesChange: (images: UploadImageResponse[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setError(`최대 ${maxImages}개까지 업로드할 수 있습니다.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    // 파일 유효성 검사
    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB를 초과할 수 없습니다.');
        return;
      }
    }

    setUploading(true);
    setError(null);

    try {
      const results: UploadImageResponse[] = [];

      for (const file of filesToUpload) {
        const response = await api.uploadImage(file);
        if (response.success && response.data) {
          results.push(response.data);
        } else {
          setError(response.error?.message || '업로드에 실패했습니다.');
          break;
        }
      }

      if (results.length > 0) {
        onImagesChange([...images, ...results]);
      }
    } catch (err) {
      setError('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [images, maxImages, onImagesChange]);

  const handleRemoveImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setError(`최대 ${maxImages}개까지 업로드할 수 있습니다.`);
      return;
    }

    const filesToUpload = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const results: UploadImageResponse[] = [];

      for (const file of filesToUpload) {
        if (file.size > 10 * 1024 * 1024) {
          setError('파일 크기는 10MB를 초과할 수 없습니다.');
          continue;
        }

        const response = await api.uploadImage(file);
        if (response.success && response.data) {
          results.push(response.data);
        }
      }

      if (results.length > 0) {
        onImagesChange([...images, ...results]);
      }
    } catch (err) {
      setError('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, onImagesChange]);

  return (
    <div className="space-y-4">
      {/* 업로드 영역 */}
      {images.length < maxImages && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          {uploading ? (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="mt-2 text-sm text-gray-500">업로드 중...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <Camera className="w-8 h-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                이미지를 드래그하거나 클릭하여 업로드
              </p>
              <p className="mt-1 text-xs text-gray-400">
                JPG, PNG, GIF, WEBP (최대 10MB, {maxImages}장까지)
              </p>
            </div>
          )}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* 업로드된 이미지 미리보기 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div
              key={image.fileName}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={api.getImageUrl(image.filePath)}
                alt={image.originalName}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white truncate">{image.originalName}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 이미지 개수 표시 */}
      {images.length > 0 && (
        <p className="text-sm text-gray-500">
          {images.length} / {maxImages} 이미지
        </p>
      )}
    </div>
  );
}
