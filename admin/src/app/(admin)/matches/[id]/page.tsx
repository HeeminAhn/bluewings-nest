'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMatch, useDeleteMatch } from '@/hooks/use-matches'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirm-dialog'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ArrowLeft, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import type { MatchStatus } from '@/types'

const statusLabels: Record<MatchStatus, string> = {
  SCHEDULED: '예정',
  LIVE: '진행중',
  FINISHED: '종료',
  POSTPONED: '연기',
  CANCELLED: '취소',
}

const statusColors: Record<MatchStatus, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  SCHEDULED: 'default',
  LIVE: 'destructive',
  FINISHED: 'secondary',
  POSTPONED: 'outline',
  CANCELLED: 'outline',
}

export default function MatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = Number(params.id)

  const { data: match, isLoading, error } = useMatch(matchId)
  const deleteMatch = useDeleteMatch()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteMatch.mutateAsync(matchId)
      toast.success('경기가 삭제되었습니다.')
      router.push('/matches')
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return <MatchDetailSkeleton />
  }

  if (error || !match) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">경기 정보를 불러올 수 없습니다.</p>
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
            <h1 className="text-2xl font-bold">
              {match.homeTeam} vs {match.awayTeam}
            </h1>
            <p className="text-muted-foreground">
              {formatDate(match.matchDate)} {match.matchTime || ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/matches/${matchId}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            수정
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Badge variant={statusColors[match.status]}>
          {statusLabels[match.status]}
        </Badge>
        <Badge variant="outline">{match.competition}</Badge>
        <Badge variant="outline">{match.season} 시즌</Badge>
        {match.matchDay && <Badge variant="outline">{match.matchDay}R</Badge>}
      </div>

      {(match.homeScore !== null && match.homeScore !== undefined) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-8 text-4xl font-bold">
              <span>{match.homeTeam}</span>
              <span className="text-primary">
                {match.homeScore} : {match.awayScore}
              </span>
              <span>{match.awayTeam}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>경기 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow label="경기 ID" value={String(match.id)} />
          <InfoRow label="경기일" value={formatDate(match.matchDate)} />
          <InfoRow label="시간" value={match.matchTime || '-'} />
          <InfoRow label="홈팀" value={match.homeTeam} />
          <InfoRow label="원정팀" value={match.awayTeam} />
          <InfoRow label="경기장" value={match.stadium} />
          <InfoRow label="대회" value={match.competition} />
          <InfoRow label="시즌" value={match.season} />
          <InfoRow label="라운드" value={match.matchDay ? String(match.matchDay) : '-'} />
          <InfoRow label="등록일" value={formatDateTime(match.createdAt)} />
          <InfoRow label="수정일" value={formatDateTime(match.updatedAt)} />
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="경기 삭제"
        description="이 경기를 삭제하시겠습니까?"
        onConfirm={handleDelete}
        isLoading={deleteMatch.isPending}
      />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b pb-3 last:border-0 last:pb-0">
      <span className="w-32 text-sm text-muted-foreground">{label}</span>
      <span className="flex-1 text-sm">{value}</span>
    </div>
  )
}

function MatchDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
