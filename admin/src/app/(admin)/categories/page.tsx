'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { useCategories, useDeleteCategory } from '@/hooks/use-categories'
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
import { formatDateTime } from '@/lib/utils'
import type { Category } from '@/types'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'
import { toast } from 'sonner'

export default function CategoriesPage() {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [keyword, setKeyword] = useState('')
  const [isActive, setIsActive] = useState<string>('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useCategories({
    page,
    size,
    keyword: keyword || undefined,
    isActive: isActive || undefined,
  })

  const clearFilters = () => {
    setKeyword('')
    setIsActive('')
    setPage(0)
  }

  const hasFilters = keyword || isActive

  const deleteCategory = useDeleteCategory()

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteCategory.mutateAsync(deleteId)
      toast.success('카테고리가 삭제되었습니다.')
      setDeleteId(null)
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>,
    },
    {
      accessorKey: 'displayOrder',
      header: '순서',
      cell: ({ row }) => row.original.displayOrder,
    },
    {
      accessorKey: 'name',
      header: '카테고리명',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: '설명',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.description || '-'}</span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: '상태',
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="default">활성</Badge>
        ) : (
          <Badge variant="secondary">비활성</Badge>
        ),
    },
    {
      accessorKey: 'createdAt',
      header: '생성일',
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
              router.push(`/categories/${row.original.id}/edit`)
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

  const handleRowClick = (category: Category) => {
    router.push(`/categories/${category.id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">카테고리 관리</h1>
          <p className="text-muted-foreground">커뮤니티 게시글 카테고리를 관리합니다.</p>
        </div>
        <Button onClick={() => router.push('/categories/new')}>
          <Plus className="mr-2 h-4 w-4" />
          새 카테고리
        </Button>
      </div>

      {/* 필터 영역 */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 검색 */}
          <div className="space-y-2">
            <Label htmlFor="keyword">카테고리명/설명</Label>
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
        title="카테고리 삭제"
        description="이 카테고리를 삭제하시겠습니까? 해당 카테고리가 적용된 게시글은 카테고리가 없는 상태가 됩니다."
        onConfirm={handleDelete}
        isLoading={deleteCategory.isPending}
      />
    </div>
  )
}
