'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { useNotices, useDeleteNotice } from '@/hooks/use-notices'
import { DataTable, DataTablePagination } from '@/components/data-table'
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import type { Notice } from '@/types'
import { Plus, Pin, Pencil, Trash2, Search, X } from 'lucide-react'
import { toast } from 'sonner'

export default function NoticesPage() {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [keyword, setKeyword] = useState('')
  const [authorNickname, setAuthorNickname] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useNotices({
    page,
    size,
    keyword: keyword || undefined,
    authorNickname: authorNickname || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const clearFilters = () => {
    setKeyword('')
    setAuthorNickname('')
    setStartDate('')
    setEndDate('')
    setPage(0)
  }

  const hasFilters = keyword || authorNickname || startDate || endDate

  const deleteNotice = useDeleteNotice()

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteNotice.mutateAsync(deleteId)
      toast.success('공지사항이 삭제되었습니다.')
      setDeleteId(null)
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  const columns: ColumnDef<Notice>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>,
    },
    {
      accessorKey: 'isPinned',
      header: '',
      cell: ({ row }) =>
        row.original.isPinned ? (
          <Badge variant="default" className="gap-1">
            <Pin className="h-3 w-3" />
            고정
          </Badge>
        ) : null,
    },
    {
      accessorKey: 'title',
      header: '제목',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: 'authorNickname',
      header: '작성자',
    },
    {
      accessorKey: 'viewCount',
      header: '조회수',
      cell: ({ row }) => row.original.viewCount.toLocaleString(),
    },
    {
      accessorKey: 'createdAt',
      header: '작성일',
      cell: ({ row }) => formatDateTime(row.original.createdAt),
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
              router.push(`/notices/${row.original.id}/edit`)
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

  const handleRowClick = (notice: Notice) => {
    router.push(`/notices/${notice.id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">공지사항 관리</h1>
          <p className="text-muted-foreground">공지사항을 관리합니다.</p>
        </div>
        <Button onClick={() => router.push('/notices/new')}>
          <Plus className="mr-2 h-4 w-4" />
          새 공지사항
        </Button>
      </div>

      {/* 필터 영역 */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 제목/내용 검색 */}
          <div className="space-y-2">
            <Label htmlFor="keyword">제목/내용</Label>
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

          {/* 작성자 */}
          <div className="space-y-2">
            <Label htmlFor="author">작성자</Label>
            <Input
              id="author"
              placeholder="닉네임 검색..."
              value={authorNickname}
              onChange={(e) => {
                setAuthorNickname(e.target.value)
                setPage(0)
              }}
            />
          </div>

          {/* 작성일 시작 */}
          <div className="space-y-2">
            <Label htmlFor="startDate">작성일 (시작)</Label>
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

          {/* 작성일 끝 */}
          <div className="space-y-2">
            <Label htmlFor="endDate">작성일 (끝)</Label>
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
        title="공지사항 삭제"
        description="이 공지사항을 삭제하시겠습니까?"
        onConfirm={handleDelete}
        isLoading={deleteNotice.isPending}
      />
    </div>
  )
}
