'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { useAccessLogs } from '@/hooks/use-access-logs'
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
import type { AccessLog } from '@/types'
import { CheckCircle, XCircle, Search, X } from 'lucide-react'

export default function AccessLogsPage() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [ipAddress, setIpAddress] = useState('')
  const [isSuccess, setIsSuccess] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data, isLoading } = useAccessLogs({
    page,
    size,
    email: email || undefined,
    ipAddress: ipAddress || undefined,
    isSuccess: isSuccess || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const clearFilters = () => {
    setEmail('')
    setIpAddress('')
    setIsSuccess('')
    setStartDate('')
    setEndDate('')
    setPage(0)
  }

  const hasFilters = email || ipAddress || isSuccess || startDate || endDate

  const columns: ColumnDef<AccessLog>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>,
    },
    {
      accessorKey: 'email',
      header: '이메일',
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP 주소',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.ipAddress}</span>
      ),
    },
    {
      accessorKey: 'isSuccess',
      header: '결과',
      cell: ({ row }) =>
        row.original.isSuccess ? (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            성공
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            실패
          </Badge>
        ),
    },
    {
      accessorKey: 'failureReason',
      header: '실패 사유',
      cell: ({ row }) => row.original.failureReason || '-',
    },
    {
      accessorKey: 'userAgent',
      header: 'User-Agent',
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate block text-xs">
          {row.original.userAgent || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: '접속일시',
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">접속 이력</h1>
        <p className="text-muted-foreground">로그인 접속 이력을 확인합니다.</p>
      </div>

      {/* 필터 영역 */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 이메일 검색 */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                placeholder="검색..."
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setPage(0)
                }}
                className="pl-9"
              />
            </div>
          </div>

          {/* IP 주소 */}
          <div className="space-y-2">
            <Label htmlFor="ipAddress">IP 주소</Label>
            <Input
              id="ipAddress"
              placeholder="IP 검색..."
              value={ipAddress}
              onChange={(e) => {
                setIpAddress(e.target.value)
                setPage(0)
              }}
            />
          </div>

          {/* 결과 */}
          <div className="space-y-2">
            <Label>결과</Label>
            <Select value={isSuccess} onValueChange={(value) => {
              setIsSuccess(value === 'all' ? '' : value)
              setPage(0)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="true">성공</SelectItem>
                <SelectItem value="false">실패</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 빈 칸 (정렬 맞추기) */}
          <div className="hidden lg:block" />

          {/* 빈 칸 (정렬 맞추기) */}
          <div className="hidden lg:block" />

          {/* 빈 칸 (정렬 맞추기) */}
          <div className="hidden lg:block" />

          {/* 접속일 시작 */}
          <div className="space-y-2">
            <Label htmlFor="startDate">접속일 (시작)</Label>
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

          {/* 접속일 끝 */}
          <div className="space-y-2">
            <Label htmlFor="endDate">접속일 (끝)</Label>
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
