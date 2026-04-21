'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Camera, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header } from '@/components/layout';
import { Toast } from '@/components/common';
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

    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: '이미지 크기는 5MB 이하여야 합니다.', type: 'error' });
      return;
    }

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

    if (value === member?.nickname) {
      return;
    }

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header title="프로필 수정" />

      <main className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 프로필 이미지 */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-2 border-blue-100">
                    {profileImageUrl ? (
                      <AvatarImage src={api.getImageUrl(profileImageUrl)} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-3xl">
                      {nickname.charAt(0) || member.nickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {profileImageUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 disabled:opacity-50"
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
                <p className="text-sm text-slate-500 mt-4">
                  {profileImageUrl ? '이미지를 변경하려면 카메라 버튼을 클릭하세요' : '카메라 버튼을 눌러 프로필 사진을 추가하세요'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 닉네임 */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-4 space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => handleNicknameChange(e.target.value)}
                maxLength={30}
                placeholder="닉네임을 입력하세요"
                className={nicknameError ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              <div className="flex justify-between">
                {nicknameError ? (
                  <p className="text-sm text-red-500">{nicknameError}</p>
                ) : isCheckingNickname ? (
                  <p className="text-sm text-slate-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    확인 중...
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">한글, 영문, 숫자, 언더스코어 사용 가능</p>
                )}
                <p className="text-xs text-slate-400">{nickname.length}/30</p>
              </div>
            </CardContent>
          </Card>

          {/* 이메일 (수정 불가) */}
          <Card className="shadow-sm border-0">
            <CardContent className="p-4 space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={member.email}
                disabled
                className="bg-slate-100"
              />
              <p className="text-xs text-slate-400">이메일은 변경할 수 없습니다</p>
            </CardContent>
          </Card>

          {/* 자기소개 */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-4 space-y-2">
              <Label htmlFor="bio">자기소개</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="자기소개를 입력하세요 (선택)"
                className="resize-none"
              />
              <p className="text-right text-xs text-slate-400">{bio.length}/500</p>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800"
            disabled={isLoading || !!nicknameError || isCheckingNickname}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              '저장하기'
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
