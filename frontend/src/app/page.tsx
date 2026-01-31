'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LogOut,
  CalendarCheck,
  MessageSquare,
  Trophy,
  Bell,
  ChevronRight,
  Eye,
  Heart,
  TrendingUp,
  Volume2,
  MessagesSquare,
  X,
  Cookie,
  Search,
  Flame,
  Calendar,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Toast } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { PostListItem, NoticeListItem, FortuneCookieResponse, Match } from '@/lib/types';

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
  const [nextMatch, setNextMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadInitialData = async () => {
      await Promise.all([
        fetchProfile(),
        fetchGradeInfo(),
        api.getPopularPosts(popularPeriod, 5).then((res) => {
          if (res.success && res.data) setPopularPosts(res.data);
        }),
        api.getNotices(0, 5).then((res) => {
          if (res.success && res.data) setNotices(res.data.notices);
        }),
        api.getUpcomingMatches().then((res) => {
          if (res.success && res.data && res.data.upcoming && res.data.upcoming.length > 0) {
            setNextMatch(res.data.upcoming[0]);
          }
        }),
      ]);
    };
    loadInitialData();
  }, [_hasHydrated, isAuthenticated, router, fetchProfile, fetchGradeInfo]);

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

  // 스켈레톤 UI
  if (!_hasHydrated || !member || !member.nickname) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl animate-pulse" />
              <div>
                <div className="h-5 w-32 bg-white/20 rounded animate-pulse mb-1" />
                <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="h-48 bg-white/10 rounded-2xl animate-pulse" />
        </div>
        <div className="px-4 -mt-4 space-y-4">
          <div className="h-32 bg-white rounded-xl shadow animate-pulse" />
          <div className="h-48 bg-white rounded-xl shadow animate-pulse" />
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const activityStats = member.grade?.activityStats;
  const alreadyAttended = activityStats?.lastAttendanceDate === today;
  const totalPoints = member.grade?.currentPoints || 0;
  const nextGradePoints = member.grade?.nextGrade?.requiredPoints || 100;
  const progressPercent = Math.min((totalPoints / nextGradePoints) * 100, 100);

  const gradeEmoji: Record<string, string> = {
    ROOKIE: '🐣',
    SUPPORTER: '🙌',
    FANATIC: '🔥',
    ULTRAS: '⚡',
    LEGEND: '👑',
  };

  const getDday = (dateStr: string) => {
    const matchDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    matchDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((matchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24 md:pb-8">
      {/* 히어로 헤더 - 청백적 */}
      <div className="relative bluewings-stripe text-white overflow-hidden">
        {/* 오버레이 (가독성 향상) */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 to-blue-800/80" />

        <div className="relative px-4 pt-4 pb-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/favicon-48x48.png"
                  alt="블루윙즈 둥지"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight">블루윙즈 둥지</h1>
                <p className="text-blue-200 text-sm">모든 날개가 모이는 곳</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => router.push('/posts')}
              >
                <Search size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 relative"
                onClick={() => router.push('/notices')}
              >
                <Bell size={20} />
                {notices.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </Button>
            </div>
          </div>

          {/* 다음 경기 카드 */}
          {nextMatch ? (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-yellow-400" />
                    <span className="font-medium">{nextMatch.competition}</span>
                  </div>
                  <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500">
                    D-{getDday(nextMatch.matchDate)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-4">
                  <div className="text-center flex-1">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <span className="text-3xl">🔵</span>
                    </div>
                    <p className="font-bold text-sm">{nextMatch.homeTeam}</p>
                    <Badge
                      variant="outline"
                      className="mt-1 border-white/30 text-white text-xs"
                    >
                      HOME
                    </Badge>
                  </div>

                  <div className="px-4 text-center">
                    <div className="text-3xl font-black text-white/30">VS</div>
                    <p className="text-lg font-semibold text-yellow-400 mt-1">
                      {nextMatch.matchDate.split('T')[1]?.slice(0, 5) || ''}
                    </p>
                  </div>

                  <div className="text-center flex-1">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <span className="text-3xl">⚽</span>
                    </div>
                    <p className="font-bold text-sm">{nextMatch.awayTeam}</p>
                    <Badge
                      variant="outline"
                      className="mt-1 border-white/30 text-white text-xs"
                    >
                      AWAY
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-white/20 my-3" />

                <div className="flex items-center justify-between text-sm text-blue-100">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{nextMatch.matchDate.split('T')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{nextMatch.stadium || '수원월드컵경기장'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="py-8 text-center">
                <Trophy size={32} className="mx-auto mb-2 text-white/50" />
                <p className="text-white/70">예정된 경기가 없습니다</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 -mt-4">
          {/* 프로필 카드 */}
          <Card className="shadow-lg border-0 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-14 h-14 border-2 border-blue-100">
                {member.profileImageUrl ? (
                  <AvatarImage src={api.getImageUrl(member.profileImageUrl)} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-2xl">
                  {gradeEmoji[member.grade?.currentGrade?.name || 'ROOKIE']}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg text-slate-800">{member.nickname}</h2>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                    {member.grade?.currentGrade?.displayName || '신입 서포터'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">{totalPoints.toLocaleString()}P</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-slate-400"
              >
                <LogOut size={20} />
              </Button>
            </div>

            {/* 등급 프로그레스 */}
            <div className="bg-slate-50 rounded-xl p-3 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">다음 등급까지</span>
                <span className="font-bold text-blue-700">
                  {(nextGradePoints - totalPoints).toLocaleString()}P
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="flex justify-between text-xs mt-2 text-slate-400">
                <span>{member.grade?.currentGrade?.name || 'ROOKIE'}</span>
                <span>{member.grade?.nextGrade?.name || 'SUPPORTER'}</span>
              </div>
            </div>

            {/* 출석 체크 버튼 */}
            <Button
              onClick={handleAttendance}
              disabled={isLoading || alreadyAttended}
              className={`w-full ${
                alreadyAttended
                  ? 'bg-slate-100 text-slate-400 hover:bg-slate-100'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              <CalendarCheck className="w-5 h-5 mr-2" />
              {isLoading ? '처리중...' : alreadyAttended ? '오늘 출석 완료!' : '출석 체크 +5P'}
            </Button>
          </CardContent>
        </Card>

        {/* 인기글 - PC에서는 우측에 표시 */}
        <Card className="shadow-lg border-0 lg:col-span-2 lg:row-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame size={18} className="text-orange-500" />
                인기글
              </CardTitle>
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setPopularPeriod(period)}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                      popularPeriod === period
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {period === 'DAILY' ? '일간' : period === 'WEEKLY' ? '주간' : '월간'}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {popularPosts.length > 0 ? (
              popularPosts.map((post, idx) => (
                <Button
                  key={post.id}
                  variant="ghost"
                  onClick={() => router.push(`/posts/${post.id}`)}
                  className="w-full justify-between h-auto py-3 px-2 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {idx < 3 && (
                      <Badge
                        className={`shrink-0 ${
                          idx === 0
                            ? 'bg-gradient-to-r from-orange-500 to-red-500'
                            : idx === 1
                            ? 'bg-gradient-to-r from-slate-400 to-slate-500'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600'
                        } text-white`}
                      >
                        {idx + 1}
                      </Badge>
                    )}
                    {idx >= 3 && (
                      <span className="w-6 text-center text-slate-400 font-medium shrink-0">
                        {idx + 1}
                      </span>
                    )}
                    <p className="text-slate-700 truncate text-left text-sm">{post.title}</p>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-xs ml-2 shrink-0">
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {post.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={12} className="text-red-400" /> {post.likeCount}
                    </span>
                  </div>
                </Button>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                아직 인기글이 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        {/* 공지사항 배너 */}
        {notices.length > 0 && (
          <div className="lg:col-span-1">
          <Link href={`/notices/${notices[noticeIndex]?.id}`}>
            <Card className="shadow-md border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Volume2 className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0 h-5 overflow-hidden">
                    <p
                      className={`text-sm text-slate-700 truncate transition-all duration-300 ${
                        isNoticeAnimating
                          ? '-translate-y-full opacity-0'
                          : 'translate-y-0 opacity-100'
                      }`}
                    >
                      {notices[noticeIndex]?.title}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
          </div>
        )}
        </div>
      </div>

      {/* 바로가기 */}
      <div className="max-w-7xl mx-auto px-4 mt-4 pb-4">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">바로가기</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                {
                  href: '/notices',
                  icon: Bell,
                  iconBg: 'bg-red-100',
                  iconColor: 'text-red-500',
                  title: '공지사항',
                  desc: '새로운 소식을 확인하세요',
                },
                {
                  href: '/matches',
                  icon: Trophy,
                  iconBg: 'bg-green-100',
                  iconColor: 'text-green-600',
                  title: '경기 일정',
                  desc: '일정 및 순위 확인',
                },
                {
                  href: '/posts',
                  icon: MessageSquare,
                  iconBg: 'bg-blue-100',
                  iconColor: 'text-blue-600',
                  title: '커뮤니티',
                  desc: '팬들과 소통하세요',
                },
                {
                  href: '/chat',
                  icon: MessagesSquare,
                  iconBg: 'bg-purple-100',
                  iconColor: 'text-purple-600',
                  title: '실시간 채팅',
                  desc: '서포터들과 대화하세요',
                },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto py-3 px-3 hover:bg-slate-50 hover:shadow-md transition-all"
                  >
                    <div
                      className={`w-10 h-10 ${item.iconBg} rounded-xl flex items-center justify-center mr-3`}
                    >
                      <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 lg:hidden" />
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* 포츈쿠키 모달 */}
      {fortuneCookie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 max-w-sm w-full shadow-xl animate-in fade-in zoom-in duration-200">
            <CardContent className="p-6">
              <div className="flex justify-end mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFortuneCookie(null)}
                  className="h-8 w-8"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </Button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                  <Cookie className="w-8 h-8 text-amber-500" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  🎉 출석 체크 완료! +5P
                </h3>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-4">
                  <p className="text-slate-700 font-medium leading-relaxed">
                    "{fortuneCookie.message}"
                  </p>
                </div>

                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">
                  {fortuneCookie.category}
                </Badge>
              </div>

              <Button
                onClick={() => setFortuneCookie(null)}
                className="w-full mt-6 bg-blue-700 hover:bg-blue-800"
              >
                확인
              </Button>
            </CardContent>
          </Card>
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
