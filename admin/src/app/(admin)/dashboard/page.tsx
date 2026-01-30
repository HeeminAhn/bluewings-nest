'use client'

import { useDashboard } from '@/hooks/use-dashboard'
import { StatCard } from '@/components/dashboard/stat-card'
import { RecentPosts } from '@/components/dashboard/recent-posts'
import { RecentMembers } from '@/components/dashboard/recent-members'
import { UpcomingMatches } from '@/components/dashboard/upcoming-matches'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  Flag,
  Ban,
} from 'lucide-react'

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboard()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        통계 데이터를 불러올 수 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">블루윙즈 둥지 관리자</h1>
        <p className="text-muted-foreground">커뮤니티 현황을 한눈에 확인하세요.</p>
      </div>

      {/* 통계 카드 - 1행 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="총 회원 수"
          value={stats.totalMembers}
          icon={Users}
          iconBgColor="bg-primary"
        />
        <StatCard
          title="총 게시글"
          value={stats.totalPosts}
          icon={FileText}
          iconBgColor="bg-blue-500"
        />
        <StatCard
          title="총 댓글"
          value={stats.totalComments}
          icon={MessageSquare}
          iconBgColor="bg-green-500"
        />
        <StatCard
          title="오늘 신규 가입"
          value={stats.todayNewMembers}
          icon={TrendingUp}
          iconBgColor="bg-red-500"
        />
      </div>

      {/* 통계 카드 - 2행 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="대기 중인 신고"
          value={stats.pendingReports}
          icon={Flag}
          iconBgColor="bg-orange-500"
        />
        <StatCard
          title="차단된 회원"
          value={stats.blockedMembers}
          icon={Ban}
          iconBgColor="bg-red-600"
        />
      </div>

      {/* 최근 활동 */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentPosts posts={stats.recentPosts} />
        <RecentMembers members={stats.recentMembers} />
        <UpcomingMatches matches={stats.upcomingMatches} />
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  )
}
