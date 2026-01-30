'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, CalendarCheck, MessageSquare, Trophy, Bell, ChevronRight, Settings, Eye, Heart, TrendingUp, Volume2, MessagesSquare, X, Cookie } from 'lucide-react';
import { Toast } from '@/components/common';
import { GradeBadge } from '@/components/member';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { PostListItem, NoticeListItem, FortuneCookieResponse } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const {
    isAuthenticated,
    member,
    isLoading,
    error,
    logout,
    fetchProfile,
    fetchGradeInfo,
    checkAttendance,
    clearError,
    _hasHydrated,
  } = useAuthStore();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [popularPeriod, setPopularPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [popularPosts, setPopularPosts] = useState<PostListItem[]>([]);
  const [notices, setNotices] = useState<NoticeListItem[]>([]);
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [isNoticeAnimating, setIsNoticeAnimating] = useState(false);
  const [fortuneCookie, setFortuneCookie] = useState<FortuneCookieResponse | null>(null);

  useEffect(() => {
    // hydration 완료 전에는 체크하지 않음
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // 모든 초기 데이터를 병렬로 로드
    const loadInitialData = async () => {
      await Promise.all([
        fetchProfile(),
        fetchGradeInfo(),
        api.getPopularPosts(popularPeriod, 5).then(res => {
          if (res.success && res.data) setPopularPosts(res.data);
        }),
        api.getNotices(0, 5).then(res => {
          if (res.success && res.data) setNotices(res.data.notices);
        }),
      ]);
    };
    loadInitialData();
  }, [_hasHydrated, isAuthenticated, router, fetchProfile, fetchGradeInfo]);

  // 인기글 기간 변경 시에만 인기글 다시 로드
  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated) return;

    const fetchPopularPosts = async () => {
      const response = await api.getPopularPosts(popularPeriod, 5);
      if (response.success && response.data) {
        setPopularPosts(response.data);
      }
    };
    fetchPopularPosts();
  }, [popularPeriod]);

  useEffect(() => {
    if (notices.length <= 1) return;

    const interval = setInterval(() => {
      setIsNoticeAnimating(true);
      setTimeout(() => {
        setNoticeIndex((prev) => (prev + 1) % notices.length);
        setIsNoticeAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [notices.length]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleAttendance = async () => {
    const result = await checkAttendance();
    if (result) {
      if (result.fortuneCookie) {
        setFortuneCookie(result.fortuneCookie);
      } else {
        setToast({ message: '출석 체크 완료! +5 포인트', type: 'success' });
      }
    } else {
      setToast({ message: error || '출석 체크에 실패했습니다.', type: 'error' });
    }
  };

  // hydration 완료 전이거나 인증 정보 로딩 중 - 스켈레톤 UI 표시
  if (!_hasHydrated || !member || !member.nickname) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-transparent pt-safe">
          <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex items-center gap-1">
              <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-5 pb-8">
          <div className="h-12 bg-gray-200 rounded-xl mb-4 animate-pulse" />
          <section className="mb-8">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 rounded mb-6 animate-pulse" />
            <div className="bg-gray-300 rounded-2xl p-5 h-40 animate-pulse" />
          </section>
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="bg-white rounded-2xl overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center px-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-6 h-5 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1 h-4 bg-gray-200 rounded mx-3 animate-pulse" />
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const activityStats = member.grade?.activityStats;
  const alreadyAttended = activityStats?.lastAttendanceDate === today;
  const totalPoints = member.grade?.currentPoints || 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '늦은 밤이에요';
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후에요';
    return '좋은 저녁이에요';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-transparent pt-safe">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <img src="/android-chrome-512x512.png" alt="블루윙즈 둥지" className="w-8 h-8 rounded-lg" />
          <div className="flex items-center gap-1">
            <Link
              href="/mypage"
              className="p-2 hover:bg-gray-200/50 rounded-full transition-colors text-gray-500"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-200/50 rounded-full transition-colors text-gray-500"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pb-8">
        {notices.length > 0 && (
          <Link
            href={`/notices/${notices[noticeIndex]?.id}`}
            className="block bg-white rounded-xl px-4 py-3 mb-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <Volume2 className="w-3.5 h-3.5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0 h-5 overflow-hidden">
                <p
                  className={`text-sm text-gray-700 truncate transition-all duration-300 ${
                    isNoticeAnimating ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
                  }`}
                >
                  {notices[noticeIndex]?.title}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </Link>
        )}

        <section className="mb-8">
          <p className="text-gray-500 text-sm mb-1">{getGreeting()}</p>
          <div className="flex items-center gap-2 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{member.nickname}님</h1>
            {member.grade?.currentGrade && (
              <GradeBadge grade={member.grade.currentGrade.name} showName={false} size="sm" />
            )}
          </div>

          <div className="bg-gradient-to-br from-bluewings to-blue-700 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/80 text-sm">내 포인트</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {member.grade?.currentGrade?.displayName || '신입 서포터'}
              </span>
            </div>
            <div className="text-3xl font-bold mb-4">{totalPoints.toLocaleString()}P</div>

            <button
              onClick={handleAttendance}
              disabled={isLoading || alreadyAttended}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                ${alreadyAttended
                  ? 'bg-white/20 text-white/60 cursor-not-allowed'
                  : 'bg-white text-bluewings hover:bg-white/90 active:scale-[0.98]'
                }`}
            >
              <CalendarCheck className="w-5 h-5" />
              {isLoading ? '처리중...' : alreadyAttended ? '오늘 출석 완료!' : '출석 체크 +5P'}
            </button>
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-bluewings" />
              <h2 className="text-sm font-medium text-gray-900">인기글</h2>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setPopularPeriod(period)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    popularPeriod === period
                      ? 'bg-white text-bluewings shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {period === 'DAILY' ? '일간' : period === 'WEEKLY' ? '주간' : '월간'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden">
            {popularPosts.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {popularPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className={`w-6 text-sm font-bold ${
                      index === 0 ? 'text-red-500' : index === 1 ? 'text-orange-500' : index === 2 ? 'text-yellow-500' : 'text-gray-400'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm text-gray-900 truncate mx-3">{post.title}</span>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.likeCount}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">
                아직 인기글이 없습니다
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-3 px-1">바로가기</h2>
          <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100">
            <Link href="/notices" className="flex items-center px-4 py-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                <Bell className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">공지사항</h3>
                <p className="text-sm text-gray-500">새로운 소식을 확인하세요</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link href="/matches" className="flex items-center px-4 py-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">경기 일정</h3>
                <p className="text-sm text-gray-500">일정 및 순위 확인</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link href="/posts" className="flex items-center px-4 py-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <MessageSquare className="w-5 h-5 text-bluewings" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">커뮤니티</h3>
                <p className="text-sm text-gray-500">팬들과 소통하세요</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link href="/chat" className="flex items-center px-4 py-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <MessagesSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">실시간 채팅</h3>
                <p className="text-sm text-gray-500">서포터들과 대화하세요</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </section>
      </main>

      {/* 포츈쿠키 모달 */}
      {fortuneCookie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setFortuneCookie(null)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <Cookie className="w-8 h-8 text-amber-500" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                🎉 출석 체크 완료! +5P
              </h3>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700 font-medium leading-relaxed">
                  "{fortuneCookie.message}"
                </p>
              </div>

              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                {fortuneCookie.category}
              </span>
            </div>

            <button
              onClick={() => setFortuneCookie(null)}
              className="w-full mt-6 py-3 bg-bluewings text-white font-medium rounded-xl hover:bg-bluewings-dark transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

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
