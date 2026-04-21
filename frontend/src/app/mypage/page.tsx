'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Edit2,
  LogOut,
  ChevronRight,
  FileText,
  MessageCircle,
  Heart,
  CalendarCheck,
  UserX,
  Loader2,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout';
import { Toast } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export default function MyPage() {
  const router = useRouter();
  const { isAuthenticated, member, logout, _hasHydrated } = useAuthStore();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawConfirm, setWithdrawConfirm] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout();
      router.push('/');
    }
  };

  const handleWithdraw = async () => {
    if (withdrawConfirm !== '탈퇴합니다') {
      setToast({ message: '"탈퇴합니다"를 정확히 입력해주세요.', type: 'error' });
      return;
    }

    setIsWithdrawing(true);
    const response = await api.withdrawMember();
    setIsWithdrawing(false);

    if (response.success) {
      setToast({ message: '회원 탈퇴가 완료되었습니다.', type: 'success' });
      setTimeout(() => {
        logout();
        router.push('/login');
      }, 1500);
    } else {
      setToast({ message: response.error?.message || '탈퇴 처리에 실패했습니다.', type: 'error' });
    }
  };

  if (!_hasHydrated || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
      </div>
    );
  }

  const gradeEmoji: Record<string, string> = {
    ROOKIE: '🐣',
    SUPPORTER: '🙌',
    FANATIC: '🔥',
    ULTRAS: '⚡',
    LEGEND: '👑',
  };

  const totalPoints = member.grade?.currentPoints || 0;
  const nextGradePoints = member.grade?.nextGrade?.requiredPoints || 100;
  const progressPercent = Math.min((totalPoints / nextGradePoints) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
      <Header title="마이페이지" />

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* 프로필 카드 */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-20 h-20 border-2 border-blue-100">
                {member.profileImageUrl ? (
                  <AvatarImage src={api.getImageUrl(member.profileImageUrl)} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-3xl">
                  {gradeEmoji[member.grade?.currentGrade?.name || 'ROOKIE']}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-slate-900">{member.nickname}</h2>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                    {member.grade?.currentGrade?.displayName || '신입 서포터'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">{member.email}</p>
                {member.bio && (
                  <p className="text-sm text-slate-600 mt-2">{member.bio}</p>
                )}
              </div>
              <Link href="/mypage/edit">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                  <Edit2 className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* 등급 프로그레스 */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">현재 포인트</span>
                <span className="font-bold text-blue-700">{totalPoints.toLocaleString()}P</span>
              </div>
              <Progress value={progressPercent} className="h-2 mb-2" />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{member.grade?.currentGrade?.name || 'ROOKIE'}</span>
                {member.grade?.nextGrade && (
                  <span>
                    다음 등급까지 {member.grade.pointsToNextGrade?.toLocaleString()}P
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 활동 통계 */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">활동 통계</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="w-12 h-12 mx-auto mb-2 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-lg font-bold text-slate-900">{member.grade?.activityStats?.postCount || 0}</p>
                <p className="text-xs text-slate-500">게시글</p>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto mb-2 bg-green-50 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-lg font-bold text-slate-900">{member.grade?.activityStats?.commentCount || 0}</p>
                <p className="text-xs text-slate-500">댓글</p>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto mb-2 bg-red-50 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-lg font-bold text-slate-900">{member.grade?.activityStats?.likeCount || 0}</p>
                <p className="text-xs text-slate-500">좋아요</p>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto mb-2 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-lg font-bold text-slate-900">{member.grade?.activityStats?.attendanceCount || 0}</p>
                <p className="text-xs text-slate-500">출석</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 메뉴 */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-2">
            <Link href={`/posts?authorId=${member.id}`}>
              <Button variant="ghost" className="w-full justify-between h-auto py-3 px-3">
                <span className="text-slate-700">내가 쓴 글</span>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </Button>
            </Link>
            <Separator />
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start h-auto py-3 px-3 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-2" />
              로그아웃
            </Button>
          </CardContent>
        </Card>

        {/* 회원 탈퇴 */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-2">
            <Button
              variant="ghost"
              onClick={() => setShowWithdrawModal(true)}
              className="w-full justify-start h-auto py-3 px-3 text-slate-400 hover:text-slate-500"
            >
              <UserX className="w-5 h-5 mr-2" />
              회원 탈퇴
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* 탈퇴 확인 모달 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 max-w-sm w-full shadow-xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900">회원 탈퇴</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawConfirm('');
                  }}
                  className="h-8 w-8"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </Button>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                탈퇴 시 모든 개인정보가 삭제되며 복구할 수 없습니다.
                작성한 게시글과 댓글은 &quot;탈퇴한 회원&quot;으로 표시됩니다.
              </p>
              <p className="text-sm text-red-500 mb-2">
                탈퇴를 원하시면 아래에 <strong>&quot;탈퇴합니다&quot;</strong>를 입력하세요.
              </p>
              <Input
                type="text"
                value={withdrawConfirm}
                onChange={(e) => setWithdrawConfirm(e.target.value)}
                placeholder="탈퇴합니다"
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawConfirm('');
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || withdrawConfirm !== '탈퇴합니다'}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : '탈퇴하기'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
