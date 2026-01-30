'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Button, Input, Toast } from '@/components/common';
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
    if (checking) return <div className="w-5 h-5 border-2 border-bluewings border-t-transparent rounded-full animate-spin" />;
    if (available === true) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (available === false) return <XCircle className="w-5 h-5 text-red-500" />;
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/android-chrome-512x512.png" alt="블루윙즈 둥지" className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover" />
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="text-gray-500 mt-2">블루윙즈 팬이 되어주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="toss-card space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailAvailable(null);
              }}
              className="pl-12 pr-12"
              required
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <AvailabilityIcon available={emailAvailable} checking={checkingEmail} />
            </div>
          </div>
          {emailAvailable === false && (
            <p className="text-sm text-red-500 -mt-3">이미 사용 중인 이메일입니다</p>
          )}

          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="닉네임 (2~20자)"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setNicknameAvailable(null);
              }}
              className="pl-12 pr-12"
              minLength={2}
              maxLength={20}
              required
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <AvailabilityIcon available={nicknameAvailable} checking={checkingNickname} />
            </div>
          </div>
          {nicknameAvailable === false && (
            <p className="text-sm text-red-500 -mt-3">이미 사용 중인 닉네임입니다</p>
          )}

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className={`text-sm -mt-3 ${isPasswordValid ? 'text-green-500' : 'text-gray-400'}`}>
            8자 이상, 영문/숫자/특수문자(!@#$%^&*) 포함
          </p>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-12"
              required
            />
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-sm text-red-500 -mt-3">비밀번호가 일치하지 않습니다</p>
          )}

          <Button type="submit" isLoading={isLoading} disabled={!canSubmit}>
            가입하기
          </Button>
        </form>

        <p className="text-center mt-6 text-gray-500">
          이미 회원이신가요?{' '}
          <Link href="/login" className="text-bluewings font-medium hover:underline">
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
