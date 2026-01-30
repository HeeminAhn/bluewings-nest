'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { useReports } from '@/hooks/use-reports'
import { DataTable, DataTablePagination } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDateTime } from '@/lib/utils'
import type { Report, ReportStatus } from '@/types'
import { X } from 'lucide-react'

const statusLabels: Record<ReportStatus, string> = {
  PENDING: '처리 대기',
  ACCEPTED: '신고 승인',
  REJECTED: '신고 반려',
  RESOLVED: '처리 완료',
}

const statusColors: Record<ReportStatus, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  PENDING: 'outline',
  ACCEPTED: 'destructive',
  REJECTED: 'secondary',
  RESOLVED: 'default',
}

export default function ReportsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [status, setStatus] = useState<string>(searchParams.get('status') || '')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const reportedMemberId = searchParams.get('reportedMemberId')

  const { data, isLoading } = useReports({
    page,
    size,
    status: status || undefined,
    reportedMemberId: reportedMemberId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const clearFilters = () => {
    setStatus('')
    setStartDate('')
    setEndDate('')
    setPage(0)
  }

  const hasFilters = status || startDate || endDate

  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>,
    },
    {
      accessorKey: 'reporterNickname',
      header: '신고자',
    },
    {
      accessorKey: 'reportedMemberNickname',
      header: '피신고자',
    },
    {
      accessorKey: 'reasonDescription',
      header: '사유',
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
      accessorKey: 'createdAt',
      header: '신고일시',
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
  ]

  const handleRowClick = (report: Report) => {
    router.push(`/reports/${report.id}`)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">신고 관리</h1>
        <p className="text-muted-foreground">회원 신고를 관리합니다.</p>
      </div>

      {/* 필터 영역 */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <SelectItem value="PENDING">처리 대기</SelectItem>
                <SelectItem value="ACCEPTED">신고 승인</SelectItem>
                <SelectItem value="REJECTED">신고 반려</SelectItem>
                <SelectItem value="RESOLVED">처리 완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 빈 칸 (정렬 맞추기) */}
          <div className="hidden lg:block" />

          {/* 신고일 시작 */}
          <div className="space-y-2">
            <Label htmlFor="startDate">신고일 (시작)</Label>
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

          {/* 신고일 끝 */}
          <div className="space-y-2">
            <Label htmlFor="endDate">신고일 (끝)</Label>
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
    </div>
  )
}
