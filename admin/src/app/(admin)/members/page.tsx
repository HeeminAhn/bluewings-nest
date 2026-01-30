'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { useMembers } from '@/hooks/use-members'
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
import type { Member } from '@/types'
import { Ban, User, Search, X } from 'lucide-react'

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

const columns: ColumnDef<Member>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>,
  },
  {
    accessorKey: 'nickname',
    header: '닉네임',
    cell: ({ row }) => <span className="font-medium">{row.original.nickname}</span>,
  },
  {
    accessorKey: 'email',
    header: '이메일',
  },
  {
    accessorKey: 'role',
    header: '역할',
    cell: ({ row }) => (
      <Badge variant={row.original.role === 'ADMIN' ? 'destructive' : 'secondary'}>
        {roleLabels[row.original.role] || row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: 'grade',
    header: '등급',
    cell: ({ row }) => (
      <Badge variant="outline">
        {gradeLabels[row.original.grade] || row.original.grade}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: '상태',
    cell: ({ row }) => {
      if (row.original.isBlocked) {
        return (
          <Badge variant="destructive" className="gap-1">
            <Ban className="h-3 w-3" />
            차단됨
          </Badge>
        )
      }
      return (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'} className="gap-1">
          <User className="h-3 w-3" />
          {row.original.isActive ? '정상' : '비활성'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'reportCount',
    header: '신고 횟수',
    cell: ({ row }) => (
      <span className={row.original.reportCount > 0 ? 'text-destructive font-medium' : ''}>
        {row.original.reportCount}
      </span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: '가입일',
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
  {
    accessorKey: 'lastLoginAt',
    header: '마지막 로그인',
    cell: ({ row }) =>
      row.original.lastLoginAt ? formatDateTime(row.original.lastLoginAt) : '-',
  },
]

export default function MembersPage() {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [keyword, setKeyword] = useState('')
  const [role, setRole] = useState<string>('')
  const [grade, setGrade] = useState<string>('')
  const [isActive, setIsActive] = useState<string>('')
  const [isBlocked, setIsBlocked] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data, isLoading } = useMembers({
    page,
    size,
    keyword: keyword || undefined,
    role: role || undefined,
    grade: grade || undefined,
    isActive: isActive || undefined,
    isBlocked: isBlocked || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const clearFilters = () => {
    setKeyword('')
    setRole('')
    setGrade('')
    setIsActive('')
    setIsBlocked('')
    setStartDate('')
    setEndDate('')
    setPage(0)
  }

  const hasFilters = keyword || role || grade || isActive || isBlocked || startDate || endDate

  const handleRowClick = (member: Member) => {
    router.push(`/members/${member.id}`)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">회원 관리</h1>
        <p className="text-muted-foreground">커뮤니티 회원을 관리합니다.</p>
      </div>

      {/* 필터 영역 */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 닉네임/이메일 검색 */}
          <div className="space-y-2">
            <Label htmlFor="keyword">닉네임/이메일</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="keyword"
                placeholder="검색..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  setPage(0)
                }}
                className="pl-9"
              />
            </div>
          </div>

          {/* 역할 */}
          <div className="space-y-2">
            <Label>역할</Label>
            <Select value={role} onValueChange={(value) => {
              setRole(value === 'all' ? '' : value)
              setPage(0)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="USER">일반 회원</SelectItem>
                <SelectItem value="ADMIN">관리자</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 등급 */}
          <div className="space-y-2">
            <Label>등급</Label>
            <Select value={grade} onValueChange={(value) => {
              setGrade(value === 'all' ? '' : value)
              setPage(0)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="ROOKIE">루키</SelectItem>
                <SelectItem value="SUPPORTER">서포터</SelectItem>
                <SelectItem value="FANATIC">패너틱</SelectItem>
                <SelectItem value="ULTRAS">울트라스</SelectItem>
                <SelectItem value="LEGEND">레전드</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 상태 */}
          <div className="space-y-2">
            <Label>상태</Label>
            <Select value={isActive} onValueChange={(value) => {
              setIsActive(value === 'all' ? '' : value)
              setPage(0)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="true">활성</SelectItem>
                <SelectItem value="false">비활성</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 차단 */}
          <div className="space-y-2">
            <Label>차단</Label>
            <Select value={isBlocked} onValueChange={(value) => {
              setIsBlocked(value === 'all' ? '' : value)
              setPage(0)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="true">차단됨</SelectItem>
                <SelectItem value="false">정상</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 빈 칸 (정렬 맞추기) */}
          <div className="hidden lg:block" />

          {/* 가입일 시작 */}
          <div className="space-y-2">
            <Label htmlFor="startDate">가입일 (시작)</Label>
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

          {/* 가입일 끝 */}
          <div className="space-y-2">
            <Label htmlFor="endDate">가입일 (끝)</Label>
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
