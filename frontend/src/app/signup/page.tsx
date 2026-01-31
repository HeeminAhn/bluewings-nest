'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, XCircle, UserPlus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toast } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingNickname, setCheckingNickname] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const debouncedEmail = useDebounce(email, 500);
  const debouncedNickname = useDebounce(nickname, 500);

  const checkEmail = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setEmailAvailable(null);
      return;
    }

    setCheckingEmail(true);
    try {
      const response = await api.checkEmail(emailToCheck);
      if (response.success && response.data) {
        setEmailAvailable(response.data.available);
      } else {
        setEmailAvailable(true);
      }
    } catch {
      setEmailAvailable(true);
    }
    setCheckingEmail(false);
  }, []);

  const checkNickname = useCallback(async (nicknameToCheck: string) => {
    if (!nicknameToCheck || nicknameToCheck.length < 2) {
      setNicknameAvailable(null);
      return;
    }

    setCheckingNickname(true);
    try {
      const response = await api.checkNickname(nicknameToCheck);
      if (response.success && response.data) {
        setNicknameAvailable(response.data.available);
      } else {
        setNicknameAvailable(true);
      }
    } catch {
      setNicknameAvailable(true);
    }
    setCheckingNickname(false);
  }, []);

  useEffect(() => {
    if (debouncedEmail) {
      checkEmail(debouncedEmail);
    }
  }, [debouncedEmail, checkEmail]);

  useEffect(() => {
    if (debouncedNickname) {
      checkNickname(debouncedNickname);
    }
  }, [debouncedNickname, checkNickname]);

  const isPasswordValid = password.length >= 8 &&
    /[a-zA-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*]/.test(password);

  const passwordsMatch = password === confirmPassword && password.length > 0;

  const canSubmit =
    email &&
    email.includes('@') &&
    (emailAvailable === true || emailAvailable === null) &&
    nickname &&
    nickname.length >= 2 &&
    (nicknameAvailable === true || nicknameAvailable === null) &&
    isPasswordValid &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    const success = await signUp(email, password, nickname);
    if (success) {
      setToast({ message: '회원가입이 완료되었습니다!', type: 'success' });
      setTimeout(() => router.push('/login'), 1500);
    } else {
      setToast({ message: error || '회원가입에 실패했습니다.', type: 'error' });
    }
  };

  const AvailabilityIcon = ({ available, checking }: { available: boolean | null; checking: boolean }) => {
    if (checking) return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
    if (available === true) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (available === false) return <XCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg overflow-hidden">
            <Image
              src="/android-chrome-512x512.png"
              alt="블루윙즈 둥지"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">회원가입</h1>
          <p className="text-slate-500 mt-2">블루윙즈 팬이 되어주세요</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">계정 만들기</CardTitle>
            <CardDescription>서포터 등록을 시작하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailAvailable(null);
                    }}
                    className="pl-10 pr-10"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AvailabilityIcon available={emailAvailable} checking={checkingEmail} />
                  </div>
                </div>
                {emailAvailable === false && (
                  <p className="text-sm text-red-500">이미 사용 중인 이메일입니다</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="nickname"
                    type="text"
                    placeholder="2~20자"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setNicknameAvailable(null);
                    }}
                    className="pl-10 pr-10"
                    minLength={2}
                    maxLength={20}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AvailabilityIcon available={nicknameAvailable} checking={checkingNickname} />
                  </div>
                </div>
                {nicknameAvailable === false && (
                  <p className="text-sm text-red-500">이미 사용 중인 닉네임입니다</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="8자 이상"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className={`text-xs ${isPasswordValid ? 'text-green-500' : 'text-slate-400'}`}>
                  8자 이상, 영문/숫자/특수문자(!@#$%^&*) 포함
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-sm text-red-500">비밀번호가 일치하지 않습니다</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800"
                disabled={isLoading || !canSubmit}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    가입하기
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-slate-500">
          이미 회원이신가요?{' '}
          <Link href="/login" className="text-blue-700 font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => {
            setToast(null);
            clearError();
          }}
        />
      )}
    </div>
  );
}
