'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Camera, X } from 'lucide-react';
import { Button, Toast } from '@/components/common';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function EditProfilePage() {
  const router = useRouter();
  const { isAuthenticated, member, setMember, _hasHydrated } = useAuthStore();

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (member) {
      setNickname(member.nickname);
      setBio(member.bio || '');
      setProfileImageUrl(member.profileImageUrl || null);
    }
  }, [member]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: '이미지 크기는 5MB 이하여야 합니다.', type: 'error' });
      return;
    }

    // 이미지 타입 체크
    if (!file.type.startsWith('image/')) {
      setToast({ message: '이미지 파일만 업로드 가능합니다.', type: 'error' });
      return;
    }

    setIsUploadingImage(true);
    const response = await api.uploadImage(file);
    setIsUploadingImage(false);

    if (response.success && response.data) {
      setProfileImageUrl(response.data.filePath);
      setToast({ message: '이미지가 업로드되었습니다.', type: 'success' });
    } else {
      setToast({ message: response.error?.message || '이미지 업로드에 실패했습니다.', type: 'error' });
    }

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setProfileImageUrl(null);
  };

  const validateNickname = (value: string): string | null => {
    if (value.length < 2 || value.length > 30) {
      return '닉네임은 2자 이상 30자 이하여야 합니다';
    }
    if (!/^[가-힣a-zA-Z0-9_]+$/.test(value)) {
      return '닉네임은 한글, 영문, 숫자, 언더스코어만 사용할 수 있습니다';
    }
    return null;
  };

  const handleNicknameChange = async (value: string) => {
    setNickname(value);
    setNicknameError('');

    const validationError = validateNickname(value);
    if (validationError) {
      setNicknameError(validationError);
      return;
    }

    // 현재 닉네임과 같으면 중복 체크 불필요
    if (value === member?.nickname) {
      return;
    }

    // 닉네임 중복 체크
    setIsCheckingNickname(true);
    const response = await api.checkNickname(value);
    setIsCheckingNickname(false);

    if (response.success && response.data && !response.data.available) {
      setNicknameError('이미 사용 중인 닉네임입니다');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nicknameError) {
      setToast({ message: nicknameError, type: 'error' });
      return;
    }

    const validationError = validateNickname(nickname);
    if (validationError) {
      setToast({ message: validationError, type: 'error' });
      return;
    }

    setIsLoading(true);

    const response = await api.updateMyProfile({
      nickname: nickname !== member?.nickname ? nickname : undefined,
      bio: bio !== member?.bio ? bio : undefined,
      profileImageUrl: profileImageUrl !== member?.profileImageUrl ? (profileImageUrl ?? undefined) : undefined,
    });

    setIsLoading(false);

    if (response.success && response.data) {
      setMember(response.data);
      setToast({ message: '프로필이 수정되었습니다.', type: 'success' });
      setTimeout(() => router.push('/mypage'), 1000);
    } else {
      setToast({ message: response.error?.message || '수정에 실패했습니다.', type: 'error' });
    }
  };

  if (!_hasHydrated || !member) {
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
            <h1 className="text-lg font-semibold">프로필 수정</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 프로필 이미지 */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                {profileImageUrl ? (
                  <div className="relative">
                    <img
                      src={api.getImageUrl(profileImageUrl)}
                      alt="프로필 이미지"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-bluewings-light to-bluewings rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {nickname.charAt(0) || member.nickname.charAt(0)}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-bluewings text-white rounded-full flex items-center justify-center hover:bg-bluewings-dark disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-4">
                {profileImageUrl ? '이미지를 변경하려면 카메라 버튼을 클릭하세요' : '카메라 버튼을 눌러 프로필 사진을 추가하세요'}
              </p>
            </div>
          </div>

          {/* 닉네임 */}
          <div className="bg-white rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              maxLength={30}
              className={`w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 ${
                nicknameError ? 'ring-2 ring-red-500' : 'focus:ring-bluewings/30'
              }`}
              placeholder="닉네임을 입력하세요"
            />
            <div className="flex justify-between mt-2">
              {nicknameError ? (
                <p className="text-sm text-red-500">{nicknameError}</p>
              ) : isCheckingNickname ? (
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  확인 중...
                </p>
              ) : (
                <p className="text-sm text-gray-400">한글, 영문, 숫자, 언더스코어 사용 가능</p>
              )}
              <p className="text-sm text-gray-400">{nickname.length}/30</p>
            </div>
          </div>

          {/* 이메일 (수정 불가) */}
          <div className="bg-white rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={member.email}
              disabled
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-500"
            />
            <p className="text-sm text-gray-400 mt-2">이메일은 변경할 수 없습니다</p>
          </div>

          {/* 자기소개 */}
          <div className="bg-white rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              자기소개
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-bluewings/30"
              placeholder="자기소개를 입력하세요 (선택)"
            />
            <p className="text-right text-sm text-gray-400 mt-2">{bio.length}/500</p>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!!nicknameError || isCheckingNickname}
          >
            저장하기
          </Button>
        </form>
      </main>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
