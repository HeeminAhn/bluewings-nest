'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, LogOut, ChevronRight, User, FileText, MessageCircle, Heart, UserX } from 'lucide-react';
import { GradeBadge } from '@/components/member/GradeBadge';
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
            <h1 className="text-lg font-semibold">마이페이지</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        {/* 프로필 섹션 */}
        <section className="bg-white p-6">
          <div className="flex items-center gap-4">
            {member.profileImageUrl ? (
              <img
                src={api.getImageUrl(member.profileImageUrl)}
                alt={member.nickname}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-bluewings-light to-bluewings rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {member.nickname.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold">{member.nickname}</span>
                <GradeBadge grade={member.grade.currentGrade.name} size="sm" />
              </div>
              <p className="text-gray-500 text-sm">{member.email}</p>
              {member.bio && (
                <p className="text-gray-600 text-sm mt-2">{member.bio}</p>
              )}
            </div>
            <Link
              href="/mypage/edit"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <Edit2 className="w-5 h-5" />
            </Link>
          </div>

          {/* 등급 정보 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">현재 등급</span>
              <span className="font-medium">{member.grade.currentGrade.displayName}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">보유 포인트</span>
              <span className="font-medium">{member.grade.currentPoints.toLocaleString()}P</span>
            </div>
            {member.grade.nextGrade && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-bluewings h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (member.grade.currentPoints / member.grade.nextGrade.requiredPoints) * 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  다음 등급까지 {member.grade.pointsToNextGrade?.toLocaleString()}P 남음
                </p>
              </>
            )}
          </div>
        </section>

        {/* 활동 통계 */}
        <section className="bg-white mt-2 p-4">
          <h2 className="font-semibold mb-4">활동 통계</h2>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="w-10 h-10 mx-auto mb-2 bg-blue-50 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-lg font-bold">{member.grade.activityStats.postCount}</p>
              <p className="text-xs text-gray-500">게시글</p>
            </div>
            <div>
              <div className="w-10 h-10 mx-auto mb-2 bg-green-50 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-lg font-bold">{member.grade.activityStats.commentCount}</p>
              <p className="text-xs text-gray-500">댓글</p>
            </div>
            <div>
              <div className="w-10 h-10 mx-auto mb-2 bg-red-50 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-lg font-bold">{member.grade.activityStats.likeCount}</p>
              <p className="text-xs text-gray-500">좋아요</p>
            </div>
            <div>
              <div className="w-10 h-10 mx-auto mb-2 bg-yellow-50 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-lg font-bold">{member.grade.activityStats.attendanceCount}</p>
              <p className="text-xs text-gray-500">출석</p>
            </div>
          </div>
        </section>

        {/* 메뉴 */}
        <section className="bg-white mt-2">
          <Link
            href={`/posts?authorId=${member.id}`}
            className="flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <span>내가 쓴 글</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          <div className="border-t" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full p-4 text-red-500 hover:bg-gray-50"
          >
            <LogOut className="w-5 h-5" />
            <span>로그아웃</span>
          </button>
        </section>

        {/* 회원 탈퇴 */}
        <section className="bg-white mt-2">
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center gap-2 w-full p-4 text-gray-400 hover:bg-gray-50"
          >
            <UserX className="w-5 h-5" />
            <span>회원 탈퇴</span>
          </button>
        </section>
      </main>

      {/* 탈퇴 확인 모달 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">회원 탈퇴</h3>
            <p className="text-sm text-gray-600 mb-4">
              탈퇴 시 모든 개인정보가 삭제되며 복구할 수 없습니다.
              작성한 게시글과 댓글은 &quot;탈퇴한 회원&quot;으로 표시됩니다.
            </p>
            <p className="text-sm text-red-500 mb-2">
              탈퇴를 원하시면 아래에 <strong>&quot;탈퇴합니다&quot;</strong>를 입력하세요.
            </p>
            <input
              type="text"
              value={withdrawConfirm}
              onChange={(e) => setWithdrawConfirm(e.target.value)}
              placeholder="탈퇴합니다"
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawConfirm('');
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing || withdrawConfirm !== '탈퇴합니다'}
                className="flex-1 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? '처리중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
