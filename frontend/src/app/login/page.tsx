'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Toast } from '@/components/common';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login(email, password);
    if (success) {
      router.push('/');
    } else {
      setShowToast(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/android-chrome-512x512.png" alt="블루윙즈 둥지" className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover" />
          <h1 className="text-2xl font-bold text-gray-900">블루윙즈 둥지</h1>
          <p className="text-gray-500 mt-2">수원의 수원에 의한 수원을 위한</p>
        </div>

        <form onSubmit={handleSubmit} className="toss-card space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12"
              required
            />
          </div>

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

          <Button type="submit" isLoading={isLoading}>
            로그인
          </Button>
        </form>

        <p className="text-center mt-6 text-gray-500">
          아직 회원이 아니신가요?{' '}
          <Link href="/signup" className="text-bluewings font-medium hover:underline">
            회원가입
          </Link>
        </p>
      </div>

      {showToast && error && (
        <Toast
          message={error}
          type="error"
          onClose={() => {
            setShowToast(false);
            clearError();
          }}
        />
      )}
    </div>
  );
}
