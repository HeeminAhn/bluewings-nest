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
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0 });
  const [recentMatch, setRecentMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;

    const loadPublicData = () => Promise.all([
      api.getPopularPosts(popularPeriod, 5).then((res) => {
        if (res.success && res.data) setPopularPosts(res.data);
      }),
      api.getNotices(0, 5).then((res) => {
        if (res.success && res.data) setNotices(res.data.notices);
      }),
      api.getUpcomingMatches().then((res) => {
        if (res.success && res.data) {
          if (res.data.upcoming && res.data.upcoming.length > 0) {
            setNextMatch(res.data.upcoming[0]);
          }
          if (res.data.recent && res.data.recent.length > 0) {
            setRecentMatch(res.data.recent[0]);
          }
        }
      }),
    ]);

    loadPublicData();

    if (isAuthenticated) {
      fetchProfile();
      fetchGradeInfo();
    }
  }, [_hasHydrated, isAuthenticated, fetchProfile, fetchGradeInfo]);

  useEffect(() => {
    if (!_hasHydrated) return;
    const fetchPopularPosts = async () => {
      const response = await api.getPopularPosts(popularPeriod, 5);
      if (response.success && response.data) {
        setPopularPosts(response.data);
      }
    };
    fetchPopularPosts();
  }, [popularPeriod]);

  // 카운트다운 타이머
  useEffect(() => {
    if (!nextMatch) return;
    const updateCountdown = () => {
      const matchDate = new Date(`${nextMatch.matchDate}${nextMatch.matchTime ? 'T' + nextMatch.matchTime : 'T00:00:00'}`);
      const now = new Date();
      const diff = matchDate.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, mins: 0 });
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [nextMatch]);

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

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-[#fcf9f8] pb-24">
        <div className="bg-[#00366e] px-4 pt-4 pb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-48 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="h-48 bg-white/10 rounded-lg animate-pulse" />
        </div>
        <div className="max-w-[1280px] mx-auto px-6 -mt-8 space-y-6">
          <div className="h-32 bg-white rounded-lg shadow animate-pulse" />
          <div className="h-48 bg-white rounded-lg shadow animate-pulse" />
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const activityStats = member?.grade?.activityStats;
  const alreadyAttended = activityStats?.lastAttendanceDate === today;
  const totalPoints = member?.grade?.currentPoints || 0;
  const nextGradePoints = member?.grade?.nextGrade?.requiredPoints || 100;
  const progressPercent = Math.min((totalPoints / nextGradePoints) * 100, 100);

  const gradeEmoji: Record<string, string> = {
    ROOKIE: '🐣',
    SUPPORTER: '🙌',
    FANATIC: '🔥',
    ULTRAS: '⚡',
    LEGEND: '👑',
  };

  return (
    <div className="min-h-screen bg-[#fcf9f8] pb-24 md:pb-8">
      {/* 파워 바 (상단 레드 라인) */}
      <div className="h-1 bg-[#833502]" />

      {/* 히어로 헤더 */}
      <div className="relative bg-gradient-to-br from-[#00366e] via-[#004C97] to-[#00366e] text-white overflow-hidden">
        {/* 대각선 패턴 */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-20 -right-20 w-96 h-96 border-[40px] border-white rounded-full" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 border-[30px] border-white rounded-full" />
        </div>

        <div className="relative max-w-[1280px] mx-auto px-6 pt-5 pb-16">
          {/* 상단 네비게이션 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 backdrop-blur rounded-lg flex items-center justify-center overflow-hidden">
                <Image src="/favicon-48x48.png" alt="블루윙즈 둥지" width={32} height={32} className="object-contain" />
              </div>
              <h1 className="font-extrabold text-xl tracking-tight uppercase">Bluewings Nest</h1>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10" onClick={() => router.push('/posts')}>
                <Search size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 relative" onClick={() => router.push('/notices')}>
                <Bell size={20} />
                {notices.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-[#833502] rounded-full animate-pulse" />}
              </Button>
            </div>
          </div>

          {/* 다음 경기 */}
          {nextMatch ? (
            <div>
              <Badge className="bg-[#833502] text-white border-0 mb-3 uppercase tracking-widest text-xs font-semibold px-3 py-1">
                Next Fixture
              </Badge>
              <p className="text-white/70 text-sm mb-6 tracking-wide uppercase">
                {nextMatch.competition} · Round {nextMatch.matchDay || '-'}
              </p>

              <div className="flex items-center justify-center gap-6 md:gap-12 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <span className="text-3xl md:text-4xl">🔵</span>
                  </div>
                  <p className="font-bold text-sm uppercase tracking-wide">{nextMatch.homeTeam?.substring(0, 3) || 'SWN'}</p>
                </div>

                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-black text-[#833502]">VS</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-3xl md:text-4xl">⚽</span>
                  </div>
                  <p className="font-bold text-sm uppercase tracking-wide">{nextMatch.awayTeam?.substring(0, 3) || 'AWY'}</p>
                </div>
              </div>

              {/* 카운트다운 */}
              <div className="flex justify-center gap-3 mb-6">
                {[
                  { value: countdown.days, label: 'DAYS' },
                  { value: countdown.hours, label: 'HRS' },
                  { value: countdown.mins, label: 'MIN' },
                ].map((item) => (
                  <div key={item.label} className="bg-white/15 backdrop-blur rounded-lg px-4 py-3 text-center min-w-[64px]">
                    <p className="text-2xl md:text-3xl font-extrabold">{String(item.value).padStart(2, '0')}</p>
                    <p className="text-[10px] text-white/60 uppercase tracking-widest mt-1">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <Link href="/matches">
                  <Button className="bg-[#833502] hover:bg-[#6b2b02] text-white font-semibold uppercase tracking-wider px-6">
                    <Calendar size={16} className="mr-2" />
                    Match Center
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy size={40} className="mx-auto mb-3 text-white/30" />
              <p className="text-white/50 uppercase tracking-wide text-sm">No upcoming fixtures</p>
            </div>
          )}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-[1280px] mx-auto px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측 컬럼: 프로필 + 공지 + 최근 결과 */}
          <div className="space-y-6">
            {/* 프로필 카드 — 회원만 */}
            {isAuthenticated && member && (
              <Card className="border border-[#c2c6d3] shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-14 h-14 border-2 border-[#004C97]">
                      {member.profileImageUrl ? <AvatarImage src={api.getImageUrl(member.profileImageUrl)} /> : null}
                      <AvatarFallback className="bg-[#d6e3ff] text-2xl">
                        {gradeEmoji[member.grade?.currentGrade?.name || 'ROOKIE']}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-lg text-[#1c1b1b]">{member.nickname}</h2>
                        <Badge className="bg-[#d6e3ff] text-[#004C97] hover:bg-[#a9c7ff] border-0 text-xs">
                          {member.grade?.currentGrade?.displayName || '신입 서포터'}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#424751]">{totalPoints.toLocaleString()}P</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-[#737782]">
                      <LogOut size={18} />
                    </Button>
                  </div>

                  <div className="bg-[#f0eded] rounded-lg p-3 mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#424751]">다음 등급까지</span>
                      <span className="font-bold text-[#004C97]">{(nextGradePoints - totalPoints).toLocaleString()}P</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                    <div className="flex justify-between text-xs mt-2 text-[#737782]">
                      <span>{member.grade?.currentGrade?.name || 'ROOKIE'}</span>
                      <span>{member.grade?.nextGrade?.name || 'SUPPORTER'}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleAttendance}
                    disabled={isLoading || alreadyAttended}
                    className={`w-full font-semibold ${
                      alreadyAttended
                        ? 'bg-[#f0eded] text-[#737782] hover:bg-[#f0eded]'
                        : 'bg-[#004C97] hover:bg-[#00366e] text-white'
                    }`}
                  >
                    <CalendarCheck className="w-5 h-5 mr-2" />
                    {isLoading ? '처리중...' : alreadyAttended ? '오늘 출석 완료!' : '출석 체크 +5P'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 비회원 CTA */}
            {_hasHydrated && !isAuthenticated && (
              <Card className="border border-[#c2c6d3] shadow-sm">
                <CardContent className="p-6 text-center">
                  <h2 className="font-bold text-lg text-[#1c1b1b] mb-1">환영합니다</h2>
                  <p className="text-sm text-[#424751] mb-4">로그인하고 모든 기능을 이용하세요</p>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1 bg-[#004C97] hover:bg-[#00366e]">
                      <Link href="/login">로그인</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 border-[#004C97] text-[#004C97]">
                      <Link href="/signup">회원가입</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 공지사항 */}
            {notices.length > 0 && (
              <div>
              <Link href={`/notices/${notices[noticeIndex]?.id}`}>
                <Card className="border border-[#c2c6d3] shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#833502] rounded-full flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 h-5 overflow-hidden">
                        <p className={`text-sm text-[#1c1b1b] font-medium truncate transition-all duration-300 ${
                          isNoticeAnimating ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
                        }`}>
                          {notices[noticeIndex]?.title}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#737782] flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              </div>
            )}

            {/* 최근 결과 */}
            {recentMatch && (
              <Card className="border border-[#c2c6d3] shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-[#1c1b1b] flex items-center gap-2">
                      <div className="w-1 h-5 bg-[#004C97] rounded-full" />
                      최근 결과
                    </CardTitle>
                    <Badge className="bg-[#f0eded] text-[#424751] border-0 text-xs uppercase">
                      {recentMatch.status === 'FINISHED' ? 'Full Time' : recentMatch.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#737782] uppercase tracking-wide mb-3">
                    {recentMatch.competition} · Round {recentMatch.matchDay || '-'}
                  </p>
                  <div className="flex items-center justify-between py-3">
                    <div className="text-center flex-1">
                      <p className="font-bold text-sm text-[#1c1b1b]">{recentMatch.homeTeam}</p>
                      <p className="text-xs text-[#737782]">HOME</p>
                    </div>
                    <div className="px-4 text-center">
                      <p className="text-3xl font-extrabold text-[#004C97]">
                        {recentMatch.homeScore ?? '-'} - {recentMatch.awayScore ?? '-'}
                      </p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="font-bold text-sm text-[#1c1b1b]">{recentMatch.awayTeam}</p>
                      <p className="text-xs text-[#737782]">AWAY</p>
                    </div>
                  </div>
                  <Link href="/matches">
                    <Button variant="outline" size="sm" className="w-full mt-2 border-[#004C97] text-[#004C97] hover:bg-[#d6e3ff] uppercase tracking-wider text-xs font-semibold">
                      Match Center <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 우측 컬럼: 인기글 */}
          <Card className="border border-[#c2c6d3] shadow-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-[#1c1b1b] flex items-center gap-2">
                  <Flame size={18} className="text-[#833502]" />
                  인기글
                </CardTitle>
                <div className="flex gap-1 bg-[#f0eded] rounded-lg p-1">
                  {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setPopularPeriod(period)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all uppercase tracking-wide ${
                        popularPeriod === period
                          ? 'bg-[#004C97] text-white shadow-sm'
                          : 'text-[#424751] hover:text-[#1c1b1b]'
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
                    className="w-full justify-between h-auto py-3 px-3 hover:bg-[#f6f3f2] rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {idx < 3 ? (
                        <span className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                          idx === 0 ? 'bg-[#833502]' : idx === 1 ? 'bg-[#004C97]' : 'bg-[#424751]'
                        }`}>
                          {idx + 1}
                        </span>
                      ) : (
                        <span className="w-7 text-center text-[#737782] font-semibold shrink-0">{idx + 1}</span>
                      )}
                      <p className="text-[#1c1b1b] truncate text-left text-sm font-medium">{post.title}</p>
                    </div>
                    <div className="flex items-center gap-3 text-[#737782] text-xs ml-2 shrink-0">
                      <span className="flex items-center gap-1"><Eye size={12} /> {post.viewCount}</span>
                      <span className="flex items-center gap-1"><Heart size={12} className="text-[#833502]" /> {post.likeCount}</span>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="py-8 text-center text-[#737782] text-sm">아직 인기글이 없습니다</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 바로가기 */}
        <div className="mt-6 pb-4">
          <Card className="border border-[#c2c6d3] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-[#1c1b1b]">바로가기</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  { href: '/notices', icon: Bell, bg: 'bg-[#833502]', title: '공지사항', desc: '새로운 소식을 확인하세요' },
                  { href: '/matches', icon: Trophy, bg: 'bg-[#004C97]', title: '경기 일정', desc: '일정 및 순위 확인' },
                  { href: '/posts', icon: MessageSquare, bg: 'bg-[#00366e]', title: '커뮤니티', desc: '팬들과 소통하세요' },
                  { href: '/chat', icon: MessagesSquare, bg: 'bg-[#424751]', title: '실시간 채팅', desc: '서포터들과 대화하세요' },
                ].map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto py-3 px-3 hover:bg-[#f6f3f2] transition-all rounded-lg"
                    >
                      <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center mr-3`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-[#1c1b1b]">{item.title}</p>
                        <p className="text-xs text-[#737782]">{item.desc}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#c2c6d3] lg:hidden" />
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 포츈쿠키 모달 */}
      {fortuneCookie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 max-w-sm w-full shadow-xl animate-in fade-in zoom-in duration-200 border-0">
            <CardContent className="p-6">
              <div className="flex justify-end mb-2">
                <Button variant="ghost" size="icon" onClick={() => setFortuneCookie(null)} className="h-8 w-8">
                  <X className="w-5 h-5 text-[#737782]" />
                </Button>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#ffdbcc] rounded-full flex items-center justify-center">
                  <Cookie className="w-8 h-8 text-[#833502]" />
                </div>
                <h3 className="text-lg font-bold text-[#1c1b1b] mb-2">🎉 출석 체크 완료! +5P</h3>
                <div className="bg-[#f6f3f2] rounded-lg p-4 mb-4">
                  <p className="text-[#1c1b1b] font-medium leading-relaxed">"{fortuneCookie.message}"</p>
                </div>
                <Badge className="bg-[#ffdbcc] text-[#833502] border-0">{fortuneCookie.category}</Badge>
              </div>
              <Button onClick={() => setFortuneCookie(null)} className="w-full mt-6 bg-[#004C97] hover:bg-[#00366e]">확인</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => { setToast(null); clearError(); }} />
      )}
    </div>
  );
}
