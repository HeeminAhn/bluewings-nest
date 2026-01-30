'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMember, useBlockMember, useUnblockMember } from '@/hooks/use-members'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { BlockMemberDialog } from '@/components/dialogs/block-member-dialog'
import { UnblockMemberDialog } from '@/components/dialogs/unblock-member-dialog'
import { formatDateTime } from '@/lib/utils'
import { ArrowLeft, Ban, LockOpen, Pencil, User, Activity, History, Flag } from 'lucide-react'
import { toast } from 'sonner'

const roleLabels: Record<string, string> = {
  USER: '일반 회원',
  ADMIN: '관리자',
}

const gradeLabels: Record<string, string> = {
  ROOKIE: '루키',
  SUPPORTER: '서포터',
  FANATIC: '패너틱',
  ULTRAS: '울트라스',
  LEGEND: '레전드',
}

export default function MemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const memberId = Number(params.id)

  const { data: member, isLoading, error } = useMember(memberId)
  const blockMember = useBlockMember()
  const unblockMember = useUnblockMember()

  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false)

  const handleBlock = async (reason: string) => {
    try {
      await blockMember.mutateAsync({ memberId, reason })
      toast.success('회원이 차단되었습니다.')
      setBlockDialogOpen(false)
    } catch {
      toast.error('차단 처리 중 오류가 발생했습니다.')
    }
  }

  const handleUnblock = async () => {
    try {
      await unblockMember.mutateAsync(memberId)
      toast.success('차단이 해제되었습니다.')
      setUnblockDialogOpen(false)
    } catch {
      toast.error('차단 해제 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return <MemberDetailSkeleton />
  }

  if (error || !member) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">회원 정보를 불러올 수 없습니다.</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          돌아가기
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{member.nickname}</h1>
            <p className="text-muted-foreground">{member.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {member.isBlocked ? (
            <Button variant="outline" onClick={() => setUnblockDialogOpen(true)}>
              <LockOpen className="mr-2 h-4 w-4" />
              차단 해제
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => setBlockDialogOpen(true)}>
              <Ban className="mr-2 h-4 w-4" />
              차단
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/members/${memberId}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            수정
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info" className="gap-2">
            <User className="h-4 w-4" />
            기본 정보
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            활동
          </TabsTrigger>
          <TabsTrigger value="block" className="gap-2">
            <Ban className="h-4 w-4" />
            차단 정보
          </TabsTrigger>
          <TabsTrigger value="access" className="gap-2">
            <History className="h-4 w-4" />
            접속 이력
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <Flag className="h-4 w-4" />
            신고 내역
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="ID" value={String(member.id)} />
              <InfoRow label="닉네임" value={member.nickname} />
              <InfoRow label="이메일" value={member.email} />
              <InfoRow label="자기소개" value={member.bio || '-'} />
              <InfoRow
                label="역할"
                value={
                  <Badge variant={member.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                    {roleLabels[member.role] || member.role}
                  </Badge>
                }
              />
              <InfoRow
                label="등급"
                value={
                  <Badge variant="outline">
                    {gradeLabels[member.grade] || member.grade}
                  </Badge>
                }
              />
              <InfoRow
                label="상태"
                value={
                  member.isBlocked ? (
                    <Badge variant="destructive">차단됨</Badge>
                  ) : (
                    <Badge variant={member.isActive ? 'default' : 'secondary'}>
                      {member.isActive ? '활성' : '비활성'}
                    </Badge>
                  )
                }
              />
              <InfoRow label="가입일" value={formatDateTime(member.createdAt)} />
              <InfoRow
                label="마지막 로그인"
                value={member.lastLoginAt ? formatDateTime(member.lastLoginAt) : '-'}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>활동 통계</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                label="총 게시글 수"
                value={String(member.activityStats?.totalPosts || 0)}
              />
              <InfoRow
                label="총 댓글 수"
                value={String(member.activityStats?.totalComments || 0)}
              />
              <InfoRow
                label="총 포인트"
                value={String(member.activityStats?.totalPoints || 0)}
              />
              <InfoRow
                label="출석 횟수"
                value={String(member.activityStats?.attendanceCount || 0)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="block" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>차단 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                label="차단 상태"
                value={
                  <Badge variant={member.isBlocked ? 'destructive' : 'secondary'}>
                    {member.isBlocked ? '차단됨' : '정상'}
                  </Badge>
                }
              />
              <InfoRow label="차단 사유" value={member.blockedReason || '-'} />
              <InfoRow
                label="차단일시"
                value={member.blockedAt ? formatDateTime(member.blockedAt) : '-'}
              />
              <InfoRow
                label="차단 해제 예정일"
                value={member.blockedUntil ? formatDateTime(member.blockedUntil) : '-'}
              />
              <InfoRow
                label="누적 신고 횟수"
                value={String(member.reportCount)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>접속 이력</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                접속 이력 페이지에서 상세 내역을 확인하세요.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push(`/access-logs?email=${member.email}`)}
              >
                접속 이력 보기
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>신고 내역</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                신고 페이지에서 상세 내역을 확인하세요.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push(`/reports?reportedMemberId=${member.id}`)}
              >
                신고 내역 보기
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BlockMemberDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        memberNickname={member.nickname}
        onConfirm={handleBlock}
        isLoading={blockMember.isPending}
      />

      <UnblockMemberDialog
        open={unblockDialogOpen}
        onOpenChange={setUnblockDialogOpen}
        memberNickname={member.nickname}
        onConfirm={handleUnblock}
        isLoading={unblockMember.isPending}
      />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex border-b pb-3 last:border-0 last:pb-0">
      <span className="w-40 text-sm text-muted-foreground">{label}</span>
      <span className="flex-1 text-sm">{value}</span>
    </div>
  )
}

function MemberDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
