'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { useMatches, useDeleteMatch } from '@/hooks/use-matches'
import { DataTable, DataTablePagination } from '@/components/data-table'
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import type { Match, MatchStatus } from '@/types'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

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

export default function MatchesPage() {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [season, setSeason] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [competition, setCompetition] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useMatches({
    page,
    size,
    season: season || undefined,
    status: status || undefined,
    competition: competition || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sort: 'matchDate,desc',
  })

  const clearFilters = () => {
    setSeason('')
    setStatus('')
    setCompetition('')
    setStartDate('')
    setEndDate('')
    setPage(0)
  }

  const hasFilters = season || status || competition || startDate || endDate

  const deleteMatch = useDeleteMatch()

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMatch.mutateAsync(deleteId)
      toast.success('경기가 삭제되었습니다.')
      setDeleteId(null)
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  const columns: ColumnDef<Match>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>,
    },
    {
      accessorKey: 'matchDate',
      header: '경기일',
      cell: ({ row }) => formatDate(row.original.matchDate),
    },
    {
      accessorKey: 'matchTime',
      header: '시간',
      cell: ({ row }) => row.original.matchTime || '-',
    },
    {
      accessorKey: 'matchup',
      header: '경기',
      cell: ({ row }) => (
        <span className="font-bold">
          {row.original.homeTeam} vs {row.original.awayTeam}
        </span>
      ),
    },
    {
      accessorKey: 'score',
      header: '스코어',
      cell: ({ row }) => {
        if (row.original.homeScore === null || row.original.homeScore === undefined) {
          return '-'
        }
        return (
          <span className="font-bold">
            {row.original.homeScore} : {row.original.awayScore}
          </span>
        )
      },
    },
    {
      accessorKey: 'stadium',
      header: '경기장',
    },
    {
      accessorKey: 'competition',
      header: '대회',
    },
    {
      accessorKey: 'matchDay',
      header: '라운드',
      cell: ({ row }) => row.original.matchDay || '-',
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => (
        <Badge variant={statusColors[row.original.status]}>
          {statusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/matches/${row.original.id}/edit`)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              setDeleteId(row.original.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const handleRowClick = (match: Match) => {
    router.push(`/matches/${match.id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">경기 관리</h1>
          <p className="text-muted-foreground">경기 일정을 관리합니다.</p>
        </div>
        <Button onClick={() => router.push('/matches/new')}>
          <Plus className="mr-2 h-4 w-4" />
          새 경기
        </Button>
      </div>

      {/* 필터 영역 */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 시즌 */}
          <div className="space-y-2">
            <Label>시즌</Label>
            <Select value={season} onValueChange={(value) => {
              setSeason(value === 'all' ? '' : value)
              setPage(0)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 상태 */}
          <div className="space-y-2">
            <Label>상태</Label>
            <Select value={status} onValueChange={(value) => {
              setStatus(value === 'all' ? '' : value)
              setPage(0)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="SCHEDULED">예정</SelectItem>
                <SelectItem value="LIVE">진행중</SelectItem>
                <SelectItem value="FINISHED">종료</SelectItem>
                <SelectItem value="POSTPONED">연기</SelectItem>
                <SelectItem value="CANCELLED">취소</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 대회 */}
          <div className="space-y-2">
            <Label>대회</Label>
            <Select value={competition} onValueChange={(value) => {
              setCompetition(value === 'all' ? '' : value)
              setPage(0)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="K리그1">K리그1</SelectItem>
                <SelectItem value="K리그2">K리그2</SelectItem>
                <SelectItem value="FA컵">FA컵</SelectItem>
                <SelectItem value="ACL">ACL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 빈 칸 (정렬 맞추기) */}
          <div className="hidden lg:block" />

          {/* 빈 칸 (정렬 맞추기) */}
          <div className="hidden lg:block" />

          {/* 빈 칸 (정렬 맞추기) */}
          <div className="hidden lg:block" />

          {/* 경기일 시작 */}
          <div className="space-y-2">
            <Label htmlFor="startDate">경기일 (시작)</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setPage(0)
              }}
            />
          </div>

          {/* 경기일 끝 */}
          <div className="space-y-2">
            <Label htmlFor="endDate">경기일 (끝)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setPage(0)
              }}
            />
          </div>
        </div>

        {hasFilters && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              필터 초기화
            </Button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.content || []}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />

      {data && (
        <DataTablePagination
          page={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          size={size}
          onPageChange={setPage}
          onSizeChange={(newSize) => {
            setSize(newSize)
            setPage(0)
          }}
        />
      )}

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="경기 삭제"
        description="이 경기를 삭제하시겠습니까?"
        onConfirm={handleDelete}
        isLoading={deleteMatch.isPending}
      />
    </div>
  )
}
